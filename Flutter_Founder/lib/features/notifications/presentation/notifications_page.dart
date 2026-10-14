import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../../app/shell/secondary_scaffold.dart';
import '../data/notifications_controller.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  static const _pageSize = 30;
  final List<FounderNotification> _laterPages = <FounderNotification>[];
  bool _loadingMore = false;

  Future<void> _loadMore(int shownCount) async {
    if (_loadingMore) return;
    setState(() => _loadingMore = true);
    try {
      final next = await ref
          .read(founderNotificationsRepositoryProvider)
          .fetch(page: shownCount ~/ _pageSize + 1, pageSize: _pageSize);
      if (mounted) setState(() => _laterPages.addAll(next.items));
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.notificationsLoadFailedBody)),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  void _resetPages() {
    if (_laterPages.isEmpty) return;
    setState(_laterPages.clear);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(founderNotificationsProvider);
    return FopxSecondaryScaffold(
      title: context.l10n.notifications,
      subtitle: context.l10n.notificationsSubtitle,
      child: state.when(
        loading: () => const FopxLoadingState(height: 220),
        error:
            (_, _) => FopxErrorState(
              title: context.l10n.notificationsLoadFailed,
              body: context.l10n.notificationsLoadFailedBody,
              actionLabel: context.l10n.retry,
              kind: FopxErrorKind.network,
              onAction: () => ref.invalidate(founderNotificationsProvider),
            ),
        data: (page) {
          final notifications = <FounderNotification>[
            ...page.items,
            ..._laterPages,
          ];
          final canLoadMore = notifications.length < page.totalCount;
          return Column(
            children: <Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      '${page.unreadCount} ${context.l10n.unreadNotifications}',
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ),
                  if (page.unreadCount > 0)
                    TextButton.icon(
                      onPressed: () => _markAllRead(context, ref),
                      icon: const Icon(Icons.done_all_rounded),
                      label: Text(context.l10n.markAllRead),
                    ),
                ],
              ),
              const SizedBox(height: FopxSpacing.sm),
              Expanded(
                child:
                    page.items.isEmpty
                        ? FopxEmptyState(
                          title: context.l10n.noNotifications,
                          body: context.l10n.notificationsEmptyBody,
                          icon: Icons.notifications_none_rounded,
                        )
                        : RefreshIndicator(
                          onRefresh: () async {
                            _resetPages();
                            ref.invalidate(founderNotificationsProvider);
                            await ref.read(founderNotificationsProvider.future);
                          },
                          child: ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(),
                            itemCount:
                                notifications.length + (canLoadMore ? 1 : 0),
                            separatorBuilder:
                                (_, _) =>
                                    const SizedBox(height: FopxSpacing.xs),
                            itemBuilder: (context, index) {
                              if (index >= notifications.length) {
                                return Center(
                                  child: TextButton(
                                    onPressed:
                                        _loadingMore
                                            ? null
                                            : () =>
                                                _loadMore(notifications.length),
                                    child: Text(
                                      _loadingMore
                                          ? context.l10n.loadingMore
                                          : context.l10n.loadMore,
                                    ),
                                  ),
                                );
                              }
                              final notification = notifications[index];
                              return _NotificationTile(
                                notification: notification,
                                onDelete:
                                    () => _deleteNotification(
                                      context,
                                      ref,
                                      notification.id,
                                    ),
                                onTap:
                                    !notification.isRead ||
                                            founderNotificationRouteForEvent(
                                                  eventType:
                                                      notification.eventType,
                                                  actionUrl:
                                                      notification.actionUrl,
                                                ) !=
                                                null
                                        ? () => _openNotification(
                                          context,
                                          ref,
                                          notification,
                                        )
                                        : null,
                              );
                            },
                          ),
                        ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _deleteNotification(
    BuildContext context,
    WidgetRef ref,
    int id,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(context.l10n.deleteNotification),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(
                  MaterialLocalizations.of(context).cancelButtonLabel,
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(context.l10n.deleteNotification),
              ),
            ],
          ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(founderNotificationsRepositoryProvider).delete(id);
      _resetPages();
      ref.invalidate(founderNotificationsProvider);
      ref.invalidate(founderUnreadNotificationCountProvider);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.notificationUpdateFailed)),
        );
      }
    }
  }

  Future<void> _openNotification(
    BuildContext context,
    WidgetRef ref,
    FounderNotification notification,
  ) async {
    try {
      if (!notification.isRead) {
        await ref.read(founderNotificationsRepositoryProvider).markRead(<int>[
          notification.id,
        ]);
        _resetPages();
        ref.invalidate(founderNotificationsProvider);
        ref.invalidate(founderUnreadNotificationCountProvider);
      }
      final route = founderNotificationRouteForEvent(
        eventType: notification.eventType,
        actionUrl: notification.actionUrl,
      );
      if (route != null && context.mounted) context.push(route);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.notificationUpdateFailed)),
        );
      }
    }
  }

  Future<void> _markAllRead(BuildContext context, WidgetRef ref) async {
    try {
      await ref
          .read(founderNotificationsRepositoryProvider)
          .markRead(const <int>[]);
      _resetPages();
      ref.invalidate(founderNotificationsProvider);
      ref.invalidate(founderUnreadNotificationCountProvider);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.notificationUpdateFailed)),
        );
      }
    }
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.notification,
    required this.onDelete,
    this.onTap,
  });

  final FounderNotification notification;
  final VoidCallback onDelete;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: Icon(
          notification.isRead
              ? Icons.notifications_none_rounded
              : Icons.notifications_active_outlined,
          color: notification.isRead ? scheme.outline : scheme.primary,
        ),
        title: Text(
          notification.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: FopxSpacing.xs),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(notification.body),
              if (notification.createdAt != null) ...<Widget>[
                const SizedBox(height: FopxSpacing.xs),
                Text(
                  MaterialLocalizations.of(
                    context,
                  ).formatShortDate(notification.createdAt!.toLocal()),
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ],
            ],
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (!notification.isRead)
              Icon(Icons.circle, size: 9, color: scheme.primary),
            IconButton(
              tooltip: context.l10n.deleteNotification,
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline_rounded),
            ),
          ],
        ),
        isThreeLine: true,
      ),
    );
  }
}
