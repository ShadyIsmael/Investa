class ConversationDto {
  final String id;
  final int type;
  final String title;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;

  ConversationDto({
    required this.id,
    required this.type,
    required this.title,
    this.lastMessage,
    this.lastMessageAt,
    required this.unreadCount,
  });

  factory ConversationDto.fromJson(Map<String, dynamic> json) {
    return ConversationDto(
      id: json['id'] as String? ?? '',
      type: json['type'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      lastMessage: json['lastMessage'] as String?,
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.parse(json['lastMessageAt'] as String)
          : null,
      unreadCount: json['unreadCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'lastMessage': lastMessage,
        'lastMessageAt': lastMessageAt?.toIso8601String(),
        'unreadCount': unreadCount,
      };
}
