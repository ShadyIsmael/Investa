import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../data/project_models.dart';
import '../data/opportunity_form_controller.dart';
import '../data/project_overview_controller.dart';
import '../data/projects_controller.dart';
import 'direct_offers_panel.dart';

class ProjectOpportunitiesPage extends ConsumerWidget {
  const ProjectOpportunitiesPage({required this.projectId, super.key});
  final int projectId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final provider = projectOverviewProvider(projectId);
    final state = ref.watch(provider);
    final project = state.valueOrNull;
    final locale = Localizations.localeOf(context);
    final all = [...?project?.opportunities]
      ..sort((a, b) => _latestFirst(a, b));
    final current = all.where((item) => !item.isPast).toList(growable: false);
    final past = all.where((item) => item.isPast).toList(growable: false);

    return RefreshIndicator(
      onRefresh: () => ref.refresh(provider.future),
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
              child: _PageBackBar(onBack: context.pop),
            ),
          ),
          if (state.isLoading && project == null)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator.adaptive()),
            )
          else if (state.hasError && project == null)
            SliverFillRemaining(
              hasScrollBody: false,
              child: _RequestError(
                error: state.error,
                onRetry: () => ref.invalidate(provider),
              ),
            )
          else if (project != null)
            SliverPadding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.lg,
                FopxSpacing.pageGutter,
                FopxSpacing.xxl,
              ),
              sliver: SliverList.list(
                children: <Widget>[
                  Text(
                    context.l10n.opportunities,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: FopxSpacing.sm),
                  Text(
                    project.displayName,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withValues(alpha: 0.62),
                    ),
                  ),
                  if (project.canEdit &&
                      project.status.toLowerCase() != 'archived') ...<Widget>[
                    const SizedBox(height: FopxSpacing.lg),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed:
                            () => context.push(
                              '/projects/$projectId/opportunities/new',
                            ),
                        icon: const Icon(Icons.add_rounded),
                        label: Text(context.l10n.createOpportunity),
                      ),
                    ),
                  ],
                  if (current.isNotEmpty) ...<Widget>[
                    const SizedBox(height: FopxSpacing.xxl),
                    _EditorialSectionTitle(context.l10n.currentRecent),
                    const SizedBox(height: FopxSpacing.sm),
                    for (final opportunity in current)
                      _OpportunityListEntry(
                        projectId: projectId,
                        opportunity: opportunity,
                        locale: locale,
                      ),
                  ],
                  if (past.isNotEmpty) ...<Widget>[
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: FopxSpacing.md),
                      child: Divider(height: 1),
                    ),
                    _EditorialSectionTitle(context.l10n.pastOpportunities),
                    const SizedBox(height: FopxSpacing.sm),
                    for (final opportunity in past)
                      _OpportunityListEntry(
                        projectId: projectId,
                        opportunity: opportunity,
                        locale: locale,
                      ),
                  ],
                  if (all.isEmpty) ...<Widget>[
                    const SizedBox(height: FopxSpacing.xxl),
                    Text(
                      context.l10n.noOpportunitiesTitle,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: FopxSpacing.xs),
                    Text(
                      context.l10n.noOpportunitiesBody,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class ProjectOpportunityDetailPage extends ConsumerWidget {
  const ProjectOpportunityDetailPage({
    required this.projectId,
    required this.opportunityId,
    super.key,
  });
  final int projectId;
  final int opportunityId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final provider = projectOpportunityProvider(opportunityId);
    final state = ref.watch(provider);
    final opportunity = state.valueOrNull;
    final project = ref.watch(projectOverviewProvider(projectId)).valueOrNull;
    return RefreshIndicator(
      onRefresh: () => ref.refresh(provider.future),
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
              child: _PageBackBar(onBack: context.pop),
            ),
          ),
          if (state.isLoading && opportunity == null)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator.adaptive()),
            )
          else if (state.hasError ||
              (opportunity != null && opportunity.projectId != projectId))
            SliverFillRemaining(
              hasScrollBody: false,
              child: _RequestError(
                error:
                    state.error ??
                    const ApiError(
                      message: 'Opportunity not found.',
                      statusCode: 404,
                    ),
                onRetry: () => ref.invalidate(provider),
              ),
            )
          else if (opportunity != null)
            SliverPadding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.lg,
                FopxSpacing.pageGutter,
                FopxSpacing.xxl,
              ),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    if (project?.canEdit == true && opportunity.canFounderEdit)
                      Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: TextButton.icon(
                          onPressed:
                              () => context.push(
                                '/projects/$projectId/opportunities/$opportunityId/edit',
                              ),
                          icon: const Icon(Icons.edit_outlined),
                          label: Text(context.l10n.editOpportunity),
                        ),
                      ),
                    _OpportunityDetailContent(opportunity: opportunity),
                    if (project?.canEdit == true) ...<Widget>[
                      const SizedBox(height: FopxSpacing.xl),
                      FounderDirectOffersPanel(opportunityId: opportunityId),
                    ],
                    if (project?.canEdit == true) ...<Widget>[
                      const SizedBox(height: FopxSpacing.md),
                      _OpportunityCoverAction(
                        projectId: projectId,
                        opportunityId: opportunityId,
                        imageUrl: opportunity.coverImageUrl,
                        onUpdated: () {
                          ref.invalidate(provider);
                          ref.invalidate(projectOverviewProvider(projectId));
                          ref.invalidate(projectsControllerProvider);
                        },
                      ),
                    ],
                    if (project?.canEdit == true &&
                        (opportunity.canFounderSubmitForReview ||
                            opportunity.canFounderPublish)) ...<Widget>[
                      const SizedBox(height: FopxSpacing.lg),
                      _OpportunityLifecycleAction(
                        opportunityId: opportunityId,
                        submitForReview: opportunity.canFounderSubmitForReview,
                        onTransitioned: () {
                          ref.invalidate(provider);
                          ref.invalidate(projectOverviewProvider(projectId));
                          ref.invalidate(projectsControllerProvider);
                        },
                      ),
                    ],
                    if (project?.canEdit == true &&
                        opportunity.canFounderArchive) ...<Widget>[
                      const SizedBox(height: FopxSpacing.sm),
                      _OpportunityArchiveAction(
                        opportunityId: opportunityId,
                        onArchived: () {
                          ref.invalidate(provider);
                          ref.invalidate(projectOverviewProvider(projectId));
                          ref.invalidate(projectsControllerProvider);
                        },
                      ),
                    ],
                    const SizedBox(height: FopxSpacing.xl),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed:
                            () => context.push(
                              '/projects/$projectId/opportunities/$opportunityId/requests?title=${Uri.encodeQueryComponent(opportunity.title)}',
                            ),
                        icon: const Icon(Icons.inbox_outlined),
                        label: Text(context.l10n.investorRequests),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _OpportunityLifecycleAction extends ConsumerStatefulWidget {
  const _OpportunityLifecycleAction({
    required this.opportunityId,
    required this.submitForReview,
    required this.onTransitioned,
  });

  final int opportunityId;
  final bool submitForReview;
  final VoidCallback onTransitioned;

  @override
  ConsumerState<_OpportunityLifecycleAction> createState() =>
      _OpportunityLifecycleActionState();
}

class _OpportunityCoverAction extends ConsumerStatefulWidget {
  const _OpportunityCoverAction({
    required this.projectId,
    required this.opportunityId,
    required this.imageUrl,
    required this.onUpdated,
  });

  final int projectId;
  final int opportunityId;
  final String? imageUrl;
  final VoidCallback onUpdated;

  @override
  ConsumerState<_OpportunityCoverAction> createState() =>
      _OpportunityCoverActionState();
}

class _OpportunityCoverActionState
    extends ConsumerState<_OpportunityCoverAction> {
  static const _mediaChannel = MethodChannel('com.fopx.founder/media');
  bool _busy = false;
  String? _error;

  Future<void> _chooseAndUpload() async {
    Map<String, dynamic>? selected;
    try {
      selected = await _mediaChannel.invokeMapMethod<String, dynamic>(
        'pickCoverImage',
      );
    } on PlatformException catch (error) {
      if (mounted) {
        setState(
          () =>
              _error =
                  error.code == 'FILE_TOO_LARGE'
                      ? context.l10n.opportunityCoverImageTooLarge
                      : context.l10n.opportunityCoverImageFailed,
        );
      }
      return;
    } on MissingPluginException {
      if (mounted) {
        setState(() => _error = context.l10n.opportunityCoverImageFailed);
      }
      return;
    }
    if (selected == null || !mounted) return;
    final rawBytes = selected['bytes'];
    final bytes = rawBytes is List<int> ? rawBytes : null;
    final fileName = selected['name']?.toString() ?? 'opportunity-cover';
    if (bytes == null || bytes.isEmpty) {
      setState(() => _error = context.l10n.opportunityCoverImageFailed);
      return;
    }
    if (bytes.length > 10 * 1024 * 1024) {
      setState(() => _error = context.l10n.opportunityCoverImageTooLarge);
      return;
    }

    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref
          .read(opportunityFormRepositoryProvider)
          .setCoverImage(
            projectId: widget.projectId,
            opportunityId: widget.opportunityId,
            fileBytes: bytes,
            fileName: fileName,
          );
      if (!mounted) return;
      widget.onUpdated();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.opportunityCoverImageUpdated)),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error =
            error is ApiError
                ? error.message
                : context.l10n.opportunityCoverImageFailed;
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: <Widget>[
      if (widget.imageUrl?.trim().isNotEmpty == true) ...<Widget>[
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.network(
            widget.imageUrl!,
            height: 190,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder:
                (context, error, stackTrace) => const SizedBox.shrink(),
          ),
        ),
        const SizedBox(height: FopxSpacing.sm),
      ],
      if (_error != null) ...<Widget>[
        FopxInlineFeedback(kind: FopxFeedbackKind.error, message: _error!),
        const SizedBox(height: FopxSpacing.sm),
      ],
      OutlinedButton.icon(
        onPressed: _busy ? null : _chooseAndUpload,
        icon:
            _busy
                ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : const Icon(Icons.add_photo_alternate_outlined),
        label: Text(
          _busy ? context.l10n.saving : context.l10n.changeCoverImage,
        ),
      ),
    ],
  );
}

class _OpportunityLifecycleActionState
    extends ConsumerState<_OpportunityLifecycleAction> {
  bool _busy = false;
  String? _error;

  Future<void> _publish() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final repository = ref.read(opportunityFormRepositoryProvider);
      if (widget.submitForReview) {
        await repository.submitForReview(widget.opportunityId);
        if (!mounted) return;
        widget.onTransitioned();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.opportunitySubmittedForReview)),
        );
        return;
      }
      final quote = await repository.quotePublish();
      if (!mounted) return;
      if (!quote.hasSufficientCredit) {
        setState(() => _error = context.l10n.insufficientPublishCredit);
        return;
      }
      final confirmed = await showDialog<bool>(
        context: context,
        builder:
            (dialogContext) => AlertDialog(
              title: Text(context.l10n.publishOpportunity),
              content: Text(
                context.l10n.paidActionConfirmation(
                  _credit(quote.creditCost),
                  _credit(quote.currentBalance),
                ),
              ),
              actions: <Widget>[
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext, false),
                  child: Text(context.l10n.cancel),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(dialogContext, true),
                  child: Text(context.l10n.publishOpportunity),
                ),
              ],
            ),
      );
      if (confirmed != true || !mounted) return;
      await repository.publish(widget.opportunityId);
      if (!mounted) return;
      widget.onTransitioned();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.opportunityPublished)),
      );
    } catch (error) {
      if (mounted) {
        setState(
          () =>
              _error =
                  error is ApiError
                      ? error.message
                      : widget.submitForReview
                      ? context.l10n.opportunitySubmitFailed
                      : context.l10n.opportunityPublishFailed,
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: <Widget>[
      if (_error != null) ...<Widget>[
        FopxInlineFeedback(kind: FopxFeedbackKind.error, message: _error!),
        const SizedBox(height: FopxSpacing.sm),
      ],
      FilledButton.icon(
        onPressed: _busy ? null : _publish,
        icon:
            _busy
                ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : Icon(
                  widget.submitForReview
                      ? Icons.fact_check_outlined
                      : Icons.publish_outlined,
                ),
        label: Text(
          _busy
              ? context.l10n.saving
              : widget.submitForReview
              ? context.l10n.submitOpportunityForReview
              : context.l10n.publishOpportunity,
        ),
      ),
    ],
  );
}

String _credit(double value) =>
    value == value.roundToDouble()
        ? value.toStringAsFixed(0)
        : value.toStringAsFixed(2);

class _OpportunityArchiveAction extends ConsumerStatefulWidget {
  const _OpportunityArchiveAction({
    required this.opportunityId,
    required this.onArchived,
  });

  final int opportunityId;
  final VoidCallback onArchived;

  @override
  ConsumerState<_OpportunityArchiveAction> createState() =>
      _OpportunityArchiveActionState();
}

class _OpportunityArchiveActionState
    extends ConsumerState<_OpportunityArchiveAction> {
  bool _busy = false;
  String? _error;

  Future<void> _archive() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(context.l10n.opportunityArchiveConfirmTitle),
            content: Text(context.l10n.opportunityArchiveConfirmBody),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(context.l10n.projectArchiveCancel),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(context.l10n.opportunityArchiveAction),
              ),
            ],
          ),
    );
    if (confirmed != true || !mounted) return;

    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref
          .read(opportunityFormRepositoryProvider)
          .archive(widget.opportunityId);
      if (!mounted) return;
      widget.onArchived();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(context.l10n.opportunityArchived)));
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error =
            error is ApiError
                ? error.message
                : context.l10n.opportunityArchiveFailed;
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: <Widget>[
      if (_error != null) ...<Widget>[
        FopxInlineFeedback(kind: FopxFeedbackKind.error, message: _error!),
        const SizedBox(height: FopxSpacing.sm),
      ],
      OutlinedButton.icon(
        onPressed: _busy ? null : _archive,
        icon:
            _busy
                ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : const Icon(Icons.archive_outlined),
        label: Text(
          _busy ? context.l10n.saving : context.l10n.opportunityArchiveAction,
        ),
      ),
    ],
  );
}

class _OpportunityDetailContent extends StatelessWidget {
  const _OpportunityDetailContent({required this.opportunity});
  final FounderOpportunityDetail opportunity;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final color = _statusColor(theme, opportunity.status);
    final locale = Localizations.localeOf(context);
    final summary = opportunity.shortDescription?.trim();
    final description = opportunity.description?.trim();
    final terms = opportunity.publicInvestmentTermsSummary?.trim();
    final facts = <(String, String)>[
      if (opportunity.fundingTarget != null &&
          opportunity.fundingCurrency != null)
        (
          l10n.fundingTarget,
          '${_amount(opportunity.fundingTarget!)} ${opportunity.fundingCurrency}',
        ),
      if (opportunity.minimumInvestmentAmount != null &&
          opportunity.fundingCurrency != null)
        (
          l10n.minimumParticipation,
          '${_amount(opportunity.minimumInvestmentAmount!)} ${opportunity.fundingCurrency}',
        ),
      if (opportunity.maximumInvestmentAmount != null &&
          opportunity.fundingCurrency != null)
        (
          l10n.maximumParticipation,
          '${_amount(opportunity.maximumInvestmentAmount!)} ${opportunity.fundingCurrency}',
        ),
      if (opportunity.expectedDurationMonths != null)
        (
          l10n.expectedDuration,
          '${opportunity.expectedDurationMonths} ${locale.languageCode == 'ar' ? 'شهر' : 'months'}',
        ),
      if (opportunity.fundingOpensAt != null ||
          opportunity.fundingClosesAt != null)
        (
          l10n.fundingWindow,
          '${opportunity.fundingOpensAt == null ? '—' : _date(opportunity.fundingOpensAt!, locale)} – ${opportunity.fundingClosesAt == null ? '—' : _date(opportunity.fundingClosesAt!, locale)}',
        ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          opportunity.title,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: FopxSpacing.sm),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: FopxSpacing.xs),
            Text(
              l10n.opportunityStatusLabel(opportunity.status),
              style: theme.textTheme.labelLarge?.copyWith(
                color: color,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        if (summary?.isNotEmpty == true) ...<Widget>[
          const SizedBox(height: FopxSpacing.lg),
          Text(
            summary!,
            style: theme.textTheme.titleMedium?.copyWith(height: 1.4),
          ),
        ],
        if (description?.isNotEmpty == true) ...<Widget>[
          const SizedBox(height: FopxSpacing.md),
          Text(
            description!,
            style: theme.textTheme.bodyLarge?.copyWith(height: 1.5),
          ),
        ],
        if (opportunity.useOfFunds?.trim().isNotEmpty == true) ...<Widget>[
          const _PageDivider(),
          _EditorialSectionTitle(l10n.useOfFunds),
          const SizedBox(height: FopxSpacing.sm),
          Text(
            opportunity.useOfFunds!,
            style: theme.textTheme.bodyLarge?.copyWith(height: 1.5),
          ),
        ],
        if (terms?.isNotEmpty == true) ...<Widget>[
          const _PageDivider(),
          _EditorialSectionTitle(l10n.publicTerms),
          const SizedBox(height: FopxSpacing.sm),
          Text(terms!, style: theme.textTheme.bodyLarge?.copyWith(height: 1.5)),
        ],
        if (opportunity.expectedReturnSummary?.trim().isNotEmpty ==
            true) ...<Widget>[
          const _PageDivider(),
          _EditorialSectionTitle(l10n.expectedReturn),
          const SizedBox(height: FopxSpacing.sm),
          Text(
            opportunity.expectedReturnSummary!,
            style: theme.textTheme.bodyLarge?.copyWith(height: 1.5),
          ),
        ],
        if (facts.isNotEmpty) ...<Widget>[
          const _PageDivider(),
          _EditorialSectionTitle(l10n.opportunityContext),
          const SizedBox(height: FopxSpacing.md),
          for (final fact in facts)
            Padding(
              padding: const EdgeInsets.only(bottom: FopxSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    fact.$1,
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(
                        alpha: 0.55,
                      ),
                    ),
                  ),
                  const SizedBox(height: FopxSpacing.xs),
                  Text(
                    fact.$2,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
        ],
        const _PageDivider(),
        _EditorialSectionTitle(l10n.projectInformation),
        const SizedBox(height: FopxSpacing.md),
        if (opportunity.createdAt != null)
          _MetaLine(
            label: l10n.created,
            value: _date(opportunity.createdAt!, locale),
          ),
        if (opportunity.updatedAt != null)
          _MetaLine(
            label: l10n.lastUpdated,
            value: _date(opportunity.updatedAt!, locale),
          ),
        if (opportunity.closedAt != null)
          _MetaLine(
            label: l10n.statusCompleted,
            value: _date(opportunity.closedAt!, locale),
          ),
      ],
    );
  }
}

class _OpportunityListEntry extends StatelessWidget {
  const _OpportunityListEntry({
    required this.projectId,
    required this.opportunity,
    required this.locale,
  });
  final int projectId;
  final FounderOpportunity opportunity;
  final Locale locale;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final color = _statusColor(theme, opportunity.status);
    return Semantics(
      button: true,
      label:
          '${opportunity.title}. ${l10n.opportunityStatusLabel(opportunity.status)}',
      child: InkWell(
        onTap:
            opportunity.id > 0
                ? () => context.push(
                  '/projects/$projectId/opportunities/${opportunity.id}',
                )
                : null,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: FopxSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                opportunity.title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: FopxSpacing.xs),
              Row(
                children: <Widget>[
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: FopxSpacing.xs),
                        Flexible(
                          child: Text(
                            l10n.opportunityStatusLabel(opportunity.status),
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: color,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (opportunity.createdAt != null)
                    Text(
                      _date(opportunity.createdAt!, locale),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(
                          alpha: 0.58,
                        ),
                      ),
                    ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.only(top: FopxSpacing.md),
                child: Divider(height: 1),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PageBackBar extends StatelessWidget {
  const _PageBackBar({required this.onBack});
  final VoidCallback onBack;
  @override
  Widget build(BuildContext context) => Align(
    alignment: AlignmentDirectional.centerStart,
    child: BackButton(onPressed: onBack),
  );
}

class _EditorialSectionTitle extends StatelessWidget {
  const _EditorialSectionTitle(this.title);
  final String title;
  @override
  Widget build(BuildContext context) => Text(
    title.toUpperCase(),
    style: Theme.of(context).textTheme.labelLarge?.copyWith(
      color: Theme.of(context).colorScheme.primary,
      fontWeight: FontWeight.w800,
      letterSpacing: 0.7,
    ),
  );
}

class _PageDivider extends StatelessWidget {
  const _PageDivider();
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xl),
    child: Divider(
      height: 1,
      color: Theme.of(context).colorScheme.outlineVariant,
    ),
  );
}

class _MetaLine extends StatelessWidget {
  const _MetaLine({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: FopxSpacing.md),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: Theme.of(
              context,
            ).colorScheme.onSurface.withValues(alpha: 0.55),
          ),
        ),
        const SizedBox(height: FopxSpacing.xs),
        Text(value, style: Theme.of(context).textTheme.bodyLarge),
      ],
    ),
  );
}

class _RequestError extends StatelessWidget {
  const _RequestError({required this.error, required this.onRetry});
  final Object? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final apiError = error is ApiError ? error as ApiError : null;
    final forbidden =
        apiError?.statusCode == 403 ||
        apiError?.code?.contains('FORBIDDEN') == true;
    final notFound =
        apiError?.statusCode == 404 ||
        apiError?.code?.endsWith('_NOT_FOUND') == true;
    final l10n = context.l10n;
    return FopxErrorState(
      title:
          forbidden
              ? context.l10n.projectOverviewForbiddenTitle
              : notFound
              ? l10n.unavailable
              : l10n.projectOverviewErrorTitle,
      body:
          forbidden
              ? context.l10n.projectOverviewForbiddenBody
              : notFound
              ? l10n.unavailable
              : l10n.projectOverviewErrorBody,
      actionLabel: forbidden || notFound ? null : l10n.retry,
      onAction: forbidden || notFound ? null : onRetry,
      kind:
          forbidden
              ? FopxErrorKind.forbidden
              : apiError == null
              ? FopxErrorKind.network
              : FopxErrorKind.generic,
    );
  }
}

int _latestFirst(FounderOpportunity a, FounderOpportunity b) {
  final byCreated = (b.createdAt ?? DateTime(1)).compareTo(
    a.createdAt ?? DateTime(1),
  );
  return byCreated != 0
      ? byCreated
      : b.sequenceNumber.compareTo(a.sequenceNumber);
}

Color _statusColor(ThemeData theme, String status) => switch (status
    .toLowerCase()) {
  'published' ||
  'funding' ||
  'fullyfunded' ||
  'inprogress' => theme.colorScheme.tertiary,
  'completed' || 'archived' => theme.colorScheme.outline,
  'rejected' => theme.colorScheme.error,
  _ => theme.colorScheme.primary,
};

String _date(DateTime date, Locale locale) =>
    DateFormat.yMMMd(locale.toLanguageTag()).format(date.toLocal());
String _amount(double value) => NumberFormat('#,##0.##').format(value);
