import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fopx_founder/app/app.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test(
    'theme preference defaults to system and persists a manual selection',
    () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(
        await container.read(themeModeControllerProvider.future),
        ThemeMode.system,
      );
      await container
          .read(themeModeControllerProvider.notifier)
          .setThemeMode(ThemeMode.dark);
      expect(
        container.read(themeModeControllerProvider).valueOrNull,
        ThemeMode.dark,
      );
      expect(
        SharedPreferences.getInstance().then(
          (prefs) => prefs.getString('fopx.theme_mode'),
        ),
        completion('dark'),
      );
    },
  );
}
