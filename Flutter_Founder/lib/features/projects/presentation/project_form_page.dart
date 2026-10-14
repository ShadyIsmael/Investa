import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
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
import '../../../shared/files/founder_file_picker.dart';

class ProjectFormPage extends ConsumerWidget {
  const ProjectFormPage({super.key, this.projectId});

  final int? projectId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lookups = ref.watch(projectManagementLookupsProvider);
    final projectState =
        projectId == null
            ? null
            : ref.watch(projectOverviewProvider(projectId!));
    final project = projectState?.valueOrNull;
    if (lookups.isLoading ||
        (projectState?.isLoading == true && project == null)) {
      return CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: <Widget>[
          SliverPadding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              FopxSpacing.pageGutter,
              FopxSpacing.md,
              FopxSpacing.pageGutter,
              FopxSpacing.xl,
            ),
            sliver: const SliverToBoxAdapter(
              child: Column(
                children: <Widget>[
                  FopxLoadingState(height: 56),
                  SizedBox(height: FopxSpacing.xl),
                  FopxLoadingState(height: 180),
                  SizedBox(height: FopxSpacing.lg),
                  FopxLoadingState(height: 220),
                ],
              ),
            ),
          ),
        ],
      );
    }
    if (lookups.hasError ||
        (projectState?.hasError == true && project == null)) {
      final error = lookups.error ?? projectState?.error;
      return _ProjectFormLoadError(
        error: error,
        onRetry: () {
          ref.invalidate(projectManagementLookupsProvider);
          if (projectId != null) {
            ref.invalidate(projectOverviewProvider(projectId!));
          }
        },
      );
    }
    if (project?.status.toLowerCase() == 'archived') {
      return _ProjectFormLoadError(
        error: const ApiError(
          message: 'Archived projects cannot be edited.',
          statusCode: 409,
        ),
      );
    }

    return _ProjectFormBody(project: project, lookups: lookups.requireValue);
  }
}

class _ProjectFormBody extends ConsumerStatefulWidget {
  const _ProjectFormBody({required this.project, required this.lookups});

  final FounderProjectDetails? project;
  final ProjectManagementLookups lookups;

  @override
  ConsumerState<_ProjectFormBody> createState() => _ProjectFormBodyState();
}

class _ProjectFormBodyState extends ConsumerState<_ProjectFormBody> {

  final _formKey = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _fields;
  int? _categoryId;
  String? _stage;
  String? _riskLevel;
  DateTime? _foundedOn;
  Map<String, String> _serverErrors = <String, String>{};
  Object? _saveError;
  bool _saving = false;
  List<int>? _pendingLogoBytes;
  String? _pendingLogoFileName;
  String? _uploadedLogoUrlPending;
  int? _createdProjectIdPending;

  @override
  void initState() {
    super.initState();
    final project = widget.project;
    _fields = <String, TextEditingController>{
      'displayName': TextEditingController(text: project?.displayName ?? ''),
      'legalName': TextEditingController(text: project?.legalName ?? ''),
      'summary': TextEditingController(text: project?.summary ?? ''),
      'description': TextEditingController(text: project?.description ?? ''),
      'industry': TextEditingController(text: project?.industry ?? ''),
      'geography': TextEditingController(text: project?.geography ?? ''),
      'foundedOn': TextEditingController(
        text:
            project?.foundedOn == null
                ? ''
                : DateFormat('yyyy-MM-dd').format(project!.foundedOn!),
      ),
      'websiteUrl': TextEditingController(text: project?.websiteUrl ?? ''),
      'logoUrl': TextEditingController(text: project?.logoUrl ?? ''),
      'teamDescription': TextEditingController(
        text: project?.teamDescription ?? '',
      ),
      'businessModel': TextEditingController(
        text: project?.businessModel ?? '',
      ),
      'riskDisclosure': TextEditingController(
        text: project?.riskDisclosure ?? '',
      ),
    };
    _categoryId = project?.categoryId;
    _stage = project?.stage ?? _firstChoiceCode(widget.lookups.stages, 'Idea');
    _riskLevel = project?.riskLevel;
    _foundedOn = project?.foundedOn;
  }

  String? _firstChoiceCode(List<ProjectChoice> choices, String preferred) {
    for (final choice in choices) {
      if (choice.code.toLowerCase() == preferred.toLowerCase()) {
        return choice.code;
      }
    }
    return choices.isEmpty ? null : choices.first.code;
  }

  @override
  void dispose() {
    for (final controller in _fields.values) {
      controller.dispose();
    }
    super.dispose();
  }

  String? _serverError(String key) => _serverErrors[key.toLowerCase()];

  Future<void> _pickProjectLogo() async {
    PlatformFile? selected;
    try {
      selected = await pickFounderFile(
        allowedExtensions: const <String>['jpg', 'jpeg', 'png', 'webp'],
        maxFileSizeBytes: 10 * 1024 * 1024,
      );
    } on FounderFileSelectionException {
      if (!mounted) return;
      setState(() {
        _saveError = ApiError(message: context.l10n.projectLogoTooLarge);
      });
      return;
    } catch (_) {
      if (mounted) {
        setState(
          () =>
              _saveError = ApiError(
                message: context.l10n.projectLogoPickFailed,
              ),
        );
      }
      return;
    }
    if (selected == null || !mounted) return;

    final bytes = selected.bytes;
    final fileName = selected.name.trim();
    if (bytes == null || bytes.isEmpty || fileName.isEmpty) {
      setState(
        () =>
            _saveError = ApiError(message: context.l10n.projectLogoPickFailed),
      );
      return;
    }
    setState(() {
      _pendingLogoBytes = bytes;
      _pendingLogoFileName = fileName;
      _uploadedLogoUrlPending = null;
      _saveError = null;
    });
  }

  String? _requiredText(String? value, String key, {int? minimum}) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return context.l10n.requiredField;
    if (minimum != null && text.length < minimum) {
      return context.l10n.projectMinimumCharacters(minimum);
    }
    return _serverError(key);
  }

  String? _optionalText(String? _, String key) => _serverError(key);

  String? _webAddressError(String? value, String apiField) {
    final input = value?.trim() ?? '';
    if (input.isEmpty) return _serverError(apiField);
    final uri = Uri.tryParse(input);
    if (uri == null ||
        !uri.hasAuthority ||
        uri.host.isEmpty ||
        !const <String>{'http', 'https'}.contains(uri.scheme.toLowerCase())) {
      return context.l10n.projectInvalidUrl;
    }
    return _serverError(apiField);
  }

  Widget _textField(
    String key,
    String label, {
    bool required = false,
    int? minLength,
    int maxLength = 2000,
    int minLines = 1,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    VoidCallback? onTap,
    Widget? suffixIcon,
  }) {
    return TextFormField(
      controller: _fields[key],
      validator:
          validator ??
          (value) =>
              required
                  ? _requiredText(value, _apiFieldName(key), minimum: minLength)
                  : _optionalText(value, _apiFieldName(key)),
      maxLength: maxLength,
      minLines: minLines,
      maxLines: maxLines,
      keyboardType: keyboardType,
      readOnly: onTap != null,
      onTap: onTap,
      decoration: InputDecoration(labelText: label, suffixIcon: suffixIcon),
    );
  }

  String _apiFieldName(String key) => switch (key) {
    'displayName' => 'DisplayName',
    'legalName' => 'LegalName',
    'summary' => 'Summary',
    'description' => 'Description',
    'industry' => 'Industry',
    'geography' => 'Geography',
    'websiteUrl' => 'WebsiteUrl',
    'logoUrl' => 'LogoUrl',
    'teamDescription' => 'TeamDescription',
    'businessModel' => 'BusinessModel',
    'riskDisclosure' => 'RiskDisclosure',
    _ => key,
  };

  Future<void> _pickFoundedDate() async {
    final today = DateUtils.dateOnly(DateTime.now());
    final picked = await showDatePicker(
      context: context,
      initialDate: _foundedOn ?? today,
      firstDate: DateTime(1900),
      lastDate: today,
      helpText: context.l10n.projectFoundedDate,
    );
    if (picked != null && mounted) {
      setState(() {
        _foundedOn = DateUtils.dateOnly(picked);
        _fields['foundedOn']!.text = DateFormat(
          'yyyy-MM-dd',
        ).format(_foundedOn!);
      });
    }
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _serverErrors = <String, String>{};
      _saveError = null;
    });
    if (!_formKey.currentState!.validate()) return;
    if (_stage == null) {
      setState(
        () =>
            _serverErrors = <String, String>{
              'projectstage': context.l10n.projectStageRequired,
            },
      );
      return;
    }

    final project = widget.project;
    final request = _buildRequest();
    setState(() => _saving = true);
    try {
      final repository = ref.read(projectManagementRepositoryProvider);
      final id = project?.id ?? _createdProjectIdPending;
      final projectId = id ?? await repository.createProject(request);
      if (id == null && project == null) {
        // Keep the returned ID if a later governed logo upload fails so a
        // retry updates this project instead of creating a duplicate.
        _createdProjectIdPending = projectId;
      } else {
        await repository.updateProject(projectId, request);
      }

      if (_pendingLogoBytes != null) {
        final logoUrl =
            _uploadedLogoUrlPending ??
            await repository.uploadProjectLogo(
              projectId: projectId,
              fileBytes: _pendingLogoBytes!,
              fileName: _pendingLogoFileName!,
            );
        _uploadedLogoUrlPending = logoUrl;
        await repository.updateProject(
          projectId,
          _buildRequest(logoUrl: logoUrl),
        );
        _fields['logoUrl']!.text = logoUrl;
        _pendingLogoBytes = null;
        _pendingLogoFileName = null;
        _uploadedLogoUrlPending = null;
      }

      _createdProjectIdPending = null;
      ref.invalidate(projectsControllerProvider);
      ref.invalidate(projectOverviewProvider(projectId));
      if (!mounted) return;
      context.go('/projects/$projectId');
    } catch (error) {
      if (!mounted) return;
      if (error is ApiError) {
        setState(() {
          _saveError =
              _pendingLogoBytes != null
                  ? ApiError(
                    message:
                        '${context.l10n.projectLogoPartialFailure} ${error.message}',
                  )
                  : error;
          _serverErrors = <String, String>{
            for (final fieldError in error.errors)
              fieldError.field.toLowerCase(): fieldError.message,
          };
        });
        _formKey.currentState?.validate();
      } else {
        setState(
          () =>
              _saveError =
                  _pendingLogoBytes != null
                      ? ApiError(
                        message: context.l10n.projectLogoPartialFailure,
                      )
                      : error,
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  ProjectWriteRequest _buildRequest({String? logoUrl}) {
    final project = widget.project;
    return ProjectWriteRequest(
      displayName: _value('displayName'),
      legalName: _nullableValue('legalName'),
      summary: _value('summary'),
      description: _value('description'),
      categoryId: _categoryId,
      industry: _nullableValue('industry'),
      projectStage: _stage!,
      geography: _nullableValue('geography'),
      foundedOn:
          _foundedOn == null
              ? null
              : DateFormat('yyyy-MM-dd').format(_foundedOn!),
      websiteUrl: _nullableValue('websiteUrl'),
      logoUrl: logoUrl ?? _nullableValue('logoUrl'),
      teamDescription: _nullableValue('teamDescription'),
      businessModel: _nullableValue('businessModel'),
      riskLevel: _riskLevel,
      riskDisclosure: _nullableValue('riskDisclosure'),
      defaultCurrency: project?.defaultCurrency,
    );
  }

  String _value(String key) => _fields[key]!.text.trim();
  String? _nullableValue(String key) =>
      _value(key).isEmpty ? null : _value(key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context);
    final project = widget.project;
    final stages = widget.lookups.stages;
    final categories = widget.lookups.categories;
    final risks = widget.lookups.riskLevels;

    return CustomScrollView(
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
            child: Row(
              children: <Widget>[
                BackButton(onPressed: () => context.pop()),
                const SizedBox(width: FopxSpacing.sm),
                Expanded(
                  child: Text(
                    project == null ? l10n.projectCreate : l10n.projectEdit,
                    style: theme.textTheme.headlineSmall,
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsetsDirectional.fromSTEB(
            FopxSpacing.pageGutter,
            FopxSpacing.lg,
            FopxSpacing.pageGutter,
            FopxSpacing.xxl,
          ),
          sliver: SliverToBoxAdapter(
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    l10n.projectIdentitySection,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: FopxSpacing.lg),
                  _textField(
                    'displayName',
                    l10n.projectName,
                    required: true,
                    maxLength: 200,
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'legalName',
                    l10n.projectLegalName,
                    maxLength: 250,
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  DropdownButtonFormField<String>(
                    initialValue:
                        stages.any((choice) => choice.code == _stage)
                            ? _stage
                            : null,
                    decoration: InputDecoration(
                      labelText: l10n.stageLabel,
                      errorText: _serverError('ProjectStage'),
                    ),
                    items: <DropdownMenuItem<String>>[
                      for (final choice in stages)
                        DropdownMenuItem<String>(
                          value: choice.code,
                          child: Text(choice.labelFor(locale.languageCode)),
                        ),
                    ],
                    onChanged:
                        _saving
                            ? null
                            : (value) => setState(() => _stage = value),
                    validator:
                        (value) =>
                            value == null ? l10n.projectStageRequired : null,
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  DropdownButtonFormField<int?>(
                    initialValue:
                        categories.any((choice) => choice.id == _categoryId)
                            ? _categoryId
                            : null,
                    decoration: InputDecoration(
                      labelText: l10n.categoryLabel,
                      errorText: _serverError('CategoryId'),
                    ),
                    items: <DropdownMenuItem<int?>>[
                      DropdownMenuItem<int?>(
                        value: null,
                        child: Text(l10n.notSpecified),
                      ),
                      for (final choice in categories)
                        if (choice.id != null)
                          DropdownMenuItem<int?>(
                            value: choice.id,
                            child: Text(choice.labelFor(locale.languageCode)),
                          ),
                    ],
                    onChanged:
                        _saving
                            ? null
                            : (value) => setState(() => _categoryId = value),
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField('industry', l10n.industryLabel, maxLength: 150),
                  const SizedBox(height: FopxSpacing.xxl),
                  Text(
                    l10n.projectNarrativeSection,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: FopxSpacing.lg),
                  _textField(
                    'summary',
                    l10n.projectSummary,
                    required: true,
                    minLength: 20,
                    maxLength: 500,
                    minLines: 3,
                    maxLines: 5,
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'description',
                    l10n.projectDescription,
                    required: true,
                    minLength: 20,
                    maxLength: 4000,
                    minLines: 5,
                    maxLines: 9,
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'businessModel',
                    l10n.projectBusinessModel,
                    maxLength: 2000,
                    minLines: 3,
                    maxLines: 5,
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'teamDescription',
                    l10n.projectTeamDescription,
                    maxLength: 2000,
                    minLines: 3,
                    maxLines: 5,
                  ),
                  const SizedBox(height: FopxSpacing.xxl),
                  Text(
                    l10n.projectInformation,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: FopxSpacing.lg),
                  _textField('geography', l10n.location, maxLength: 200),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'foundedOn',
                    l10n.founded,
                    validator: (_) => _serverError('FoundedOn'),
                    onTap: _pickFoundedDate,
                    suffixIcon: IconButton(
                      tooltip: l10n.founded,
                      onPressed: _saving ? null : _pickFoundedDate,
                      icon: const Icon(Icons.calendar_today_outlined),
                    ),
                  ),
                  if (_foundedOn != null)
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: TextButton(
                        onPressed:
                            _saving
                                ? null
                                : () => setState(() {
                                  _foundedOn = null;
                                  _fields['foundedOn']!.clear();
                                }),
                        child: Text(
                          '${l10n.clearLabel} · ${DateFormat.yMMMd(locale.toLanguageTag()).format(_foundedOn!)}',
                        ),
                      ),
                    ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'websiteUrl',
                    l10n.website,
                    maxLength: 500,
                    keyboardType: TextInputType.url,
                    validator: (value) => _webAddressError(value, 'WebsiteUrl'),
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'logoUrl',
                    l10n.projectLogoUrl,
                    maxLength: 1000,
                    keyboardType: TextInputType.url,
                    validator: (value) => _webAddressError(value, 'LogoUrl'),
                  ),
                  const SizedBox(height: FopxSpacing.sm),
                  OutlinedButton.icon(
                    onPressed: _saving ? null : _pickProjectLogo,
                    icon: const Icon(Icons.add_photo_alternate_outlined),
                    label: Text(l10n.projectLogoChooseAction),
                  ),
                  if (_pendingLogoBytes != null) ...<Widget>[
                    const SizedBox(height: FopxSpacing.sm),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.memory(
                        Uint8List.fromList(_pendingLogoBytes!),
                        height: 160,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder:
                            (context, error, stackTrace) => const SizedBox(
                              height: 72,
                              child: Center(
                                child: Icon(Icons.broken_image_outlined),
                              ),
                            ),
                      ),
                    ),
                    const SizedBox(height: FopxSpacing.xs),
                    Text(
                      _pendingLogoFileName!,
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                  const SizedBox(height: FopxSpacing.xxl),
                  Text(
                    l10n.projectRiskSection,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: FopxSpacing.lg),
                  DropdownButtonFormField<String?>(
                    initialValue:
                        risks.any((choice) => choice.code == _riskLevel)
                            ? _riskLevel
                            : null,
                    decoration: InputDecoration(
                      labelText: l10n.projectRiskLevel,
                    ),
                    items: <DropdownMenuItem<String?>>[
                      DropdownMenuItem<String?>(
                        value: null,
                        child: Text(l10n.notSpecified),
                      ),
                      for (final choice in risks)
                        DropdownMenuItem<String?>(
                          value: choice.code,
                          child: Text(choice.labelFor(locale.languageCode)),
                        ),
                    ],
                    onChanged:
                        _saving
                            ? null
                            : (value) => setState(() => _riskLevel = value),
                  ),
                  const SizedBox(height: FopxSpacing.md),
                  _textField(
                    'riskDisclosure',
                    l10n.projectRiskDisclosure,
                    maxLength: 4000,
                    minLines: 3,
                    maxLines: 7,
                  ),
                  if (_saveError != null) ...<Widget>[
                    const SizedBox(height: FopxSpacing.lg),
                    _ProjectSaveError(error: _saveError),
                  ],
                  const SizedBox(height: FopxSpacing.xxl),
                  FopxButton(
                    label:
                        project == null && _createdProjectIdPending == null
                            ? l10n.projectCreate
                            : l10n.projectSaveChanges,
                    onPressed: _saving ? null : _save,
                    busy: _saving,
                    expanded: true,
                    icon: Icons.check_rounded,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ProjectFormLoadError extends StatelessWidget {
  const _ProjectFormLoadError({this.error, this.onRetry});

  final Object? error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final api = error is ApiError ? error as ApiError : null;
    final forbidden = api?.isForbidden == true;
    final missing = api?.statusCode == 404;
    return FopxErrorState(
      title:
          forbidden
              ? l10n.projectOverviewForbiddenTitle
              : missing
              ? l10n.projectOverviewNotFoundTitle
              : l10n.projectOverviewErrorTitle,
      body:
          forbidden
              ? l10n.projectOverviewForbiddenBody
              : missing
              ? l10n.projectOverviewNotFoundBody
              : l10n.projectOverviewErrorBody,
      actionLabel: onRetry == null || forbidden || missing ? null : l10n.retry,
      onAction: onRetry,
      kind:
          forbidden
              ? FopxErrorKind.forbidden
              : api?.statusCode == null
              ? FopxErrorKind.network
              : FopxErrorKind.generic,
    );
  }
}

class _ProjectSaveError extends StatelessWidget {
  const _ProjectSaveError({required this.error});

  final Object? error;

  @override
  Widget build(BuildContext context) {
    final apiError = error is ApiError ? error as ApiError : null;
    final forbidden = apiError?.isForbidden == true;
    return FopxInlineFeedback(
      kind: forbidden ? FopxFeedbackKind.warning : FopxFeedbackKind.error,
      message:
          forbidden
              ? '${context.l10n.projectOverviewForbiddenTitle}. ${context.l10n.projectOverviewForbiddenBody}'
              : '${context.l10n.projectSaveFailed}: ${apiError?.message ?? context.l10n.projectSaveFailedBody}',
    );
  }
}
