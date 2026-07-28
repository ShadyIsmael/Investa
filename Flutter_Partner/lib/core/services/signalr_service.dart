import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../services/app_logger.dart';

class SignalRService {
  final _newMessageController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _supportMessageController =
      StreamController<SupportMessageDto>.broadcast();
  final _adminJoinedController = StreamController<AdminJoinedDto>.broadcast();

  bool _connected = false;

  SignalRService({
    dynamic networkConfig,
    dynamic secureStorage,
    dynamic logger,
  }) {
    // No-op constructor for compatibility
  }

  Stream<Map<String, dynamic>> get onNewMessage => _newMessageController.stream;
  Stream<SupportMessageDto> get onSupportMessage =>
      _supportMessageController.stream;
  Stream<AdminJoinedDto> get onAdminJoined => _adminJoinedController.stream;

  bool get isConnected => _connected;

  Future<void> connect() async {
    _connected = true;
    if (kDebugMode) {
      AppLogger.logInfo('signalr', '[SignalRShim] connect() called (no-op)');
    }
  }

  Future<void> disconnect() async {
    _connected = false;
    if (kDebugMode) {
      AppLogger.logInfo('signalr', '[SignalRShim] disconnect() called (no-op)');
    }
  }

  Future<void> joinConversation(String id) async {
    if (kDebugMode) {
      AppLogger.logInfo(
          'signalr', '[SignalRShim] joinConversation($id) called (no-op)');
    }
  }

  Future<void> sendMessage(String conversationId, String message) async {
    if (kDebugMode) {
      AppLogger.logInfo('signalr',
          '[SignalRShim] sendMessage($conversationId, $message) called (no-op)');
    }
  }

  Future<void> closeConversation(String conversationId) async {
    if (kDebugMode) {
      AppLogger.logInfo('signalr',
          '[SignalRShim] closeConversation($conversationId) called (no-op)');
    }
  }

  Future<void> leaveConversation(String conversationId) async {
    return closeConversation(conversationId);
  }

  Future<bool> verifyHandshake() async {
    return true;
  }

  void addRawMessage(Map<String, dynamic> payload) =>
      _newMessageController.add(payload);

  void addSupportMessage(SupportMessageDto dto) =>
      _supportMessageController.add(dto);

  void addAdminJoined(AdminJoinedDto dto) => _adminJoinedController.add(dto);

  void dispose() {
    _newMessageController.close();
    _supportMessageController.close();
    _adminJoinedController.close();
  }
}

class SupportMessageDto {
  final String? id;
  final String? conversationId;
  final String? message;
  final String? senderName;
  final bool isFromAdmin;
  final DateTime? timestamp;

  SupportMessageDto({
    this.id,
    this.conversationId,
    this.message,
    this.senderName,
    this.isFromAdmin = false,
    this.timestamp,
  });
}

class AdminJoinedDto {
  final String? conversationId;
  final String? adminId;
  final String? adminName;

  AdminJoinedDto({this.conversationId, this.adminId, this.adminName});
}
