import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/services/logger_service.dart';
import '../../domain/entities/support_message.dart';
import '../../domain/usecases/send_support_request_usecase.dart';
import '../../domain/usecases/listen_to_support_messages_usecase.dart';
import '../../domain/usecases/initiate_support_session_usecase.dart';

enum SupportState {
  initial,
  loading,
  connected,
  disconnected,
  sending,
  sent,
  error,
}

/// Provider for support feature.
class SupportProvider with ChangeNotifier {
  final SendSupportRequestUseCase sendSupportRequestUseCase;
  final ListenToSupportMessagesUseCase listenToSupportMessagesUseCase;
  final LoggerService logger;

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  SupportState _state = SupportState.initial;
  String? _errorMessage;
  final List<SupportMessage> _messages = [];
  StreamSubscription<SupportMessage>? _messageSubscription;

  String? _activeSessionId;

  final InitiateSupportSessionUseCase initiateSupportSessionUseCase;

  SupportProvider({
    required this.sendSupportRequestUseCase,
    required this.listenToSupportMessagesUseCase,
    required this.initiateSupportSessionUseCase,
    required this.logger,
  });

  // Getters
  SupportState get state => _state;
  String? get errorMessage => _errorMessage;
  List<SupportMessage> get messages => List.unmodifiable(_messages);
  bool get isLoading =>
      _state == SupportState.loading || _state == SupportState.sending;
  bool get isConnected => _state == SupportState.connected;
  String? get activeSessionId => _activeSessionId;

  /// Start listening to support messages
  void startListening() {
    logger.info('[Support]', 'Starting to listen for messages');

    _messageSubscription = listenToSupportMessagesUseCase().listen(
      (message) {
        logger.debug('[Support]', 'New message received: ${message.message}');
        _messages.add(message);
        notifyListeners();
      },
      onError: (error) {
        logger.error('[Support]', 'Error listening to messages: $error');
        _errorMessage = 'Connection error: $error';
        _setState(SupportState.error);
      },
    );

    _setState(SupportState.connected);
  }

  /// Stop listening to support messages
  void stopListening() {
    logger.info('[Support]', 'Stopping message listener');
    _messageSubscription?.cancel();
    _messageSubscription = null;
    _setState(SupportState.disconnected);
  }

  /// Send a support request
  Future<bool> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  }) async {
    _setState(SupportState.sending);
    _errorMessage = null;

    logger.info('[Support]',
        'Sending support request: type=$type, sessionId=$sessionId');

    final result = await sendSupportRequestUseCase(
      userMobile: userMobile,
      message: message,
      type: type,
      sessionId: sessionId,
    );

    return result.fold(
      (failure) {
        logger.error('[Support]', 'Failed to send request: ${failure.message}');
        _errorMessage = failure.message;
        _setState(SupportState.error);
        return false;
      },
      (_) {
        logger.info('[Support]', 'Support request sent successfully');
        _setState(SupportState.sent);

        // Return to connected state after a brief delay
        Future.delayed(const Duration(seconds: 2), () {
          _setState(SupportState.connected);
        });

        return true;
      },
    );
  }

  /// Clear messages
  void clearMessages() {
    _messages.clear();
    notifyListeners();
  }

  /// Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> setActiveSessionId(String sessionId) async {
    _activeSessionId = sessionId;
    await _secureStorage.write(key: 'activeSupportSessionId', value: sessionId);
    notifyListeners();
  }

  Future<void> loadActiveSessionId() async {
    _activeSessionId = await _secureStorage.read(key: 'activeSupportSessionId');
    notifyListeners();
  }

  /// Initiate a support session
  Future<String> initiateSupportSession({
    required String userMobile,
    required String type,
  }) async {
    final result = await initiateSupportSessionUseCase(
      userMobile: userMobile,
      type: type,
    );

    return result.fold((failure) {
      logger.error(
          '[Support]', 'Failed to initiate session: ${failure.message}');
      throw Exception(failure.message);
    }, (sessionId) {
      logger.info('[Support]', 'Support session initiated: $sessionId');
      setActiveSessionId(sessionId);
      return sessionId;
    });
  }

  void _setState(SupportState newState) {
    _state = newState;
    notifyListeners();
  }

  @override
  void dispose() {
    stopListening();
    super.dispose();
  }
}
