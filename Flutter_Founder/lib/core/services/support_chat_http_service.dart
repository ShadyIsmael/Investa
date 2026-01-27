import 'dart:convert';
import 'package:http/http.dart' as http;
import '../services/logger_service.dart';
import '../services/secure_storage_service.dart';
import '../network/network_config.dart';

/// HTTP Service for support chat API calls
/// Replaces SignalR real-time communication with REST API
class SupportChatHttpService {
  final LoggerService logger;
  final SecureStorageService secureStorage;
  final NetworkConfig networkConfig;

  SupportChatHttpService({
    required this.logger,
    required this.secureStorage,
    required this.networkConfig,
  });

  /// Create a new support conversation
  /// Returns conversationId
  Future<String> createSupportRequest({
    required String userMobile,
    required String message,
    String? category,
  }) async {
    try {
      final baseUrl = networkConfig.baseUrl;
      final url = Uri.parse('$baseUrl/api/support/requests');

      final authToken = await secureStorage.read('auth_token');
      if (authToken == null) {
        throw Exception('No authentication token available');
      }

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({
          'userMobile': userMobile,
          'message': message,
          'category': category ?? 'General',
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final conversationId = data['conversationId'] as String?;

        if (conversationId == null) {
          throw Exception('No conversationId in response');
        }

        logger.info(
            '[SupportChat]', 'Support request created: $conversationId');
        return conversationId;
      } else {
        throw Exception(
            'Failed to create support request: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      logger.error(
          '[SupportChat]', 'Error creating support request: $e', stackTrace);
      rethrow;
    }
  }

  /// Send a message in an existing conversation
  Future<void> sendMessage({
    required String conversationId,
    required String message,
    required String userMobile,
  }) async {
    try {
      final baseUrl = networkConfig.baseUrl;
      final url = Uri.parse(
          '$baseUrl/api/support/conversations/$conversationId/messages');

      final authToken = await secureStorage.read('auth_token');
      if (authToken == null) {
        throw Exception('No authentication token available');
      }

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({
          'conversationId': conversationId,
          'message': message,
          'userMobile': userMobile,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 200 ||
          response.statusCode == 201 ||
          response.statusCode == 204) {
        logger.info('[SupportChat]', 'Message sent successfully');
      } else {
        throw Exception('Failed to send message: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      logger.error('[SupportChat]', 'Error sending message: $e', stackTrace);
      rethrow;
    }
  }

  /// Close a support conversation
  Future<void> closeConversation(String conversationId) async {
    try {
      final baseUrl = networkConfig.baseUrl;
      final url =
          Uri.parse('$baseUrl/api/support/conversations/$conversationId/close');

      final authToken = await secureStorage.read('auth_token');
      if (authToken == null) {
        throw Exception('No authentication token available');
      }

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        logger.info('[SupportChat]', 'Conversation closed: $conversationId');
      } else {
        throw Exception('Failed to close conversation: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      logger.error(
          '[SupportChat]', 'Error closing conversation: $e', stackTrace);
      rethrow;
    }
  }

  /// Get conversation history
  Future<List<Map<String, dynamic>>> getConversationHistory(
      String conversationId) async {
    try {
      final baseUrl = networkConfig.baseUrl;
      final url = Uri.parse(
          '$baseUrl/api/support/conversations/$conversationId/messages');

      final authToken = await secureStorage.read('auth_token');
      if (authToken == null) {
        throw Exception('No authentication token available');
      }

      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $authToken',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          return List<Map<String, dynamic>>.from(data);
        } else if (data is Map && data.containsKey('messages')) {
          return List<Map<String, dynamic>>.from(data['messages']);
        }
        return [];
      } else {
        throw Exception(
            'Failed to get conversation history: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      logger.error('[SupportChat]', 'Error getting conversation history: $e',
          stackTrace);
      rethrow;
    }
  }

  /// Send typing indicator (optional, if backend supports it)
  Future<void> sendTypingIndicator(String conversationId, bool isTyping) async {
    try {
      final baseUrl = networkConfig.baseUrl;
      final url = Uri.parse(
          '$baseUrl/api/support/conversations/$conversationId/typing');

      final authToken = await secureStorage.read('auth_token');
      if (authToken == null) return;

      await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $authToken',
            },
            body: jsonEncode({
              'isTyping': isTyping,
            }),
          )
          .timeout(const Duration(seconds: 5));
    } catch (e) {
      // Typing indicator is best-effort, don't propagate errors
      logger.debug('[SupportChat]', 'Typing indicator error (ignored): $e');
    }
  }
}
