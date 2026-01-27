import 'package:flutter/material.dart';
import '../models/chat_user.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';
import '../l10n/app_localizations.dart';
import 'chat_box_screen.dart';
import 'user_profile_screen.dart';

class EngagementScreen extends StatelessWidget {
  EngagementScreen({Key? key}) : super(key: key);

  final List<ChatUser> users = [
    ChatUser(
        id: '1',
        name: 'Alice Johnson',
        avatarUrl: '',
        lastMessage: 'See you tomorrow',
        lastSeen: DateTime.now().subtract(const Duration(minutes: 3)),
        online: true),
    ChatUser(
        id: '2',
        name: 'Mohamed Ali',
        avatarUrl: '',
        lastMessage: 'Thanks for the update',
        lastSeen: DateTime.now().subtract(const Duration(hours: 2)),
        online: false),
    ChatUser(
        id: '3',
        name: 'Sara Ibrahim',
        avatarUrl: '',
        lastMessage: 'Can we call later?',
        lastSeen: DateTime.now().subtract(const Duration(minutes: 20)),
        online: true),
    ChatUser(
        id: '4',
        name: 'John Smith',
        avatarUrl: '',
        lastMessage: 'Reviewed the report',
        lastSeen: DateTime.now().subtract(const Duration(days: 1)),
        online: false),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final onlineCount = users.where((u) => u.online).length;
    final loc = AppLocalizations.of(context);

    final body = SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header card with title and action
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: isDarkMode ? AppGradients.hero : null,
                      color: isDarkMode ? null : theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: isDarkMode
                          ? Border.all(
                              color: Colors.white.withOpacityCompat(0.06))
                          : Border.all(
                              color: theme.colorScheme.outline
                                  .withOpacityCompat(0.5)),
                      boxShadow: isDarkMode
                          ? AppShadows.medium
                          : [
                              BoxShadow(
                                  color: Colors.black.withOpacityCompat(0.04),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4))
                            ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(loc.t('engagement'),
                                      style: theme.textTheme.headlineSmall
                                          ?.copyWith(
                                              fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 6),
                                  Text(loc.t('engagement_subtitle'),
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                              color: theme.colorScheme.onSurface
                                                  .withOpacityCompat(0.7))),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton.icon(
                              icon: const Icon(Icons.chat, size: 18),
                              label: Text(loc.t('new_chat')),
                              style: ElevatedButton.styleFrom(
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14))),
                              onPressed: () {
                                // TODO: open new chat flow
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                                child: _QuickStatChip(
                                    icon: Icons.circle,
                                    iconColor: AppPalette.success,
                                    label: '$onlineCount online')),
                            const SizedBox(width: 12),
                            Expanded(
                                child: _QuickStatChip(
                                    icon: Icons.chat_bubble_outline_rounded,
                                    iconColor: AppPalette.flame,
                                    label: '${users.length} chats')),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.separated(
                physics: const BouncingScrollPhysics(),
                itemCount: users.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final user = users[index];
                  return _EngagementTile(
                    user: user,
                    onTap: () {
                      Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => ChatBoxScreen(user: user)));
                    },
                    timeLabel: _formatTime(user.lastSeen),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );

    return Scaffold(
        backgroundColor:
            isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
        body: isDarkMode ? AppBackground(child: body) : body);
  }

  String _formatTime(DateTime t) {
    final now = DateTime.now();
    final diff = now.difference(t);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }
}

class _QuickStatChip extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;

  const _QuickStatChip(
      {required this.icon, required this.iconColor, required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isDarkMode
            ? Colors.white.withOpacityCompat(0.16)
            : iconColor.withOpacityCompat(0.1),
        borderRadius: BorderRadius.circular(20),
        border: isDarkMode
            ? Border.all(color: Colors.white.withOpacityCompat(0.08))
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(width: 8),
          Text(label,
              style: theme.textTheme.labelMedium?.copyWith(
                  color:
                      isDarkMode ? Colors.white : theme.colorScheme.onSurface)),
        ],
      ),
    );
  }
}

class _EngagementTile extends StatelessWidget {
  final ChatUser user;
  final VoidCallback onTap;
  final String timeLabel;

  const _EngagementTile(
      {required this.user, required this.onTap, required this.timeLabel});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textTheme = theme.textTheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Container(
          decoration: isDarkMode
              ? AppDecorations.premiumGlass(radius: 22)
              : BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                      color: theme.colorScheme.outline.withOpacityCompat(0.5)),
                ),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Row(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                          colors: [AppPalette.flame, AppPalette.amber]),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      user.name.isNotEmpty ? user.name[0] : '?',
                      style: textTheme.titleLarge?.copyWith(
                          color: Colors.white, fontWeight: FontWeight.w700),
                    ),
                  ),
                  Positioned(
                    bottom: -4,
                    right: -4,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: user.online ? AppPalette.success : Colors.grey,
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: isDarkMode
                                ? Colors.black.withOpacityCompat(0.6)
                                : theme.colorScheme.surface,
                            width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      style: textTheme.bodyLarge
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.message_rounded,
                            size: 14,
                            color: theme.colorScheme.onSurface
                                .withOpacityCompat(0.6)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            user.lastMessage,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurface
                                    .withOpacityCompat(0.7)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(timeLabel,
                      style: textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withOpacityCompat(0.7))),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute(
                                builder: (_) => ChatBoxScreen(user: user))),
                        icon: const Icon(Icons.message, size: 20),
                        color: theme.colorScheme.primary,
                        tooltip: 'Message',
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute(
                                builder: (_) => UserProfileScreen(user: user))),
                        icon: const Icon(Icons.person_outline, size: 20),
                        color:
                            theme.colorScheme.onSurface.withOpacityCompat(0.7),
                        tooltip: 'View profile',
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
