import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../data/founder_dashboard.dart';
import '../data/founder_dashboard_controller.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(founderDashboardProvider);
    final dashboard = state.valueOrNull;
    final l10n = context.l10n;

    return RefreshIndicator(
      onRefresh: () async {
        try {
          await ref.refresh(founderDashboardProvider.future).then<void>((_) {});
        } catch (_) {
          // The provider exposes the failure in the page's section-level state.
        }
      },
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
            sliver: SliverToBoxAdapter(
              child: _HomeHeader(
                title: l10n.overview,
                subtitle: l10n.homeSubtitle,
              ),
            ),
          ),
          if (state.isLoading && dashboard == null)
            const SliverPadding(
              padding: EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
              ),
              sliver: SliverToBoxAdapter(child: _DashboardLoading()),
            )
          else if (state.hasError && dashboard == null)
            SliverFillRemaining(
              hasScrollBody: false,
              child: _DashboardError(
                error: state.error,
                onRetry: () => ref.invalidate(founderDashboardProvider),
              ),
            )
          else if (dashboard != null)
            SliverPadding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
              ),
              sliver: SliverToBoxAdapter(
                child: _DashboardContent(dashboard: dashboard),
              ),
            ),
        ],
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(title, style: theme.textTheme.headlineMedium),
        const SizedBox(height: FopxSpacing.sm),
        Text(
          subtitle,
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.68),
          ),
        ),
      ],
    );
  }
}

class _DashboardContent extends StatelessWidget {
  const _DashboardContent({required this.dashboard});

  final FounderDashboard dashboard;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final metrics = dashboard.metrics;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(l10n.homePortfolio, style: theme.textTheme.titleMedium),
        const SizedBox(height: FopxSpacing.md),
        _PortfolioSummary(
          projects: metrics.totalProjects,
          opportunities: metrics.activeOpportunities,
        ),
        if (metrics.pendingActions > 0) ...<Widget>[
          const SizedBox(height: FopxSpacing.xxl),
          Text(l10n.homeNeedsAttention, style: theme.textTheme.titleMedium),
          const SizedBox(height: FopxSpacing.sm),
          Semantics(
            label: l10n.homePendingActions(metrics.pendingActions),
            child: Text(
              l10n.homePendingActions(metrics.pendingActions),
              style: theme.textTheme.bodyLarge,
            ),
          ),
        ],
        const SizedBox(height: FopxSpacing.xxl),
        Text(l10n.homeCapitalPosition, style: theme.textTheme.titleMedium),
        const SizedBox(height: FopxSpacing.sm),
        _CapitalPosition(dashboard: dashboard),
        if (dashboard.projects.isNotEmpty) ...<Widget>[
          const SizedBox(height: FopxSpacing.xxl),
          Text(l10n.homeYourProjects, style: theme.textTheme.titleMedium),
          const SizedBox(height: FopxSpacing.sm),
          for (var index = 0; index < dashboard.projects.length; index++)
            _ProjectLink(
              project: dashboard.projects[index],
              isLast: index == dashboard.projects.length - 1,
            ),
        ] else ...<Widget>[
          const SizedBox(height: FopxSpacing.xxl),
          Text(l10n.homeNoProjects, style: theme.textTheme.titleMedium),
          const SizedBox(height: FopxSpacing.xs),
          Text(
            l10n.homeNoProjectsBody,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.68),
            ),
          ),
        ],
      ],
    );
  }
}

class _PortfolioSummary extends StatelessWidget {
  const _PortfolioSummary({
    required this.projects,
    required this.opportunities,
  });

  final int projects;
  final int opportunities;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    return Semantics(
      container: true,
      label:
          '${l10n.totalProjects}: $projects. '
          '${l10n.activeOpportunities}: $opportunities.',
      child: Row(
        children: <Widget>[
          Expanded(
            child: _SummaryValue(value: projects, label: l10n.totalProjects),
          ),
          Container(
            width: 1,
            height: 48,
            color: theme.colorScheme.outlineVariant,
            margin: const EdgeInsetsDirectional.symmetric(
              horizontal: FopxSpacing.lg,
            ),
          ),
          Expanded(
            child: _SummaryValue(
              value: opportunities,
              label: l10n.activeOpportunities,
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryValue extends StatelessWidget {
  const _SummaryValue({required this.value, required this.label});

  final int value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ExcludeSemantics(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('$value', style: theme.textTheme.headlineSmall),
          const SizedBox(height: FopxSpacing.xs),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.68),
            ),
          ),
        ],
      ),
    );
  }
}

class _CapitalPosition extends StatelessWidget {
  const _CapitalPosition({required this.dashboard});

  final FounderDashboard dashboard;

  @override
  Widget build(BuildContext context) {
    final metrics = dashboard.metrics;
    final l10n = context.l10n;
    final rows = <(String, FounderDashboardMoney)>[
      (l10n.homeCommitted, metrics.totalCommitted),
      (l10n.homeDeclared, metrics.declaredReceivedAmount),
      (l10n.homeAwaitingConfirmation, metrics.awaitingConfirmationAmount),
      (l10n.homeDisputed, metrics.disputedAmount),
      (l10n.homeConfirmed, metrics.confirmedReceivedAmount),
      (l10n.homeOutstanding, metrics.outstandingAmount),
    ];
    return Column(
      children: <Widget>[
        for (var index = 0; index < rows.length; index++)
          _CapitalRow(
            label: rows[index].$1,
            money: rows[index].$2,
            currency: dashboard.displayCurrency,
            isLast: index == rows.length - 1,
          ),
      ],
    );
  }
}

class _CapitalRow extends StatelessWidget {
  const _CapitalRow({
    required this.label,
    required this.money,
    required this.currency,
    required this.isLast,
  });

  final String label;
  final FounderDashboardMoney money;
  final String currency;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context);
    final value =
        !money.available || money.value == null
            ? l10n.unavailable
            : '${money.approximate ? '≈ ' : ''}'
                '${NumberFormat.currency(name: currency, symbol: currency, decimalDigits: 2, locale: locale.languageCode == 'ar' ? 'ar_EG' : 'en_US').format(money.value)}';
    return Semantics(
      label:
          money.approximate && money.available
              ? '$label, ${l10n.approximateValue}, $value'
              : '$label, $value',
      child: ExcludeSemantics(
        child: Padding(
          padding: const EdgeInsetsDirectional.symmetric(
            vertical: FopxSpacing.md,
          ),
          child: Column(
            children: <Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      label,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(
                          alpha: 0.78,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: FopxSpacing.md),
                  Flexible(
                    child: Text(
                      value,
                      textAlign: TextAlign.end,
                      style: theme.textTheme.titleSmall,
                    ),
                  ),
                ],
              ),
              if (!isLast) ...<Widget>[
                const SizedBox(height: FopxSpacing.md),
                Divider(height: 1, color: theme.colorScheme.outlineVariant),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ProjectLink extends StatelessWidget {
  const _ProjectLink({required this.project, required this.isLast});

  final FounderDashboardProject project;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    return Column(
      children: <Widget>[
        Semantics(
          button: true,
          label:
              '${project.displayName}. '
              '${l10n.projectOpportunityTotal(project.opportunityCount)}',
          child: InkWell(
            onTap: () => context.push('/projects/${project.id}'),
            borderRadius: BorderRadius.circular(FopxRadii.control),
            child: Padding(
              padding: const EdgeInsetsDirectional.symmetric(
                vertical: FopxSpacing.md,
              ),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          project.displayName,
                          style: theme.textTheme.titleSmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: FopxSpacing.xs),
                        Text(
                          l10n.projectOpportunityTotal(
                            project.opportunityCount,
                          ),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface.withValues(
                              alpha: 0.65,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: FopxSpacing.md),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 16,
                    color: theme.colorScheme.primary,
                    semanticLabel: null,
                  ),
                ],
              ),
            ),
          ),
        ),
        if (!isLast)
          Divider(height: 1, color: theme.colorScheme.outlineVariant),
      ],
    );
  }
}

class _DashboardLoading extends StatelessWidget {
  const _DashboardLoading();

  @override
  Widget build(BuildContext context) => const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: <Widget>[
      FopxLoadingState(height: 58),
      SizedBox(height: FopxSpacing.xxl),
      FopxLoadingState(height: 250),
      SizedBox(height: FopxSpacing.xxl),
      FopxLoadingState(height: 150),
    ],
  );
}

class _DashboardError extends StatelessWidget {
  const _DashboardError({required this.error, required this.onRetry});

  final Object? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final apiError = error is ApiError ? error as ApiError : null;
    final forbidden = apiError?.isForbidden == true;
    return FopxErrorState(
      title: forbidden ? l10n.homeForbiddenTitle : l10n.homeErrorTitle,
      body: forbidden ? l10n.homeForbiddenBody : l10n.homeErrorBody,
      actionLabel: forbidden ? null : l10n.retry,
      onAction: forbidden ? null : onRetry,
      kind:
          forbidden
              ? FopxErrorKind.forbidden
              : apiError?.statusCode == null
              ? FopxErrorKind.network
              : FopxErrorKind.generic,
    );
  }
}
