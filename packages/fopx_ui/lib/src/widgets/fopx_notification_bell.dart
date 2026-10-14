import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

class FopxNotificationBell extends StatelessWidget {
  const FopxNotificationBell({super.key, required this.onPressed, this.unreadCount, this.tooltip = 'Notifications'});

  final VoidCallback onPressed;
  final int? unreadCount;
  final String tooltip;

  static String badgeLabel(int count) => count > 9 ? '10+' : '$count';

  @override
  Widget build(BuildContext context) {
    final hasUnread = unreadCount != null && unreadCount! > 0;
    final label = unreadCount == null
        ? '$tooltip, unread count unavailable'
        : hasUnread
            ? '$tooltip, $unreadCount unread'
            : tooltip;
    return Semantics(
      button: true,
      label: label,
      hint: 'Open notification center',
      child: Tooltip(
        message: tooltip,
        child: IconButton(
          onPressed: onPressed,
          iconSize: FopxIconSizes.navigation,
          constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
          icon: Stack(
            clipBehavior: Clip.none,
            children: <Widget>[
              const Icon(FopxIcons.notifications),
              Positioned(
                top: -4,
                right: -5,
                child: AnimatedSwitcher(
                  duration: FopxMotion.duration(context, FopxMotion.standard),
                  transitionBuilder: (child, animation) => ScaleTransition(scale: animation, child: child),
                  child: hasUnread
                      ? Container(
                          key: ValueKey(unreadCount),
                          constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(color: Theme.of(context).colorScheme.error, shape: BoxShape.circle),
                          child: Text(
                            FopxNotificationBell.badgeLabel(unreadCount!),
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Theme.of(context).colorScheme.onError, fontSize: 9),
                          ),
                        )
                      : const SizedBox.shrink(key: ValueKey('none')),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
