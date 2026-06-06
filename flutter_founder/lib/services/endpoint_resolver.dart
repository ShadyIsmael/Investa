import 'dart:io' show InternetAddress;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_founder/services/config.dart';
import 'secure_storage.dart';

class EndpointResolver {
  EndpointResolver._internal();
  static final EndpointResolver instance = EndpointResolver._internal();

  static const _storageKey = 'resolved_api_index';
  static const _customApiKey = 'custom_api_url';

  late final List<String> apiCandidates = _expandCandidates(_parseList(
      const String.fromEnvironment('API_BASE_URL', defaultValue: ''),
      dotenv.env['API_BASE_URL']));

  /// Normalise candidates: deduplicate and strip trailing slashes.
  /// Also adds a lowercase variant of the host when the configured name is
  /// mixed-case (e.g. DESKTOP-DIH7CQH → desktop-dih7cqh) because some
  /// Android DNS resolvers only accept lowercase hostnames.
  static List<String> _expandCandidates(List<String> candidates) {
    final out = <String>[];
    final seen = <String>{};
    String normalize(String s) => s.trim().replaceAll(RegExp(r"/+\s*$"), '');

    bool isIp(String h) => RegExp(r'^\d+\.\d+\.\d+\.\d+$').hasMatch(h);

    for (var c in candidates) {
      final norm = normalize(c);
      if (norm.isEmpty) continue;
      if (seen.add(norm)) out.add(norm);

      // Add lowercase host variant (some Android DNS resolvers require lowercase)
      try {
        final u = Uri.parse(norm);
        final host = u.host;
        if (host.isNotEmpty && !isIp(host)) {
          final lowerHost = host.toLowerCase();
          if (lowerHost != host) {
            final lowerUri = u.replace(host: lowerHost).toString();
            if (seen.add(lowerUri)) out.add(lowerUri);
          }
        }
      } catch (_) {}
    }

    return out;
  }

  late final List<String> signalrCandidates = _buildSignalrCandidates(
      const String.fromEnvironment('SIGNALR_HUB_URL', defaultValue: ''),
      dotenv.env['SIGNALR_HUB_URL']);

  static List<String> _buildSignalrCandidates(
      String compileTime, String? fromDot) {
    final parsed = _parseList(compileTime, fromDot);
    if (parsed.isNotEmpty) return parsed;

    // No explicit SIGNALR_HUB_URL configured — fall back to discovery using
    // the configured base host name. Provide two candidates so we can try
    // machine name first, then the .local mDNS variant.
    final host = Env.baseHostName;
    if (host.isEmpty) return <String>[];
    final primary = 'http://$host:5000/hubs/chat';
    final secondary = 'http://$host.local:5000/hubs/chat';
    return [primary, secondary];
  }

  int _selectedIndex = 0;
  bool _loaded = false;

  /// Call at app startup to load persisted selection index if present.
  /// Also applies any user-saved custom URL (set via the login screen) and
  /// attempts to resolve configured hostnames to IPs.
  Future<void> init() async {
    if (_loaded) return;

    // 1. Apply user-saved custom URL first — highest priority candidate.
    try {
      final custom = await SecureStorage().read(_customApiKey);
      if (custom != null && custom.isNotEmpty) {
        final seen = <String>{...apiCandidates};
        if (seen.add(custom)) apiCandidates.insert(0, custom);
        _selectedIndex = 0;
      }
    } catch (_) {}

    // 2. Try to resolve hostname → IP for remaining hostname candidates.
    await _prependResolvedIpCandidates();

    try {
      final txt = await SecureStorage().read(_storageKey);
      if (txt != null && txt.isNotEmpty) {
        final idx = int.tryParse(txt);
        if (idx != null && idx >= 0 && idx < apiCandidates.length) {
          // If signalrCandidates is populated, ensure the index is valid for
          // both lists so API and SignalR remain aligned.
          if (signalrCandidates.isEmpty || idx < signalrCandidates.length) {
            _selectedIndex = idx;
          }
        }
      }
    } catch (_) {}
    _loaded = true;
  }

  /// For every hostname-based candidate, attempt a DNS lookup. On success,
  /// prepend an IP-based URL so it becomes the first (highest-priority) option.
  ///
  /// Android does not support NetBIOS name resolution, but it does support mDNS.
  /// Windows 10+ broadcasts via mDNS, so `hostname.local` resolves on Android.
  /// We therefore try both the plain hostname AND the `.local` variant, take
  /// the first address that resolves, and prepend it as the primary candidate.
  Future<void> _prependResolvedIpCandidates() async {
    final toInsert = <String>[];
    final seen = <String>{...apiCandidates};
    final ipRegex = RegExp(r'^\d+\.\d+\.\d+\.\d+$');

    for (final candidate in List<String>.from(apiCandidates)) {
      try {
        final uri = Uri.parse(candidate);
        final host = uri.host;
        if (host.isEmpty || ipRegex.hasMatch(host)) continue;

        // Build the list of names to try: plain host first, then .local variant
        final namesToTry = [host];
        if (!host.toLowerCase().endsWith('.local')) {
          namesToTry.add('${host.toLowerCase()}.local');
        }

        for (final name in namesToTry) {
          try {
            final addresses = await InternetAddress.lookup(name)
                .timeout(const Duration(seconds: 2));
            for (final addr in addresses) {
              if (!addr.isLoopback) {
                final ipUrl = uri.replace(host: addr.address).toString();
                if (seen.add(ipUrl)) toInsert.add(ipUrl);
              }
            }
            if (toInsert.isNotEmpty) break; // resolved — no need to try .local
          } catch (_) {
            // Try next name variant
          }
        }
      } catch (_) {}
    }

    if (toInsert.isNotEmpty) {
      apiCandidates.insertAll(0, toInsert);
    }
  }

  static List<String> _parseList(String compileTime, String? fromDot) {
    final value =
        (compileTime.isNotEmpty ? compileTime : (fromDot ?? '')).trim();
    if (value.isEmpty) return <String>[];
    return value
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
  }

  List<String> get apiBaseUrls => apiCandidates;
  List<String> get signalrHubUrls => signalrCandidates;

  String get selectedApiBaseUrl {
    if (apiCandidates.isEmpty) return '';
    if (_selectedIndex < 0 || _selectedIndex >= apiCandidates.length) {
      return apiCandidates.first;
    }
    return apiCandidates[_selectedIndex];
  }

  String get selectedSignalRHubUrl {
    if (signalrCandidates.isEmpty) return '';
    if (_selectedIndex >= 0 && _selectedIndex < signalrCandidates.length) {
      return signalrCandidates[_selectedIndex];
    }
    // If indices don't line up, prefer first signalr candidate
    return signalrCandidates.first;
  }

  // ── Investa.FileStore configuration ──────────────────────────────────────
  static const _defaultFileStoreBase = 'http://localhost:5240';
  static const _defaultFileStoreApiKey =
      'investa-filestore-key-change-in-production';

  String get fileStoreBaseUrl {
    // Allow override via environment variable or .env
    final envUrl = dotenv.env['FILE_STORE_BASE_URL'] ?? '';
    if (envUrl.isNotEmpty) {
      return envUrl.trimRight().replaceAll(RegExp(r'/+$'), '');
    }
    return _defaultFileStoreBase;
  }

  String get fileStoreApiKey {
    final envKey = dotenv.env['FILE_STORE_API_KEY'] ?? '';
    if (envKey.isNotEmpty) {
      return envKey;
    }
    return _defaultFileStoreApiKey;
  }

  int get selectedIndex => _selectedIndex;

  Future<void> setSelectedIndex(int idx) async {
    if (idx < 0 || idx >= apiCandidates.length) return;
    // Keep API and SignalR aligned when SignalR candidates are provided
    if (signalrCandidates.isNotEmpty && idx >= signalrCandidates.length) return;
    _selectedIndex = idx;
    try {
      await SecureStorage().write(_storageKey, idx.toString());
    } catch (_) {}
  }

  /// Saves a user-entered server URL (e.g. an IP address typed on the login
  /// screen) and immediately makes it the active primary endpoint.
  Future<void> setCustomApiUrl(String url) async {
    final norm = url.trim().replaceAll(RegExp(r'/+\s*$'), '');
    if (norm.isEmpty) return;
    try {
      await SecureStorage().write(_customApiKey, norm);
    } catch (_) {}
    final seen = <String>{...apiCandidates};
    if (seen.add(norm)) {
      apiCandidates.insert(0, norm);
    } else {
      // Already in list — move to front
      apiCandidates.remove(norm);
      apiCandidates.insert(0, norm);
    }
    _selectedIndex = 0;
  }
}
