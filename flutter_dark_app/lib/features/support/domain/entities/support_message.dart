import 'package:equatable/equatable.dart';

/// Domain entity representing a support message.
class SupportMessage extends Equatable {
  final String id;
  final String conversationId;
  final String message;
  final String senderName;
  final bool isFromAdmin;
  final DateTime timestamp;

  const SupportMessage({
    required this.id,
    required this.conversationId,
    required this.message,
    required this.senderName,
    required this.isFromAdmin,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [
        id,
        conversationId,
        message,
        senderName,
        isFromAdmin,
        timestamp,
      ];

  SupportMessage copyWith({
    String? id,
    String? conversationId,
    String? message,
    String? senderName,
    bool? isFromAdmin,
    DateTime? timestamp,
  }) {
    return SupportMessage(
      id: id ?? this.id,
      conversationId: conversationId ?? this.conversationId,
      message: message ?? this.message,
      senderName: senderName ?? this.senderName,
      isFromAdmin: isFromAdmin ?? this.isFromAdmin,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
