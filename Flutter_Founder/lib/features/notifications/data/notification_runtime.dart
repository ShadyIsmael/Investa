import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';

import 'notifications_controller.dart';

/// Connects authenticated app sessions to FCM without treating push payloads
/// as business data. Payloads are used only to select a whitelisted route.
class FounderNotificationRuntime {
  FounderNotificationRuntime(this._ref, this._router);

  final WidgetRef _ref;
  final GoRouter _router;
  StreamSubscription<RemoteMessage>? _foreground;
  StreamSubscription<RemoteMessage>? _opened;
  StreamSubscription<String>? _tokenRefresh;
  RemoteMessage? _pendingMessage;
  bool _active = false;

  Future<void> onAuthenticationChanged(bool authenticated) async {
    if (!authenticated) {
      await _stop();
      return;
    }
    if (_active || !FirebaseFoundation.instance.isInitialized) return;
    _active = true;
    try {
      await FirebaseFoundation.instance.requestMessagingPermission();
      final token = await FirebaseFoundation.instance.readToken();
      if (token != null && token.isNotEmpty) await _register(token);
      _tokenRefresh = FirebaseFoundation.instance.tokenRefreshes.listen(
        (value) => unawaited(_register(value)),
      );
      _foreground = FirebaseMessaging.onMessage.listen((_) {
        _ref.invalidate(founderUnreadNotificationCountProvider);
        _ref.invalidate(founderNotificationsProvider);
      });
      _opened = FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);
      final initial = await FirebaseMessaging.instance.getInitialMessage();
      if (initial != null) _handleMessage(initial);
      _handlePendingMessage();
    } catch (_) {
      // Push is optional in local/development builds; API-backed inbox remains usable.
      _active = false;
      await _cancelSubscriptions();
    }
  }

  void _handleMessage(RemoteMessage message) {
    final actionUrl =
        message.data['targetUrl']?.toString() ??
        message.data['actionUrl']?.toString();
    final route = founderNotificationRouteForEvent(
      eventType: message.data['eventType']?.toString(),
      actionUrl: actionUrl,
    );
    if (route == null) return;
    final session = _ref.read(sessionControllerProvider).valueOrNull;
    if (session?.isAuthenticated == true) {
      final notificationId = int.tryParse(
        message.data['notificationId']?.toString() ?? '',
      );
      if (notificationId != null) {
        unawaited(_markNotificationRead(notificationId));
      }
      _router.go(route);
    } else {
      _pendingMessage = message;
    }
  }

  void _handlePendingMessage() {
    final message = _pendingMessage;
    if (message == null) return;
    _pendingMessage = null;
    _handleMessage(message);
  }

  Future<void> _markNotificationRead(int id) async {
    try {
      await _ref.read(founderNotificationsRepositoryProvider).markRead(<int>[
        id,
      ]);
      _ref.invalidate(founderUnreadNotificationCountProvider);
      _ref.invalidate(founderNotificationsProvider);
    } catch (_) {
      // Opening a push must navigate even if its read receipt cannot sync yet.
    }
  }

  Future<void> _register(String token) async {
    try {
      final platform = switch (defaultTargetPlatform) {
        TargetPlatform.android => 'android',
        TargetPlatform.iOS => 'ios',
        _ => 'other',
      };
      await _ref
          .read(apiClientProvider)
          .post<dynamic>(
            '/notifications/devices',
            data: <String, String>{
              'token': token,
              'platform': platform,
              'browser': 'FOPX Founder Flutter',
            },
          );
    } catch (_) {
      // A token registration failure must never block sign-in or app navigation.
    }
  }

  Future<void> _stop() async {
    _active = false;
    _pendingMessage = null;
    await _cancelSubscriptions();
  }

  Future<void> _cancelSubscriptions() async {
    await _foreground?.cancel();
    await _opened?.cancel();
    await _tokenRefresh?.cancel();
    _foreground = null;
    _opened = null;
    _tokenRefresh = null;
  }
}
