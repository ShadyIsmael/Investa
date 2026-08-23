import 'package:flutter_dotenv/flutter_dotenv.dart';

class NetworkConfig {
  static const int defaultPort = 5000;

  static const String defaultHostname = 'DESKTOP-DIH7CQH';

  String? _customBaseUrl;

  String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    final envUrl = dotenv.env['API_BASE_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl.split(',').first.trim();
    }

    final hostname = dotenv.env['BASE_HOST_NAME'] ?? defaultHostname;
    return 'http://$hostname.local:$defaultPort';
  }

  void setCustomBaseUrl(String url) {
    _customBaseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  void resetToDefaults() {
    _customBaseUrl = null;
  }

  List<String> getBaseUrlCandidates() {
    final hostname = dotenv.env['BASE_HOST_NAME'] ?? defaultHostname;
    return [
      'http://$hostname.local:$defaultPort',
      'http://$hostname:$defaultPort',
      'http://localhost:$defaultPort',
    ];
  }

  List<String> getApiUrlCandidates() => getBaseUrlCandidates();
}
