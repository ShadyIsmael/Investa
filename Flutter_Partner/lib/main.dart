import 'dart:async';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
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
import 'theme/theme_provider.dart';
import 'package:provider/provider.dart';
import 'controllers/chat_controller.dart';
import 'core/services/fcm_service.dart';
import 'core/services/logger_service.dart';
import 'core/services/secure_storage_service.dart';
import 'core/network/network_config.dart';
import 'firebase_options.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

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

  try {
    if (kIsWeb) {
      AppLogger.logInfo('main',
          'Initializing Firebase for web with DefaultFirebaseOptions...');
      await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform);
      AppLogger.logInfo('main', 'Firebase initialized successfully on web');
    } else {
      AppLogger.logInfo('main', 'Initializing Firebase for mobile...');
      await Firebase.initializeApp();
      AppLogger.logInfo('main', 'Firebase initialized successfully on mobile');
    }
  } catch (e, st) {
    AppLogger.logError('main', 'Firebase initialization error: $e', st);
  }

  try {
    AppLogger.logInfo('main', 'Setting background message handler...');
    // Set background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    AppLogger.logInfo('main', 'Background message handler set successfully');
  } catch (e) {
    AppLogger.logError('main', 'Error setting background message handler: $e');
  }

  try {
    AppLogger.logInfo('main', 'Initializing NotificationService...');
    if (!kIsWeb) {
      // Skip NotificationService on web - requires valid Firebase credentials
      await NotificationService().init();
      AppLogger.logInfo('main', 'NotificationService initialized successfully');
    } else {
      AppLogger.logInfo('main', 'Skipping NotificationService on web platform');
    }
  } catch (e, st) {
    AppLogger.logError(
        'main', 'Error initializing NotificationService: $e', st);
  }
  try {
    AppLogger.logInfo('main', 'Loading dotenv...');
    await dotenv.load();
    AppLogger.logInfo('main', 'Dotenv loaded');
  } catch (e) {
    AppLogger.logError('main', 'Dotenv load failed (expected on web): $e');
  }

  try {
    AppLogger.logInfo('main', 'Initializing AppLogger...');
    await AppLogger.init();
    AppLogger.logInfo('main', 'AppLogger initialized');
  } catch (e) {
    AppLogger.logError('main', 'AppLogger init failed: $e');
  }

  // Initialize endpoint resolver (reads persisted selection if present)
  try {
    AppLogger.logInfo('main', 'Initializing EndpointResolver...');
    await EndpointResolver.instance.init();
    AppLogger.logInfo('main', 'EndpointResolver initialized');
  } catch (e) {
    AppLogger.logError('main', 'EndpointResolver init failed: $e');
  }

  AppLogger.logInfo('main', 'Setting up error handlers...');
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    AppLogger.logError(
        'FlutterError', details.exceptionAsString(), details.stack);
  };

  ui.PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    AppLogger.logError('PlatformDispatcher', error.toString(), stack);
    return true;
  };
  AppLogger.logInfo('main', 'Error handlers set up');

  AppLogger.logInfo('main', 'About to run MyApp widget...');
  runApp(const MyApp());
  AppLogger.logInfo('main', 'MyApp widget started');
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final ThemeProvider _themeProvider = ThemeProvider();
  final LocaleProvider _localeProvider = LocaleProvider();
  bool _isLoggedIn = false;
  bool _providersReady = false;

  @override
  void initState() {
    super.initState();
    AppLogger.logInfo('MyApp', 'initState called');
    _initializeProviders();
    _loadLoginState();
  }

  Future<void> _initializeProviders() async {
    await _themeProvider.loadThemePreference();
    await _localeProvider.init();
    if (mounted) {
      setState(() => _providersReady = true);
    }
  }

  Future<void> _loadLoginState() async {
    AppLogger.logInfo('MyApp', '_loadLoginState started');
    final prefs = await SharedPreferences.getInstance();
    final prefLoggedIn = prefs.getBool('logged_in') ?? false;
    final user = FirebaseAuth.instance.currentUser;
    final resolved = (user != null) || prefLoggedIn;
    AppLogger.logInfo('MyApp',
        'Login state: prefLoggedIn=$prefLoggedIn, user=$user, resolved=$resolved');
    if (mounted) {
      setState(() => _isLoggedIn = resolved);
      AppLogger.logInfo('MyApp', '_isLoggedIn set to: $resolved');
    }
  }

  Future<void> _logout() async {
    await FirebaseAuth.instance.signOut();
    try {
      if (!kIsWeb) {
        final googleSignIn = GoogleSignIn();
        await googleSignIn.signOut();
      } else {
        AppLogger.logInfo('main._logout',
            'Skipping GoogleSignIn.signOut on web: clientId not configured');
      }
    } catch (e) {
      AppLogger.logInfo('main._logout', 'GoogleSignIn signOut skipped: $e');
    }
    await SecureStorage().deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await _loadLoginState();
  }

  @override
  Widget build(BuildContext context) {
    AppLogger.logInfo('MyApp', 'build called, _isLoggedIn=$_isLoggedIn');
    // Initialize FCM service
    final logger = LoggerService();
    final secureStorage = SecureStorageService();
    final networkConfig = NetworkConfig();
    final fcmService = FCMService(
      networkConfig: networkConfig,
      secureStorage: secureStorage,
      logger: logger,
    );

    final themeMode =
        _themeProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light;

    final homeWidget = _isLoggedIn
        ? MainWrapper(
            themeMode: themeMode,
            currentLocale: _localeProvider.currentLocale,
            onLocaleChanged: _localeProvider.setLocale,
            onThemeChanged: (mode) =>
                _themeProvider.setDarkMode(mode == ThemeMode.dark),
            onLogout: _logout,
          )
        : AuthScreen(onLogin: () => _loadLoginState());

    AppLogger.logInfo('MyApp', 'Home widget: ${homeWidget.runtimeType}');

    if (!_providersReady) {
      return const MaterialApp(
        home: Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _themeProvider),
        ChangeNotifierProvider.value(value: _localeProvider),
        ChangeNotifierProvider(create: (_) => ChatController(fcmService)),
      ],
      child: Consumer2<ThemeProvider, LocaleProvider>(
        builder: (context, themeProvider, localeProvider, _) {
          return MaterialApp(
            title: 'Investment Partner',
            debugShowCheckedModeBanner: false,
            locale: localeProvider.currentLocale,
            supportedLocales: const [Locale('en'), Locale('ar')],
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            theme: themeProvider.currentTheme,
            darkTheme: themeProvider.currentTheme,
            themeMode:
                themeProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            home: homeWidget,
          );
        },
      ),
    );
  }
}
