import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../error/failures.dart';
import '../services/logger_service.dart';

/// Firebase Messaging Service for push notifications.
///
/// Features:
/// - Foreground message handling
/// - Background message handling
/// - Notification tap handling with deep linking
/// - Deduplication with SignalR events
/// - FCM token management
class FirebaseMessagingService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  final LoggerService logger;

  // Stream controllers
  final _messageController = StreamController<RemoteMessage>.broadcast();
  final _tokenController = StreamController<String>.broadcast();

  // Public streams
  Stream<RemoteMessage> get onMessage => _messageController.stream;
  Stream<String> get onTokenRefresh => _tokenController.stream;

  // Track recent notifications to avoid duplicates with SignalR
  final Set<String> _recentNotifications = {};
  static const _deduplicationWindow = Duration(seconds: 5);

  String? _currentToken;

  FirebaseMessagingService({required this.logger});

  /// Initialize Firebase Messaging
  Future<void> initialize() async {
    try {
      logger.info('[FCM]', 'Initializing Firebase Messaging');

      // Request permission
      final settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      logger.info(
          '[FCM]', 'Permission status: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        await _setupMessageHandlers();
        await _setupLocalNotifications();
        await _getToken();
      } else {
        logger.warning('[FCM]', 'Notification permission denied');
      }
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Failed to initialize: $e', stackTrace);
      throw FirebaseFailure('Failed to initialize Firebase Messaging: $e');
    }
  }

  Future<void> _setupMessageHandlers() async {
    // Foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      logger.info('[FCM]',
          'Foreground message received: ${message.notification?.title}');

      // Check for duplicates
      final messageId = message.messageId ?? message.sentTime.toString();
      if (_isDuplicate(messageId)) {
        logger.debug('[FCM]', 'Duplicate message ignored: $messageId');
        return;
      }

      _showLocalNotification(message);
      _messageController.add(message);
    });

    // Background messages (app in background but not terminated)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      logger.info('[FCM]',
          'Notification opened from background: ${message.notification?.title}');
      _handleNotificationTap(message);
    });

    // Check if app was opened from a terminated state
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      logger.info('[FCM]',
          'App opened from terminated state: ${initialMessage.notification?.title}');
      _handleNotificationTap(initialMessage);
    }

    // Token refresh
    _firebaseMessaging.onTokenRefresh.listen((String token) {
      logger.info('[FCM]', 'Token refreshed');
      _currentToken = token;
      _tokenController.add(token);
    });
  }

  Future<void> _setupLocalNotifications() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        logger.debug('[FCM]', 'Local notification tapped: ${response.payload}');
        // Handle notification tap
      },
    );
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    const androidDetails = AndroidNotificationDetails(
      'investa_support_channel',
      'Support Messages',
      channelDescription: 'Notifications for support chat messages',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      details,
      payload: message.data.toString(),
    );
  }

  void _handleNotificationTap(RemoteMessage message) {
    // Extract data and navigate to appropriate screen
    final data = message.data;
    logger.debug('[FCM]', 'Notification data: $data');

    // TODO: Implement deep linking to Support Chat screen
    // This should navigate to the chat screen if conversation_id is present
    if (data.containsKey('conversationId')) {
      final conversationId = data['conversationId'];
      logger.info('[FCM]', 'Navigate to conversation: $conversationId');
      // Navigation logic here
    }
  }

  bool _isDuplicate(String messageId) {
    if (_recentNotifications.contains(messageId)) {
      return true;
    }

    _recentNotifications.add(messageId);

    // Clean up old entries after deduplication window
    Future.delayed(_deduplicationWindow, () {
      _recentNotifications.remove(messageId);
    });

    return false;
  }

  /// Get FCM token
  Future<String?> getToken() async {
    if (_currentToken != null) {
      return _currentToken;
    }
    return await _getToken();
  }

  Future<String?> _getToken() async {
    try {
      _currentToken = await _firebaseMessaging.getToken();
      if (_currentToken != null) {
        logger.info('[FCM]', 'Token: ${_currentToken!.substring(0, 20)}...');
        _tokenController.add(_currentToken!);
      }
      return _currentToken;
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Failed to get token: $e', stackTrace);
      return null;
    }
  }

  /// Delete FCM token (on logout)
  Future<void> deleteToken() async {
    try {
      await _firebaseMessaging.deleteToken();
      _currentToken = null;
      logger.info('[FCM]', 'Token deleted');
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Failed to delete token: $e', stackTrace);
    }
  }

  /// Dispose and cleanup
  void dispose() {
    _messageController.close();
    _tokenController.close();
  }
}

/// Top-level function for background message handler
/// This must be a top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Handle background messages
  print('[FCM Background] Message received: ${message.notification?.title}');
}
