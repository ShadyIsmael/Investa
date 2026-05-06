import 'package:flutter/foundation.dart';

/// Lightweight local notification abstraction so the app can optionally
/// show local notifications when messages arrive while the app is backgrounded.
///
/// Provide your own implementation (for example using
/// `flutter_local_notifications`) and pass it to the `ChatController`.
abstract class LocalNotifier {
  Future<void> init();
  Future<void> showMessageNotification(String title, String body);
}

class NoopLocalNotifier implements LocalNotifier {
  @override
  Future<void> init() async {}

  @override
  Future<void> showMessageNotification(String title, String body) async {
    if (kDebugMode) debugPrint('LocalNotifier noop: $title — $body');
  }
}

// Example implementation (commented):
// import 'package:flutter_local_notifications/flutter_local_notifications.dart';
// class FlutterLocalNotifier implements LocalNotifier { ... }
