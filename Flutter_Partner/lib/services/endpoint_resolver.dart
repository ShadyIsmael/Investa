import 'dart:io' show NetworkInterface, InternetAddressType;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_partner/services/config.dart';
import 'secure_storage.dart';
import 'app_logger.dart';

class EndpointResolver {
  EndpointResolver._internal();
  static final EndpointResolver instance = EndpointResolver._internal();

  static const _storageKey = 'resolved_api_index';

  late final List<String> apiCandidates = _expandCandidates(_parseList(
      const String.fromEnvironment('API_BASE_URL', defaultValue: ''),
      dotenv.env['API_BASE_URL']));

  /// Expand hostname-only candidates with sensible fallbacks (e.g. add
  /// `.local` mDNS variant and lowercase host variant) to improve device
  /// discovery when DNS resolution is flaky on mobile devices.
  static List<String> _expandCandidates(List<String> candidates) {
    final out = <String>[];
    final seen = <String>{};
    String normalize(String s) => s.trim().replaceAll(RegExp(r"/+\s*$"), '');

    bool isIp(String h) => RegExp(r'^\d+\.\d+\.\d+\.\d+$').hasMatch(h);

    for (var c in candidates) {
      final norm = normalize(c);
      if (norm.isEmpty) continue;
      if (seen.add(norm)) out.add(norm);

      // Try to expand hostnames (avoid expanding IPs or already .local hosts)
      try {
        final u = Uri.parse(norm);
        final host = u.host;
        if (host.isNotEmpty && !isIp(host)) {
          // Add `.local` variant if not present
          if (!host.toLowerCase().endsWith('.local')) {
            final localHost = '$host.local';
            final localUri = u.replace(host: localHost).toString();
            if (seen.add(localUri)) out.add(localUri);
          }

          // Add lowercase host variant (some networks require lowercase)
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
  Future<void> init() async {
    if (_loaded) return;
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

      // Attempt to discover local IPv4 addresses and add IP-based candidates
      // as fallbacks (only on native platforms - not web).
      try {
        await _maybeAddLocalIpCandidates();
      } catch (e) {
        // Non-fatal; discovery may fail on some environments
        AppLogger.logError('EndpointResolver', 'local IP discovery failed: $e');
      }
    } catch (_) {}
    _loaded = true;
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

  /// Discover local IPv4 addresses and add IP-based candidates so devices
  /// that cannot resolve hostnames can still reach the backend.
  Future<void> _maybeAddLocalIpCandidates() async {
    if (kIsWeb) return; // NetworkInterface unavailable on web

    try {
      final ifaces = await NetworkInterface.list();
      final seen = <String>{...apiCandidates};

      for (final iface in ifaces) {
        for (final addr in iface.addresses) {
          if (addr.type == InternetAddressType.IPv4 &&
              !addr.isLoopback &&
              !addr.isLinkLocal) {
            final ip = addr.address;

            // Add common development ports
            final cand1 = 'http://$ip:5235';
            final cand2 = 'http://$ip:5000';
            if (seen.add(cand1)) apiCandidates.add(cand1);
            if (seen.add(cand2)) apiCandidates.add(cand2);

            // SignalR hub candidates
            final hub1 = 'http://$ip:5000/hubs/chat';
            final hub2 = 'http://$ip:5235/hubs/chat';
            final hubSeen = <String>{...signalrCandidates};
            if (hubSeen.add(hub1)) signalrCandidates.add(hub1);
            if (hubSeen.add(hub2)) signalrCandidates.add(hub2);
          }
        }
      }
    } catch (e) {
      // Non-critical; do not block initialization
      AppLogger.logError(
          'EndpointResolver', 'failed to add local IP candidates: $e');
    }
  }
}
