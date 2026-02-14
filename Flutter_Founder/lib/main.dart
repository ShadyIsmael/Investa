import 'dart:async';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'firebase_options.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'services/app_logger.dart';
import 'services/notification_service.dart';
import 'services/secure_storage.dart';
import 'services/endpoint_resolver.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
import 'screens/auth_screen.dart';
import 'screens/main_wrapper.dart';
import 'services/app_state.dart';
import 'theme/app_theme.dart';
import 'package:provider/provider.dart';
import 'controllers/chat_controller.dart';
import 'core/services/fcm_service.dart';
import 'core/services/logger_service.dart';
import 'core/services/secure_storage_service.dart';
import 'core/network/network_config.dart';

// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform);
  } else {
    await Firebase.initializeApp();
  }
  AppLogger.logInfo('fcm', 'Handling background message: ${message.messageId}');
  AppLogger.logInfo('fcm', 'Data: ${message.data}');

  // Process data payload
  if (message.data.containsKey('conversationId')) {
    final conversationId = message.data['conversationId'];
    AppLogger.logInfo('fcm', 'New message in conversation: $conversationId');
  }
}

String? _startupError;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase. On web we must pass FirebaseOptions — use placeholders
  // in `lib/firebase_options.dart` and replace them with your project's values.
  try {
    if (kIsWeb) {
      await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform);
    } else {
      await Firebase.initializeApp();
    }
  } catch (e, s) {
    _startupError = 'Firebase initialization failed: $e';
    AppLogger.logError('startup', 'Firebase init failed: $e', s);
  }

  // Set background message handler
  try {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e, s) {
    AppLogger.logError('startup', 'Failed to set background handler: $e', s);
  }

  try {
    await NotificationService().init();
  } catch (e, s) {
    AppLogger.logError('startup', 'NotificationService init failed: $e', s);
  }

  try {
    await dotenv.load();
  } catch (e) {
    AppLogger.logInfo('startup', 'dotenv.load() failed or missing .env: $e');
  }

  try {
    await AppLogger.init();
  } catch (e, s) {
    AppLogger.logError('startup', 'AppLogger.init failed: $e', s);
  }

  // Initialize endpoint resolver (reads persisted selection if present)
  try {
    await EndpointResolver.instance.init();
  } catch (e, s) {
    AppLogger.logError('startup', 'EndpointResolver init failed: $e', s);
  }

  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    AppLogger.logError(
        'FlutterError', details.exceptionAsString(), details.stack);
  };

  ui.PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    AppLogger.logError('PlatformDispatcher', error.toString(), stack);
    return true;
  };

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.system;
  bool _isLoggedIn = false;
  Locale? _locale;

  late final FCMService _fcmService;
  bool _fcmInitialized = false;

  @override
  void initState() {
    super.initState();
    _loadThemeMode();
    _loadLoginState();
    _loadLocale();

    // Initialize global FCM service and subscribe to investment creation events
    _initFcm();
  }

  Future<void> _initFcm() async {
    final logger = LoggerService();
    final secureStorage = SecureStorageService();
    final networkConfig = NetworkConfig();
    _fcmService = FCMService(
      networkConfig: networkConfig,
      secureStorage: secureStorage,
      logger: logger,
    );

    try {
      await _fcmService.initialize();
      _fcmInitialized = true;
    } catch (e, s) {
      AppLogger.logError('FCM', 'Failed to initialize FCM: $e', s);
    }

    // Listen for investment created notifications and trigger UI refresh
    _fcmService.onMessage.listen((message) {
      try {
        final type = message.data['type'] as String? ?? '';
        if (type == 'investment_created') {
          AppLogger.logInfo(
              'FCM', 'Investment created event received: ${message.data}');
          AppState.instance.triggerRefresh();
        }
      } catch (e) {
        AppLogger.logError(
            'FCM', 'Error processing FCM message: $e', StackTrace.current);
      }
    });
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString('locale');
    if (code != null && mounted) setState(() => _locale = Locale(code));
  }

  Future<void> _setLocale(Locale locale) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('locale', locale.languageCode);
    setState(() => _locale = locale);
  }

  Future<void> _loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString('themeMode') ?? 'system';
    setState(() => _themeMode = _themeModeFromString(stored));
  }

  ThemeMode _themeModeFromString(String s) {
    switch (s) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> _setThemeMode(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('themeMode', mode.name);
    setState(() => _themeMode = mode);
  }

  // الدالة دي هي المحرك الأساسي
  Future<void> _loadLoginState() async {
    final prefs = await SharedPreferences.getInstance();
    final prefLoggedIn = prefs.getBool('logged_in') ?? false;
    final user = FirebaseAuth.instance.currentUser;
    final resolved = (user != null) || prefLoggedIn;
    if (mounted) {
      setState(() => _isLoggedIn = resolved);
    }
  }

  Future<void> _logout() async {
    await FirebaseAuth.instance.signOut();
    try {
      await GoogleSignIn.instance.disconnect();
    } catch (e) {
      // Ignore errors during Google sign-out - log for debugging
      AppLogger.logInfo('main._logout', 'GoogleSignIn disconnect skipped: $e');
    }
    await SecureStorage().deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await _loadLoginState();
  }

  @override
  Widget build(BuildContext context) {
    // If startup error occurred, show it prominently to help debugging on web
    if (_startupError != null) {
      return MaterialApp(
        title: 'Investa - Startup Error',
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          appBar: AppBar(title: const Text('Startup Error')),
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(_startupError!, textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                      onPressed: () {
                        // Show console hint
                        AppLogger.logInfo('startup', 'User tapped show logs');
                      },
                      child: const Text('Open DevTools and check console'))
                ],
              ),
            ),
          ),
        ),
      );
    }

    // Initialize FCM service
    final logger = LoggerService();
    final secureStorage = SecureStorageService();
    final networkConfig = NetworkConfig();
    final fcmService = FCMService(
      networkConfig: networkConfig,
      secureStorage: secureStorage,
      logger: logger,
    );

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ChatController(_fcmService)),
      ],
      child: MaterialApp(
        title: 'Investa',
        debugShowCheckedModeBanner: false,
        locale: _locale,
        supportedLocales: const [Locale('en'), Locale('ar')],
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: _themeMode,
        home: _isLoggedIn
            ? MainWrapper(
                themeMode: _themeMode,
                onThemeChanged: _setThemeMode,
                onLogout: _logout,
                currentLocale: _locale,
                onLocaleChanged: _setLocale,
              )
            // التعديل هنا لضمان عمل الـ Navigation بعد الضغط على Sign in
            : AuthScreen(onLogin: () => _loadLoginState()),
      ),
    );
  }
}
