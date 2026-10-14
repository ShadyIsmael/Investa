import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../data/project_management_controller.dart';
import '../data/project_models.dart';
import '../data/project_overview_controller.dart';
import '../data/projects_controller.dart';

class ProjectOverviewPage extends ConsumerWidget {
  const ProjectOverviewPage({super.key, required this.projectId});

  final int projectId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectOverviewProvider(projectId));
    final project = state.valueOrNull;
    final provider = projectOverviewProvider(projectId);

    return RefreshIndicator(
      onRefresh: () => ref.refresh(provider.future),
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
              child: _OverviewTopBar(
                onBack: () => context.pop(),
                projectId: project?.id,
                canEdit: project?.canEdit == true,
                availableStatusTransitions:
                    project?.availableStatusTransitions ?? const <String>[],
                onStatusTransition:
                    project == null
                        ? null
                        : (request) async {
                          await ref
                              .read(projectManagementRepositoryProvider)
                              .transitionProjectStatus(project.id, request);
                          ref.invalidate(projectOverviewProvider(project.id));
                          ref.invalidate(projectsControllerProvider);
                        },
              ),
            ),
          ),
          if (state.isLoading && project == null)
            const SliverPadding(
              padding: EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
                FopxSpacing.pageGutter,
                FopxSpacing.xl,
              ),
              sliver: SliverToBoxAdapter(child: _ProjectOverviewSkeleton()),
            )
          else if (state.hasError && project == null)
            SliverFillRemaining(
              hasScrollBody: false,
              child: _ProjectOverviewError(
                error: state.error,
                onRetry: () => ref.invalidate(provider),
              ),
            )
          else if (project != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  FopxSpacing.pageGutter,
                  FopxSpacing.lg,
                  FopxSpacing.pageGutter,
                  FopxSpacing.xxl,
                ),
                child: _ProjectOverviewContent(project: project),
              ),
            ),
        ],
      ),
    );
  }
}

class _OverviewTopBar extends StatelessWidget {
  const _OverviewTopBar({
    required this.onBack,
    required this.projectId,
    required this.canEdit,
    required this.availableStatusTransitions,
    required this.onStatusTransition,
  });

  final VoidCallback onBack;
  final int? projectId;
  final bool canEdit;
  final List<String> availableStatusTransitions;
  final Future<void> Function(ProjectStatusTransitionRequest request)?
  onStatusTransition;

  @override
  Widget build(BuildContext context) => Row(
    children: <Widget>[
      BackButton(onPressed: onBack),
      const Spacer(),
      if (canEdit && projectId != null)
        TextButton.icon(
          onPressed: () => context.push('/projects/$projectId/edit'),
          icon: const Icon(Icons.edit_outlined),
          label: Text(context.l10n.projectEdit),
        ),
      if (availableStatusTransitions.isNotEmpty && onStatusTransition != null)
        PopupMenuButton<String>(
          tooltip: context.l10n.projectStatusActions,
          icon: const Icon(Icons.more_vert_rounded),
          onSelected: (target) => _runStatusTransition(context, target),
          itemBuilder:
              (context) => <PopupMenuEntry<String>>[
                for (final status in availableStatusTransitions)
                  PopupMenuItem<String>(
                    value: status,
                    child: Text(_statusActionLabel(context.l10n, status)),
                  ),
              ],
        ),
    ],
  );

  Future<void> _runStatusTransition(BuildContext context, String target) async {
    String? reason;
    if (target.toLowerCase() == 'archived') {
      reason = await _confirmArchive(context);
      if (reason == null) return;
    }
    try {
      await onStatusTransition!(
        ProjectStatusTransitionRequest(targetStatus: target, reason: reason),
      );
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.projectStatusUpdateFailed)),
      );
    }
  }

  Future<String?> _confirmArchive(BuildContext context) async {
    return showDialog<String>(
      context: context,
      builder: (_) => const _ProjectArchiveConfirmationDialog(),
    );
  }
}

class _ProjectArchiveConfirmationDialog extends StatefulWidget {
  const _ProjectArchiveConfirmationDialog();

  @override
  State<_ProjectArchiveConfirmationDialog> createState() =>
      _ProjectArchiveConfirmationDialogState();
}

class _ProjectArchiveConfirmationDialogState
    extends State<_ProjectArchiveConfirmationDialog> {
  final _reason = TextEditingController();

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(context.l10n.projectArchiveConfirmTitle),
    content: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(context.l10n.projectArchiveConfirmBody),
        const SizedBox(height: FopxSpacing.md),
        TextField(
          controller: _reason,
          autofocus: true,
          maxLength: 1000,
          decoration: InputDecoration(
            labelText: context.l10n.projectArchiveReason,
          ),
          onChanged: (_) => setState(() {}),
        ),
      ],
    ),
    actions: <Widget>[
      TextButton(
        onPressed: () => Navigator.of(context).pop(),
        child: Text(context.l10n.projectArchiveCancel),
      ),
      TextButton(
        onPressed:
            _reason.text.trim().length < 5
                ? null
                : () => Navigator.of(context).pop(_reason.text.trim()),
        child: Text(context.l10n.projectArchiveAction),
      ),
    ],
  );
}

String _statusActionLabel(FopxLocalizations l10n, String status) =>
    switch (status.toLowerCase()) {
      'draft' => l10n.statusDraft,
      'active' => l10n.statusActive,
      'paused' => l10n.statusPaused,
      'completed' => l10n.statusCompleted,
      'archived' => l10n.projectArchiveAction,
      _ => status,
    };

class _ProjectOverviewContent extends ConsumerWidget {
  const _ProjectOverviewContent({required this.project});

  final FounderProjectDetails project;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context);
    final category =
        locale.languageCode == 'ar'
            ? (project.categoryAr ?? project.categoryEn)
            : (project.categoryEn ?? project.categoryAr);
    final description = project.description.trim();
    final summary = project.summary.trim();
    final showAbout = description.isNotEmpty && description != summary;
    final facts = <_ProjectFactData>[
      if (project.industry?.trim().isNotEmpty == true)
        _ProjectFactData(l10n.industryLabel, project.industry!.trim()),
      if (category?.trim().isNotEmpty == true)
        _ProjectFactData(l10n.categoryLabel, category!.trim()),
      if (project.foundedOn != null)
        _ProjectFactData(l10n.founded, _formatDate(project.foundedOn!, locale)),
      if (project.geography?.trim().isNotEmpty == true)
        _ProjectFactData(l10n.location, project.geography!.trim()),
      if (project.websiteUrl?.trim().isNotEmpty == true)
        _ProjectFactData(l10n.website, project.websiteUrl!.trim(), isLtr: true),
    ];

    final opportunities = [...project.opportunities]..sort((a, b) {
      final byCreated = (b.createdAt ?? DateTime(1)).compareTo(
        a.createdAt ?? DateTime(1),
      );
      return byCreated != 0
          ? byCreated
          : b.sequenceNumber.compareTo(a.sequenceNumber);
    });
    final latest = opportunities.isEmpty ? null : opportunities.first;
    final roomState = ref.watch(projectRoomProvider(project.id));

    return Semantics(
      container: true,
      label: '${project.displayName}. ${project.statusLabel(l10n)}.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _ProjectIdentity(project: project),
          if (summary.isNotEmpty) ...<Widget>[
            const SizedBox(height: FopxSpacing.lg),
            Text(
              summary,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(
                  context,
                ).colorScheme.onSurface.withValues(alpha: 0.72),
                height: 1.45,
              ),
            ),
          ],
          const _OverviewDivider(),
          _OverviewSection(
            title: l10n.latestOpportunity,
            child: _LatestOpportunitySpotlight(
              project: project,
              latest: latest,
              allOpportunities: opportunities,
            ),
          ),
          const _OverviewDivider(),
          _OverviewSection(
            title: l10n.projectRoom,
            child: _ProjectRoomEntrySection(
              project: project,
              state: roomState,
              onRetry: () => ref.invalidate(projectRoomProvider(project.id)),
            ),
          ),
          if (facts.isNotEmpty) ...<Widget>[
            const _OverviewDivider(),
            _OverviewSection(
              title: l10n.businessProfile,
              child: _ProjectFacts(facts: facts),
            ),
          ],
          if (showAbout) ...<Widget>[
            const _OverviewDivider(),
            _OverviewSection(
              title: l10n.aboutProject,
              child: Text(
                description,
                style: Theme.of(
                  context,
                ).textTheme.bodyLarge?.copyWith(height: 1.55),
              ),
            ),
          ],
          const _OverviewDivider(),
          _OverviewSection(
            title: l10n.projectInformation,
            child: _ProjectDates(project: project),
          ),
        ],
      ),
    );
  }
}

class _ProjectIdentity extends StatelessWidget {
  const _ProjectIdentity({required this.project});

  final FounderProjectDetails project;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _ProjectMark(project: project),
        const SizedBox(width: FopxSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(project.displayName, style: theme.textTheme.headlineSmall),
              const SizedBox(height: FopxSpacing.sm),
              _ProjectStage(value: project.stageLabel(l10n)),
              const SizedBox(height: FopxSpacing.xs),
              _ProjectStatus(
                label: project.statusLabel(l10n),
                status: project.status,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProjectMark extends StatelessWidget {
  const _ProjectMark({required this.project});

  final FounderProjectDetails project;

  @override
  Widget build(BuildContext context) {
    final logoUrl = project.logoUrl?.trim();
    final uri = logoUrl == null ? null : Uri.tryParse(logoUrl);
    final hasValidLogo =
        uri != null &&
        (uri.scheme == 'http' || uri.scheme == 'https') &&
        uri.host.isNotEmpty;

    return Container(
      width: 64,
      height: 64,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(FopxRadii.surface),
      ),
      child:
          hasValidLogo
              ? Image.network(
                uri.toString(),
                fit: BoxFit.cover,
                errorBuilder:
                    (context, error, stackTrace) =>
                        _Monogram(label: project.monogram),
              )
              : _Monogram(label: project.monogram),
    );
  }
}

class _Monogram extends StatelessWidget {
  const _Monogram({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) => Center(
    child: Text(
      label,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
        color: Theme.of(context).colorScheme.primary,
        fontWeight: FontWeight.w800,
      ),
    ),
  );
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
        Text(
          label,
          style: theme.textTheme.labelMedium?.copyWith(
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _OverviewSection extends StatelessWidget {
  const _OverviewSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: <Widget>[
      Text(
        title,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
          color: Theme.of(context).colorScheme.primary,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.7,
        ),
      ),
      const SizedBox(height: FopxSpacing.md),
      child,
    ],
  );
}

class _OverviewDivider extends StatelessWidget {
  const _OverviewDivider();

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xl),
    child: Divider(
      height: 1,
      color: Theme.of(context).colorScheme.outlineVariant,
    ),
  );
}

class _ProjectFacts extends StatelessWidget {
  const _ProjectFacts({required this.facts});

  final List<_ProjectFactData> facts;

  @override
  Widget build(BuildContext context) => Wrap(
    spacing: FopxSpacing.xl,
    runSpacing: FopxSpacing.lg,
    children: facts
        .map((fact) => _ProjectFact(fact: fact))
        .toList(growable: false),
  );
}

class _ProjectFactData {
  const _ProjectFactData(this.label, this.value, {this.isLtr = false});

  final String label;
  final String value;
  final bool isLtr;
}

class _ProjectFact extends StatelessWidget {
  const _ProjectFact({required this.fact});

  final _ProjectFactData fact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final value = Text(
      fact.value,
      style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
    );
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 120, maxWidth: 260),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            fact.label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.48),
              fontWeight: FontWeight.w700,
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: FopxSpacing.xs),
          fact.isLtr
              ? Directionality(
                textDirection: ui.TextDirection.ltr,
                child: value,
              )
              : value,
        ],
      ),
    );
  }
}

class _LatestOpportunitySpotlight extends StatelessWidget {
  const _LatestOpportunitySpotlight({
    required this.project,
    required this.latest,
    required this.allOpportunities,
  });

  final FounderProjectDetails project;
  final FounderOpportunity? latest;
  final List<FounderOpportunity> allOpportunities;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    if (latest == null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(l10n.noOpportunitiesTitle, style: theme.textTheme.bodyLarge),
          const SizedBox(height: FopxSpacing.xs),
          Text(l10n.noOpportunitiesBody, style: theme.textTheme.bodyMedium),
        ],
      );
    }

    return Consumer(
      builder: (context, ref, _) {
        final state =
            latest!.id > 0
                ? ref.watch(projectOpportunityProvider(latest!.id))
                : null;
        final detail = state?.valueOrNull;
        final preview = detail?.projectId == project.id ? detail : null;
        final date = preview?.updatedAt ?? latest!.createdAt;
        final description =
            preview?.shortDescription ?? latest!.shortDescription;
        final statusColor = _opportunityStatusColor(theme, latest!.status);
        final pastCount = allOpportunities.where((o) => o.isPast).length;
        final totalCount = allOpportunities.length;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Semantics(
              label:
                  '${latest!.title}. ${l10n.opportunityStatusLabel(latest!.status)}.',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    latest!.title,
                    style: theme.textTheme.titleLarge?.copyWith(
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
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: FopxSpacing.xs),
                      Text(
                        l10n.opportunityStatusLabel(latest!.status),
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  if (description?.trim().isNotEmpty == true) ...<Widget>[
                    const SizedBox(height: FopxSpacing.md),
                    Text(
                      description!.trim(),
                      style: theme.textTheme.bodyLarge?.copyWith(height: 1.45),
                    ),
                  ] else if (state?.isLoading == true) ...<Widget>[
                    const SizedBox(height: FopxSpacing.md),
                    const _SkeletonBar(width: 220, height: 14),
                  ],
                  if (date != null) ...<Widget>[
                    const SizedBox(height: FopxSpacing.sm),
                    Text(
                      _formatDate(date, Localizations.localeOf(context)),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(
                          alpha: 0.58,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: FopxSpacing.md),
            Semantics(
              button: true,
              label: '${l10n.viewOpportunity}: ${latest!.title}',
              child: InkWell(
                onTap:
                    latest!.id > 0
                        ? () => context.push(
                          '/projects/${project.id}/opportunities/${latest!.id}',
                        )
                        : null,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: FopxSpacing.md),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        l10n.viewOpportunity,
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(width: FopxSpacing.xs),
                      Icon(
                        Directionality.of(context) == ui.TextDirection.rtl
                            ? Icons.arrow_back_rounded
                            : Icons.arrow_forward_rounded,
                        size: 18,
                        color: theme.colorScheme.primary,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (totalCount > 1 || project.canEdit) ...<Widget>[
              const _OverviewDivider(),
              Semantics(
                button: true,
                label: l10n.viewAllOpportunities,
                child: InkWell(
                  onTap:
                      () =>
                          context.push('/projects/${project.id}/opportunities'),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: FopxSpacing.md,
                    ),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            l10n.viewAllOpportunities,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Text(
                          '$totalCount',
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: theme.colorScheme.onSurface.withValues(
                              alpha: 0.62,
                            ),
                          ),
                        ),
                        const SizedBox(width: FopxSpacing.sm),
                        Icon(
                          Directionality.of(context) == ui.TextDirection.rtl
                              ? Icons.chevron_left_rounded
                              : Icons.chevron_right_rounded,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
            if (pastCount > 0) ...<Widget>[
              const _OverviewDivider(),
              Semantics(
                button: true,
                label: '${l10n.viewPastOpportunities}. $pastCount',
                child: InkWell(
                  onTap:
                      () =>
                          context.push('/projects/${project.id}/opportunities'),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: FopxSpacing.md,
                    ),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            l10n.viewPastOpportunities,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Text(
                          '$pastCount',
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: theme.colorScheme.onSurface.withValues(
                              alpha: 0.62,
                            ),
                          ),
                        ),
                        const SizedBox(width: FopxSpacing.sm),
                        Icon(
                          Directionality.of(context) == ui.TextDirection.rtl
                              ? Icons.chevron_left_rounded
                              : Icons.chevron_right_rounded,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}

class _ProjectRoomEntrySection extends StatelessWidget {
  const _ProjectRoomEntrySection({
    required this.project,
    required this.state,
    required this.onRetry,
  });
  final FounderProjectDetails project;
  final AsyncValue<FounderProjectRoom> state;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    if (state.isLoading) return const _SkeletonBar(width: 210, height: 16);
    final room = state.valueOrNull;
    if (room == null || !room.isFounder || room.projectId != project.id) {
      final apiError =
          state.error is ApiError ? state.error! as ApiError : null;
      final accessDenied =
          apiError?.statusCode == 403 ||
          apiError?.code?.contains('FORBIDDEN') == true;
      final notFound =
          apiError?.statusCode == 404 ||
          apiError?.code?.endsWith('_NOT_FOUND') == true;
      if (!accessDenied && !notFound && state.hasError) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              l10n.projectOverviewErrorBody,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.62),
              ),
            ),
            TextButton(onPressed: onRetry, child: Text(l10n.retry)),
          ],
        );
      }
      return Text(
        l10n.roomUnavailable,
        style: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurface.withValues(alpha: 0.62),
        ),
      );
    }
    final entryCount =
        room.updates.length + room.milestones.length + room.documents.length;
    return Semantics(
      button: true,
      label: '${l10n.openProjectRoom}: ${project.displayName}',
      child: InkWell(
        onTap: () => context.push('/projects/${project.id}/room'),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: FopxSpacing.sm),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      l10n.projectRoomDescription,
                      style: theme.textTheme.bodyLarge,
                    ),
                    const SizedBox(height: FopxSpacing.xs),
                    Text(
                      l10n.openProjectRoom,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (entryCount > 0) ...<Widget>[
                      const SizedBox(height: FopxSpacing.xs),
                      Text(
                        '${room.updates.length} · ${room.milestones.length} · ${room.documents.length}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withValues(
                            alpha: 0.58,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: FopxSpacing.sm),
              Icon(
                Directionality.of(context) == ui.TextDirection.rtl
                    ? Icons.chevron_left_rounded
                    : Icons.chevron_right_rounded,
                color: theme.colorScheme.primary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProjectDates extends StatelessWidget {
  const _ProjectDates({required this.project});

  final FounderProjectDetails project;

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context);
    final facts = <_ProjectFactData>[
      if (project.createdAt != null)
        _ProjectFactData(
          context.l10n.created,
          _formatDate(project.createdAt!, locale),
        ),
      if (project.updatedAt != null)
        _ProjectFactData(
          context.l10n.lastUpdated,
          _formatDate(project.updatedAt!, locale),
        ),
    ];
    if (facts.isEmpty) return const SizedBox.shrink();
    return _ProjectFacts(facts: facts);
  }
}

class _ProjectOverviewSkeleton extends StatelessWidget {
  const _ProjectOverviewSkeleton();

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: <Widget>[
      const Row(
        children: <Widget>[
          _SkeletonBar(width: 64, height: 64),
          SizedBox(width: FopxSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                _SkeletonBar(width: 210, height: 24),
                SizedBox(height: FopxSpacing.sm),
                _SkeletonBar(width: 110, height: 16),
                SizedBox(height: FopxSpacing.xs),
                _SkeletonBar(width: 70, height: 13),
              ],
            ),
          ),
        ],
      ),
      SizedBox(height: FopxSpacing.lg),
      _SkeletonBar(width: double.infinity, height: 14),
      SizedBox(height: FopxSpacing.xs),
      _SkeletonBar(width: 260, height: 14),
      SizedBox(height: FopxSpacing.xxl),
      _SkeletonBar(width: 130, height: 14),
      SizedBox(height: FopxSpacing.md),
      _SkeletonBar(width: double.infinity, height: 16),
      SizedBox(height: FopxSpacing.xs),
      _SkeletonBar(width: 190, height: 16),
      SizedBox(height: FopxSpacing.xxl),
      _SkeletonBar(width: 120, height: 14),
      SizedBox(height: FopxSpacing.md),
      _SkeletonBar(width: double.infinity, height: 16),
    ],
  );
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

class _ProjectOverviewError extends StatelessWidget {
  const _ProjectOverviewError({required this.error, required this.onRetry});

  final Object? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final apiError = error is ApiError ? error! as ApiError : null;
    final isForbidden = apiError?.isForbidden == true;
    final isNotFound =
        apiError?.statusCode == 404 || apiError?.code == 'PROJECT_NOT_FOUND';
    final title =
        isForbidden
            ? l10n.projectOverviewForbiddenTitle
            : isNotFound
            ? l10n.projectOverviewNotFoundTitle
            : l10n.projectOverviewErrorTitle;
    final body =
        apiError?.message.isNotEmpty == true
            ? apiError!.message
            : isForbidden
            ? l10n.projectOverviewForbiddenBody
            : isNotFound
            ? l10n.projectOverviewNotFoundBody
            : l10n.projectOverviewErrorBody;
    return FopxErrorState(
      title: title,
      body: body,
      actionLabel: l10n.retry,
      onAction: onRetry,
      kind: isForbidden ? FopxErrorKind.forbidden : FopxErrorKind.network,
    );
  }
}

String _formatDate(DateTime value, Locale locale) =>
    DateFormat.yMMMd(locale.languageCode).format(value.toLocal());

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

Color _opportunityStatusColor(ThemeData theme, String status) {
  final tokens = theme.extension<FopxSemanticColors>();
  return switch (status.toLowerCase()) {
    'approved' ||
    'published' ||
    'funding' => tokens?.success ?? theme.colorScheme.primary,
    'rejected' => tokens?.error ?? theme.colorScheme.error,
    'completed' || 'archived' => tokens?.neutral ?? theme.colorScheme.outline,
    _ => tokens?.info ?? theme.colorScheme.primary,
  };
}
