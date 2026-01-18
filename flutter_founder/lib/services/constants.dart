/// Centralized constants to make local host overrides easy to change
/// Update `BASE_HOST_NAME` here (or pass `--dart-define=BASE_HOST_NAME=...`)
/// to point the mobile app at a different machine name.
class Constants {
  // Default host name for local desktop discovery. Override with --dart-define
  static const String BASE_HOST_NAME =
      String.fromEnvironment('BASE_HOST_NAME', defaultValue: 'DESKTOP-DIH7CQH');

  /// Primary SignalR hub URL built from the host name
  static String signalRPrimaryUrl(
          {int port = 5000, String hubPath = '/hubs/chat'}) =>
      'http://$BASE_HOST_NAME:$port$hubPath';

  /// Secondary (mDNS) fallback using .local
  static String signalRSecondaryUrl(
          {int port = 5000, String hubPath = '/hubs/chat'}) =>
      'http://$BASE_HOST_NAME.local:$port$hubPath';
}
