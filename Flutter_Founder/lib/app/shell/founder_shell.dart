import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import 'brand_mark.dart';
import '../../features/notifications/data/notifications_controller.dart';

class FounderShell extends StatelessWidget {
  const FounderShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final labels = <String>[l10n.home, l10n.projects, l10n.deals, l10n.chat];
    final title = labels[navigationShell.currentIndex];
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: <Widget>[
            _TopChrome(title: title),
            Expanded(child: navigationShell),
          ],
        ),
      ),
      bottomNavigationBar: _FopxBottomNav(
        currentIndex: navigationShell.currentIndex,
        labels: labels,
        onSelected:
            (index) => navigationShell.goBranch(
              index,
              initialLocation: index == navigationShell.currentIndex,
            ),
      ),
    );
  }
}

class _TopChrome extends ConsumerWidget {
  const _TopChrome({required this.title});

  final String title;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final unreadCount =
        ref.watch(founderUnreadNotificationCountProvider).valueOrNull;
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 360;
        final profile = Semantics(
          button: true,
          label: l10n.profile,
          child: InkWell(
            borderRadius: BorderRadius.circular(FopxRadii.surface),
            onTap: () => context.push('/profile'),
            child: const Padding(
              padding: EdgeInsets.all(FopxSpacing.xs),
              child: FopxAvatar(label: 'F', size: 38),
            ),
          ),
        );
        final actions = <Widget>[
          FopxNotificationBell(
            onPressed: () => context.push('/notifications'),
            unreadCount: unreadCount,
            tooltip: l10n.notifications,
          ),
          const SizedBox(width: FopxSpacing.xs),
          profile,
        ];

        return Padding(
          padding: EdgeInsetsDirectional.fromSTEB(
            compact ? FopxSpacing.sm : FopxSpacing.pageGutter,
            compact ? FopxSpacing.sm : FopxSpacing.lg,
            compact ? FopxSpacing.sm : FopxSpacing.lg,
            compact ? FopxSpacing.sm : FopxSpacing.md,
          ),
          child:
              compact
                  ? Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          const FopxBrandMark(compact: true),
                          const Spacer(),
                          ...actions,
                        ],
                      ),
                      const SizedBox(height: FopxSpacing.xs),
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ],
                  )
                  : Row(
                    children: <Widget>[
                      const FopxBrandMark(compact: true),
                      const SizedBox(width: FopxSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              l10n.founderIdentity,
                              style: Theme.of(
                                context,
                              ).textTheme.labelMedium?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            const SizedBox(height: FopxSpacing.xs),
                            Text(
                              title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ],
                        ),
                      ),
                      ...actions,
                    ],
                  ),
        );
      },
    );
  }
}

class _FopxBottomNav extends StatelessWidget {
  const _FopxBottomNav({
    required this.currentIndex,
    required this.labels,
    required this.onSelected,
  });

  final int currentIndex;
  final List<String> labels;
  final ValueChanged<int> onSelected;

  static const _icons = <IconData>[
    FopxIcons.home,
    FopxIcons.projects,
    FopxIcons.deals,
    FopxIcons.chat,
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.surface,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            FopxSpacing.md,
            FopxSpacing.sm,
            FopxSpacing.md,
            FopxSpacing.md,
          ),
          child: Row(
            children: List<Widget>.generate(labels.length, (index) {
              final selected = index == currentIndex;
              return Expanded(
                child: Semantics(
                  button: true,
                  selected: selected,
                  label: labels[index],
                  child: GestureDetector(
                    onTap: () => onSelected(index),
                    child: AnimatedContainer(
                      duration: FopxMotion.duration(
                        context,
                        FopxMotion.standard,
                      ),
                      curve: FopxMotion.standardCurve,
                      margin: const EdgeInsets.symmetric(
                        horizontal: FopxSpacing.xs,
                      ),
                      padding: const EdgeInsets.symmetric(
                        vertical: FopxSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        color:
                            selected
                                ? scheme.primaryContainer
                                : Colors.transparent,
                        borderRadius: BorderRadius.circular(FopxRadii.control),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          AnimatedScale(
                            scale: selected ? 1.08 : 1,
                            duration: FopxMotion.duration(
                              context,
                              FopxMotion.standard,
                            ),
                            child: Icon(
                              _icons[index],
                              size: FopxIconSizes.navigation,
                              color:
                                  selected
                                      ? scheme.primary
                                      : scheme.onSurface.withValues(
                                        alpha: 0.55,
                                      ),
                            ),
                          ),
                          const SizedBox(height: FopxSpacing.xs),
                          Text(
                            labels[index],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(
                              context,
                            ).textTheme.labelMedium?.copyWith(
                              color:
                                  selected
                                      ? scheme.primary
                                      : scheme.onSurface.withValues(
                                        alpha: 0.55,
                                      ),
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
