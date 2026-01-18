// GENERATED FILE (placeholder)
// Replace the placeholder values below with your Firebase project's configuration.

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    throw UnsupportedError(
        'DefaultFirebaseOptions have not been configured for this platform.');
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: '<YOUR_API_KEY>',
    authDomain: '<YOUR_PROJECT>.firebaseapp.com',
    projectId: '<YOUR_PROJECT_ID>',
    storageBucket: '<YOUR_PROJECT>.appspot.com',
    messagingSenderId: '<YOUR_SENDER_ID>',
    appId: '<YOUR_WEB_APP_ID>',
    measurementId: '<YOUR_MEASUREMENT_ID>',
  );
}
