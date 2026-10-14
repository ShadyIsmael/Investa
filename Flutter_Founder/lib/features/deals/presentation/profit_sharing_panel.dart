import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../../shared/files/founder_file_picker.dart';
import '../data/profit_sharing.dart';
import '../data/profit_sharing_controller.dart';

class FounderProfitSharingPanel extends ConsumerWidget {
  const FounderProfitSharingPanel({
    required this.opportunityId,
    required this.participationId,
    super.key,
  });

  final int opportunityId;
  final int participationId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final args = (
      opportunityId: opportunityId,
      participationId: participationId,
    );
    final state = ref.watch(founderProfitSharingProvider(args));
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.md),
        child: state.when(
          loading: () => const FopxLoadingState(height: 100),
          error:
              (_, _) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    context.l10n.profitSharingTitle,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(context.l10n.fundingLoadFailed),
                  TextButton(
                    onPressed:
                        () => ref.invalidate(founderProfitSharingProvider(args)),
                    child: Text(context.l10n.retry),
                  ),
                ],
              ),
          data: (summary) {
            if (summary.obligations.isEmpty) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    context.l10n.profitSharingTitle,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: FopxSpacing.xs),
                  Text(context.l10n.profitSharingNoObligations),
                ],
              );
            }
            final locale = Localizations.localeOf(context).toLanguageTag();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  context.l10n.profitSharingTitle,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: FopxSpacing.sm),
                for (final obligation in summary.obligations) ...<Widget>[
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingRate,
                    value: '${_number(obligation.profitSharePercentage, locale)}%',
                  ),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingReporting,
                    value: obligation.reportingFrequency,
                  ),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingBasis,
                    value: obligation.calculationBasis,
                  ),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingStatus,
                    value: obligation.status,
                  ),
                  if (obligation.settledAt != null)
                    _ProfitSharingLine(
                      label: context.l10n.profitSharingSettledAt,
                      value: _date(obligation.settledAt),
                    ),
                  if (obligation.closedAt != null)
                    _ProfitSharingLine(
                      label: context.l10n.profitSharingClosedAt,
                      value: _date(obligation.closedAt),
                    ),
                  if (obligation.closureReason?.isNotEmpty == true)
                    Text(obligation.closureReason!),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingEntitlement,
                    value: _money(obligation.totalEntitlement, obligation.currency, locale),
                  ),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingConfirmed,
                    value: _money(obligation.totalConfirmedDistributed, obligation.currency, locale),
                  ),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingPending,
                    value: _money(obligation.totalPendingConfirmation, obligation.currency, locale),
                  ),
                  _ProfitSharingLine(
                    label: context.l10n.profitSharingOutstanding,
                    value: _money(obligation.totalDistributionOutstanding, obligation.currency, locale),
                  ),
                  const SizedBox(height: FopxSpacing.sm),
                  for (final period in obligation.reportingPeriods)
                    _ProfitSharingPeriodCard(
                      opportunityId: opportunityId,
                      participationId: participationId,
                      obligation: obligation,
                      period: period,
                      locale: locale,
                    ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ProfitSharingPeriodCard extends ConsumerWidget {
  const _ProfitSharingPeriodCard({
    required this.opportunityId,
    required this.participationId,
    required this.obligation,
    required this.period,
    required this.locale,
  });

  final int opportunityId;
  final int participationId;
  final FounderProfitSharingObligation obligation;
  final FounderProfitSharingPeriod period;
  final String locale;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final args = (opportunityId: opportunityId, participationId: participationId);
    final active = const <String>{'active', 'matured'}
        .contains(obligation.status.toLowerCase());
    final range = l10n.profitSharingPeriodRange
        .replaceAll('{start}', _date(period.startDate))
        .replaceAll('{end}', _date(period.endDate));
    return Card(
      margin: const EdgeInsets.only(bottom: FopxSpacing.xs),
      child: ExpansionTile(
        title: Text(l10n.profitSharingPeriod.replaceAll(
          '{number}',
          period.periodNumber.toString(),
        )),
        subtitle: Text('$range · ${period.status}'),
        childrenPadding: const EdgeInsetsDirectional.fromSTEB(
          FopxSpacing.md, 0, FopxSpacing.md, FopxSpacing.md,
        ),
        children: <Widget>[
          if (period.declaration != null) ...<Widget>[
            _ProfitSharingLine(
              label: l10n.profitSharingResultHistory,
              value: period.declaration!.status,
            ),
            _ProfitSharingLine(
              label: l10n.profitSharingDeclaredBasis,
              value: _money(period.declaration!.declaredBasisAmount, obligation.currency, locale),
            ),
            _ProfitSharingLine(
              label: l10n.profitSharingDeclaredResult,
              value: _money(period.declaration!.declaredResultAmount, obligation.currency, locale),
            ),
            if ((period.investorEntitlement ?? 0) > 0)
              _ProfitSharingLine(
                label: l10n.profitSharingEntitlement,
                value: _money(period.investorEntitlement!, obligation.currency, locale),
              ),
            if (period.declaration!.calculationError?.isNotEmpty == true)
              Text(l10n.profitSharingCalculationError.replaceAll(
                '{message}', period.declaration!.calculationError!,
              )),
            if (period.declaration!.evidenceAvailable)
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: TextButton.icon(
                  onPressed: () => _downloadEvidence(
                    context, ref, period.declaration!.id,
                    period.declaration!.evidenceFileName, distribution: false,
                  ),
                  icon: const Icon(Icons.download_outlined),
                  label: Text(l10n.profitSharingDownloadEvidence),
                ),
              ),
          ],
          if (period.distributionDeclarations.isNotEmpty) ...<Widget>[
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: Padding(
                padding: const EdgeInsets.only(top: FopxSpacing.xs),
                child: Text(l10n.profitSharingDistribution,
                    style: Theme.of(context).textTheme.titleSmall),
              ),
            ),
            for (final distribution in period.distributionDeclarations) ...<Widget>[
              _ProfitSharingLine(
                label: l10n.fundingAmount,
                value: _money(distribution.declaredAmount, distribution.currency, locale),
              ),
              _ProfitSharingLine(
                label: l10n.profitSharingInvestorDecision.replaceAll(
                  '{status}', distribution.status,
                ),
                value: _date(distribution.declaredAt),
              ),
              if (distribution.confirmationComment?.isNotEmpty == true)
                Text('${l10n.fundingConfirmationNote}: ${distribution.confirmationComment}'),
              if (distribution.disputeReason?.isNotEmpty == true)
                Text('${l10n.fundingDisputeReason}: ${distribution.disputeReason}'),
              if (distribution.evidenceAvailable)
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: TextButton.icon(
                    onPressed: () => _downloadEvidence(
                      context, ref, distribution.id,
                      distribution.evidenceFileName, distribution: true,
                    ),
                    icon: const Icon(Icons.download_outlined),
                    label: Text(l10n.profitSharingDownloadEvidence),
                  ),
                ),
              const Divider(height: FopxSpacing.md),
            ],
          ],
          if (active && (!period.hasDeclaration || (period.distributionOutstanding ?? 0) > 0))
            Wrap(
              spacing: FopxSpacing.sm,
              runSpacing: FopxSpacing.xs,
              children: <Widget>[
                if (!period.hasDeclaration)
                  OutlinedButton.icon(
                    onPressed: () => _declare(context, ref, args, distribution: false),
                    icon: const Icon(Icons.assignment_outlined),
                    label: Text(l10n.profitSharingDeclareResult),
                  ),
                if ((period.distributionOutstanding ?? 0) > 0)
                  FilledButton.icon(
                    onPressed: () => _declare(context, ref, args, distribution: true),
                    icon: const Icon(Icons.payments_outlined),
                    label: Text(l10n.profitSharingDeclareDistribution),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  Future<void> _declare(BuildContext context, WidgetRef ref,
      ({int opportunityId, int participationId}) args, {required bool distribution}) async {
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => _ProfitSharingDeclarationDialog(
        opportunityId: opportunityId,
        obligationId: obligation.id,
        periodId: period.id,
        currency: obligation.currency,
        distribution: distribution,
        outstanding: period.distributionOutstanding,
      ),
    );
    if (saved == true) ref.invalidate(founderProfitSharingProvider(args));
  }

  Future<void> _downloadEvidence(BuildContext context, WidgetRef ref,
      int declarationId, String? evidenceName, {required bool distribution}) async {
    final dialogTitle = context.l10n.profitSharingDownloadEvidence;
    try {
      final repository = ref.read(founderProfitSharingRepositoryProvider);
      final bytes = distribution
          ? await repository.downloadDistributionEvidence(declarationId)
          : await repository.downloadResultEvidence(declarationId);
      await FilePicker.platform.saveFile(
        dialogTitle: dialogTitle,
        fileName: evidenceName ?? 'profit-sharing-evidence-$declarationId',
        bytes: Uint8List.fromList(bytes),
      );
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(context.l10n.profitSharingDeclarationFailed),
        ));
      }
    }
  }
}

class _ProfitSharingLine extends StatelessWidget {
  const _ProfitSharingLine({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: FopxSpacing.xs),
    child: Row(
      children: <Widget>[
        Expanded(child: Text(label)),
        const SizedBox(width: FopxSpacing.sm),
        Flexible(
          child: Text(value, textAlign: TextAlign.end),
        ),
      ],
    ),
  );
}

class _ProfitSharingDeclarationDialog extends ConsumerStatefulWidget {
  const _ProfitSharingDeclarationDialog({
    required this.opportunityId,
    required this.obligationId,
    required this.periodId,
    required this.currency,
    required this.distribution,
    required this.outstanding,
  });

  final int opportunityId;
  final int obligationId;
  final int periodId;
  final String currency;
  final bool distribution;
  final double? outstanding;

  @override
  ConsumerState<_ProfitSharingDeclarationDialog> createState() =>
      _ProfitSharingDeclarationDialogState();
}

class _ProfitSharingDeclarationDialogState
    extends ConsumerState<_ProfitSharingDeclarationDialog> {
  final _formKey = GlobalKey<FormState>();
  final _amount = TextEditingController();
  final _basis = TextEditingController();
  final _result = TextEditingController();
  final _reference = TextEditingController();
  final _notes = TextEditingController();
  DateTime _date = DateTime.now();
  PlatformFile? _evidence;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _amount.dispose();
    _basis.dispose();
    _result.dispose();
    _reference.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AlertDialog(
      title: Text(widget.distribution
          ? l10n.profitSharingDeclareDistribution
          : l10n.profitSharingDeclareResult),
      content: SizedBox(
        width: 440,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                if (widget.distribution)
                  ...<Widget>[
                    if (widget.outstanding != null)
                      Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: Text(
                          '${l10n.profitSharingOutstanding}: ${_money(widget.outstanding!, widget.currency, Localizations.localeOf(context).toLanguageTag())}',
                        ),
                      ),
                    _decimalField(
                      _amount,
                      l10n.fundingAmount,
                      mustBePositive: true,
                    ),
                  ]
                else ...<Widget>[
                  _decimalField(_basis, l10n.profitSharingDeclaredBasis),
                  _decimalField(_result, l10n.profitSharingDeclaredResult),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(_date.toIso8601String().split('T').first),
                    subtitle: Text(l10n.fundingReceivedDate),
                    trailing: const Icon(Icons.calendar_month_outlined),
                    onTap: _saving ? null : _pickDate,
                  ),
                ],
                TextFormField(
                  controller: _reference,
                  decoration: InputDecoration(labelText: l10n.fundingExternalReference),
                ),
                TextFormField(
                  controller: _notes,
                  maxLines: 3,
                  decoration: InputDecoration(labelText: l10n.profitSharingNotes),
                ),
                const SizedBox(height: FopxSpacing.xs),
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: OutlinedButton.icon(
                    onPressed: _saving ? null : _pickEvidence,
                    icon: const Icon(Icons.attach_file),
                    label: Text(_evidence?.name ?? l10n.fundingEvidence),
                  ),
                ),
                if (_error != null)
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Text(
                      _error!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: _saving ? null : () => Navigator.of(context).pop(false),
          child: Text(l10n.cancel),
        ),
        FilledButton(
          onPressed: _saving ? null : _submit,
          child: _saving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(l10n.save),
        ),
      ],
    );
  }

  Widget _decimalField(
    TextEditingController controller,
    String label, {
    bool mustBePositive = false,
  }) => TextFormField(
        controller: controller,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(labelText: label),
        validator: (value) {
          final parsed = double.tryParse(value?.trim() ?? '');
          if (parsed == null || (mustBePositive && parsed <= 0)) {
            return context.l10n.requiredField;
          }
          return null;
        },
      );

  Future<void> _pickDate() async {
    final today = DateUtils.dateOnly(DateTime.now());
    final picked = await showDatePicker(
      context: context,
      initialDate: DateUtils.dateOnly(_date),
      firstDate: DateTime(2000),
      lastDate: today,
    );
    if (picked != null && mounted) setState(() => _date = picked);
  }

  Future<void> _pickEvidence() async {
    try {
      final picked = await pickFounderFile(
        allowedExtensions: const <String>['pdf', 'jpg', 'jpeg', 'png', 'webp'],
        maxFileSizeBytes: 25 * 1024 * 1024,
      );
      if (mounted && picked != null) setState(() => _evidence = picked);
    } catch (_) {
      if (mounted) {
        setState(() => _error = context.l10n.profitSharingDeclarationFailed);
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _saving = true; _error = null; });
    try {
      final repository = ref.read(founderProfitSharingRepositoryProvider);
      final bytes = _evidence?.bytes;
      if (widget.distribution) {
        await repository.declareDistribution(
          opportunityId: widget.opportunityId,
          obligationId: widget.obligationId,
          periodId: widget.periodId,
          amount: double.parse(_amount.text.trim()),
          currency: widget.currency,
          externalReference: _reference.text,
          notes: _notes.text,
          evidenceBytes: bytes,
          evidenceFileName: _evidence?.name,
          evidenceContentType: _mimeFor(_evidence?.name),
        );
      } else {
        await repository.declareResult(
          opportunityId: widget.opportunityId,
          obligationId: widget.obligationId,
          periodId: widget.periodId,
          declaredBasisAmount: double.parse(_basis.text.trim()),
          declaredResultAmount: double.parse(_result.text.trim()),
          currency: widget.currency,
          declarationDate: _date,
          externalReference: _reference.text,
          notes: _notes.text,
          evidenceBytes: bytes,
          evidenceFileName: _evidence?.name,
          evidenceContentType: _mimeFor(_evidence?.name),
        );
      }
      if (mounted) Navigator.of(context).pop(true);
    } catch (_) {
      if (mounted) {
        setState(() {
          _saving = false;
          _error = context.l10n.profitSharingDeclarationFailed;
        });
      }
    }
  }

  String? _mimeFor(String? name) {
    final extension = name?.split('.').last.toLowerCase();
    return switch (extension) {
      'pdf' => 'application/pdf',
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'webp' => 'image/webp',
      _ => null,
    };
  }
}

String _money(double value, String currency, String locale) =>
    FopxFormatters.formatCurrency(value, currencyCode: currency, locale: locale);
String _number(double value, String locale) =>
    FopxFormatters.number(value, locale: locale);
String _date(DateTime? value) =>
    value == null ? '—' : FopxFormatters.date(value);
