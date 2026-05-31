import 'dart:async';
import 'dart:io';
import 'package:signalr_netcore/signalr_client.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'secure_storage.dart';
import 'endpoint_resolver.dart';
import 'app_logger.dart';
import 'constants.dart';

/// SignalR hub URL is resolved at runtime from environment variables.
/// Set `SIGNALR_HUB_URL` in your `.env` file (loaded in `main.dart`).

class SignalRService {
  SignalRService._internal();
  static final SignalRService _instance = SignalRService._internal();
  factory SignalRService() => _instance;

  HubConnection? _connection;
  final Set<String> _joinedConversations = <String>{};

  final _newMessageController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _messageDeletedController = StreamController<List<String>>.broadcast();
  final _userTypingController = StreamController<List<String>>.broadcast();
  final _conversationUpdatedController =
      StreamController<Map<String, dynamic>>.broadcast();
  // Signals when an admin joins a conversation. Payload is a Map with
  // { conversationId, adminId, adminName, ... }
  final _adminJoinedController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onNewMessage => _newMessageController.stream;
  Stream<List<String>> get onMessageDeleted => _messageDeletedController.stream;
  Stream<List<String>> get onUserTyping => _userTypingController.stream;
  Stream<Map<String, dynamic>> get onConversationUpdated =>
      _conversationUpdatedController.stream;
  Stream<Map<String, dynamic>> get onAdminJoined =>
      _adminJoinedController.stream;

  bool get isConnected =>
      _connection != null && _connection!.state == HubConnectionState.Connected;

  /// Connects to the SignalR hub.
  ///
  /// If [hubUrl] is null, this will resolve the URL from the environment
  /// variable `SIGNALR_HUB_URL` (loaded via `flutter_dotenv`).
  ///
  /// This method prefers WebSockets (`HttpTransportType.webSockets`) and will
  /// fall back to LongPolling if WebSockets fail. `withAutomaticReconnect()` is
  /// enabled to recover from transient network drops. For local HTTPS dev
  /// servers using a self-signed certificate, the client will use an insecure
  /// HTTP client that bypasses certificate validation (only when the host is a
  /// local/private IP) to make local testing simpler.
  ///
  /// If [hubUrl] is null, this will resolve the URL from the environment
  /// variable `SIGNALR_HUB_URL` (loaded via `flutter_dotenv`) or saved
  /// runtime config in `SecureStorage` under the same key.
  ///
  /// Returns `true` if the connection is started successfully, `false`
  /// if no hub URL was configured (caller should handle UI fallback).
  Future<bool> connect(String? hubUrl,
      {Future<String?> Function()? accessTokenFactory}) async {
    if (isConnected) return true;

    // Resolve SignalR hub URL.
    // Prefer an explicitly-passed hubUrl, then any resolved selection from
    // EndpointResolver (which persists the working API index), then .env or
    // SecureStorage fallback.
    String? resolvedUrl;
    if (hubUrl != null && hubUrl.isNotEmpty) {
      resolvedUrl = hubUrl;
    } else {
      // Try resolver first (it may have a selected index saved).
      final candidate = EndpointResolver.instance.selectedSignalRHubUrl;
      if (candidate.isNotEmpty) resolvedUrl = candidate;
      // No selected candidate - fall back to explicit env or stored value
      resolvedUrl ??= dotenv.env['SIGNALR_HUB_URL'];
      if (resolvedUrl == null || resolvedUrl.isEmpty) {
        resolvedUrl = await SecureStorage().read('SIGNALR_HUB_URL');
      }
    }

    if (resolvedUrl == null || resolvedUrl.isEmpty) {
      // No URL configured; return false and let caller decide how to prompt the user
      return false;
    }

    final tokenFactory = accessTokenFactory ??
        () async => await SecureStorage().read('auth_token');

    // Build a list of hub candidates. If `resolvedUrl` contains a comma-separated
    // list, use those; otherwise fall back to the global constants (primary + secondary).
    final List<String> hubCandidates = [];
    if (resolvedUrl.isNotEmpty) {
      hubCandidates.addAll(resolvedUrl
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty));
    } else {
      hubCandidates.add(Constants.signalRPrimaryUrl());
      hubCandidates.add(Constants.signalRSecondaryUrl());
    }

    for (final raw in hubCandidates) {
      var candidate = raw;

      try {
        candidate = await _normalizeHubUrl(candidate);
      } catch (_) {}

      AppLogger.logInfo(
          'SignalRService', 'Attempting SignalR connect to $candidate');

      // Create a candidate-specific HTTP client for local HTTPS dev servers

      Future<void> buildConnectionFor(
          {required bool useWebsockets, required String url}) async {
        _connection = HubConnectionBuilder()
            .withUrl(
              url,
              options: HttpConnectionOptions(
                accessTokenFactory: tokenFactory as AccessTokenFactory,
                transport: useWebsockets
                    ? HttpTransportType.WebSockets
                    : HttpTransportType.LongPolling,
              ),
            )
            .withAutomaticReconnect()
            .build();

        _connection!.onclose(({Exception? error}) {
          // connection closed; UI can observe connection state via isConnected
        });

        // re-join conversations after reconnect
        try {
          _connection!.onreconnected(({String? connectionId}) async {
            for (final conv in _joinedConversations) {
              try {
                await joinConversation(conv);
              } catch (_) {}
            }
          });
        } catch (_) {}
      }

      try {
        // Prefer WebSockets but allow fallback to LongPolling per candidate
        try {
          await buildConnectionFor(useWebsockets: true, url: candidate);
          // register handlers (these assume _connection is set)
          _registerEventHandlers();
          await _connection!.start();
          _resolvedHubUrl = candidate;
          AppLogger.logInfo('SignalRService',
              'Connected to SignalR hub at $candidate (websockets)');
          return true;
        } catch (e) {
          // WebSockets failed (e.g., protocol error 1002); try long polling
          try {
            await buildConnectionFor(useWebsockets: false, url: candidate);
            _registerEventHandlers();
            await _connection!.start();
            _resolvedHubUrl = candidate;
            AppLogger.logInfo('SignalRService',
                'Connected to SignalR hub at $candidate (long polling)');
            return true;
          } catch (e2) {
            AppLogger.logInfo(
                'SignalRService', 'Connection to $candidate failed: $e2');
            try {
              await _connection?.stop();
            } catch (_) {}
            continue; // try next candidate
          }
        }
      } catch (_) {
        continue; // try next candidate
      }
    }

    // No candidate succeeded
    return false;
  }

  /// Ask the server to start a new support conversation. Server should
  /// implement `StartNewConversation` and/or `CreateConversation` to support this.
  /// Returns the conversation id (GUID as string) if the server responds with one.
  Future<String?> startNewConversation(
      {String type = 'support', Map<String, dynamic>? metadata}) async {
    if (!isConnected) throw StateError('Not connected to SignalR hub');
    try {
      // Ensure args are strings: metadata is JSON-encoded before sending
      final metaArg = metadata != null ? jsonEncode(metadata) : '{}';
      final res = await _connection!
          .invoke('StartNewConversation', args: [type, metaArg]);
      if (res == null) return null;
      if (res is String) return res;
      if (res is Map && res['conversationId'] is String) {
        return res['conversationId'] as String;
      }
      if (res is Map && res['id'] is String) return res['id'] as String;
      return res.toString();
    } catch (e) {
      rethrow;
    }
  }

  /// Request support (alternate hub method some servers expose)
  Future<String?> requestSupport(String category,
      {Map<String, dynamic>? metadata}) async {
    if (!isConnected) throw StateError('Not connected to SignalR hub');
    try {
      AppLogger.logInfo('SignalRService', 'Invoking hub method RequestSupport');
      // Server expects two args: category and metadata JSON string.
      final metaJson = metadata != null ? jsonEncode(metadata) : '{}';
      final res = await _connection!
          .invoke('RequestSupport', args: [category, metaJson]);
      AppLogger.logInfo('SignalRService',
          '🚀 SignalR: RequestSupport sent successfully. result=${res ?? 'null'}');
      if (res == null) return null;
      if (res is String) return res;
      if (res is Map && res['conversationId'] is String) {
        return res['conversationId'] as String;
      }
      if (res is Map && res['id'] is String) return res['id'] as String;
      return res.toString();
    } catch (e, s) {
      AppLogger.logError('SignalRService',
          '❌ SignalR Error: Failed to send RequestSupport: $e', s);
      rethrow;
    }
  }

  Future<void> disconnect() async {
    try {
      await _connection?.stop();
    } catch (_) {}
    _connection = null;
    _joinedConversations.clear();
    _resolvedHubUrl = null;
  }

  /// Persist a runtime hub URL so next runs can resolve it without .env
  Future<void> setHubUrl(String url) async {
    await SecureStorage().write('SIGNALR_HUB_URL', url);
    _resolvedHubUrl = url;
  }

  String? _resolvedHubUrl;
  String? get resolvedHubUrl => _resolvedHubUrl;

  /// Normalize the hub URL for mobile devices:
  /// - convert ws:// -> http://, wss:// -> https://
  /// - replace localhost/127.0.0.1 with a non-loopback machine IP if available
  Future<String> _normalizeHubUrl(String url) async {
    try {
      if (url.startsWith('ws://')) url = url.replaceFirst('ws://', 'http://');
      if (url.startsWith('wss://')) {
        url = url.replaceFirst('wss://', 'https://');
      }
      final uri = Uri.parse(url);
      if (uri.host == 'localhost' || uri.host == '127.0.0.1') {
        try {
          final interfaces = await NetworkInterface.list(
              includeLoopback: false, type: InternetAddressType.IPv4);
          for (final iface in interfaces) {
            for (final addr in iface.addresses) {
              if (!addr.isLoopback) {
                final newUri = uri.replace(host: addr.address);
                return newUri.toString();
              }
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
    return url;
  }

  void _registerEventHandlers() {
    // New message (server may send either 'NewMessage' or 'ReceiveMessage')
    void handleMessageArgs(List<Object?>? args) {
      if (args != null && args.isNotEmpty) {
        final raw = args[0];
        if (raw is Map) {
          _newMessageController.add(Map<String, dynamic>.from(raw));
        }
      }
    }

    _connection!.on('NewMessage', (args) => handleMessageArgs(args));
    _connection!.on('ReceiveMessage', (args) => handleMessageArgs(args));

    _connection!.on('MessageDeleted', (args) {
      if (args != null && args.length >= 2) {
        final messageId = args[0] as String? ?? '';
        final conversationId = args[1] as String? ?? '';
        _messageDeletedController.add([messageId, conversationId]);
      }
    });

    _connection!.on('UserTyping', (args) {
      if (args != null && args.length >= 3) {
        final userId = args[0] as String? ?? '';
        final userName = args[1] as String? ?? '';
        final conversationId = args[2] as String? ?? '';
        _userTypingController.add([userId, userName, conversationId]);
      }
    });

    _connection!.on('ConversationUpdated', (args) {
      if (args != null && args.isNotEmpty) {
        final raw = args[0];
        if (raw is Map) {
          _conversationUpdatedController.add(Map<String, dynamic>.from(raw));
        }
      }
    });

    // Admin joined / chat started events (server may use either name)
    void handleAdminJoined(List<Object?>? args) {
      if (args != null && args.isNotEmpty) {
        final raw = args[0];
        if (raw is Map) {
          _adminJoinedController.add(Map<String, dynamic>.from(raw));
        }
      }
    }

    _connection!.on('AdminJoined', (args) => handleAdminJoined(args));
    _connection!.on('ChatStarted', (args) => handleAdminJoined(args));
  }

  /// Create a new conversation on the server.
  ///
  /// The server should expose a `CreateConversation` hub method that returns a
  /// conversation id (GUID as string or object with `id` property).
  Future<String> createConversation(
      {String type = 'support', Map<String, dynamic>? metadata}) async {
    if (!isConnected) throw StateError('Not connected to SignalR hub');
    try {
      final metaArg = metadata != null ? jsonEncode(metadata) : '{}';
      final res = await _connection!
          .invoke('CreateConversation', args: [type, metaArg]);
      // The server may return either a simple id string or an object with id
      if (res is String) return res;
      if (res is Map && res['id'] is String) return res['id'] as String;
      if (res != null) return res.toString();
      throw StateError('CreateConversation returned null');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> joinConversation(String conversationId) async {
    if (!isConnected) return;

    final candidates = ['JoinConversation', 'Join', 'JoinGroup', 'AddToGroup'];
    for (final method in candidates) {
      try {
        // Ensure argument is sent as a string
        final arg = conversationId.toString();
        await _connection!.invoke(method, args: [arg]);
        _joinedConversations.add(conversationId);
        return;
      } catch (e) {
        final msg = e.toString();
        //AppLogger.logWarning('SignalRService', '$method invocation failed: $msg');
        if (msg.contains('Method does not exist') ||
            msg.contains('No such method')) {
          continue;
        }
        rethrow;
      }
    }

    throw StateError(
        'Join method not found on server for conversation: $conversationId');
  }

  Future<void> leaveConversation(String conversationId) async {
    if (!isConnected) return;
    try {
      final idArg = conversationId.toString();
      await _connection!.invoke('LeaveConversation', args: [idArg]);
      _joinedConversations.remove(conversationId);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> sendMessage(String conversationId, String content,
      {String? replyToMessageId}) async {
    if (!isConnected) return;
    // Ensure all args are strings to avoid SignalR binding issues
    final args = <Object>[conversationId.toString(), content.toString()];
    if (replyToMessageId != null) args.add(replyToMessageId.toString());
    try {
      await _connection!.invoke('SendMessage', args: args);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markAsRead(String conversationId, String lastMessageId) async {
    if (!isConnected) return;
    try {
      final args = <Object>[
        conversationId.toString(),
        lastMessageId.toString()
      ];
      await _connection!.invoke('MarkAsRead', args: args);
    } catch (e) {
      rethrow;
    }
  }

  void dispose() {
    _newMessageController.close();
    _messageDeletedController.close();
    _userTypingController.close();
    _conversationUpdatedController.close();
    _adminJoinedController.close();
  }
}
