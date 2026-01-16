import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/services/logger_service.dart';
import '../../../../core/services/signalr_service.dart';
import '../../domain/entities/support_message.dart';

/// Remote data source for support feature using SignalR.
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
  final SignalRService signalRService;
  final LoggerService logger;

  SupportRemoteDataSourceImpl({
    required this.signalRService,
    required this.logger,
  });

  @override
  Future<void> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  }) async {
    final url = Uri.parse(
        'https://api.example.com/api/support/sessions/$sessionId/messages');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userMobile': userMobile,
        'message': message,
        'type': type,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to send support request');
    }
  }

  @override
  Stream<SupportMessage> listenToMessages() {
    return signalRService.onSupportMessage.map((dto) {
      return SupportMessage(
        id: dto.id ?? '',
        conversationId: dto.conversationId ?? '',
        message: dto.message ?? '',
        senderName: dto.senderName ?? 'Unknown',
        isFromAdmin: dto.isFromAdmin,
        timestamp: dto.timestamp ?? DateTime.now(),
      );
    });
  }

  @override
  Future<void> connect() async {
    await signalRService.connect();
  }

  @override
  Future<void> disconnect() async {
    await signalRService.disconnect();
  }

  @override
  bool isConnected() {
    return signalRService.isConnected;
  }

  @override
  Future<String> initiateSupportSession({
    required String userMobile,
    required String type,
  }) async {
    final url = Uri.parse('https://api.example.com/api/support/sessions');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userMobile': userMobile,
        'type': type,
      }),
    );

    if (response.statusCode == 201) {
      final responseData = jsonDecode(response.body);
      return responseData['sessionId'];
    } else {
      throw Exception('Failed to initiate support session');
    }
  }
}
