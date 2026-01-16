import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:signalr_core/signalr_core.dart';
import 'package:http/io_client.dart';
import '../error/failures.dart';
import '../services/logger_service.dart';
import '../services/secure_storage_service.dart';
import '../network/network_config.dart';

/// Clean Architecture SignalR Service for the Investa app.
///
/// This service handles:
/// - Dynamic connection to SignalR hub with fallback URLs
/// - Event listening and broadcasting
/// - Automatic reconnection with exponential backoff
/// - Proper state management and timeout handling
/// - Race condition prevention
///
/// Hub URL: /hubs/chat
/// Methods:
/// - RequestSupport(SupportRequestDto) - Send support request to backend
///
/// Events:
/// - ReceiveSupportRequest - Receive support messages from admin
/// - AdminJoined - Admin joined the conversation
/// - UserTyping - User is typing indicator
class SignalRService {
  final NetworkConfig networkConfig;
  final SecureStorageService secureStorage;
  final LoggerService logger;

  // Configuration
  static const Duration _connectionTimeout = Duration(seconds: 30);
  static const Duration _startTimeout = Duration(seconds: 15);
  // The field is kept for future backoff logic - mark as intentionally unused for now
  // ignore: unused_field
  static const int _maxRetryAttempts = 3;

  HubConnection? _connection;
  // Current hub URL is tracked for logging/fallback but may not be read yet
  // ignore: unused_field
  String? _currentHubUrl;
  bool _isConnecting = false;
  Timer? _timeoutTimer;

  // Stream controllers for events
  final _supportMessageController =
      StreamController<SupportMessageDto>.broadcast();
  final _adminJoinedController = StreamController<AdminJoinedDto>.broadcast();
  final _userTypingController = StreamController<UserTypingDto>.broadcast();
  final _connectionStateController =
      StreamController<SignalRConnectionState>.broadcast();

  // Legacy compatibility streams (raw message maps)
  final _newMessageController =
      StreamController<Map<String, dynamic>>.broadcast();

  /// Legacy stream used by older widgets expecting raw message payloads.
  Stream<Map<String, dynamic>> get onNewMessage => _newMessageController.stream;

  // RequestAccepted event (handshake verification)
  final _requestAcceptedController =
      StreamController<RequestAcceptedDto>.broadcast();
  Stream<RequestAcceptedDto> get onRequestAccepted =>
      _requestAcceptedController.stream;

  // Public streams
  Stream<SupportMessageDto> get onSupportMessage =>
      _supportMessageController.stream;
  Stream<AdminJoinedDto> get onAdminJoined => _adminJoinedController.stream;
  Stream<UserTypingDto> get onUserTyping => _userTypingController.stream;
  Stream<SignalRConnectionState> get onConnectionStateChanged =>
      _connectionStateController.stream;

  SignalRService({
    required this.networkConfig,
    required this.secureStorage,
    required this.logger,
  });

  /// Check if connected to SignalR hub
  bool get isConnected =>
      _connection != null &&
      _connection!.state == HubConnectionState.connected &&
      !_isConnecting;

  /// Get current connection state
  HubConnectionState get connectionState =>
      _connection?.state ?? HubConnectionState.disconnected;

  /// Connect to SignalR hub with automatic fallback
  Future<void> connect() async {
    // Prevent concurrent connection attempts
    if (_isConnecting) {
      logger.warning('[SignalR]', 'Connection already in progress');
      return;
    }

    if (isConnected) {
      logger.info('[SignalR]', 'Already connected');
      return;
    }

    _isConnecting = true;
    _connectionStateController.add(SignalRConnectionState.connecting);

    try {
      final candidates = networkConfig.getSignalRUrlCandidates();
      logger.info('[SignalR]',
          'Attempting to connect with ${candidates.length} candidates');

      for (final hubUrl in candidates) {
        if (!_isConnecting) {
          // Connection was cancelled
          logger.info('[SignalR]', 'Connection attempt cancelled');
          return;
        }

        try {
          logger.debug('[SignalR]', 'Trying to connect to: $hubUrl');
          final connectFuture = _connectToHub(hubUrl);
          final success = await connectFuture.timeout(_connectionTimeout);

          if (success) {
            _currentHubUrl = hubUrl;
            logger.info('[SignalR]', 'Successfully connected to: $hubUrl');
            _connectionStateController.add(SignalRConnectionState.connected);
            return;
          }
        } on TimeoutException catch (e) {
          logger.warning('[SignalR]', 'Connection timeout for $hubUrl: $e');
          await _safeCleanupConnection();
          continue;
        } catch (e) {
          logger.warning('[SignalR]', 'Failed to connect to $hubUrl: $e');
          await _safeCleanupConnection();
          continue;
        }
      }

      // All candidates failed
      _connectionStateController.add(SignalRConnectionState.failed);
      throw const SignalRFailure(
          'Failed to connect to any SignalR hub candidate');
    } finally {
      _isConnecting = false;
      _timeoutTimer?.cancel();
      _timeoutTimer = null;
    }
  }

  Future<bool> _connectToHub(String hubUrl) async {
    try {
      // Access token factory: read latest token from secure storage when SignalR
      // performs negotiate. Try several common keys to be resilient to naming.
      Future<String?> getToken() async {
        final keys = ['access_token', 'auth_token', 'token'];
        for (final k in keys) {
          try {
            final v = await secureStorage.read(k);
            if (v != null && v.isNotEmpty) return v;
          } catch (_) {}
        }
        return null;
      }

      // Create HTTP client for local HTTPS dev servers
      IOClient? ioClient;
      final uri = Uri.parse(hubUrl);
      final isLocalHost = uri.host.contains('localhost') ||
          uri.host.contains('127.0.0.1') ||
          uri.host.startsWith('10.') ||
          uri.host.startsWith('192.168.');

      if (uri.scheme == 'https' && isLocalHost) {
        final httpClient = HttpClient();
        httpClient.badCertificateCallback = (cert, host, port) => true;
        ioClient = IOClient(httpClient);
      }

      // Build connection with configurable timeouts
      _connection = HubConnectionBuilder()
          .withUrl(
        hubUrl,
        HttpConnectionOptions(
          client: ioClient,
          // Ensure the negotiate request includes an up-to-date bearer token
          accessTokenFactory: () async {
            final t = await getToken();
            return t ?? '';
          },
          transport: HttpTransportType.webSockets,
          skipNegotiation: false,
        ),
      )
          .withAutomaticReconnect(
              [0, 2000, 5000, 10000, 30000]) // Exponential backoff
          .build();

      // Register event handlers before connecting
      _registerEventHandlers();

      // Register connection state handlers
      _connection!.onclose((error) {
        if (error != null) {
          logger.warning('[SignalR]', 'Connection closed with error: $error');
        } else {
          logger.info('[SignalR]', 'Connection closed normally');
        }
        _connectionStateController.add(SignalRConnectionState.disconnected);
      });

      _connection!.onreconnecting((error) {
        logger.info('[SignalR]', 'Reconnecting... Error: $error');
        _connectionStateController.add(SignalRConnectionState.reconnecting);
      });

      _connection!.onreconnected((connectionId) {
        logger.info('[SignalR]', 'Reconnected with ID: $connectionId');
        _connectionStateController.add(SignalRConnectionState.connected);
      });

      // Start connection with timeout
      final startFuture = _connection!.start();
      if (startFuture != null) {
        await startFuture.timeout(_startTimeout);
      }

      // Verify connection is actually established
      if (_connection!.state != HubConnectionState.connected) {
        throw Exception(
            'Connection started but not in connected state: ${_connection!.state}');
      }

      logger.info('[SignalR]', 'Connection started successfully');
      return true;
    } on TimeoutException catch (e) {
      logger.error('[SignalR]', 'Connection start timeout: $e', null);
      await _safeCleanupConnection();
      return false;
    } catch (e, stackTrace) {
      logger.error('[SignalR]', 'Connection error: $e', stackTrace);
      await _safeCleanupConnection();
      return false;
    }
  }

  /// Safely cleanup connection to prevent "stopConnection called while connecting" error
  Future<void> _safeCleanupConnection() async {
    if (_connection == null) return;

    try {
      // Only try to stop if we're in a state that allows it
      final state = _connection!.state;
      if (state == HubConnectionState.connected ||
          state == HubConnectionState.disconnected ||
          state == HubConnectionState.reconnecting) {
        await _connection!.stop();
      }
    } catch (e) {
      // Ignore errors during cleanup
      logger.debug('[SignalR]', 'Error during connection cleanup: $e');
    } finally {
      _connection = null;
    }
  }

  void _registerEventHandlers() {
    if (_connection == null) return;

    // Listen to "ReceiveSupportRequest" event from backend
    _connection!.on('ReceiveSupportRequest', (arguments) {
      try {
        if (arguments == null || arguments.isEmpty) return;

        final data = arguments[0] as Map<String, dynamic>;
        print('[SignalR] Raw Payload: $data');
        final message = SupportMessageDto.fromJson(data);

        logger.debug(
            '[SignalR]', 'Received support message: ${message.message}');
        _supportMessageController.add(message);
      } catch (e, stackTrace) {
        logger.error(
            '[SignalR]', 'Error parsing ReceiveSupportRequest: $e', stackTrace);
      }
    });

    // Listen to "AdminJoined" event
    _connection!.on('AdminJoined', (arguments) {
      try {
        if (arguments == null || arguments.isEmpty) return;

        final data = arguments[0] as Map<String, dynamic>;
        final adminJoined = AdminJoinedDto.fromJson(data);

        logger.info('[SignalR]', 'Admin joined: ${adminJoined.adminName}');
        _adminJoinedController.add(adminJoined);
      } catch (e, stackTrace) {
        logger.error('[SignalR]', 'Error parsing AdminJoined: $e', stackTrace);
      }
    });

    // Listen to "UserTyping" event
    _connection!.on('UserTyping', (arguments) {
      try {
        if (arguments == null || arguments.isEmpty) return;

        final data = arguments[0] as Map<String, dynamic>;
        final userTyping = UserTypingDto.fromJson(data);

        _userTypingController.add(userTyping);
      } catch (e, stackTrace) {
        logger.error('[SignalR]', 'Error parsing UserTyping: $e', stackTrace);
      }
    });

    // RequestAccepted event from server to acknowledge support request
    _connection!.on('RequestAccepted', (arguments) {
      try {
        if (arguments == null || arguments.isEmpty) return;
        final data = arguments[0] as Map<String, dynamic>;
        final dto = RequestAcceptedDto.fromJson(data);
        _requestAcceptedController.add(dto);
      } catch (e, stackTrace) {
        logger.error(
            '[SignalR]', 'Error parsing RequestAccepted: $e', stackTrace);
      }
    });

    // Legacy message events for compatibility with older UI components
    void handleRawMessage(List<Object?>? args) {
      if (args == null || args.isEmpty) return;
      final raw = args[0];
      if (raw is Map<String, dynamic>) {
        _newMessageController.add(Map<String, dynamic>.from(raw));
      }
    }

    _connection!.on('NewMessage', (arguments) => handleRawMessage(arguments));
    _connection!
        .on('ReceiveMessage', (arguments) => handleRawMessage(arguments));
  }

  /// Send a support request to the backend via SignalR
  /// Method name on backend: "RequestSupport"
  Future<void> sendSupportRequest(SupportRequestDto request) async {
    if (!isConnected) {
      throw const SignalRFailure('Not connected to SignalR hub');
    }

    try {
      // Prepare payload and ensure required fields exist
      final payload = Map<String, dynamic>.from(request.toJson());

      // Ensure userMobile is present
      if (payload['userMobile'] == null ||
          (payload['userMobile'] as String).isEmpty) {
        payload['userMobile'] = '0000000000';
      }

      // Ensure clientMutationId exists for tracking (generate if absent)
      if (!payload.containsKey('clientMutationId') ||
          (payload['clientMutationId'] as String).isEmpty) {
        payload['clientMutationId'] =
            'cmi-${DateTime.now().microsecondsSinceEpoch.toString()}';
      }

      logger.debug('[SignalR]', 'Sending support request: $payload');

      // Invoke the "RequestSupport" method on the backend
      // Server expects (category, metadataJson)
      final category = payload['type'] as String? ?? 'Request';
      final metadataJson = jsonEncode(payload);
      await _connection!
          .invoke('RequestSupport', args: [category, metadataJson]);

      logger.info('[SignalR]', 'Support request sent successfully');
    } catch (e, stackTrace) {
      logger.error(
          '[SignalR]', 'Failed to send support request: $e', stackTrace);
      throw SignalRFailure('Failed to send support request: $e');
    }
  }

  /// Close a conversation on the backend via SignalR
  /// Expected backend method name: "CloseConversation"
  Future<void> closeConversation(String conversationId) async {
    if (!isConnected) {
      // attempt to connect before sending close
      await connect();
      if (!isConnected) {
        throw const SignalRFailure('Not connected to SignalR hub');
      }
    }

    try {
      logger.debug('[SignalR]', 'Closing conversation: $conversationId');
      final idArg = conversationId.toString();
      await _connection!.invoke('CloseConversation', args: [idArg]);
      logger.info('[SignalR]', 'CloseConversation invoked for $conversationId');
    } catch (e, stackTrace) {
      logger.error(
          '[SignalR]', 'Failed to invoke CloseConversation: $e', stackTrace);
      throw SignalRFailure('Failed to invoke CloseConversation: $e');
    }
  }

  /// Verify handshake by sending a probe and awaiting a RequestAccepted or AdminJoined event
  Future<bool> verifyHandshake(
      {Duration timeout = const Duration(seconds: 10)}) async {
    if (!isConnected) return false;

    final completer = Completer<bool>();
    StreamSubscription<RequestAcceptedDto>? subReq;
    StreamSubscription<AdminJoinedDto>? subAdmin;
    Timer? timer;

    void finish(bool success) {
      if (!completer.isCompleted) completer.complete(success);
    }

    try {
      subReq = onRequestAccepted.listen((dto) {
        logger.debug('[SignalR]', 'RequestAccepted received: ${dto.raw}');
        finish(true);
      });

      subAdmin = onAdminJoined.listen((dto) {
        logger.debug('[SignalR]',
            'AdminJoined received during handshake: ${dto.conversationId}');
        finish(true);
      });

      // Attempt server-friendly probe: try calling RequestSupport without args first
      try {
        await _connection!.invoke('RequestSupport');
      } catch (_) {
        // If server expects args, send a minimal support request probe
        try {
          final probe = SupportRequestDto(
              userMobile: '0000000000',
              message: 'handshake-probe',
              type: 'Probe');
          await sendSupportRequest(probe);
        } catch (e) {
          logger.warning('[SignalR]', 'Handshake probe invocation failed: $e');
        }
      }

      timer = Timer(timeout, () {
        finish(false);
      });

      final result = await completer.future;
      return result;
    } finally {
      await subReq?.cancel();
      await subAdmin?.cancel();
      timer?.cancel();
    }
  }

  /// Send typing indicator to backend
  Future<void> sendTypingIndicator(String conversationId) async {
    if (!isConnected) return;

    try {
      final arg = conversationId.toString();
      await _connection!.invoke('UserTyping', args: [arg]);
    } catch (e) {
      logger.warning('[SignalR]', 'Failed to send typing indicator: $e');
    }
  }

  // ---------------------- Legacy compatibility methods ----------------------
  /// Join a server-side conversation/group so this client receives messages
  Future<void> joinConversation(String conversationId) async {
    if (!isConnected) return;

    final candidates = ['JoinConversation', 'Join', 'JoinGroup', 'AddToGroup'];
    for (final method in candidates) {
      try {
        logger.debug(
            '[SignalR]', 'Attempting to invoke $method for $conversationId');
        final arg = conversationId.toString();
        await _connection!.invoke(method, args: [arg]);
        logger.info(
            '[SignalR]', 'Joined conversation via $method: $conversationId');
        return;
      } catch (e, s) {
        final msg = e.toString();
        logger.warning('[SignalR]', '$method invocation failed: $msg');
        // If server explicitly says method doesn't exist, try the next candidate.
        if (msg.contains('Method does not exist') ||
            msg.contains('No such method')) {
          continue;
        }
        // For other errors, bubble up
        logger.error('[SignalR]', 'Failed to join conversation: $e', s);
        rethrow;
      }
    }

    // If none succeeded, surface a clear error
    logger.error('[SignalR]',
        'No valid join method found on server for conversation: $conversationId');
    throw const SignalRFailure(
        'Failed to join conversation: no matching hub method on server');
  }

  /// Leave a server-side conversation/group
  /// Uses explicit string casting for conversationId to avoid SignalR binding issues.
  /// If the server fails to bind args, ensure the SignalR client package is up-to-date.
  Future<void> leaveConversation(String conversationId) async {
    if (!isConnected) return;
    try {
      final String idToSend = conversationId.toString(); // ensure string type
      await _connection!.invoke('LeaveConversation', args: [idToSend]);
      logger.info('[SignalR]', 'Successfully left conversation: $idToSend');
    } catch (e, s) {
      logger.error('[SignalR]', 'Error invoking LeaveConversation: $e', s);
      // Handle gracefully: do not rethrow to avoid bubbling platform exceptions
    }
  }

  /// Send a raw chat message using the legacy SendMessage hub method
  Future<void> sendMessage(String conversationId, String content,
      {String? replyToMessageId}) async {
    if (!isConnected) return;
    // Enforce string args
    final args = <Object>[conversationId.toString(), content.toString()];
    if (replyToMessageId != null) args.add(replyToMessageId.toString());
    try {
      await _connection!.invoke('SendMessage', args: args);
    } catch (e, s) {
      logger.error('[SignalR]', 'Failed to send message: $e', s);
      rethrow;
    }
  }

  /// Disconnect from SignalR hub
  Future<void> disconnect() async {
    if (_connection == null && !_isConnecting) return;

    // Cancel any ongoing connection attempt
    _isConnecting = false;
    _timeoutTimer?.cancel();
    _timeoutTimer = null;

    if (_connection == null) return;

    try {
      // Check state before attempting to stop
      final state = _connection!.state;
      logger.debug('[SignalR]', 'Disconnecting from state: $state');

      if (state == HubConnectionState.connected ||
          state == HubConnectionState.reconnecting) {
        await _connection!.stop();
        logger.info('[SignalR]', 'Disconnected from hub');
      } else if (state == HubConnectionState.connecting) {
        // Wait a bit for connection to complete or fail, then try to stop
        await Future.delayed(const Duration(milliseconds: 500));
        if (_connection?.state == HubConnectionState.connected) {
          await _connection!.stop();
        }
      }

      _connectionStateController.add(SignalRConnectionState.disconnected);
    } catch (e, stackTrace) {
      logger.error('[SignalR]', 'Error disconnecting: $e', stackTrace);
    } finally {
      _connection = null;
      _currentHubUrl = null;
    }
  }

  /// Dispose and cleanup
  void dispose() {
    _timeoutTimer?.cancel();
    disconnect();
    _supportMessageController.close();
    _adminJoinedController.close();
    _userTypingController.close();
    _connectionStateController.close();
    _newMessageController.close();
  }
}

/// SignalR connection state
enum SignalRConnectionState {
  disconnected,
  connecting,
  connected,
  reconnecting,
  failed,
}

/// DTO for support request (sent to backend)
/// Must match backend SupportRequestDto exactly with camelCase
class SupportRequestDto {
  final String userMobile;
  final String message;
  final String
      type; // allowed: "Complaint", "Inquiry", "Request", "LiveSupport"
  final String? conversationId;
  final String? sessionId;
  final String? clientMutationId;

  SupportRequestDto({
    required this.userMobile,
    required this.message,
    required this.type,
    this.conversationId,
    this.sessionId,
    this.clientMutationId,
  });

  // Prefer sending sessionId when available; fall back to conversationId for
  // backward compatibility with older server contracts.
  Map<String, dynamic> toJson() => {
        'userMobile': userMobile,
        'message': message,
        'type': _normalizeType(type),
        if (sessionId != null)
          'sessionId': sessionId
        else if (conversationId != null)
          'conversationId': conversationId,
        if (clientMutationId != null) 'clientMutationId': clientMutationId,
      };
}

/// Normalize various internal type/category values to the exact set expected
/// by the backend.
String _normalizeType(String t) {
  final v = t.trim();
  switch (v.toLowerCase()) {
    case 'complaint':
    case 'problem':
      return 'Complaint';
    case 'inquiry':
    case 'inquire':
      return 'Inquiry';
    case 'livesupport':
    case 'live support':
    case 'live_support':
      return 'LiveSupport';
    case 'request':
    case 'support':
      return 'Request';
    default:
      // Fallback to Request for unknown categories
      return 'Request';
  }
}

/// DTO for support message (received from backend)
class SupportMessageDto {
  final String? id;
  final String? conversationId;
  final String? message;
  final String? senderName;
  final bool isFromAdmin;
  final DateTime? timestamp;

  SupportMessageDto({
    this.id,
    this.conversationId,
    this.message,
    this.senderName,
    required this.isFromAdmin,
    this.timestamp,
  });

  factory SupportMessageDto.fromJson(Map<String, dynamic> json) {
    return SupportMessageDto(
      id: json['id'] as String? ?? '',
      // Support either 'conversationId' or 'sessionId' from server payloads.
      conversationId: json['conversationId'] as String? ??
          json['sessionId'] as String? ??
          '',
      message: json['message'] as String? ?? '',
      senderName: json['senderName'] as String? ?? 'Unknown',
      isFromAdmin: json['isFromAdmin'] as bool? ?? false,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id ?? '',
        'conversationId': conversationId ?? '',
        'message': message ?? '',
        'senderName': senderName ?? 'Unknown',
        'isFromAdmin': isFromAdmin,
        'timestamp':
            timestamp?.toIso8601String() ?? DateTime.now().toIso8601String(),
      };
}

/// DTO for admin joined event
class AdminJoinedDto {
  final String conversationId;
  final String adminId;
  final String adminName;

  AdminJoinedDto({
    required this.conversationId,
    required this.adminId,
    required this.adminName,
  });

  factory AdminJoinedDto.fromJson(Map<String, dynamic> json) {
    return AdminJoinedDto(
      conversationId: json['conversationId'] as String? ??
          json['sessionId'] as String? ??
          '',
      adminId: json['adminId'] as String,
      adminName: json['adminName'] as String? ?? 'Admin',
    );
  }
}

/// DTO for user typing event
class UserTypingDto {
  final String conversationId;
  final String userName;

  UserTypingDto({
    required this.conversationId,
    required this.userName,
  });

  factory UserTypingDto.fromJson(Map<String, dynamic> json) {
    return UserTypingDto(
      conversationId: json['conversationId'] as String? ??
          json['sessionId'] as String? ??
          '',
      userName: json['userName'] as String? ?? 'User',
    );
  }
}

/// DTO for RequestAccepted handshake response
class RequestAcceptedDto {
  final String? conversationId;
  final String? message;
  final Map<String, dynamic>? raw;

  RequestAcceptedDto({this.conversationId, this.message, this.raw});

  factory RequestAcceptedDto.fromJson(Map<String, dynamic> json) {
    return RequestAcceptedDto(
      conversationId: json['conversationId'] as String?,
      message: json['message'] as String?,
      raw: Map<String, dynamic>.from(json),
    );
  }
}
