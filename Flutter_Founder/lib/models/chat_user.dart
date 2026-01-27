class ChatUser {
  final String id;
  final String name;
  final String avatarUrl;
  final String lastMessage;
  final DateTime lastSeen;
  final bool online;
  final String? email;
  final String? phone;
  final String? address;

  ChatUser({
    required this.id,
    required this.name,
    required this.avatarUrl,
    required this.lastMessage,
    required this.lastSeen,
    this.online = false,
    this.email,
    this.phone,
    this.address,
  });
}
