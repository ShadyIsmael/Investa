/// Centralized constants to make local host overrides easy to change.
///
/// For local development:
/// - Set `BASE_HOST_NAME` in your `.env` file
/// - Or pass `--dart-define=BASE_HOST_NAME=your-hostname` at compile time
///
/// For production:
/// - Set `API_BASE_URL` in your `.env` file with the full production URL
/// - Or pass `--dart-define=API_BASE_URL=https://api.investa.com` at compile time
///
/// IMPORTANT: Never commit a hardcoded hostname. Use environment configuration.
class Constants {
  /// Default port for the backend API
  static const int defaultApiPort = 5000;

  /// SignalR hub path (must match backend MapHub configuration)
  static const String signalRHubPath = '/hubs/chat';

  /// Base host name for local discovery.
  /// Override with `--dart-define=BASE_HOST_NAME=your-hostname` or `.env` file.
  static const String BASE_HOST_NAME =
      String.fromEnvironment('BASE_HOST_NAME', defaultValue: 'DESKTOP-DIH7CQH');

  /// Primary SignalR hub URL built from the host name
  static String signalRPrimaryUrl(
          {int port = defaultApiPort, String hubPath = signalRHubPath}) =>
      'http://$BASE_HOST_NAME:$port$hubPath';

  /// Secondary (mDNS) fallback using .local
  static String signalRSecondaryUrl(
          {int port = defaultApiPort, String hubPath = signalRHubPath}) =>
      'http://$BASE_HOST_NAME.local:$port$hubPath';
}
