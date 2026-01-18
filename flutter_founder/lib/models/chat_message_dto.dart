class ChatMessageDto {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String? senderPhone;
  final String content;
  final DateTime createdAt;
  final DateTime? editedAt;
  final String? replyToMessageId;
  final bool isDeleted;
  final List<dynamic> attachments;
  final List<dynamic> reactions;

  ChatMessageDto({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    this.senderPhone,
    required this.content,
    required this.createdAt,
    this.editedAt,
    this.replyToMessageId,
    required this.isDeleted,
    required this.attachments,
    required this.reactions,
  });

  factory ChatMessageDto.fromJson(Map<String, dynamic> json) {
    return ChatMessageDto(
      id: json['id'] as String? ?? '',
      conversationId: json['conversationId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? '',
      senderAvatar: json['senderAvatar'] as String?,
      // backend may send phone under different keys, normalize here
      senderPhone: (json['senderPhone'] as String?) ??
          (json['phone'] as String?) ??
          (json['userMobile'] as String?) ??
          (json['mobile'] as String?),
      content: json['content'] as String? ?? '',
      createdAt: DateTime.parse(json['createdAt'] as String),
      editedAt: json['editedAt'] != null
          ? DateTime.parse(json['editedAt'] as String)
          : null,
      replyToMessageId: json['replyToMessageId'] as String?,
      isDeleted: json['isDeleted'] as bool? ?? false,
      attachments: json['attachments'] as List<dynamic>? ?? [],
      reactions: json['reactions'] as List<dynamic>? ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'conversationId': conversationId,
        'senderId': senderId,
        'senderName': senderName,
        'senderAvatar': senderAvatar,
        'senderPhone': senderPhone,
        'content': content,
        'createdAt': createdAt.toIso8601String(),
        'editedAt': editedAt?.toIso8601String(),
        'replyToMessageId': replyToMessageId,
        'isDeleted': isDeleted,
        'attachments': attachments,
        'reactions': reactions,
      };
}
