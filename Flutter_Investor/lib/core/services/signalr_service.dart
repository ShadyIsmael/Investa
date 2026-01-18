import 'dart:async';

import 'package:flutter/foundation.dart';

/// Lightweight compatibility shim for SignalRService.
/// This class provides the minimal API used by UI code so older
/// widgets/screens continue to compile after SignalR removal.
///
/// NOTE: This is a no-op / adapter: real messaging now uses HTTP + FCM.
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

  // Public streams
  Stream<Map<String, dynamic>> get onNewMessage => _newMessageController.stream;
  Stream<SupportMessageDto> get onSupportMessage =>
      _supportMessageController.stream;
  Stream<AdminJoinedDto> get onAdminJoined => _adminJoinedController.stream;

  bool get isConnected => _connected;

  /// Connect is a no-op in the new architecture. It sets internal flag to true
  Future<void> connect() async {
    _connected = true;
    if (kDebugMode) {
      // ignore: avoid_print
      print('[SignalRShim] connect() called (no-op)');
    }
  }

  Future<void> disconnect() async {
    _connected = false;
    if (kDebugMode) {
      // ignore: avoid_print
      print('[SignalRShim] disconnect() called (no-op)');
    }
  }

  Future<void> joinConversation(String id) async {
    if (kDebugMode) {
      // ignore: avoid_print
      print('[SignalRShim] joinConversation($id) called (no-op)');
    }
  }

  Future<void> sendMessage(String conversationId, String message) async {
    if (kDebugMode) {
      // ignore: avoid_print
      print(
          '[SignalRShim] sendMessage($conversationId, $message) called (no-op)');
    }
  }

  Future<void> closeConversation(String conversationId) async {
    if (kDebugMode) {
      // ignore: avoid_print
      print('[SignalRShim] closeConversation($conversationId) called (no-op)');
    }
  }

  /// Convenience alias used by UI when leaving a chat
  Future<void> leaveConversation(String conversationId) async {
    return closeConversation(conversationId);
  }

  /// Compatibility method used by some debug UIs to verify a working handshake.
  Future<bool> verifyHandshake() async {
    // No real handshake in shim; return true to indicate "ok".
    return true;
  }

  /// Utility: Add a new raw message - used in tests or by other adapters
  void addRawMessage(Map<String, dynamic> payload) =>
      _newMessageController.add(payload);

  /// Utility: Add a support message DTO
  void addSupportMessage(SupportMessageDto dto) =>
      _supportMessageController.add(dto);

  /// Utility: Add admin joined event
  void addAdminJoined(AdminJoinedDto dto) => _adminJoinedController.add(dto);

  void dispose() {
    _newMessageController.close();
    _supportMessageController.close();
    _adminJoinedController.close();
  }
}

/// Minimal DTOs to satisfy existing UI code.
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
