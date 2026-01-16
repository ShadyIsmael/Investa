import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../core/services/secure_storage_service.dart';
import '../core/services/signalr_service.dart';
import '../models/chat_message.dart';
import '../services/local_notifier.dart';
import '../services/app_state.dart';

enum ChatState { idle, waiting, active }

class ChatController extends ChangeNotifier {
  final SignalRService _service;
  final LocalNotifier _notifier;
  final SecureStorageService _storage;

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

  StreamSubscription<AdminJoinedDto>? _adminSub;
  StreamSubscription<SupportMessageDto>? _msgSub;
  StreamSubscription<Map<String, dynamic>>? _legacyMsgSub;

  ChatController(this._service,
      {LocalNotifier? notifier, SecureStorageService? storage})
      : _notifier = notifier ?? NoopLocalNotifier(),
        _storage = storage ?? SecureStorageService();

  Future<void> init() async {
    await _notifier.init();
    // If there is a stored active conversation, restore it so welcome chips are suppressed
    try {
      final stored = await _storage.read('activeConversationId');
      if (stored != null && stored.isNotEmpty) {
        conversationId = stored;
        _state = ChatState.waiting;
        notifyListeners();

        // Attempt to re-join the conversation to receive messages
        if (!_service.isConnected) {
          await _service.connect();
        }
        await _service.joinConversation(stored);
        // Subscriptions will populate messages when events arrive
      }
    } catch (e) {
      // ignore storage errors
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
    _adminSub?.cancel();
    _msgSub?.cancel();
    _legacyMsgSub?.cancel();
    _adminSub = null;
    _msgSub = null;
    _legacyMsgSub = null;

    try {
      await _storage.delete('activeConversationId');
    } catch (_) {}

    notifyListeners();
  }

  /// Start a new support conversation and wait for an admin to join.
  Future<void> startNewConversation({Map<String, dynamic>? metadata}) async {
    _state = ChatState.waiting;
    // Do NOT clear messages here so we preserve the greeting flow
    notifyListeners();

    // Connect if not already connected
    if (!_service.isConnected) {
      await _service.connect();
    }

    // Listen for admin join
    _adminSub = _service.onAdminJoined.listen((adminJoined) async {
      try {
        // Only process if it's for our conversation (or first one we receive)
        if (conversationId != null &&
            adminJoined.conversationId != conversationId) {
          return;
        }

        conversationId ??= adminJoined.conversationId;
        if (conversationId != null) {
          // persist active conversation id
          try {
            await _storage.write('activeConversationId', conversationId!);
          } catch (_) {}
        }
        adminId = adminJoined.adminId;
        adminName = adminJoined.adminName;

        _state = ChatState.active;
        notifyListeners();
        // Flush any queued messages now that we have a conversation id
        _flushPendingMessages();
      } catch (e) {
        print('Error processing admin joined: $e');
      }
    });

    // Subscribe to messages
    _msgSub = _service.onSupportMessage.listen((supportMessage) async {
      try {
        // Only process messages for our conversation
        if (conversationId != null &&
            supportMessage.conversationId != null &&
            supportMessage.conversationId != conversationId) {
          return;
        }

        conversationId ??= supportMessage.conversationId;
        if (conversationId != null) {
          try {
            await _storage.write('activeConversationId', conversationId!);
          } catch (_) {}
        }
        // If conversation became available from an incoming message, flush queued messages
        _flushPendingMessages();

        // Determine if message is from me
        final isMe = !supportMessage.isFromAdmin;

        final msg = ChatMessage(
          id: supportMessage.id ?? '',
          text: supportMessage.message ?? '',
          time: supportMessage.timestamp ?? DateTime.now(),
          isMe: isMe,
        );

        messages.add(msg);
        notifyListeners();

        // Show a local notification if app is backgrounded and message is from admin
        if (supportMessage.isFromAdmin) {
          final state = WidgetsBinding.instance.lifecycleState;
          if (state == AppLifecycleState.paused ||
              state == AppLifecycleState.inactive) {
            _notifier.showMessageNotification(
              supportMessage.senderName ?? 'Admin',
              supportMessage.message ?? 'New message',
            );
          }
        }
      } catch (e) {
        print('Error processing message: $e');
      }
    });

    // Subscribe to legacy/raw messages (e.g. from "ReceiveMessage" event)
    _legacyMsgSub = _service.onNewMessage.listen((raw) {
      try {
        // Only process if conversationId is set
        if (conversationId == null) return;

        // Extract fields
        final content = raw['message'] as String? ?? '';
        final senderId = raw['senderId'] as String?;
        final timestampStr = raw['timestamp'] as String?;

        // Determine if message is from me
        final myId = FirebaseAuth.instance.currentUser?.uid;
        final isMe = (senderId != null && myId != null && senderId == myId);

        // Avoid adding duplicate messages if we already have them (by id or content/time)
        // Ideally we would use a proper ID, but raw message might differ.
        // For now, accept it.

        final msg = ChatMessage(
          id: DateTime.now().microsecondsSinceEpoch.toString(),
          text: content,
          time: timestampStr != null
              ? DateTime.tryParse(timestampStr) ?? DateTime.now()
              : DateTime.now(),
          isMe: isMe,
          senderName: raw['senderName'] ?? 'Support',
        );

        messages.add(msg);
        notifyListeners();
      } catch (e) {
        print('Error processing legacy message: $e');
      }
    });

    // Send support request to server
    try {
      final phone = metadata?['phone'] as String? ??
          AppState.instance.profile?.phone1 ??
          AppState.instance.profile?.phone2 ??
          '';

      if (phone.isEmpty) {
        throw StateError('No phone number available for support request');
      }

      // Create support request DTO
      final request = SupportRequestDto(
        userMobile: phone,
        message: metadata?['initialMessage'] as String? ?? 'Support Request',
        type: metadata?['type'] as String? ?? 'Request',
        conversationId: conversationId,
      );

      // Send the request
      await _service.sendSupportRequest(request);

      // The server will respond with AdminJoined event and set conversationId
    } catch (e) {
      // Cleanup on error
      await cancel();
      rethrow;
    }
  }

  Future<void> sendMessage(String content) async {
    // If conversation not started yet, buffer message locally and show optimistic UI
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

    // Ensure connected before sending
    if (!_service.isConnected) {
      await _service.connect();
    }

    // Get phone number (use fallback if missing)
    final phone = AppState.instance.profile?.phone1 ??
        AppState.instance.profile?.phone2 ??
        '0000000000';

    // Send message via SignalR
    final request = SupportRequestDto(
      userMobile: phone,
      message: content,
      type: 'Message',
      conversationId: conversationId,
    );

    try {
      await _service.sendSupportRequest(request);
    } catch (e) {
      // If send failed, keep in pending for retry
      _pendingMessages.add(msg);
      notifyListeners();
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
      if (!_service.isConnected) {
        await _service.connect();
      }

      final phone = AppState.instance.profile?.phone1 ??
          AppState.instance.profile?.phone2 ??
          '0000000000';

      final pending = List<ChatMessage>.from(_pendingMessages);
      for (final m in pending) {
        final req = SupportRequestDto(
          userMobile: phone,
          message: m.text,
          type: 'Message',
          conversationId: conversationId,
        );

        try {
          await _service.sendSupportRequest(req);
          _pendingMessages.remove(m);
          notifyListeners();
        } catch (e) {
          // stop flushing on first failure to avoid tight loop
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
    // Ensure connection
    if (!_service.isConnected) {
      await _service.connect();
    }

    final phone = AppState.instance.profile?.phone1 ??
        AppState.instance.profile?.phone2 ??
        '';

    final req = SupportRequestDto(
      userMobile: phone.isNotEmpty ? phone : '0000000000',
      message: message ?? 'Quick action: $category',
      type: category,
      conversationId: null,
    );

    await _service.sendSupportRequest(req);
  }

  Future<void> cancel() async {
    _adminSub?.cancel();
    _msgSub?.cancel();
    _legacyMsgSub?.cancel();
    _adminSub = null;
    _msgSub = null;
    _legacyMsgSub = null;
    _state = ChatState.idle;
    conversationId = null;
    adminId = null;
    adminName = null;
    messages.clear();
    // remove persisted conversation id
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
        await _service.closeConversation(id);
      }
    } catch (e) {
      // Log but continue with local cleanup
      print('Error closing conversation on server: $e');
    }

    // Ensure we cleanup local subscriptions and state so next entry shows welcome flow
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
    _adminSub?.cancel();
    _msgSub?.cancel();
    super.dispose();
  }
}
