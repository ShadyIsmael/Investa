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

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase. On web we must pass FirebaseOptions — use placeholders
  // in `lib/firebase_options.dart` and replace them with your project's values.
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform);
  } else {
    await Firebase.initializeApp();
  }

  // Set background message handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  await NotificationService().init();

  try {
    await dotenv.load();
  } catch (_) {}

  try {
    await AppLogger.init();
  } catch (e) {}

  // Initialize endpoint resolver (reads persisted selection if present)
  try {
    await EndpointResolver.instance.init();
  } catch (_) {}

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

  @override
  void initState() {
    super.initState();
    _loadThemeMode();
    _loadLoginState();
    _loadLocale();
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
    } catch (_) {
      // Ignore errors during Google sign-out
    }
    await SecureStorage().deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await _loadLoginState();
  }

  @override
  Widget build(BuildContext context) {
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
        ChangeNotifierProvider(create: (_) => ChatController(fcmService)),
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
