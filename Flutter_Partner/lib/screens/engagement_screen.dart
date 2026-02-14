import 'package:flutter/material.dart';
import '../models/chat_user.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';
import '../l10n/app_localizations.dart';
import 'chat_box_screen.dart';
import 'user_profile_screen.dart';

class EngagementScreen extends StatefulWidget {
  final Function(int)? onUnreadCountChanged;

  const EngagementScreen({Key? key, this.onUnreadCountChanged})
      : super(key: key);

  @override
  State<EngagementScreen> createState() => _EngagementScreenState();
}

class _EngagementScreenState extends State<EngagementScreen> {
  final TextEditingController _searchController = TextEditingController();
  DateTimeRange? _dateRange;
  _AvailabilityFilter _availabilityFilter = _AvailabilityFilter.all;
  String _query = '';
  bool _filtersExpanded = false;

  final List<ChatUser> users = [
    ChatUser(
        id: '1',
        name: 'Alice Johnson',
        avatarUrl: '',
        lastMessage: 'See you tomorrow',
        lastSeen: DateTime.now().subtract(const Duration(minutes: 3)),
        online: true,
        unreadCount: 2),
    ChatUser(
        id: '2',
        name: 'Mohamed Ali',
        avatarUrl: '',
        lastMessage: 'Thanks for the update',
        lastSeen: DateTime.now().subtract(const Duration(hours: 2)),
        online: false,
        unreadCount: 0),
    ChatUser(
        id: '3',
        name: 'Sara Ibrahim',
        avatarUrl: '',
        lastMessage: 'Can we call later?',
        lastSeen: DateTime.now().subtract(const Duration(minutes: 20)),
        online: true,
        unreadCount: 5),
    ChatUser(
        id: '4',
        name: 'John Smith',
        avatarUrl: '',
        lastMessage: 'Reviewed the report',
        lastSeen: DateTime.now().subtract(const Duration(days: 1)),
        online: false,
        unreadCount: 1),
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_handleSearchChanged);
    _updateUnreadCount();
  }

  void _updateUnreadCount() {
    final totalUnread =
        users.fold<int>(0, (sum, user) => sum + user.unreadCount);
    widget.onUnreadCountChanged?.call(totalUnread);
  }

  @override
  void dispose() {
    _searchController.removeListener(_handleSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearchChanged() {
    final next = _searchController.text.trim().toLowerCase();
    if (next == _query) return;
    if (!mounted) return;
    setState(() => _query = next);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final onlineCount = users.where((u) => u.online).length;
    final recentCount = users
        .where((u) => DateTime.now().difference(u.lastSeen).inHours < 24)
        .length;
    final loc = AppLocalizations.of(context);
    final filteredUsers = _filterUsers();
    final hasFilters = _dateRange != null ||
        _query.isNotEmpty ||
        _availabilityFilter != _AvailabilityFilter.all;

    final body = SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: isDarkMode
                    ? AppGradients.hero
                    : const LinearGradient(
                        colors: [Color(0xFFFDF2F8), Color(0xFFEFF6FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                    color: theme.colorScheme.outline.withOpacityCompat(0.4)),
                boxShadow: isDarkMode
                    ? AppShadows.medium
                    : [
                        BoxShadow(
                            color: Colors.black.withOpacityCompat(0.05),
                            blurRadius: 14,
                            offset: const Offset(0, 8))
                      ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withOpacityCompat(0.08),
                                blurRadius: 8,
                                offset: const Offset(0, 4))
                          ],
                        ),
                        child: const Icon(Icons.forum_rounded, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(loc.t('engagement'),
                                style: theme.textTheme.headlineSmall?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: theme.colorScheme.onSurface)),
                            const SizedBox(height: 4),
                            Text(loc.t('engagement_subtitle'),
                                style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurface
                                        .withOpacityCompat(0.7))),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppPalette.success.withOpacityCompat(0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                  color: AppPalette.success,
                                  shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 6),
                            Text('$onlineCount',
                                style: theme.textTheme.labelMedium?.copyWith(
                                    color: AppPalette.success,
                                    fontWeight: FontWeight.w700)),
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickStatChip(
                            icon: Icons.circle,
                            iconColor: AppPalette.success,
                            label: '$onlineCount online'),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickStatChip(
                            icon: Icons.chat_bubble_outline_rounded,
                            iconColor: AppPalette.flame,
                            label: '${users.length} chats'),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickStatChip(
                            icon: Icons.bolt_rounded,
                            iconColor: AppPalette.amber,
                            label: '$recentCount active'),
                      ),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildSearchPanel(theme, loc, isDarkMode, hasFilters),
            const SizedBox(height: 16),
            Expanded(
              child: filteredUsers.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.search_off_rounded,
                              size: 44,
                              color: theme.colorScheme.onSurface
                                  .withOpacityCompat(0.35)),
                          const SizedBox(height: 12),
                          Text(
                            loc.t('engagement_no_results'),
                            style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurface
                                    .withOpacityCompat(0.7)),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredUsers.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 14),
                      itemBuilder: (context, index) {
                        final user = filteredUsers[index];
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

  Widget _buildSearchPanel(
      ThemeData theme, AppLocalizations loc, bool isDarkMode, bool hasFilters) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border:
            Border.all(color: theme.colorScheme.outline.withOpacityCompat(0.4)),
        boxShadow: isDarkMode
            ? null
            : [
                BoxShadow(
                    color: Colors.black.withOpacityCompat(0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 8))
              ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.search_rounded,
                  size: 20,
                  color: theme.colorScheme.onSurface.withOpacityCompat(0.6)),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: loc.t('engagement_search_hint'),
                    border: InputBorder.none,
                  ),
                ),
              ),
              if (_searchController.text.trim().isNotEmpty)
                IconButton(
                  onPressed: () {
                    _searchController.clear();
                    setState(() {});
                  },
                  icon: const Icon(Icons.close, size: 18),
                  color: theme.colorScheme.onSurface.withOpacityCompat(0.6),
                ),
              IconButton(
                onPressed: _pickDateRange,
                icon: const Icon(Icons.date_range),
                tooltip: loc.t('engagement_date_range'),
              ),
              IconButton(
                onPressed: () =>
                    setState(() => _filtersExpanded = !_filtersExpanded),
                icon: Icon(_filtersExpanded
                    ? Icons.tune_rounded
                    : Icons.tune_outlined),
                tooltip: loc.t('engagement_filters'),
              ),
            ],
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOut,
            child: _filtersExpanded
                ? Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildAvailabilityFilters(theme, loc),
                        if (hasFilters)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Row(
                              children: [
                                if (_dateRange != null) ...[
                                  Icon(Icons.event,
                                      size: 16,
                                      color: theme.colorScheme.onSurface
                                          .withOpacityCompat(0.7)),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      _formatRange(_dateRange!),
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                              color: theme.colorScheme.onSurface
                                                  .withOpacityCompat(0.8)),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ] else
                                  const Spacer(),
                                TextButton(
                                  onPressed: _clearFilters,
                                  child:
                                      Text(loc.t('engagement_clear_filters')),
                                )
                              ],
                            ),
                          ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailabilityFilters(ThemeData theme, AppLocalizations loc) {
    return Wrap(
      spacing: 10,
      children: [
        _buildFilterChip(
          theme: theme,
          label: loc.t('engagement_filter_all'),
          selected: _availabilityFilter == _AvailabilityFilter.all,
          onSelected: () =>
              setState(() => _availabilityFilter = _AvailabilityFilter.all),
        ),
        _buildFilterChip(
          theme: theme,
          label: loc.t('engagement_filter_online'),
          selected: _availabilityFilter == _AvailabilityFilter.online,
          onSelected: () =>
              setState(() => _availabilityFilter = _AvailabilityFilter.online),
        ),
        _buildFilterChip(
          theme: theme,
          label: loc.t('engagement_filter_offline'),
          selected: _availabilityFilter == _AvailabilityFilter.offline,
          onSelected: () =>
              setState(() => _availabilityFilter = _AvailabilityFilter.offline),
        ),
      ],
    );
  }

  Widget _buildFilterChip({
    required ThemeData theme,
    required String label,
    required bool selected,
    required VoidCallback onSelected,
  }) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
      selectedColor: theme.colorScheme.primary.withOpacityCompat(0.15),
      labelStyle: theme.textTheme.bodySmall?.copyWith(
        color: selected
            ? theme.colorScheme.primary
            : theme.colorScheme.onSurface.withOpacityCompat(0.8),
        fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
      ),
      side: BorderSide(color: theme.colorScheme.outline.withOpacityCompat(0.5)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 2),
      lastDate: DateTime(now.year + 2),
      initialDateRange: _dateRange,
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: Theme.of(context).colorScheme.copyWith(
                primary: AppPalette.flame,
              ),
        ),
        child: child!,
      ),
    );

    if (picked != null) {
      setState(() => _dateRange = picked);
    }
  }

  void _clearFilters() {
    _searchController.clear();
    setState(() {
      _dateRange = null;
      _availabilityFilter = _AvailabilityFilter.all;
    });
  }

  List<ChatUser> _filterUsers() {
    final query = _query;
    return users.where((u) {
      if (query.isNotEmpty) {
        final name = u.name.toLowerCase();
        final message = u.lastMessage.toLowerCase();
        final id = u.id.toLowerCase();
        if (!name.contains(query) &&
            !message.contains(query) &&
            !id.contains(query)) {
          return false;
        }
      }

      if (_dateRange != null && !_isWithinRange(u.lastSeen, _dateRange!)) {
        return false;
      }

      if (_availabilityFilter == _AvailabilityFilter.online && !u.online) {
        return false;
      }
      if (_availabilityFilter == _AvailabilityFilter.offline && u.online) {
        return false;
      }

      return true;
    }).toList();
  }

  bool _isWithinRange(DateTime value, DateTimeRange range) {
    final start =
        DateTime(range.start.year, range.start.month, range.start.day);
    final end = DateTime(
        range.end.year, range.end.month, range.end.day, 23, 59, 59, 999);
    return (value.isAtSameMomentAs(start) || value.isAfter(start)) &&
        (value.isAtSameMomentAs(end) || value.isBefore(end));
  }

  String _formatRange(DateTimeRange range) {
    return '${_formatDate(range.start)} → ${_formatDate(range.end)}';
  }

  String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }
}

enum _AvailabilityFilter { all, online, offline }

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
                        if (user.unreadCount > 0)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              user.unreadCount > 99
                                  ? '99+'
                                  : user.unreadCount.toString(),
                              style: textTheme.labelSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
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
