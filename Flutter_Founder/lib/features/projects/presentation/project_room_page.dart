import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../shared/files/founder_file_picker.dart';
import '../data/project_models.dart';
import '../data/project_overview_controller.dart';

class ProjectRoomPage extends ConsumerWidget {
  const ProjectRoomPage({required this.projectId, super.key});
  final int projectId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final provider = projectRoomProvider(projectId);
    final state = ref.watch(provider);
    final room = state.valueOrNull;
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
              child: Align(
                alignment: AlignmentDirectional.centerStart,
                child: BackButton(onPressed: context.pop),
              ),
            ),
          ),
          if (state.isLoading && room == null)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator.adaptive()),
            )
          else if (state.hasError ||
              (room != null &&
                  (!room.isFounder || room.projectId != projectId)))
            SliverFillRemaining(
              hasScrollBody: false,
              child: _RoomError(
                error:
                    state.error ??
                    const ApiError(
                      message: 'Project Room is unavailable.',
                      statusCode: 403,
                    ),
                onRetry: () => ref.invalidate(provider),
              ),
            )
          else if (room != null)
            SliverPadding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                FopxSpacing.pageGutter,
                FopxSpacing.lg,
                FopxSpacing.pageGutter,
                FopxSpacing.xxl,
              ),
              sliver: SliverToBoxAdapter(child: _RoomContent(room: room)),
            ),
        ],
      ),
    );
  }
}

class _RoomContent extends ConsumerWidget {
  const _RoomContent({required this.room});
  final FounderProjectRoom room;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final hasContent =
        room.updates.isNotEmpty ||
        room.milestones.isNotEmpty ||
        room.timeline.isNotEmpty ||
        room.documents.isNotEmpty ||
        room.opportunities.isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          l10n.projectRoom,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: FopxSpacing.xl),
        _RoomContext(label: l10n.projects, value: room.displayName),
        if (room.summary.trim().isNotEmpty) ...<Widget>[
          const SizedBox(height: FopxSpacing.md),
          Text(
            room.summary,
            style: theme.textTheme.bodyLarge?.copyWith(height: 1.45),
          ),
        ],
        if (room.isFounder) ...<Widget>[
          const SizedBox(height: FopxSpacing.lg),
          Wrap(
            spacing: FopxSpacing.sm,
            runSpacing: FopxSpacing.xs,
            children: <Widget>[
              OutlinedButton.icon(
                onPressed: () => _addEntry(context, ref, room, 'Update'),
                icon: const Icon(Icons.add_comment_outlined),
                label: Text(l10n.addRoomUpdate),
              ),
              OutlinedButton.icon(
                onPressed: () => _addEntry(context, ref, room, 'Milestone'),
                icon: const Icon(Icons.flag_outlined),
                label: Text(l10n.addRoomMilestone),
              ),
              OutlinedButton.icon(
                onPressed: () => _addDocument(context, ref, room),
                icon: const Icon(Icons.upload_file_outlined),
                label: Text(l10n.addRoomDocument),
              ),
            ],
          ),
        ],
        if (!hasContent) ...<Widget>[
          const _RoomDivider(),
          Text(
            l10n.noRoomContent,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.62),
            ),
          ),
        ],
        if (room.updates.isNotEmpty) ...<Widget>[
          const _RoomDivider(),
          _RoomSectionTitle(l10n.roomUpdates),
          const SizedBox(height: FopxSpacing.sm),
          for (final entry in room.updates) _RoomEntryView(entry: entry),
        ],
        if (room.milestones.isNotEmpty) ...<Widget>[
          const _RoomDivider(),
          _RoomSectionTitle(l10n.roomMilestones),
          const SizedBox(height: FopxSpacing.sm),
          for (final entry in room.milestones)
            _RoomEntryView(
              entry: entry,
              onComplete:
                  room.isFounder && entry.id > 0 && entry.completedAt == null
                      ? () => _completeMilestone(context, ref, room, entry)
                      : null,
            ),
        ],
        if (room.timeline.isNotEmpty) ...<Widget>[
          const _RoomDivider(),
          _RoomSectionTitle(l10n.roomTimeline),
          const SizedBox(height: FopxSpacing.sm),
          for (final entry in room.timeline) _RoomEntryView(entry: entry),
        ],
        if (room.documents.isNotEmpty) ...<Widget>[
          const _RoomDivider(),
          _RoomSectionTitle(l10n.roomDocuments),
          const SizedBox(height: FopxSpacing.sm),
          for (final document in room.documents)
            _RoomDocumentView(projectId: room.projectId, document: document),
        ],
        if (room.opportunities.isNotEmpty) ...<Widget>[
          const _RoomDivider(),
          _RoomSectionTitle(l10n.opportunities),
          const SizedBox(height: FopxSpacing.sm),
          for (final opportunity in room.opportunities)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: FopxSpacing.sm),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      opportunity.title,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (opportunity.hasAccess)
                    Icon(
                      Icons.check_circle_outline_rounded,
                      color: theme.colorScheme.tertiary,
                      size: 18,
                    ),
                ],
              ),
            ),
        ],
      ],
    );
  }
}

Future<void> _addDocument(
  BuildContext context,
  WidgetRef ref,
  FounderProjectRoom room,
) async {
  final upload = await showDialog<_RoomDocumentUpload>(
    context: context,
    builder:
        (_) =>
            _RoomDocumentComposer(categories: room.availableDocumentCategories),
  );
  if (upload == null || !context.mounted) return;
  try {
    await ref
        .read(projectOverviewRepositoryProvider)
        .addProjectRoomDocument(
          projectId: room.projectId,
          fileBytes: upload.bytes,
          fileName: upload.fileName,
          categoryCode: upload.categoryCode,
          documentType: upload.purpose,
          visibility: upload.visibility,
        );
    if (!context.mounted) return;
    ref.invalidate(projectRoomProvider(room.projectId));
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.roomDocumentUploaded)));
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(context.l10n.roomDocumentUploadFailed)),
    );
  }
}

class _RoomDocumentUpload {
  const _RoomDocumentUpload({
    required this.bytes,
    required this.fileName,
    required this.categoryCode,
    required this.purpose,
    required this.visibility,
  });
  final List<int> bytes;
  final String fileName;
  final String categoryCode;
  final String purpose;
  final String visibility;
}

class _RoomDocumentComposer extends StatefulWidget {
  const _RoomDocumentComposer({required this.categories});
  final List<ProjectRoomDocumentCategory> categories;

  @override
  State<_RoomDocumentComposer> createState() => _RoomDocumentComposerState();
}

class _RoomDocumentComposerState extends State<_RoomDocumentComposer> {
  final _formKey = GlobalKey<FormState>();
  final _purpose = TextEditingController();
  PlatformFile? _file;
  String? _categoryCode;
  String _visibility = 'ProjectMembers';

  ProjectRoomDocumentCategory? get _selectedCategory {
    final code =
        _categoryCode ??
        (widget.categories.isEmpty ? null : widget.categories.first.code);
    for (final category in widget.categories) {
      if (category.code == code) return category;
    }
    return null;
  }

  @override
  void dispose() {
    _purpose.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AlertDialog(
      title: Text(l10n.addRoomDocument),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory?.code,
                decoration: InputDecoration(
                  labelText: l10n.roomDocumentCategory,
                ),
                items: widget.categories
                    .map((category) {
                      final isArabic =
                          Localizations.localeOf(context).languageCode == 'ar';
                      return DropdownMenuItem<String>(
                        value: category.code,
                        child: Text(
                          isArabic ? category.nameAr : category.nameEn,
                        ),
                      );
                    })
                    .toList(growable: false),
                onChanged:
                    (value) => setState(() {
                      _categoryCode = value;
                      _file = null;
                    }),
              ),
              TextFormField(
                controller: _purpose,
                maxLength: 100,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  labelText: l10n.roomDocumentPurpose,
                ),
                validator:
                    (value) =>
                        value == null || value.trim().isEmpty
                            ? l10n.roomDocumentPurpose
                            : null,
              ),
              DropdownButtonFormField<String>(
                initialValue: _visibility,
                decoration: InputDecoration(
                  labelText: l10n.roomDocumentVisibility,
                ),
                items: <DropdownMenuItem<String>>[
                  DropdownMenuItem(
                    value: 'ProjectMembers',
                    child: Text(l10n.roomDocumentMembers),
                  ),
                  DropdownMenuItem(
                    value: 'FounderOnly',
                    child: Text(l10n.roomDocumentFounderOnly),
                  ),
                ],
                onChanged:
                    (value) =>
                        setState(() => _visibility = value ?? 'ProjectMembers'),
              ),
              const SizedBox(height: FopxSpacing.sm),
              OutlinedButton.icon(
                onPressed: _selectedCategory == null ? null : _pickFile,
                icon: const Icon(Icons.attach_file),
                label: Text(_file?.name ?? l10n.addRoomDocument),
              ),
            ],
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(l10n.cancel),
        ),
        FilledButton(
          onPressed:
              _selectedCategory == null ||
                      _file?.bytes == null ||
                      _purpose.text.trim().isEmpty
                  ? null
                  : () {
                    if (!_formKey.currentState!.validate() ||
                        _file?.bytes == null) {
                      return;
                    }
                    Navigator.pop(
                      context,
                      _RoomDocumentUpload(
                        bytes: _file!.bytes!,
                        fileName: _file!.name,
                        categoryCode: _selectedCategory!.code,
                        purpose: _purpose.text.trim(),
                        visibility: _visibility,
                      ),
                    );
                  },
          child: Text(l10n.roomDocumentUpload),
        ),
      ],
    );
  }

  Future<void> _pickFile() async {
    final category = _selectedCategory;
    if (category == null) return;
    try {
      final file = await pickFounderFile(
        allowedExtensions: category.allowedExtensions.split(','),
        maxFileSizeBytes: category.maxFileSizeBytes,
      );
      if (file == null || !mounted) return;
      setState(() => _file = file);
    } on FounderFileSelectionException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.roomDocumentSizeInvalid)),
      );
    }
  }
}

class _RoomDocumentView extends ConsumerWidget {
  const _RoomDocumentView({required this.projectId, required this.document});
  final int projectId;
  final ProjectRoomDocument document;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final canPreview =
        document.canDownload &&
        (document.mimeType.startsWith('image/') ||
            document.mimeType == 'text/plain' ||
            document.mimeType == 'text/csv');
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: FopxSpacing.sm),
      child: Row(
        children: <Widget>[
          Icon(
            Icons.insert_drive_file_outlined,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(width: FopxSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  document.fileName,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  '${document.documentType} · ${NumberFormat.decimalPattern(Localizations.localeOf(context).toLanguageTag()).format(document.fileSize)} B',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.58),
                  ),
                ),
                Text(
                  document.visibility == 'FounderOnly'
                      ? l10n.roomDocumentFounderOnly
                      : l10n.roomDocumentMembers,
                  style: theme.textTheme.labelSmall,
                ),
              ],
            ),
          ),
          if (canPreview)
            IconButton(
              tooltip: l10n.roomDocumentPreview,
              onPressed: () => _preview(context, ref),
              icon: const Icon(Icons.visibility_outlined),
            ),
          if (document.canDownload)
            IconButton(
              tooltip: l10n.roomDocumentDownload,
              onPressed: () => _download(context, ref),
              icon: const Icon(Icons.download_outlined),
            ),
        ],
      ),
    );
  }

  Future<void> _preview(BuildContext context, WidgetRef ref) async {
    final isImage = document.mimeType.startsWith('image/');
    final isText =
        document.mimeType == 'text/plain' || document.mimeType == 'text/csv';
    if (!isImage && !isText) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.roomDocumentPreviewUnsupported)),
      );
      return;
    }
    try {
      final bytes = await ref
          .read(projectOverviewRepositoryProvider)
          .fetchProjectRoomDocumentBytes(projectId, document.id, preview: true);
      if (!context.mounted) return;
      await showDialog<void>(
        context: context,
        builder:
            (dialogContext) => Dialog(
              child: Padding(
                padding: const EdgeInsets.all(FopxSpacing.md),
                child:
                    isImage
                        ? InteractiveViewer(
                          child: Image.memory(
                            Uint8List.fromList(bytes),
                            fit: BoxFit.contain,
                          ),
                        )
                        : SingleChildScrollView(
                          child: SelectableText(
                            utf8.decode(bytes, allowMalformed: true),
                          ),
                        ),
              ),
            ),
      );
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.roomDocumentDownloadFailed)),
      );
    }
  }

  Future<void> _download(BuildContext context, WidgetRef ref) async {
    try {
      final downloadLabel = context.l10n.roomDocumentDownload;
      final downloadedMessage = context.l10n.roomDocumentDownloaded;
      final bytes = await ref
          .read(projectOverviewRepositoryProvider)
          .fetchProjectRoomDocumentBytes(
            projectId,
            document.id,
            preview: false,
          );
      final savedPath = await FilePicker.platform.saveFile(
        dialogTitle: downloadLabel,
        fileName: document.fileName,
        bytes: Uint8List.fromList(bytes),
      );
      if (!context.mounted || savedPath == null) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(downloadedMessage)));
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.roomDocumentDownloadFailed)),
      );
    }
  }
}

Future<void> _addEntry(
  BuildContext context,
  WidgetRef ref,
  FounderProjectRoom room,
  String type,
) async {
  final request = await showDialog<Map<String, dynamic>>(
    context: context,
    builder: (_) => _RoomEntryComposer(entryType: type),
  );
  if (request == null || !context.mounted) return;
  try {
    await ref
        .read(projectOverviewRepositoryProvider)
        .addProjectRoomEntry(room.projectId, request);
    if (!context.mounted) return;
    ref.invalidate(projectRoomProvider(room.projectId));
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.roomEntrySaved)));
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.roomEntrySaveFailed)));
  }
}

Future<void> _completeMilestone(
  BuildContext context,
  WidgetRef ref,
  FounderProjectRoom room,
  ProjectRoomEntry entry,
) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder:
        (dialogContext) => AlertDialog(
          title: Text(context.l10n.markMilestoneComplete),
          content: Text(context.l10n.milestoneCompleteConfirm),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: Text(context.l10n.cancel),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: Text(context.l10n.markMilestoneComplete),
            ),
          ],
        ),
  );
  if (confirmed != true || !context.mounted) return;
  try {
    await ref
        .read(projectOverviewRepositoryProvider)
        .completeProjectRoomMilestone(room.projectId, entry.id);
    if (!context.mounted) return;
    ref.invalidate(projectRoomProvider(room.projectId));
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.milestoneCompleted)));
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.milestoneUpdateFailed)));
  }
}

class _RoomEntryComposer extends StatefulWidget {
  const _RoomEntryComposer({required this.entryType});

  final String entryType;

  @override
  State<_RoomEntryComposer> createState() => _RoomEntryComposerState();
}

class _RoomEntryComposerState extends State<_RoomEntryComposer> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  DateTime? _dueAt;
  bool _investorVisible = true;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMilestone = widget.entryType == 'Milestone';
    final locale = Localizations.localeOf(context).toLanguageTag();
    return AlertDialog(
      title: Text(isMilestone ? l10n.addRoomMilestone : l10n.addRoomUpdate),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              TextFormField(
                controller: _title,
                maxLength: 200,
                decoration: InputDecoration(labelText: l10n.roomEntryTitle),
                validator:
                    (value) =>
                        value == null || value.trim().isEmpty
                            ? l10n.roomEntryTitle
                            : null,
              ),
              TextFormField(
                controller: _description,
                maxLength: 4000,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: l10n.roomEntryDescription,
                  alignLabelWithHint: true,
                ),
              ),
              if (isMilestone)
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: TextButton.icon(
                    onPressed: _pickDueDate,
                    icon: const Icon(Icons.calendar_month_outlined),
                    label: Text(
                      _dueAt == null
                          ? l10n.roomDueDate
                          : '${l10n.roomDueDate}: ${DateFormat.yMMMd(locale).format(_dueAt!)}',
                    ),
                  ),
                ),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: _investorVisible,
                onChanged:
                    (value) =>
                        setState(() => _investorVisible = value ?? false),
                title: Text(l10n.investorVisible),
                controlAffinity: ListTileControlAffinity.leading,
              ),
            ],
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(l10n.cancel),
        ),
        FilledButton(
          onPressed: () {
            if (!_formKey.currentState!.validate()) return;
            Navigator.pop(context, <String, dynamic>{
              'entryType': widget.entryType,
              'title': _title.text.trim(),
              'description':
                  _description.text.trim().isEmpty
                      ? null
                      : _description.text.trim(),
              'dueAt': _dueAt?.toUtc().toIso8601String(),
              'isInvestorVisible': _investorVisible,
            });
          },
          child: Text(l10n.save),
        ),
      ],
    );
  }

  Future<void> _pickDueDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueAt ?? now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 15),
    );
    if (picked != null && mounted) setState(() => _dueAt = picked);
  }
}

class _RoomContext extends StatelessWidget {
  const _RoomContext({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Column(
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
      Text(
        value,
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
      ),
    ],
  );
}

class _RoomEntryView extends StatelessWidget {
  const _RoomEntryView({required this.entry, this.onComplete});
  final ProjectRoomEntry entry;
  final VoidCallback? onComplete;
  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: FopxSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            entry.entryType == 'Activity'
                ? _projectEventTitle(context, entry.eventType)
                : entry.title,
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          if (entry.description?.isNotEmpty == true) ...<Widget>[
            const SizedBox(height: FopxSpacing.xs),
            Text(
              entry.description!,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(height: 1.4),
            ),
          ],
          if (entry.createdAt != null) ...<Widget>[
            const SizedBox(height: FopxSpacing.xs),
            Text(
              DateFormat.yMMMd(
                locale.toLanguageTag(),
              ).format(entry.createdAt!.toLocal()),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(
                  context,
                ).colorScheme.onSurface.withValues(alpha: 0.58),
              ),
            ),
          ],
          if (entry.dueAt != null) ...<Widget>[
            const SizedBox(height: FopxSpacing.xs),
            Text(
              '${context.l10n.roomDueDate}: ${DateFormat.yMMMd(locale.toLanguageTag()).format(entry.dueAt!.toLocal())}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
          if (entry.completedAt != null)
            Padding(
              padding: const EdgeInsets.only(top: FopxSpacing.xs),
              child: Text(context.l10n.statusCompleted),
            )
          else if (onComplete != null)
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: TextButton.icon(
                onPressed: onComplete,
                icon: const Icon(Icons.check_circle_outline_rounded),
                label: Text(context.l10n.markMilestoneComplete),
              ),
            ),
        ],
      ),
    );
  }
}

String _projectEventTitle(BuildContext context, String? type) => switch (type) {
  'OpportunityCreated' => context.l10n.projectEventOpportunityCreated,
  'MilestoneCreated' => context.l10n.projectEventMilestoneCreated,
  'MilestoneCompleted' => context.l10n.projectEventMilestoneCompleted,
  'MilestoneDelayed' => context.l10n.projectEventMilestoneDelayed,
  'MilestoneUpdated' => context.l10n.projectEventMilestoneUpdated,
  'InvestorDocumentPublished' => context.l10n.projectEventDocumentPublished,
  'ContractActivated' => context.l10n.projectEventContractActivated,
  'ParticipationApproved' => context.l10n.projectEventParticipationApproved,
  'FundingProgressReached' => context.l10n.projectEventFundingProgress,
  'ProjectStatusChanged' => context.l10n.projectEventProjectStatus,
  'FundingCompleted' => context.l10n.projectEventFundingCompleted,
  _ => context.l10n.roomTimeline,
};

class _RoomSectionTitle extends StatelessWidget {
  const _RoomSectionTitle(this.title);
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

class _RoomDivider extends StatelessWidget {
  const _RoomDivider();
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xl),
    child: Divider(
      height: 1,
      color: Theme.of(context).colorScheme.outlineVariant,
    ),
  );
}

class _RoomError extends StatelessWidget {
  const _RoomError({required this.error, required this.onRetry});
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
              ? l10n.roomUnavailable
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
