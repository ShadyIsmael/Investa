import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_dark_app/services/config.dart';
import 'secure_storage.dart';

class EndpointResolver {
  EndpointResolver._internal();
  static final EndpointResolver instance = EndpointResolver._internal();

  static const _storageKey = 'resolved_api_index';

  late final List<String> apiCandidates = _parseList(
      const String.fromEnvironment('API_BASE_URL', defaultValue: ''),
      dotenv.env['API_BASE_URL']);

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
}
