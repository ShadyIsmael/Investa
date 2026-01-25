import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_partner/l10n/app_localizations.dart';
import 'package:flutter_partner/controllers/chat_controller.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_partner/core/services/fcm_service.dart';
import 'package:flutter_partner/core/services/logger_service.dart';
import 'package:flutter_partner/core/services/secure_storage_service.dart';
import 'package:flutter_partner/core/network/network_config.dart';
import 'package:flutter_partner/screens/support_chat_intro_screen.dart';

void main() {
  testWidgets('Support intro shows Live Support button',
      (WidgetTester tester) async {
    // Ensure Firebase is initialized for FCM usage in this test
    await Firebase.initializeApp();

    final chatController = ChatController(
      FCMService(
        logger: LoggerService(),
        secureStorage: SecureStorageService(),
        networkConfig: NetworkConfig(),
      ),
    );

    await tester.pumpWidget(Provider<ChatController>.value(
      value: chatController,
      child: const MaterialApp(
        localizationsDelegates: [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: [Locale('en')],
        home: SupportChatIntroScreen(),
      ),
    ));

    // Verify presence of Live Support button
    expect(find.text('Live Support'), findsOneWidget);
    expect(find.byIcon(Icons.headset_mic), findsOneWidget);
  });
}
