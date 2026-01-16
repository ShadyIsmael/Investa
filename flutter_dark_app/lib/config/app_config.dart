/// Application-wide configuration constants.
class AppConfig {
  // App Info
  static const String appName = 'Investa';
  static const String appVersion = '2.0.0';

  // Network
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // SignalR
  static const Duration signalRReconnectDelay = Duration(seconds: 2);
  static const int signalRMaxReconnectAttempts = 5;

  // UI
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 12.0;
  static const double cardElevation = 2.0;

  // Pagination
  static const int defaultPageSize = 20;

  // Cache
  static const Duration cacheExpiry = Duration(hours: 1);

  // Credits
  static const int engageCreditCost = 5;
}
