import 'dart:developer' as dev;
import 'package:flutter/foundation.dart';

class AppLogger {
  // بنعمل تهيئة للـ Logger
  static Future<void> init() async {
    // هنا ممكن تضيف تهيئة لخدمات زي Sentry أو Firebase Crashlytics مستقبلاً
    logInfo('AppLogger initialized successfully.');
  }

  // تسجيل المعلومات العادية
  static void logInfo(String message) {
    dev.log('ℹ️ INFO: $message', name: 'APP_INFO');
  }

  // تسجيل الأخطاء (وده اللي بنحتاجه في الـ Catch)
  static void logError(String origin, String error, [StackTrace? stack]) {
    dev.log(
      '❌ ERROR at $origin: $error',
      name: 'APP_ERROR',
      error: error,
      stackTrace: stack,
    );

    if (kDebugMode) {
      print('---------- ⚠️ ERROR LOG ----------');
      print('Origin: $origin');
      print('Message: $error');
      if (stack != null) print('Stack: $stack');
      print('----------------------------------');
    }
  }
}
