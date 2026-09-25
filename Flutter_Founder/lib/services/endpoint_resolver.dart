import 'dart:io' show InternetAddress;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'secure_storage.dart';

class EndpointResolver {
  EndpointResolver._internal();
  static final EndpointResolver instance = EndpointResolver._internal();

  static const _storageKey = 'resolved_api_index';
  static const _customApiKey = 'custom_api_url';

  late final List<String> apiCandidates = _expandCandidates(_parseList(
      const String.fromEnvironment('API_BASE_URL', defaultValue: ''),
      dotenv.env['API_BASE_URL']));

  static List<String> _expandCandidates(List<String> candidates) {
    final out = <String>[];
    final seen = <String>{};
    String normalize(String s) => s.trim().replaceAll(RegExp(r"/+\s*$"), '');

    bool isIp(String h) => RegExp(r'^\d+\.\d+\.\d+\.\d+$').hasMatch(h);

    for (var c in candidates) {
      final norm = normalize(c);
      if (norm.isEmpty) continue;
      if (seen.add(norm)) out.add(norm);

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

  int _selectedIndex = 0;
  bool _loaded = false;

  Future<void> init() async {
    if (_loaded) return;

    try {
      final custom = await SecureStorage().read(_customApiKey);
      if (custom != null && custom.isNotEmpty) {
        final seen = <String>{...apiCandidates};
        if (seen.add(custom)) apiCandidates.insert(0, custom);
        _selectedIndex = 0;
      }
    } catch (_) {}

    await _prependResolvedIpCandidates();

    try {
      final txt = await SecureStorage().read(_storageKey);
      if (txt != null && txt.isNotEmpty) {
        final idx = int.tryParse(txt);
        if (idx != null && idx >= 0 && idx < apiCandidates.length) {
          _selectedIndex = idx;
        }
      }
    } catch (_) {}
    _loaded = true;
  }

  Future<void> _prependResolvedIpCandidates() async {
    final toInsert = <String>[];
    final seen = <String>{...apiCandidates};
    final ipRegex = RegExp(r'^\d+\.\d+\.\d+\.\d+$');

    for (final candidate in List<String>.from(apiCandidates)) {
      try {
        final uri = Uri.parse(candidate);
        final host = uri.host;
        if (host.isEmpty || ipRegex.hasMatch(host)) continue;

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
            if (toInsert.isNotEmpty) break;
          } catch (_) {
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

  String get selectedApiBaseUrl {
    if (apiCandidates.isEmpty) return '';
    if (_selectedIndex < 0 || _selectedIndex >= apiCandidates.length) {
      return apiCandidates.first;
    }
    return apiCandidates[_selectedIndex];
  }

  int get selectedIndex => _selectedIndex;

  Future<void> setSelectedIndex(int idx) async {
    if (idx < 0 || idx >= apiCandidates.length) return;
    _selectedIndex = idx;
    try {
      await SecureStorage().write(_storageKey, idx.toString());
    } catch (_) {}
  }

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
      apiCandidates.remove(norm);
      apiCandidates.insert(0, norm);
    }
    _selectedIndex = 0;
  }
}
