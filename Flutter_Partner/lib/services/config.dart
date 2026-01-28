import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Environment configuration for the Investa Partner app.
///
/// Configuration priority (highest to lowest):
/// 1. Compile-time: `--dart-define=KEY=value`
/// 2. Runtime: `.env` file
/// 3. Default values (only for non-sensitive settings)
///
/// IMPORTANT: For local development, create a `.env` file with:
/// ```
/// BASE_HOST_NAME=your-hostname
/// API_BASE_URL=http://your-hostname:5000
/// ```
class Env {
  /// Compile-time override via `--dart-define=API_BASE_URL=...`
  static const _apiBaseUrlConst =
      String.fromEnvironment('API_BASE_URL', defaultValue: '');

  /// Optional base host name for local desktop discovery.
  static const _baseHostNameConst =
      String.fromEnvironment('BASE_HOST_NAME', defaultValue: 'DESKTOP-DIH7CQH');

  /// Host name used to construct local URLs (e.g., http://DESKTOP-DIH7CQH:5000)
  static String get baseHostName {
    if (_baseHostNameConst.isNotEmpty) return _baseHostNameConst;
    final fromDot = dotenv.env['BASE_HOST_NAME'];
    if (fromDot != null && fromDot.isNotEmpty) return fromDot;
    return 'DESKTOP-DIH7CQH';
  }

  /// Runtime value: prefer compile-time, then `.env`, then return empty.
  /// An empty return indicates that API URL is not configured.
  static String get apiBaseUrl {
    if (_apiBaseUrlConst.isNotEmpty) return _apiBaseUrlConst;
    final fromDot = dotenv.env['API_BASE_URL'];
    if (fromDot != null && fromDot.isNotEmpty) return fromDot;

    // No override provided – API base URL is not configured. Set `API_BASE_URL` in
    // your `.env` file or provide `--dart-define=API_BASE_URL=...` at compile time.
    return '';
  }

  /// Whether the API is properly configured.
  static bool get isApiConfigured => apiBaseUrl.isNotEmpty;

  /// How many credits are consumed when the user "Engages" with an investment.
  /// Can be set at compile-time with `--dart-define=ENGAGE_CREDIT_COST=5` or
  /// at runtime via a `.env` file key `ENGAGE_CREDIT_COST`.
  static int get engageCreditCost {
    const engageConst =
        int.fromEnvironment('ENGAGE_CREDIT_COST', defaultValue: -1);
    if (engageConst >= 0) return engageConst;
    final fromDot = dotenv.env['ENGAGE_CREDIT_COST'];
    if (fromDot != null && fromDot.isNotEmpty) {
      final parsed = int.tryParse(fromDot);
      if (parsed != null) return parsed;
    }
    return 5; // default
  }
}
