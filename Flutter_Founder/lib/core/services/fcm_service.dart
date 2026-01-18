import 'dart:async';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../services/logger_service.dart';
import '../services/secure_storage_service.dart';
import '../network/network_config.dart';
import 'package:http/http.dart' as http;

/// Background message handler - must be a top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Handle background data payloads here
  print('Handling background message: ${message.messageId}');
  print('Data: ${message.data}');

  // Process data payload (e.g., update local database, sync state)
  if (message.data.containsKey('conversationId')) {
    // Handle support chat notification
    final conversationId = message.data['conversationId'];
    print('New message in conversation: $conversationId');
  }
}

/// Firebase Cloud Messaging Service
/// Handles push notification setup, token management, and message processing
class FCMService {
  final LoggerService logger;
  final SecureStorageService secureStorage;
  final NetworkConfig networkConfig;

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  // Stream controllers for notifications
  final _messageStreamController = StreamController<RemoteMessage>.broadcast();
  final _tokenStreamController = StreamController<String>.broadcast();

  Stream<RemoteMessage> get onMessage => _messageStreamController.stream;
  Stream<String> get onTokenRefresh => _tokenStreamController.stream;

  String? _currentToken;

  FCMService({
    required this.logger,
    required this.secureStorage,
    required this.networkConfig,
  });

  /// Initialize FCM and local notifications
  Future<void> initialize() async {
    try {
      logger.info('[FCM]', 'Initializing Firebase Cloud Messaging...');

      // Request permission for notifications
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        logger.info('[FCM]', 'Notification permission granted');
      } else if (settings.authorizationStatus ==
          AuthorizationStatus.provisional) {
        logger.info('[FCM]', 'Provisional notification permission granted');
      } else {
        logger.warning('[FCM]', 'Notification permission denied');
        return;
      }

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Get and sync FCM token
      await _getAndSyncToken();

      // Listen to token refresh
      _messaging.onTokenRefresh.listen((token) {
        logger.info('[FCM]', 'Token refreshed');
        _currentToken = token;
        _tokenStreamController.add(token);
        _syncTokenWithBackend(token);
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle message when app is opened from notification
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

      // Check if app was opened from a terminated state via notification
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleMessageOpenedApp(initialMessage);
      }

      logger.info('[FCM]', 'FCM initialization completed successfully');
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Failed to initialize FCM: $e', stackTrace);
    }
  }

  /// Initialize local notifications for foreground display
  Future<void> _initializeLocalNotifications() async {
    // Android initialization settings
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS initialization settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create Android notification channel for high priority notifications
    const androidChannel = AndroidNotificationChannel(
      'high_importance_channel',
      'High Importance Notifications',
      description: 'This channel is used for important notifications',
      importance: Importance.high,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
  }

  /// Get FCM token and sync with backend
  Future<void> _getAndSyncToken() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        logger.info(
            '[FCM]', 'FCM Token obtained: ${token.substring(0, 20)}...');
        _currentToken = token;
        _tokenStreamController.add(token);

        // Save token locally
        await secureStorage.write('fcm_token', token);

        // Sync with backend
        await _syncTokenWithBackend(token);
      } else {
        logger.warning('[FCM]', 'Failed to get FCM token');
      }
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Error getting FCM token: $e', stackTrace);
    }
  }

  /// Sync FCM token with backend
  Future<void> _syncTokenWithBackend(String token) async {
    try {
      final baseUrl = networkConfig.baseUrl;
      final url = Uri.parse('$baseUrl/api/users/fcm-token');

      // Get auth token
      final authToken = await secureStorage.read('auth_token');
      if (authToken == null) {
        logger.warning('[FCM]', 'No auth token available, skipping token sync');
        return;
      }

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({'fcmToken': token}),
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        logger.info('[FCM]', 'Token synced with backend successfully');
      } else {
        logger.warning('[FCM]',
            'Failed to sync token with backend: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Error syncing token with backend: $e', stackTrace);
    }
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    logger.info('[FCM]', 'Foreground message received: ${message.messageId}');

    // Add to stream for listeners
    _messageStreamController.add(message);

    // Display local notification
    _showLocalNotification(message);
  }

  /// Show local notification for foreground messages
  Future<void> _showLocalNotification(RemoteMessage message) async {
    try {
      final notification = message.notification;
      final android = message.notification?.android;

      if (notification != null) {
        await _localNotifications.show(
          notification.hashCode,
          notification.title ?? 'New Message',
          notification.body ?? '',
          NotificationDetails(
            android: AndroidNotificationDetails(
              'high_importance_channel',
              'High Importance Notifications',
              channelDescription:
                  'This channel is used for important notifications',
              importance: Importance.high,
              priority: Priority.high,
              icon: android?.smallIcon ?? '@mipmap/ic_launcher',
            ),
            iOS: const DarwinNotificationDetails(
              presentAlert: true,
              presentBadge: true,
              presentSound: true,
            ),
          ),
          payload: jsonEncode(message.data),
        );
      }
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Error showing local notification: $e', stackTrace);
    }
  }

  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    logger.info('[FCM]', 'Notification tapped: ${response.payload}');

    if (response.payload != null) {
      try {
        final data = jsonDecode(response.payload!);
        // Handle navigation based on data
        // You can emit this to a stream or use a navigation service
        logger.debug('[FCM]', 'Notification data: $data');
      } catch (e) {
        logger.error('[FCM]', 'Error parsing notification payload: $e');
      }
    }
  }

  /// Handle message when app is opened from notification
  void _handleMessageOpenedApp(RemoteMessage message) {
    logger.info('[FCM]', 'Message opened app: ${message.messageId}');

    // Handle navigation based on message data
    if (message.data.containsKey('conversationId')) {
      final conversationId = message.data['conversationId'];
      logger.info('[FCM]', 'Opening conversation: $conversationId');
      // Navigate to chat screen
      // You can use a navigation service or stream here
    }
  }

  /// Get current FCM token
  String? get currentToken => _currentToken;

  /// Manually refresh token
  Future<void> refreshToken() async {
    await _getAndSyncToken();
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      logger.info('[FCM]', 'Subscribed to topic: $topic');
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Error subscribing to topic: $e', stackTrace);
    }
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      logger.info('[FCM]', 'Unsubscribed from topic: $topic');
    } catch (e, stackTrace) {
      logger.error('[FCM]', 'Error unsubscribing from topic: $e', stackTrace);
    }
  }

  /// Dispose resources
  void dispose() {
    _messageStreamController.close();
    _tokenStreamController.close();
  }
}
