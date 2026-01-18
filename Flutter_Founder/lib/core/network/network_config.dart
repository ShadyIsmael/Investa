import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Centralized network configuration for the Investa app.
///
/// This class manages:
/// - Base URL for API calls
/// - SignalR Hub URL
/// - Dynamic hostname resolution with mDNS fallback
///
/// Default configuration for physical devices:
/// - Base URL: https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev
/// - SignalR Hub: https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev/hubs/chat
class NetworkConfig {
  // Default hostname (Windows machine name for mDNS discovery)
  static const String defaultHostname = 'DESKTOP-DIH7CQH';
  static const int defaultPort = 5000;

  // SignalR Hub endpoint (match backend MapHub<ChatHub>("/chathub"))
  static const String signalRHubPath = '/chathub';

  String? _customBaseUrl;
  String? _customSignalRUrl;

  /// Get the base URL for API calls
  /// Priority: Custom URL > .env > Default hostname with mDNS
  String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    // Try to read from .env (take first URL if comma-separated)
    final envUrl = dotenv.env['API_BASE_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl.split(',').first.trim();
    }

    // Default: Use hostname with .local for mDNS
    final hostname = dotenv.env['BASE_HOST_NAME'] ?? defaultHostname;
    return 'http://$hostname.local:$defaultPort';
  }

  /// Get the SignalR Hub URL
  /// Priority: Custom URL > .env > Derived from base URL
  String get signalRHubUrl {
    if (_customSignalRUrl != null && _customSignalRUrl!.isNotEmpty) {
      return _customSignalRUrl!;
    }

    // Try to read from .env (take first URL if comma-separated)
    final envUrl = dotenv.env['SIGNALR_HUB_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl.split(',').first.trim();
    }

    // Default: Derive from base URL
    return '$baseUrl$signalRHubPath';
  }

  /// Set a custom base URL (useful for testing or user-provided IP)
  void setCustomBaseUrl(String url) {
    _customBaseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  /// Set a custom SignalR Hub URL
  void setCustomSignalRUrl(String url) {
    _customSignalRUrl = url;
  }

  /// Reset to default configuration
  void resetToDefaults() {
    _customBaseUrl = null;
    _customSignalRUrl = null;
  }

  /// Get list of alternative base URLs to try (for fallback)
  List<String> getBaseUrlCandidates() {
    final hostname = dotenv.env['BASE_HOST_NAME'] ?? defaultHostname;
    return [
      'http://$hostname.local:$defaultPort', // mDNS with .local
      'http://$hostname:$defaultPort', // Direct hostname
      'http://localhost:$defaultPort', // Localhost fallback
    ];
  }

  /// Backwards compatibility alias for older code that used `getApiUrlCandidates()`
  /// Use `getBaseUrlCandidates()` as the canonical name.
  List<String> getApiUrlCandidates() => getBaseUrlCandidates();

  /// Get list of alternative SignalR URLs to try (for fallback)
  List<String> getSignalRUrlCandidates() {
    final candidates = <String>[];

    // First try custom URL if set
    if (_customSignalRUrl != null && _customSignalRUrl!.isNotEmpty) {
      candidates.add(_customSignalRUrl!);
    }

    // Then try .env URLs if available
    final envUrl = dotenv.env['SIGNALR_HUB_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      final envUrls =
          envUrl.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty);
      candidates.addAll(envUrls);
    }

    // Finally add default candidates
    candidates
        .addAll(getBaseUrlCandidates().map((base) => '$base$signalRHubPath'));

    // Remove duplicates while preserving order
    final seen = <String>{};
    return candidates.where((url) => seen.add(url)).toList();
  }
}
