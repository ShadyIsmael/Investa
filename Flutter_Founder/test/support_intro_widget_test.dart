import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_founder/l10n/app_localizations.dart';
import 'package:flutter_founder/controllers/chat_controller.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_founder/firebase_options.dart';
import 'package:flutter_founder/core/services/fcm_service.dart';
import 'package:flutter_founder/core/services/logger_service.dart';
import 'package:flutter_founder/core/services/secure_storage_service.dart';
import 'package:flutter_founder/core/network/network_config.dart';
import 'package:flutter_founder/screens/support_chat_intro_screen.dart';

void main() {
  testWidgets('Support intro shows Live Support button',
      (WidgetTester tester) async {
    // Ensure Firebase is initialized for FCM usage in this test
    if (kIsWeb) {
      await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform);
    } else {
      await Firebase.initializeApp();
    }

    final chatController = ChatController(
      FCMService(
        logger: LoggerService(),
        secureStorage: SecureStorageService(),
        networkConfig: NetworkConfig(),
      ),
    );

    await tester.pumpWidget(Provider<ChatController>.value(
      value: chatController,
      child: MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [Locale('en')],
        home: const SupportChatIntroScreen(),
      ),
    ));

    // Verify presence of Live Support button
    expect(find.text('Live Support'), findsOneWidget);
    expect(find.byIcon(Icons.headset_mic), findsOneWidget);
  });
}
