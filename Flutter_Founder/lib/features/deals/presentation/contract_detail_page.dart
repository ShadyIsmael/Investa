import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:file_picker/file_picker.dart';

import '../../../app/shell/secondary_scaffold.dart';
import '../data/contract_controller.dart';
import '../data/contract_detail.dart';
import 'contract_preview_page.dart';

class ContractDetailPage extends ConsumerWidget {
  const ContractDetailPage({required this.contractId, super.key});

  final int contractId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(founderContractProvider(contractId));
    return FopxSecondaryScaffold(
      title: context.l10n.contractDetails,
      subtitle: context.l10n.contractReadOnly,
      child: state.when(
        loading: () => const FopxLoadingState(height: 220),
        error:
            (_, _) => FopxErrorState(
              title: context.l10n.contractDetailLoadFailed,
              body: context.l10n.contractDetailLoadFailedBody,
              actionLabel: context.l10n.retry,
              kind: FopxErrorKind.network,
              onAction:
                  () => ref.invalidate(founderContractProvider(contractId)),
            ),
        data: (contract) => _ContractContent(contract: contract),
      ),
    );
  }
}

class _ContractContent extends ConsumerStatefulWidget {
  const _ContractContent({required this.contract});

  final FounderContractDetail contract;

  @override
  ConsumerState<_ContractContent> createState() => _ContractContentState();
}

class _ContractContentState extends ConsumerState<_ContractContent> {
  bool _busy = false;

  FounderContractDetail get contract => widget.contract;

  Future<void> _download(FounderContractVersion version) async {
    if (_busy || !version.pdfDownloadAvailable) return;
    setState(() => _busy = true);
    try {
      final bytes = await fetchContractPdfBytes(
        ref.read(apiClientProvider),
        contractId: contract.id,
        versionNumber: version.number,
      );
      if (!mounted) return;
      final safeNumber = contract.number.replaceAll(
        RegExp(r'[^A-Za-z0-9_-]'),
        '_',
      );
      final path = await FilePicker.platform.saveFile(
        dialogTitle: context.l10n.contractDownload,
        fileName:
            'FOPX-Contract-${safeNumber.isEmpty ? contract.id : safeNumber}-v${version.number}.pdf',
        type: FileType.custom,
        allowedExtensions: const <String>['pdf'],
        bytes: Uint8List.fromList(bytes),
      );
      if (!mounted || path == null) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(context.l10n.contractDownloaded)));
    } catch (error) {
      if (!mounted) return;
      final message =
          error is ApiError
              ? error.message
              : context.l10n.contractDownloadFailed;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _emailCurrentVersion() async {
    final version = contract.currentVersionNumber;
    if (_busy || version <= 0) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(context.l10n.contractEmail),
            content: Text(context.l10n.contractEmailConfirm),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(context.l10n.cancel),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(context.l10n.contractEmail),
              ),
            ],
          ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await emailContractVersion(
        ref.read(apiClientProvider),
        contractId: contract.id,
        versionNumber: version,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(context.l10n.contractEmailSent)));
    } catch (error) {
      if (!mounted) return;
      final message =
          error is ApiError ? error.message : context.l10n.contractEmailFailed;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final contract = widget.contract;
    final theme = Theme.of(context);
    final locale = Localizations.localeOf(context).toLanguageTag();
    return ListView(
      children: <Widget>[
        Card(
          child: Padding(
            padding: const EdgeInsets.all(FopxSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        contract.number.isEmpty
                            ? '${context.l10n.contractNumber} ${contract.id}'
                            : contract.number,
                        style: theme.textTheme.titleLarge,
                      ),
                    ),
                    if (contract.status.isNotEmpty)
                      FopxStatusBadge(label: contract.status),
                  ],
                ),
                const SizedBox(height: FopxSpacing.md),
                _DetailLine(
                  label: context.l10n.investor,
                  value: contract.investorName,
                ),
                if (contract.founderName.isNotEmpty)
                  _DetailLine(
                    label: context.l10n.founder,
                    value: contract.founderName,
                  ),
                if (contract.investmentModel.isNotEmpty)
                  _DetailLine(
                    label: context.l10n.investmentModel,
                    value: contract.investmentModel,
                  ),
                _DetailLine(
                  label: context.l10n.contractCurrentVersion,
                  value: contract.currentVersionNumber.toString(),
                ),
                if (contract.currentVersionStatus.isNotEmpty)
                  _DetailLine(
                    label: context.l10n.status,
                    value: contract.currentVersionStatus,
                  ),
                if (contract.currentVersionCreatedAt != null)
                  _DetailLine(
                    label: context.l10n.contractVersionCreated,
                    value: FopxFormatters.date(
                      contract.currentVersionCreatedAt!,
                      locale: locale,
                    ),
                  ),
                if (contract.currentVersionActivatedAt != null)
                  _DetailLine(
                    label: context.l10n.contractVersionActivated,
                    value: FopxFormatters.date(
                      contract.currentVersionActivatedAt!,
                      locale: locale,
                    ),
                  ),
                const SizedBox(height: FopxSpacing.sm),
                Row(
                  children: <Widget>[
                    Icon(
                      contract.htmlPreviewAvailable
                          ? Icons.description_outlined
                          : Icons.hourglass_empty_rounded,
                      size: 19,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: FopxSpacing.xs),
                    Expanded(
                      child: Text(
                        contract.htmlPreviewAvailable
                            ? context.l10n.contractPreviewAvailable
                            : context.l10n.contractPreviewUnavailable,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: FopxSpacing.sm),
                Wrap(
                  spacing: FopxSpacing.sm,
                  runSpacing: FopxSpacing.xs,
                  children: <Widget>[
                    OutlinedButton.icon(
                      onPressed:
                          _busy ||
                                  !contract.htmlPreviewAvailable ||
                                  contract.currentVersionNumber <= 0
                              ? null
                              : () => Navigator.of(context).push<void>(
                                MaterialPageRoute<void>(
                                  builder:
                                      (_) => ContractPreviewPage(
                                        contractId: contract.id,
                                        versionNumber:
                                            contract.currentVersionNumber,
                                      ),
                                ),
                              ),
                      icon: const Icon(Icons.preview_outlined),
                      label: Text(context.l10n.contractPreviewOpen),
                    ),
                    OutlinedButton.icon(
                      onPressed:
                          _busy || !contract.pdfAvailable
                              ? null
                              : () => _download(
                                contract.versionHistory.firstWhere(
                                  (version) =>
                                      version.number ==
                                      contract.currentVersionNumber,
                                  orElse:
                                      () => FounderContractVersion(
                                        number: contract.currentVersionNumber,
                                        type: contract.currentVersionType,
                                        status: contract.currentVersionStatus,
                                        createdAt:
                                            contract.currentVersionCreatedAt,
                                        activatedAt:
                                            contract.currentVersionActivatedAt,
                                        htmlPreviewAvailable:
                                            contract.htmlPreviewAvailable,
                                        pdfDownloadAvailable:
                                            contract.pdfAvailable,
                                        pdfStatus: contract.pdfStatus,
                                        documentHash: '',
                                        pdfHash: contract.pdfHash,
                                        pdfDocumentSize:
                                            contract.pdfDocumentSize,
                                      ),
                                ),
                              ),
                      icon: const Icon(Icons.download_outlined),
                      label: Text(context.l10n.contractDownload),
                    ),
                    OutlinedButton.icon(
                      onPressed: _busy ? null : _emailCurrentVersion,
                      icon: const Icon(Icons.email_outlined),
                      label: Text(context.l10n.contractEmail),
                    ),
                  ],
                ),
                if (contract.pdfHash.isNotEmpty)
                  _DetailLine(
                    label: context.l10n.contractDocumentHash,
                    value: contract.pdfHash,
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: FopxSpacing.lg),
        Text(
          context.l10n.contractVersionHistory,
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: FopxSpacing.sm),
        if (contract.versionHistory.isEmpty)
          Text(context.l10n.emptyBody)
        else
          for (final version in contract.versionHistory)
            Card(
              child: ListTile(
                leading: const Icon(Icons.history_rounded),
                title: Text(
                  '${context.l10n.contractVersion} ${version.number}',
                ),
                subtitle: Text(
                  <String>[
                    if (version.type.isNotEmpty)
                      '${context.l10n.contractVersionType}: ${version.type}',
                    if (version.status.isNotEmpty) version.status,
                    if (version.createdAt != null)
                      '${context.l10n.contractVersionCreated}: ${FopxFormatters.date(version.createdAt!, locale: locale)}',
                    if (version.activatedAt != null)
                      '${context.l10n.contractVersionActivated}: ${FopxFormatters.date(version.activatedAt!, locale: locale)}',
                  ].join('\n'),
                ),
                isThreeLine: true,
                trailing:
                    version.pdfDownloadAvailable
                        ? IconButton(
                          tooltip: context.l10n.contractDownload,
                          onPressed: _busy ? null : () => _download(version),
                          icon: const Icon(Icons.download_outlined),
                        )
                        : null,
              ),
            ),
      ],
    );
  }
}

class _DetailLine extends StatelessWidget {
  const _DetailLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    if (value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: FopxSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 132,
            child: Text(label, style: Theme.of(context).textTheme.bodySmall),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
