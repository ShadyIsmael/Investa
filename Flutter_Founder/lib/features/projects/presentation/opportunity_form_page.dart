import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';

import '../data/opportunity_form_controller.dart';
import '../data/project_models.dart';
import '../data/project_overview_controller.dart';
import '../data/projects_controller.dart';

class OpportunityFormPage extends ConsumerWidget {
  const OpportunityFormPage({
    required this.projectId,
    this.opportunityId,
    super.key,
  });

  final int projectId;
  final int? opportunityId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectProvider = projectOverviewProvider(projectId);
    final projectState = ref.watch(projectProvider);
    final choicesState = ref.watch(opportunityFormChoicesProvider);
    final opportunityProvider =
        opportunityId == null
            ? null
            : projectOpportunityProvider(opportunityId!);
    final opportunityState =
        opportunityProvider == null ? null : ref.watch(opportunityProvider);
    final project = projectState.valueOrNull;
    final opportunity = opportunityState?.valueOrNull;
    if ((project == null && projectState.isLoading) ||
        choicesState.isLoading ||
        (opportunityId != null &&
            opportunity == null &&
            opportunityState!.isLoading)) {
      return const Center(child: FopxLoadingState(height: 240));
    }
    if (project == null ||
        projectState.hasError ||
        choicesState.hasError ||
        (opportunityId != null &&
            (opportunityState!.hasError || opportunity == null))) {
      return Padding(
        padding: const EdgeInsets.all(FopxSpacing.pageGutter),
        child: FopxErrorState(
          title: context.l10n.projectOverviewErrorTitle,
          body: context.l10n.projectOverviewErrorBody,
          actionLabel: context.l10n.retry,
          kind: FopxErrorKind.network,
          onAction: () {
            ref.invalidate(projectProvider);
            ref.invalidate(opportunityFormChoicesProvider);
            if (opportunityProvider != null) {
              ref.invalidate(opportunityProvider);
            }
          },
        ),
      );
    }
    if (!project.canEdit || project.status.toLowerCase() == 'archived') {
      return Padding(
        padding: const EdgeInsets.all(FopxSpacing.pageGutter),
        child: FopxErrorState(
          title: context.l10n.projectOverviewForbiddenTitle,
          body: context.l10n.projectOverviewForbiddenBody,
          kind: FopxErrorKind.forbidden,
        ),
      );
    }

    if (opportunityId != null &&
        (opportunity!.projectId != projectId || !opportunity.canFounderEdit)) {
      return Padding(
        padding: const EdgeInsets.all(FopxSpacing.pageGutter),
        child: FopxErrorState(
          title: context.l10n.opportunityEditingUnavailable,
          body: context.l10n.opportunityEditingLockedBody,
          kind: FopxErrorKind.forbidden,
        ),
      );
    }

    final usedStages =
        project.opportunities
            .map((item) => item.projectStage.toLowerCase())
            .where(
              (stage) =>
                  stage.isNotEmpty &&
                  (opportunity == null ||
                      stage != opportunity.projectStage.toLowerCase()),
            )
            .toSet();
    final availableStages = choicesState.requireValue.stages
        .where(
          (stage) =>
              stage.allowsCustomName ||
              (!usedStages.contains(stage.code.toLowerCase()) ||
                  stage.code.toLowerCase() ==
                      opportunity?.projectStage.toLowerCase()),
        )
        .toList(growable: false);
    if (availableStages.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(FopxSpacing.pageGutter),
        child: FopxEmptyState(
          title: context.l10n.noAvailableOpportunityStages,
          body: context.l10n.noOpportunitiesBody,
          icon: Icons.layers_clear_outlined,
        ),
      );
    }
    return _OpportunityFormBody(
      project: project,
      opportunity: opportunity,
      choices: choicesState.requireValue,
      stages: availableStages,
    );
  }
}

class _OpportunityFormBody extends ConsumerStatefulWidget {
  const _OpportunityFormBody({
    required this.project,
    required this.opportunity,
    required this.choices,
    required this.stages,
  });

  final FounderProjectDetails project;
  final FounderOpportunityDetail? opportunity;
  final OpportunityFormChoices choices;
  final List<OpportunityStageChoice> stages;

  @override
  ConsumerState<_OpportunityFormBody> createState() =>
      _OpportunityFormBodyState();
}

class _OpportunityFormBodyState extends ConsumerState<_OpportunityFormBody> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _shortDescription = TextEditingController();
  final _description = TextEditingController();
  final _useOfFunds = TextEditingController();
  final _fundingTarget = TextEditingController();
  final _customStageName = TextEditingController();
  OpportunityStageChoice? _stage;
  OpportunityGoalChoice? _goal;
  OpportunityCurrencyChoice? _currency;
  bool _saving = false;
  Object? _saveError;
  bool _fundingGoalChanged = false;

  @override
  void initState() {
    super.initState();
    final opportunity = widget.opportunity;
    if (opportunity != null) {
      _title.text = opportunity.title;
      _shortDescription.text = opportunity.shortDescription ?? '';
      _description.text = opportunity.description ?? '';
      _useOfFunds.text = opportunity.useOfFunds ?? '';
      _fundingTarget.text = opportunity.fundingTarget?.toString() ?? '';
      _customStageName.text = opportunity.projectStageCustomName ?? '';
      _goal = _findGoal(widget.choices.fundingGoals, opportunity.fundingGoalId);
      _stage = _findStage(widget.stages, opportunity.projectStage);
    } else if (widget.stages.length == 1) {
      _stage = widget.stages.single;
    }
    final defaultCurrency =
        (opportunity?.fundingCurrency ?? widget.project.defaultCurrency)
            ?.toUpperCase();
    for (final currency in widget.choices.currencies) {
      if (currency.code == defaultCurrency) {
        _currency = currency;
        break;
      }
    }
  }

  OpportunityGoalChoice? _findGoal(
    List<OpportunityGoalChoice> choices,
    int? id,
  ) {
    for (final choice in choices) {
      if (choice.id == id) return choice;
    }
    return null;
  }

  OpportunityStageChoice? _findStage(
    List<OpportunityStageChoice> choices,
    String code,
  ) {
    for (final choice in choices) {
      if (choice.code.toLowerCase() == code.toLowerCase()) return choice;
    }
    return null;
  }

  @override
  void dispose() {
    _title.dispose();
    _shortDescription.dispose();
    _description.dispose();
    _useOfFunds.dispose();
    _fundingTarget.dispose();
    _customStageName.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() ||
        _stage == null ||
        _currency == null) {
      return;
    }
    setState(() => _saving = true);
    try {
      final repository = ref.read(opportunityFormRepositoryProvider);
      final request = <String, dynamic>{
        'title': _title.text.trim(),
        'shortDescription': _shortDescription.text.trim(),
        'description':
            _description.text.trim().isEmpty ? null : _description.text.trim(),
        'useOfFunds': _useOfFunds.text.trim(),
        'fundingTarget': double.parse(_fundingTarget.text.trim()),
        'fundingCurrency': _currency!.code,
        'fundingGoalId':
            _fundingGoalChanged ? _goal?.id : widget.opportunity?.fundingGoalId,
        'projectStage': _stage!.code,
        'projectStageCustomName':
            _stage!.allowsCustomName ? _customStageName.text.trim() : null,
        'tagIds': widget.opportunity?.tagIds ?? const <int>[],
      };
      if (widget.opportunity == null) {
        request['projectId'] = widget.project.id;
      }
      final id =
          widget.opportunity == null
              ? await repository.create(request)
              : widget.opportunity!.id;
      if (widget.opportunity != null) {
        await repository.update(id, request);
      }
      if (!mounted) return;
      ref.invalidate(projectOverviewProvider(widget.project.id));
      ref.invalidate(projectsControllerProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.opportunity == null
                ? context.l10n.opportunityDraftCreated
                : context.l10n.opportunityUpdated,
          ),
        ),
      );
      context.go('/projects/${widget.project.id}/opportunities/$id');
    } catch (error) {
      if (!mounted) return;
      setState(() => _saveError = error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  bool get _canChangeFundingCurrency =>
      widget.opportunity == null ||
      const {
        'draft',
        'rejected',
      }.contains(widget.opportunity!.status.toLowerCase());

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final language = Localizations.localeOf(context).languageCode;
    final usedStageCodes =
        widget.project.opportunities
            .map((item) => item.projectStage.toLowerCase())
            .where(
              (code) => code != widget.opportunity?.projectStage.toLowerCase(),
            )
            .toSet();
    final stages = widget.stages
        .where(
          (stage) =>
              stage.allowsCustomName ||
              !usedStageCodes.contains(stage.code.toLowerCase()),
        )
        .toList(growable: false);
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsetsDirectional.fromSTEB(
          FopxSpacing.pageGutter,
          FopxSpacing.md,
          FopxSpacing.pageGutter,
          FopxSpacing.xxl,
        ),
        children: <Widget>[
          Row(
            children: <Widget>[
              BackButton(onPressed: context.pop),
              Expanded(
                child: Text(
                  widget.opportunity == null
                      ? l10n.createOpportunity
                      : l10n.editOpportunity,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsetsDirectional.only(start: FopxSpacing.md),
            child: Text(
              widget.project.displayName,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          const SizedBox(height: FopxSpacing.lg),
          TextFormField(
            controller: _title,
            maxLength: 200,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              labelText: l10n.opportunityTitle,
              border: const OutlineInputBorder(),
            ),
            validator:
                (value) =>
                    value == null || value.trim().isEmpty
                        ? l10n.requiredField
                        : value.trim().length > 200
                        ? l10n.validationMaxLength(200)
                        : null,
          ),
          const SizedBox(height: FopxSpacing.sm),
          TextFormField(
            controller: _shortDescription,
            minLines: 2,
            maxLines: 4,
            maxLength: 300,
            decoration: InputDecoration(
              labelText: l10n.opportunityShortDescription,
              border: const OutlineInputBorder(),
            ),
            validator: (value) {
              final length = value?.trim().length ?? 0;
              if (length < 20) return l10n.projectMinimumCharacters(20);
              if (length > 300) return l10n.validationMaxLength(300);
              return null;
            },
          ),
          const SizedBox(height: FopxSpacing.sm),
          TextFormField(
            controller: _description,
            minLines: 3,
            maxLines: 8,
            maxLength: 4000,
            decoration: InputDecoration(
              labelText: l10n.opportunityDescription,
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: FopxSpacing.sm),
          TextFormField(
            controller: _useOfFunds,
            minLines: 3,
            maxLines: 6,
            maxLength: 2000,
            decoration: InputDecoration(
              labelText: l10n.opportunityUseOfFunds,
              border: const OutlineInputBorder(),
            ),
            validator: (value) {
              final length = value?.trim().length ?? 0;
              if (length < 30) return l10n.projectMinimumCharacters(30);
              if (length > 2000) return l10n.validationMaxLength(2000);
              return null;
            },
          ),
          const SizedBox(height: FopxSpacing.sm),
          DropdownButtonFormField<OpportunityStageChoice>(
            initialValue: _stage,
            decoration: InputDecoration(
              labelText: l10n.opportunityProjectStage,
              border: const OutlineInputBorder(),
            ),
            items: stages
                .map(
                  (stage) => DropdownMenuItem(
                    value: stage,
                    child: Text(stage.label(language)),
                  ),
                )
                .toList(growable: false),
            onChanged:
                _saving ? null : (value) => setState(() => _stage = value),
            validator: (value) => value == null ? l10n.requiredField : null,
          ),
          if (_stage?.allowsCustomName == true) ...<Widget>[
            const SizedBox(height: FopxSpacing.sm),
            TextFormField(
              controller: _customStageName,
              maxLength: 120,
              decoration: InputDecoration(
                labelText: l10n.opportunityCustomStage,
                border: const OutlineInputBorder(),
              ),
              validator:
                  (value) =>
                      _stage?.allowsCustomName == true &&
                              (value == null || value.trim().isEmpty)
                          ? l10n.requiredField
                          : null,
            ),
          ],
          const SizedBox(height: FopxSpacing.sm),
          TextFormField(
            controller: _fundingTarget,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              labelText: l10n.opportunityFundingTarget,
              border: const OutlineInputBorder(),
            ),
            validator: (value) {
              final amount = double.tryParse(value?.trim() ?? '');
              if (amount == null || amount <= 0) return l10n.invalidAmount;
              return null;
            },
          ),
          const SizedBox(height: FopxSpacing.sm),
          DropdownButtonFormField<OpportunityCurrencyChoice>(
            initialValue: _currency,
            decoration: InputDecoration(
              labelText: l10n.opportunityFundingCurrency,
              border: const OutlineInputBorder(),
            ),
            items: widget.choices.currencies
                .map(
                  (currency) => DropdownMenuItem(
                    value: currency,
                    child: Text(
                      currency.label(language).isEmpty
                          ? currency.code
                          : '${currency.code} · ${currency.label(language)}',
                    ),
                  ),
                )
                .toList(growable: false),
            onChanged:
                _saving || !_canChangeFundingCurrency
                    ? null
                    : (value) => setState(() => _currency = value),
            validator: (value) => value == null ? l10n.requiredField : null,
          ),
          if (!_canChangeFundingCurrency) ...<Widget>[
            const SizedBox(height: FopxSpacing.xs),
            Text(
              l10n.opportunityFundingCurrencyImmutable,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
          if (widget.choices.fundingGoals.isNotEmpty) ...<Widget>[
            const SizedBox(height: FopxSpacing.sm),
            DropdownButtonFormField<OpportunityGoalChoice?>(
              initialValue: _goal,
              decoration: InputDecoration(
                labelText: l10n.opportunityFundingGoal,
                border: const OutlineInputBorder(),
              ),
              items: <DropdownMenuItem<OpportunityGoalChoice?>>[
                DropdownMenuItem<OpportunityGoalChoice?>(
                  value: null,
                  child: Text(l10n.none),
                ),
                for (final goal in widget.choices.fundingGoals)
                  DropdownMenuItem<OpportunityGoalChoice?>(
                    value: goal,
                    child: Text(goal.label(language)),
                  ),
              ],
              onChanged:
                  _saving
                      ? null
                      : (value) => setState(() {
                        _goal = value;
                        _fundingGoalChanged = true;
                      }),
            ),
          ],
          const SizedBox(height: FopxSpacing.lg),
          if (_saveError != null) ...<Widget>[
            const SizedBox(height: FopxSpacing.md),
            FopxInlineFeedback(
              kind: FopxFeedbackKind.error,
              message:
                  _saveError is ApiError
                      ? (_saveError as ApiError).message
                      : l10n.opportunitySaveFailed,
            ),
          ],
          FilledButton.icon(
            onPressed: _saving ? null : _save,
            icon:
                _saving
                    ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                    : const Icon(Icons.save_outlined),
            label: Text(_saving ? l10n.saving : l10n.save),
          ),
        ],
      ),
    );
  }
}
