import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../features/notifications/data/notification_runtime.dart';
import '../features/profile/data/profile_controller.dart';
import '../features/projects/data/projects_controller.dart';
import 'router/app_router.dart';

final localeControllerProvider =
    AsyncNotifierProvider<LocaleController, Locale>(LocaleController.new);

final themeModeControllerProvider =
    AsyncNotifierProvider<ThemeModeController, ThemeMode>(
      ThemeModeController.new,
    );

class ThemeModeController extends AsyncNotifier<ThemeMode> {
  static const _key = 'fopx.theme_mode';

  @override
  Future<ThemeMode> build() async {
    final preferences = await SharedPreferences.getInstance();
    return switch (preferences.getString(_key)) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    final preferences = await SharedPreferences.getInstance();
    final value = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };
    await preferences.setString(_key, value);
    state = AsyncData(mode);
  }
}

class LocaleController extends AsyncNotifier<Locale> {
  static const _key = 'fopx.language';

  @override
  Future<Locale> build() async {
    final preferences = await SharedPreferences.getInstance();
    final definedCode = String.fromEnvironment('FOPX_DEFAULT_LOCALE');
    final code =
        definedCode.isNotEmpty
            ? definedCode
            : (preferences.getString(_key) ?? 'en');
    return Locale(code);
  }

  Future<void> setLocale(Locale locale) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_key, locale.languageCode);
    state = AsyncData(locale);
  }
}

class FopxApp extends ConsumerStatefulWidget {
  const FopxApp({super.key});

  @override
  ConsumerState<FopxApp> createState() => _FopxAppState();
}

class _FopxAppState extends ConsumerState<FopxApp> {
  late final FounderNotificationRuntime _notificationRuntime;
  ProviderSubscription<AsyncValue<SessionState>>? _sessionSubscription;

  @override
  void initState() {
    super.initState();
    _notificationRuntime = FounderNotificationRuntime(
      ref,
      ref.read(appRouterProvider),
    );
    _sessionSubscription = ref.listenManual<AsyncValue<SessionState>>(
      sessionControllerProvider,
      (_, next) {
        final session = next.valueOrNull;
        final authenticated = session?.isAuthenticated ?? false;
        if (session != null && !authenticated) {
          // These are the only long-lived Founder business-data caches.
          // Invalidate them for explicit logout and refresh/session expiry.
          ref.invalidate(projectsControllerProvider);
          ref.invalidate(founderProfileProvider);
          ref.invalidate(founderTrustScoreProvider);
        }
        unawaited(_notificationRuntime.onAuthenticationChanged(authenticated));
      },
      fireImmediately: true,
    );
    unawaited(_initializeOptionalFirebase());
  }

  Future<void> _initializeOptionalFirebase() async {
    await FirebaseFoundation.instance.initialize();
    if (!mounted) return;
    await _notificationRuntime.onAuthenticationChanged(
      ref.read(sessionControllerProvider).valueOrNull?.isAuthenticated ?? false,
    );
  }

  @override
  void dispose() {
    _sessionSubscription?.close();
    unawaited(_notificationRuntime.onAuthenticationChanged(false));
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locale =
        ref.watch(localeControllerProvider).valueOrNull ?? const Locale('en');
    final themeMode =
        ref.watch(themeModeControllerProvider).valueOrNull ?? ThemeMode.system;
    return MaterialApp.router(
      title: 'FOPX Founder',
      debugShowCheckedModeBanner: false,
      theme: FopxTheme.founderLight(),
      darkTheme: FopxTheme.founderDark(),
      themeMode: themeMode,
      locale: locale,
      supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
      localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
        FopxLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: ref.watch(appRouterProvider),
    );
  }
}
