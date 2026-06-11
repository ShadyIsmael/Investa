import 'package:dio/dio.dart';
import '../config/env.dart';

class Conversation {
  final String id;
  final String title;
  final String status;
  final bool isActive;
  final DateTime createdAt;
  final String? otherUserId;
  final String otherUserName;

  Conversation({
    required this.id,
    required this.title,
    required this.status,
    required this.isActive,
    required this.createdAt,
    this.otherUserId,
    required this.otherUserName,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Unknown',
      status: json['status'] as String? ?? 'Pending',
      isActive: json['isActive'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      otherUserId: json['otherUserId'] as String?,
      otherUserName: json['otherUserName'] as String? ?? 'Unknown',
    );
  }
}

class ChatMessage {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final bool isRead;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    required this.isRead,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      text: json['text'] as String? ?? '',
      timestamp: DateTime.parse(json['timestamp'] as String),
      isRead: json['isRead'] as bool? ?? false,
    );
  }
}

class ConversationsService {
  final Dio _dio = Dio();
  final String _baseUrl = Env.apiBaseUrl;

  Future<List<Conversation>> getMyConversations() async {
    try {
      final response = await _dio.get('$_baseUrl/api/conversations');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data.map((json) => Conversation.fromJson(json as Map<String, dynamic>)).toList();
      }
      
      throw Exception('Failed to load conversations');
    } catch (e) {
      throw Exception('Failed to load conversations: $e');
    }
  }

  Future<List<ChatMessage>> getMessages(String conversationId) async {
    try {
      final response = await _dio.get('$_baseUrl/api/conversations/$conversationId/messages');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data.map((json) => ChatMessage.fromJson(json as Map<String, dynamic>)).toList();
      }
      
      throw Exception('Failed to load messages');
    } catch (e) {
      throw Exception('Failed to load messages: $e');
    }
  }

  Future<ChatMessage> sendMessage(String conversationId, String text) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/api/conversations/$conversationId/messages',
        data: {'text': text},
      );
      
      if (response.statusCode == 200) {
        return ChatMessage.fromJson(response.data as Map<String, dynamic>);
      }
      
      throw Exception('Failed to send message');
    } catch (e) {
      throw Exception('Failed to send message: $e');
    }
  }
}
