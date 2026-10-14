import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FirebaseFoundation {
  FirebaseFoundation._();

  static final FirebaseFoundation instance = FirebaseFoundation._();

  bool _initialized = false;

  bool get isInitialized => _initialized;

  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      _initialized = true;
    } catch (_) {
      // Firebase options are supplied by the deployment environment. The app remains
      // usable in local builds where that environment is intentionally absent.
      _initialized = false;
    }
  }

  Future<AuthorizationStatus?> requestMessagingPermission() async {
    if (!_initialized) return null;
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: true,
    );
    return settings.authorizationStatus;
  }

  Future<String?> readToken() async {
    if (!_initialized) return null;
    return FirebaseMessaging.instance.getToken();
  }

  Stream<String> get tokenRefreshes => _initialized
      ? FirebaseMessaging.instance.onTokenRefresh
      : const Stream<String>.empty();
}
