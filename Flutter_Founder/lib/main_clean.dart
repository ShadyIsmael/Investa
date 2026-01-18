import 'dart:async';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'firebase_options.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'core/di/injection_container.dart';
import 'core/services/logger_service.dart';
import 'core/services/firebase_messaging_service.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/support/presentation/providers/support_provider.dart';
import 'config/routes.dart';
import 'config/theme.dart';

/// Top-level background message handler for Firebase
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform);
  } else {
    await Firebase.initializeApp();
  }
  print('[FCM Background] ${message.notification?.title}');
}

Future<void> main() async {
  // Ensure Flutter is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform);
  } else {
    await Firebase.initializeApp();
  }

  // Set background message handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Load environment variables
  try {
    await dotenv.load();
  } catch (e) {
    print('Warning: .env file not found');
  }

  // Initialize dependency injection
  await initializeDependencies();

  // Initialize Firebase Messaging
  try {
    await sl<FirebaseMessagingService>().initialize();
  } catch (e) {
    sl<LoggerService>().error('[Main]', 'Firebase Messaging init failed: $e');
  }

  // Global error handlers
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    sl<LoggerService>().error(
      '[FlutterError]',
      details.exceptionAsString(),
      details.stack,
    );
  };

  ui.PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    sl<LoggerService>().error('[PlatformDispatcher]', error.toString(), stack);
    return true;
  };

  runApp(const InvestaApp());
}

class InvestaApp extends StatelessWidget {
  const InvestaApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(375, 812), // iPhone X base size
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => sl<AuthProvider>()),
            ChangeNotifierProvider(create: (_) => sl<SupportProvider>()),
            // Add more providers here as needed
          ],
          child: MaterialApp(
            title: 'Investa',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,
            initialRoute: Routes.splash,
            onGenerateRoute: Routes.generateRoute,
            builder: (context, widget) {
              // Ensure text scaling doesn't exceed reasonable limits
              return MediaQuery(
                data: MediaQuery.of(context).copyWith(
                  textScaler: TextScaler.linear(
                      MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.3)),
                ),
                child: widget!,
              );
            },
          ),
        );
      },
    );
  }
}
