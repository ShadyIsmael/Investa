import 'package:firebase_messaging/firebase_messaging.dart';
import '../../../../core/services/logger_service.dart';
import '../../../../core/services/support_chat_http_service.dart';
import '../../../../core/services/fcm_service.dart';
import '../../domain/entities/support_message.dart';

/// Remote data source for support feature using HTTP + FCM.
abstract class SupportRemoteDataSource {
  Future<void> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  });

  Stream<SupportMessage> listenToMessages();

  Future<void> connect();

  Future<void> disconnect();

  bool isConnected();

  /// Initiate a new support session on the server and return the sessionId (GUID)
  Future<String> initiateSupportSession({
    required String userMobile,
    required String type,
  });
}

class SupportRemoteDataSourceImpl implements SupportRemoteDataSource {
  final SupportChatHttpService httpService;
  final FCMService fcmService;
  final LoggerService logger;

  SupportRemoteDataSourceImpl({
    required this.httpService,
    required this.fcmService,
    required this.logger,
  });

  @override
  Future<void> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  }) async {
    // Use HTTP service to send the message in the conversation
    await httpService.sendMessage(
      conversationId: sessionId,
      message: message,
      userMobile: userMobile,
    );
  }

  @override
  Stream<SupportMessage> listenToMessages() {
    // Map incoming FCM messages to domain SupportMessage entities
    return fcmService.onMessage.map((RemoteMessage m) {
      final data = m.data;
      final convId = data['conversationId']?.toString() ?? '';
      final msgText = data['message']?.toString() ?? m.notification?.body ?? '';
      final isFromAdmin =
          data['isFromAdmin'] == 'true' || data['isFromAdmin'] == true;
      final senderName = data['senderName']?.toString() ?? 'Support';
      final id = data['messageId']?.toString() ??
          m.messageId ??
          DateTime.now().microsecondsSinceEpoch.toString();

      return SupportMessage(
        id: id,
        conversationId: convId,
        message: msgText,
        senderName: senderName,
        isFromAdmin: isFromAdmin,
        timestamp: DateTime.now(),
      );
    });
  }

  @override
  Future<void> connect() async {
    // Ensure FCM is initialized (no-op if already initialized)
    await fcmService.initialize();
  }

  @override
  Future<void> disconnect() async {
    // Nothing to disconnect for HTTP/FCM stack
    return;
  }

  @override
  bool isConnected() {
    // HTTP/FCM doesn't maintain a persistent hub connection; report true if FCM token exists
    return fcmService.currentToken != null;
  }

  @override
  Future<String> initiateSupportSession({
    required String userMobile,
    required String type,
  }) async {
    // Create a new support conversation and return its ID
    final convId = await httpService.createSupportRequest(
      userMobile: userMobile,
      message: 'Support Request',
      category: type,
    );

    return convId;
  }
}
