import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../theme/app_theme.dart';
import '../services/notification_api_service.dart';
import '../services/app_logger.dart';

/// Notifications Screen — mirrors the Angular client portal /admin/notifications page.
///
/// Features:
/// - All | Unread filter tabs
/// - Paginated list (20 per page, load-more button)
/// - Tap to mark as read (optimistic UI)
/// - Swipe-to-delete (Dismissible)
/// - "Mark All Read" action in AppBar
/// - Polling: refresh on screen open
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  static const _pageSize = 20;

  final _service = NotificationApiService();

  List<AppNotification> _items = [];
  bool _loading = true;
  bool _loadingMore = false;
  int _totalCount = 0;
  int _currentPage = 1;
  String _filter = 'all'; // 'all' | 'unread'

  // ── Lifecycle ────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    _loadFirst();
  }

  Future<void> _loadFirst() async {
    setState(() {
      _loading = true;
      _currentPage = 1;
    });
    try {
      final page =
          await _service.fetchNotifications(page: 1, pageSize: _pageSize);
      if (!mounted) return;
      setState(() {
        _items = page.items;
        _totalCount = page.totalCount;
        _currentPage = 1;
        _loading = false;
      });
    } catch (e, s) {
      AppLogger.logError('NotificationsScreen', 'loadFirst error: $e', s);
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore) return;
    setState(() => _loadingMore = true);
    try {
      final nextPage = _currentPage + 1;
      final page = await _service.fetchNotifications(
          page: nextPage, pageSize: _pageSize);
      if (!mounted) return;
      setState(() {
        _items = [..._items, ...page.items];
        _totalCount = page.totalCount;
        _currentPage = nextPage;
        _loadingMore = false;
      });
    } catch (e, s) {
      AppLogger.logError('NotificationsScreen', 'loadMore error: $e', s);
      if (!mounted) return;
      setState(() => _loadingMore = false);
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  Future<void> _markRead(AppNotification n) async {
    if (n.isRead) return;
    // Optimistic update
    setState(() {
      _items = _items
          .map((x) => x.id == n.id ? x.copyWith(isRead: true) : x)
          .toList();
    });
    await _service.markAsRead(n.id);
  }

  Future<void> _markAllRead() async {
    setState(() {
      _items = _items.map((x) => x.copyWith(isRead: true)).toList();
    });
    await _service.markAllAsRead();
  }

  Future<void> _delete(AppNotification n) async {
    setState(() => _items.removeWhere((x) => x.id == n.id));
    await _service.deleteNotification(n.id);
  }

  // ── Computed ─────────────────────────────────────────────────────────────

  List<AppNotification> get _filtered {
    if (_filter == 'unread') return _items.where((n) => !n.isRead).toList();
    return _items;
  }

  int get _unreadCount => _items.where((n) => !n.isRead).length;

  bool get _hasMore => _items.length < _totalCount;

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? AppPalette.midnightDeep : const Color(0xFFF1F5F9);
    final filtered = _filtered;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              color: theme.colorScheme.onSurface, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Notifications',
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton.icon(
              onPressed: _markAllRead,
              icon: Icon(Icons.done_all,
                  size: 16, color: theme.colorScheme.primary),
              label: Text('Mark All Read',
                  style: theme.textTheme.labelMedium
                      ?.copyWith(color: theme.colorScheme.primary)),
            ),
          IconButton(
            icon:
                Icon(Icons.refresh_rounded, color: theme.colorScheme.onSurface),
            onPressed: _loading ? null : _loadFirst,
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Filter tabs ──────────────────────────────────────────────────
          _FilterTabs(
            active: _filter,
            unreadCount: _unreadCount,
            onChanged: (f) => setState(() => _filter = f),
          ),
          // ── Content ──────────────────────────────────────────────────────
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? _buildEmpty(theme)
                    : ListView.builder(
                        padding: const EdgeInsets.only(top: 8, bottom: 24),
                        itemCount: filtered.length +
                            (_hasMore && _filter == 'all' ? 1 : 0),
                        itemBuilder: (ctx, i) {
                          if (i == filtered.length) {
                            return _buildLoadMore(theme);
                          }
                          final n = filtered[i];
                          return _NotificationTile(
                            notification: n,
                            isDark: isDark,
                            onTap: () => _markRead(n),
                            onDismissed: () => _delete(n),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(ThemeData theme) {
    final isUnread = _filter == 'unread';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isUnread
                  ? Icons.notifications_active_outlined
                  : Icons.notifications_none_outlined,
              size: 64,
              color: theme.colorScheme.onSurface.withAlpha(70),
            ),
            const SizedBox(height: 16),
            Text(
              isUnread ? 'No unread notifications' : 'No notifications yet',
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withAlpha(140),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadMore(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: _loadingMore
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : OutlinedButton(
                onPressed: _loadMore,
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Load More'),
              ),
      ),
    );
  }
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

class _FilterTabs extends StatelessWidget {
  final String active;
  final int unreadCount;
  final ValueChanged<String> onChanged;

  const _FilterTabs({
    required this.active,
    required this.unreadCount,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final tabBg = isDark ? const Color(0xFF1E293B) : Colors.white;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: tabBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Row(
        children: [
          _tab(context, 'all', 'All', null),
          _tab(context, 'unread', 'Unread',
              unreadCount > 0 ? unreadCount : null),
        ],
      ),
    );
  }

  Widget _tab(BuildContext ctx, String value, String label, int? badgeCount) {
    final theme = Theme.of(ctx);
    final isActive = active == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? theme.colorScheme.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: GoogleFonts.outfit(
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                  fontSize: 14,
                  color: isActive
                      ? Colors.white
                      : theme.colorScheme.onSurface.withAlpha(160),
                ),
              ),
              if (badgeCount != null) ...[
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isActive
                        ? Colors.white.withAlpha(60)
                        : theme.colorScheme.error,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '$badgeCount',
                    style: TextStyle(
                      color: isActive ? Colors.white : Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── Notification Tile ─────────────────────────────────────────────────────────

class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final bool isDark;
  final VoidCallback onTap;
  final VoidCallback onDismissed;

  const _NotificationTile({
    required this.notification,
    required this.isDark,
    required this.onTap,
    required this.onDismissed,
  });

  Color _typeColor(String type, ThemeData theme) {
    switch (type.toLowerCase()) {
      case 'success':
        return Colors.green;
      case 'warning':
        return AppPalette.amber;
      case 'error':
        return AppPalette.danger;
      default:
        return theme.colorScheme.primary;
    }
  }

  IconData _typeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'success':
        return Icons.check_circle_outline;
      case 'warning':
        return Icons.warning_amber_outlined;
      case 'error':
        return Icons.error_outline;
      default:
        return Icons.info_outline;
    }
  }

  String _relativeTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('dd MMM').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final n = notification;
    final color = _typeColor(n.type, theme);
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;
    final unreadBg = isDark
        ? AppPalette.plum.withAlpha(30)
        : theme.colorScheme.primary.withAlpha(10);

    return Dismissible(
      key: ValueKey(n.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismissed(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        decoration: BoxDecoration(
          color: AppPalette.danger,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white, size: 24),
      ),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: n.isRead ? cardBg : unreadBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: n.isRead ? theme.dividerColor : color.withAlpha(80),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Type icon circle
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: Icon(_typeIcon(n.type), color: color, size: 20),
              ),
              const SizedBox(width: 12),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            n.title,
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight:
                                  n.isRead ? FontWeight.w500 : FontWeight.bold,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                        if (!n.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      n.message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(160),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _relativeTime(n.createdAt),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(100),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
