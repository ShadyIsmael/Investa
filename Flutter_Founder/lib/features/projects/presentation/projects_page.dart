import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../data/project_models.dart';
import '../data/projects_controller.dart';

class ProjectsPage extends ConsumerWidget {
  const ProjectsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectsControllerProvider);
    final projects = state.valueOrNull;

    return RefreshIndicator(
      onRefresh: () => ref.read(projectsControllerProvider.notifier).refresh(),
      color: Theme.of(context).colorScheme.primary,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: <Widget>[
          SliverPadding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              FopxSpacing.pageGutter,
              FopxSpacing.md,
              FopxSpacing.pageGutter,
              0,
            ),
            sliver: SliverToBoxAdapter(child: const _ProjectsHeader()),
          ),
          if (state.isLoading && projects == null)
            const SliverPadding(
              padding: EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
              ),
              sliver: SliverToBoxAdapter(child: _ProjectsLoading()),
            )
          else if (state.hasError && projects == null)
            SliverFillRemaining(
              hasScrollBody: false,
              child: _ProjectsError(
                error: state.error,
                onRetry:
                    () =>
                        ref.read(projectsControllerProvider.notifier).refresh(),
              ),
            )
          else if (projects != null && projects.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: _ProjectsEmpty(),
            )
          else if (projects != null)
            SliverPadding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
              ),
              sliver: SliverList.builder(
                itemCount: projects.length,
                itemBuilder:
                    (context, index) => _ProjectReveal(
                      index: index,
                      child: _ProjectEntry(
                        index: index,
                        project: projects[index],
                        isLast: index == projects.length - 1,
                        onTap:
                            () =>
                                context.push('/projects/${projects[index].id}'),
                      ),
                    ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ProjectsHeader extends StatelessWidget {
  const _ProjectsHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(context.l10n.projects, style: theme.textTheme.headlineMedium),
        const SizedBox(height: FopxSpacing.sm),
        Text(
          context.l10n.projectsContext,
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.68),
          ),
        ),
        const SizedBox(height: FopxSpacing.lg),
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: FopxButton(
            label: context.l10n.projectCreate,
            icon: Icons.add_rounded,
            variant: FopxButtonVariant.secondary,
            onPressed: () => context.push('/projects/new'),
          ),
        ),
      ],
    );
  }
}

class _ProjectsLoading extends StatelessWidget {
  const _ProjectsLoading();

  @override
  Widget build(BuildContext context) => Column(
    children: const <Widget>[
      _ProjectSkeleton(),
      _ProjectSkeleton(),
      _ProjectSkeleton(),
    ],
  );
}

class _ProjectSkeleton extends StatelessWidget {
  const _ProjectSkeleton();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsetsDirectional.only(bottom: FopxSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const SizedBox(
                width: 30,
                child: _SkeletonBar(width: 22, height: 12),
              ),
              const SizedBox(width: FopxSpacing.md),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _SkeletonBar(width: 210, height: 22),
                    SizedBox(height: FopxSpacing.sm),
                    _SkeletonBar(width: 180, height: 13),
                    SizedBox(height: FopxSpacing.xs),
                    _SkeletonBar(width: 120, height: 13),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: FopxSpacing.lg),
          Divider(color: scheme.outlineVariant, height: 1),
        ],
      ),
    );
  }
}

class _SkeletonBar extends StatelessWidget {
  const _SkeletonBar({required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: width,
    height: height,
    child: const FopxLoadingState(height: 13),
  );
}

class _ProjectsEmpty extends StatelessWidget {
  const _ProjectsEmpty();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Align(
      alignment: AlignmentDirectional.topStart,
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(
          FopxSpacing.pageGutter,
          FopxSpacing.xxl,
          FopxSpacing.pageGutter,
          FopxSpacing.xl,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(
              FopxIcons.projects,
              size: FopxIconSizes.decorative,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(height: FopxSpacing.lg),
            Text(
              context.l10n.projectsEmptyTitle,
              style: theme.textTheme.titleLarge,
            ),
            const SizedBox(height: FopxSpacing.sm),
            Text(
              context.l10n.projectsEmptyBody,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.68),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProjectsError extends StatelessWidget {
  const _ProjectsError({required this.error, required this.onRetry});

  final Object? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final isForbidden = error is ApiError && (error! as ApiError).isForbidden;
    final apiMessage = error is ApiError ? (error! as ApiError).message : null;
    return FopxErrorState(
      title:
          isForbidden
              ? context.l10n.projectsForbiddenTitle
              : context.l10n.projectsErrorTitle,
      body:
          apiMessage?.isNotEmpty == true
              ? apiMessage!
              : isForbidden
              ? context.l10n.projectsForbiddenBody
              : context.l10n.projectsErrorBody,
      actionLabel: context.l10n.retry,
      onAction: onRetry,
      kind: isForbidden ? FopxErrorKind.forbidden : FopxErrorKind.network,
    );
  }
}

class _ProjectReveal extends StatelessWidget {
  const _ProjectReveal({required this.index, required this.child});

  final int index;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final duration = FopxMotion.duration(
      context,
      Duration(milliseconds: 180 + (index.clamp(0, 3) * 45)),
    );
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: duration,
      curve: FopxMotion.standardCurve,
      builder:
          (context, value, child) => Opacity(
            opacity: value,
            child: Transform.translate(
              offset: Offset(0, (1 - value) * 8),
              child: child,
            ),
          ),
      child: child,
    );
  }
}

class _ProjectEntry extends StatelessWidget {
  const _ProjectEntry({
    required this.index,
    required this.project,
    required this.isLast,
    required this.onTap,
  });

  final int index;
  final FounderProject project;
  final bool isLast;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context);
    final status = project.statusLabel(l10n);
    final semanticLabel = l10n.projectSemanticLabel(
      project.displayName,
      status,
      project.activeOpportunityCount,
      project.totalOpportunityCount,
    );

    return Semantics(
      container: true,
      button: true,
      label: semanticLabel,
      onTap: onTap,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsetsDirectional.only(
            bottom: isLast ? 0 : FopxSpacing.xl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  _ProjectIndex(index: index, isActive: project.isActive),
                  const SizedBox(width: FopxSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          project.displayName,
                          style: theme.textTheme.titleLarge,
                        ),
                        const SizedBox(height: FopxSpacing.xs),
                        if (project.summary.trim().isNotEmpty)
                          Text(
                            project.summary.trim(),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurface.withValues(
                                alpha: 0.72,
                              ),
                            ),
                          ),
                        const SizedBox(height: FopxSpacing.sm),
                        _ProjectBusinessContext(
                          project: project,
                          locale: locale,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: FopxSpacing.md),
              Wrap(
                spacing: FopxSpacing.lg,
                runSpacing: FopxSpacing.xs,
                children: <Widget>[
                  _ProjectStatus(label: status, status: project.status),
                  _ProjectOpportunity(active: project.activeOpportunityCount),
                  if (project.updatedAt != null)
                    _ProjectUpdated(
                      value: _updatedLabel(
                        l10n,
                        project.updatedAt!.toLocal(),
                        locale,
                      ),
                    ),
                ],
              ),
              if (!isLast) ...<Widget>[
                const SizedBox(height: FopxSpacing.xl),
                Divider(color: theme.colorScheme.outlineVariant, height: 1),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ProjectIndex extends StatelessWidget {
  const _ProjectIndex({required this.index, required this.isActive});

  final int index;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      width: 30,
      child: Text(
        (index + 1).toString().padLeft(2, '0'),
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          color:
              isActive
                  ? scheme.primary
                  : scheme.onSurface.withValues(alpha: 0.46),
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _ProjectBusinessContext extends StatelessWidget {
  const _ProjectBusinessContext({required this.project, required this.locale});

  final FounderProject project;
  final Locale locale;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final category =
        locale.languageCode == 'ar'
            ? (project.categoryAr ?? project.categoryEn)
            : (project.categoryEn ?? project.categoryAr);
    final industry = project.industry?.trim();
    final normalizedIndustry = industry?.toLowerCase();
    final normalizedCategory = category?.trim().toLowerCase();
    final hasIndustry = industry?.isNotEmpty == true;
    final hasCategory =
        category?.trim().isNotEmpty == true &&
        normalizedCategory != normalizedIndustry;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (project.stageLabel(l10n).trim().isNotEmpty)
          _ProjectStage(value: project.stageLabel(l10n).trim()),
        if (hasIndustry || hasCategory) ...<Widget>[
          const SizedBox(height: FopxSpacing.sm),
          Wrap(
            spacing: FopxSpacing.lg,
            runSpacing: FopxSpacing.xs,
            children: <Widget>[
              if (hasIndustry)
                _ProjectDescriptor(label: l10n.industryLabel, value: industry!),
              if (hasCategory)
                _ProjectDescriptor(
                  label: l10n.categoryLabel,
                  value: category!.trim(),
                ),
            ],
          ),
        ],
        if (!hasIndustry && !hasCategory && project.stage.trim().isEmpty)
          Text(
            l10n.projectContextUnavailable,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(
                context,
              ).colorScheme.onSurface.withValues(alpha: 0.52),
            ),
          ),
      ],
    );
  }
}

class _ProjectStage extends StatelessWidget {
  const _ProjectStage({required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 18,
          height: 2,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: FopxSpacing.xs),
        Text(
          value,
          style: theme.textTheme.titleSmall?.copyWith(
            color: theme.colorScheme.primary,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }
}

class _ProjectDescriptor extends StatelessWidget {
  const _ProjectDescriptor({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.44),
            fontWeight: FontWeight.w700,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.72),
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _ProjectStatus extends StatelessWidget {
  const _ProjectStatus({required this.label, required this.status});

  final String label;
  final String status;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = _statusColor(theme, status);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: FopxSpacing.xs),
        Text(label, style: theme.textTheme.labelMedium?.copyWith(color: color)),
      ],
    );
  }
}

class _ProjectOpportunity extends StatelessWidget {
  const _ProjectOpportunity({required this.active});

  final int active;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    if (active == 0) {
      return Text(
        l10n.activeOpportunitySummary(active),
        style: theme.textTheme.labelMedium?.copyWith(
          color: theme.colorScheme.onSurface.withValues(alpha: 0.58),
          fontWeight: FontWeight.w600,
        ),
      );
    }

    return Text(
      l10n.activeOpportunitySummary(active),
      style: theme.textTheme.titleSmall?.copyWith(
        color: theme.colorScheme.onSurface.withValues(alpha: 0.82),
        fontWeight: FontWeight.w800,
      ),
    );
  }
}

class _ProjectUpdated extends StatelessWidget {
  const _ProjectUpdated({required this.value});

  final String value;

  @override
  Widget build(BuildContext context) => Text(
    value,
    style: Theme.of(context).textTheme.labelSmall?.copyWith(
      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.42),
      fontWeight: FontWeight.w500,
    ),
  );
}

String _updatedLabel(
  FopxLocalizations l10n,
  DateTime updatedAt,
  Locale locale,
) =>
    '${l10n.updated} ${DateFormat.yMMMd(locale.languageCode).format(updatedAt)}';

Color _statusColor(ThemeData theme, String status) {
  final tokens = theme.extension<FopxSemanticColors>();
  return switch (status.toLowerCase()) {
    'active' => tokens?.success ?? theme.colorScheme.primary,
    'paused' => tokens?.warning ?? theme.colorScheme.primary,
    'completed' => tokens?.info ?? theme.colorScheme.primary,
    'archived' => tokens?.neutral ?? theme.colorScheme.outline,
    _ => tokens?.current ?? theme.colorScheme.primary,
  };
}
