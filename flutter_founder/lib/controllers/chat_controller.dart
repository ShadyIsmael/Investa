import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../core/services/secure_storage_service.dart';
import '../core/services/fcm_service.dart';
import '../core/services/support_chat_http_service.dart';
import '../core/services/logger_service.dart';
import '../core/network/network_config.dart';
import '../models/chat_message.dart';
import '../services/local_notifier.dart';
import '../services/app_state.dart';
import '../services/app_logger.dart';

enum ChatState { idle, waiting, active }

class ChatController extends ChangeNotifier {
  final FCMService _fcmService;
  final LocalNotifier _notifier;
  final SecureStorageService _storage;
  final SupportChatHttpService _httpService;

  ChatState _state = ChatState.idle;
  ChatState get state => _state;

  String? conversationId;
  String? adminId;
  String? adminName;

  final List<ChatMessage> messages = [];
  final List<ChatMessage> _pendingMessages = [];
  bool _isFlushingPending = false;

  /// Number of messages waiting to be sent (queued)
  int get pendingCount => _pendingMessages.length;

  /// Whether there are any messages queued locally
  bool get hasPending => _pendingMessages.isNotEmpty;

  /// Whether a flush/send of pending messages is in progress
  bool get isFlushingPending => _isFlushingPending;

  StreamSubscription<RemoteMessage>? _messageSub;

  ChatController(
    this._fcmService, {
    LocalNotifier? notifier,
    SecureStorageService? storage,
    SupportChatHttpService? httpService,
  })  : _notifier = notifier ?? NoopLocalNotifier(),
        _storage = storage ?? SecureStorageService(),
        _httpService = httpService ??
            SupportChatHttpService(
              logger: LoggerService(),
              secureStorage: storage ?? SecureStorageService(),
              networkConfig: NetworkConfig(),
            );

  Future<void> init() async {
    await _notifier.init();

    // Initialize FCM
    await _fcmService.initialize();

    // Listen to FCM messages
    _messageSub = _fcmService.onMessage.listen((message) {
      _handleFCMMessage(message);
    });

    // If there is a stored active conversation, restore it
    try {
      final stored = await _storage.read('activeConversationId');
      if (stored != null && stored.isNotEmpty) {
        conversationId = stored;
        _state = ChatState.waiting;
        notifyListeners();
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  void _handleFCMMessage(RemoteMessage message) {
    try {
      final data = message.data;

      // Check if it's a support message
      if (data.containsKey('conversationId')) {
        final convId = data['conversationId'] as String?;
        final messageText =
            data['message'] as String? ?? message.notification?.body ?? '';
        final isFromAdmin =
            data['isFromAdmin'] == 'true' || data['isFromAdmin'] == true;
        final senderName = data['senderName'] as String?;

        // Update conversation ID if not set
        if (conversationId == null && convId != null) {
          conversationId = convId;
          _storage.write('activeConversationId', convId);
        }

        // Only process messages for our conversation
        if (convId != null && conversationId == convId) {
          final msg = ChatMessage(
            id: data['messageId'] ??
                DateTime.now().microsecondsSinceEpoch.toString(),
            text: messageText,
            time: DateTime.now(),
            isMe: !isFromAdmin,
            senderName: senderName,
          );

          messages.add(msg);
          notifyListeners();

          // Check if this is an admin joined notification
          if (data.containsKey('adminId')) {
            adminId = data['adminId'] as String?;
            adminName = data['adminName'] as String?;
            _state = ChatState.active;
            notifyListeners();
            _flushPendingMessages();
          }
        }
      }
    } catch (e) {
      AppLogger.logError(
          'chat', 'Error handling FCM message: $e', StackTrace.current);
    }
  }

  /// Reset the current session, clearing history and active conversation state.
  Future<void> resetSession() async {
    conversationId = null;
    adminId = null;
    adminName = null;
    messages.clear();
    _pendingMessages.clear();
    _state = ChatState.idle;

    // Clear subscriptions
    _messageSub?.cancel();
    _messageSub = null;

    try {
      await _storage.delete('activeConversationId');
    } catch (_) {}

    notifyListeners();
  }

  /// Start a new support conversation and wait for an admin to join.
  Future<void> startNewConversation({Map<String, dynamic>? metadata}) async {
    _state = ChatState.waiting;
    notifyListeners();

    try {
      final phone = metadata?['phone'] as String? ??
          AppState.instance.profile?.phone1 ??
          AppState.instance.profile?.phone2 ??
          '';

      if (phone.isEmpty) {
        throw StateError('No phone number available for support request');
      }

      final initialMessage =
          metadata?['initialMessage'] as String? ?? 'Support Request';
      final category = metadata?['type'] as String? ?? 'General';

      // Create support request via HTTP API
      final convId = await _httpService.createSupportRequest(
        userMobile: phone,
        message: initialMessage,
        category: category,
      );

      conversationId = convId;
      await _storage.write('activeConversationId', convId);

      // Add initial message to UI
      final msg = ChatMessage(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        text: initialMessage,
        time: DateTime.now(),
        isMe: true,
      );
      messages.add(msg);
      notifyListeners();

      // Backend will send FCM notification when admin joins
    } catch (e) {
      await cancel();
      rethrow;
    }
  }

  Future<void> sendMessage(String content) async {
    // Create optimistic UI message
    final msg = ChatMessage(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      text: content,
      time: DateTime.now(),
      isMe: true,
    );

    messages.add(msg);
    notifyListeners();

    if (conversationId == null) {
      _pendingMessages.add(msg);
      notifyListeners();
      return;
    }

    // Send message to backend via HTTP API
    try {
      final phone = AppState.instance.profile?.phone1 ??
          AppState.instance.profile?.phone2 ??
          '0000000000';

      await _httpService.sendMessage(
        conversationId: conversationId!,
        message: content,
        userMobile: phone,
      );
    } catch (e) {
      _pendingMessages.add(msg);
      notifyListeners();
      AppLogger.logError(
          'chat', 'Error sending message: $e', StackTrace.current);
    }
  }

  /// Flush any pending messages queued before conversation was created
  Future<void> _flushPendingMessages() async {
    if (_isFlushingPending) return;
    if (conversationId == null) return;
    if (_pendingMessages.isEmpty) return;

    _isFlushingPending = true;
    notifyListeners();

    try {
      final phone = AppState.instance.profile?.phone1 ??
          AppState.instance.profile?.phone2 ??
          '0000000000';

      final pending = List<ChatMessage>.from(_pendingMessages);
      for (final m in pending) {
        try {
          await _httpService.sendMessage(
            conversationId: conversationId!,
            message: m.text,
            userMobile: phone,
          );
          _pendingMessages.remove(m);
          notifyListeners();
        } catch (e) {
          break;
        }
      }
    } finally {
      _isFlushingPending = false;
      notifyListeners();
    }
  }

  /// Log a quick support request (used by quick-action chips)
  Future<void> logQuickSupport(String category, {String? message}) async {
    try {
      final phone = AppState.instance.profile?.phone1 ??
          AppState.instance.profile?.phone2 ??
          '0000000000';

      await _httpService.createSupportRequest(
        userMobile: phone,
        message: message ?? 'Quick action: $category',
        category: category,
      );
    } catch (e) {
      AppLogger.logError(
          'chat', 'Error logging quick support: $e', StackTrace.current);
    }
  }

  Future<void> cancel() async {
    _messageSub?.cancel();
    _messageSub = null;
    _state = ChatState.idle;
    conversationId = null;
    adminId = null;
    adminName = null;
    messages.clear();

    try {
      await _storage.delete('activeConversationId');
    } catch (_) {}

    notifyListeners();
  }

  /// Close the current conversation on the server and reset local state.
  Future<void> closeConversation() async {
    final id = conversationId;
    try {
      if (id != null) {
        await _httpService.closeConversation(id);
      }
    } catch (e) {
      AppLogger.logError('chat', 'Error closing conversation on server: $e',
          StackTrace.current);
    }

    await cancel();
  }

  /// Inject a local system message into the chat (for UX messages)
  void addSystemMessage(String text, {String? senderName}) {
    messages.add(ChatMessage(
      id: 'system-${DateTime.now().microsecondsSinceEpoch}',
      text: text,
      time: DateTime.now(),
      isMe: false,
      senderName: senderName ?? 'Investa Assistant',
    ));
    notifyListeners();
  }

  void insertSystemMessageIfEmpty() {
    if (messages.isEmpty) {
      final systemMessage = ChatMessage(
        id: 'system-${DateTime.now().microsecondsSinceEpoch}',
        text:
            'أهلاً بك في Investa! أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟',
        time: DateTime.now(),
        isMe: false,
        senderName: 'Investa Assistant',
      );
      messages.add(systemMessage);
      notifyListeners();
    }
  }

  /// Add a user message locally and notify listeners (useful for quick actions)
  void addLocalUserMessage(String text) {
    final msg = ChatMessage(
      id: 'local-${DateTime.now().microsecondsSinceEpoch}',
      text: text,
      time: DateTime.now(),
      isMe: true,
    );
    messages.add(msg);
    notifyListeners();
  }

  @override
  void dispose() {
    _messageSub?.cancel();
    _fcmService.dispose();
    super.dispose();
  }
}
