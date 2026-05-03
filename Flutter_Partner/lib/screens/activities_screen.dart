import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/mock_data.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';

class ActivitiesScreen extends StatelessWidget {
  final List<Activity> activities;
  const ActivitiesScreen({Key? key, required this.activities})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final body = SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: isDarkMode
                        ? AppDecorations.glass(radius: 16)
                        : BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                                color:
                                    theme.colorScheme.outline.withOpacity(0.5)),
                          ),
                    child: Icon(Icons.arrow_back_rounded,
                        color: theme.colorScheme.onSurface),
                  ),
                ),
                const SizedBox(width: 16),
                Text(loc.t('activity'),
                    style: theme.textTheme.titleLarge
                        ?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                physics: const BouncingScrollPhysics(),
                itemCount: activities.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (ctx, i) {
                  final activity = activities[i];
                  return _ActivityTile(
                    title: activity.title,
                    subtitle: activity.subtitle,
                    time: activity.time,
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
}

class _ActivityTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final DateTime time;

  const _ActivityTile(
      {required this.title, required this.subtitle, required this.time});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textTheme = theme.textTheme;

    return Container(
      decoration: isDarkMode
          ? AppDecorations.glass(radius: 22)
          : BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                  color:
                      theme.colorScheme.outline.withAlpha((0.5 * 255).round())),
            ),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: AppDecorations.pillGradient(AppPalette.aqua),
            child: const Icon(Icons.trending_up_rounded, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('$subtitle • ${_timeAgo(context, time)}',
                    style: textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface
                            .withAlpha((0.7 * 255).round()))),
              ],
            ),
          ),
          Icon(Icons.chevron_right,
              color: Colors.grey.withAlpha((0.6 * 255).round())),
        ],
      ),
    );
  }

  String _timeAgo(BuildContext context, DateTime t) {
    final loc = AppLocalizations.of(context);
    final diff = DateTime.now().difference(t);
    if (diff.inHours < 24) {
      return loc.t('hours_ago').replaceFirst('{0}', diff.inHours.toString());
    }
    if (diff.inDays < 7) {
      return loc.t('days_ago').replaceFirst('{0}', diff.inDays.toString());
    }
    return loc
        .t('weeks_ago')
        .replaceFirst('{0}', ((diff.inDays / 7).floor()).toString());
  }
}
