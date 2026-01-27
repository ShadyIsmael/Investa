class ChatMessage {
  final String id;
  final String text;
  final DateTime time;
  final bool isMe;
  final String? senderName;

  ChatMessage({
    required this.id,
    required this.text,
    required this.time,
    required this.isMe,
    this.senderName,
  });

  // Convenience factory to create from DTO and determine `isMe` by comparing senderId
  factory ChatMessage.fromDto({
    required String id,
    required String text,
    required DateTime time,
    required String senderId,
    required String currentUserId,
    String? senderName,
  }) {
    return ChatMessage(
      id: id,
      text: text,
      time: time,
      isMe: senderId == currentUserId,
      senderName: senderName,
    );
  }
}
