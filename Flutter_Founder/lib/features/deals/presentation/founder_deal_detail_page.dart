import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:file_picker/file_picker.dart';

import '../../../app/shell/secondary_scaffold.dart';
import '../../../shared/files/founder_file_picker.dart';
import '../data/funding_controller.dart';
import '../data/funding_declarations.dart';
import 'equity_panel.dart';
import 'profit_sharing_panel.dart';

class FounderDealDetailPage extends ConsumerWidget {
  const FounderDealDetailPage({
    required this.opportunityId,
    required this.participationId,
    required this.title,
    required this.investorName,
    required this.committedAmount,
    required this.currency,
    this.contractId,
    super.key,
  });

  final int opportunityId;
  final int participationId;
  final String title;
  final String investorName;
  final double? committedAmount;
  final String currency;
  final int? contractId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final key = (
      opportunityId: opportunityId,
      participationId: participationId,
    );
    final state = ref.watch(founderFundingDeclarationsProvider(key));
    final legsState = ref.watch(founderFundingLegsProvider(key));
    final acceptedLegs = legsState.valueOrNull;
    final locale = Localizations.localeOf(context).toLanguageTag();
    return FopxSecondaryScaffold(
      title: context.l10n.dealDetails,
      subtitle: title,
      child: state.when(
        loading: () => const FopxLoadingState(height: 220),
        error:
            (_, _) => FopxErrorState(
              title: context.l10n.fundingLoadFailed,
              body: context.l10n.dealsLoadFailedBody,
              actionLabel: context.l10n.retry,
              kind: FopxErrorKind.network,
              onAction:
                  () => ref.invalidate(founderFundingDeclarationsProvider(key)),
            ),
        data: (declarations) {
          final declared = declarations.fold<double>(
            0,
            (sum, item) => sum + item.amount,
          );
          final confirmed = declarations
              .where((item) => item.status.toLowerCase() == 'confirmed')
              .fold<double>(0, (sum, item) => sum + item.amount);
          final awaiting = declarations
              .where(
                (item) => item.status.toLowerCase() == 'pendingconfirmation',
              )
              .fold<double>(0, (sum, item) => sum + item.amount);
          final disputed = declarations
              .where((item) => item.status.toLowerCase() == 'disputed')
              .fold<double>(0, (sum, item) => sum + item.amount);
          final outstanding =
              committedAmount == null
                  ? null
                  : (committedAmount! - confirmed)
                      .clamp(0, double.infinity)
                      .toDouble();
          final available =
              committedAmount == null
                  ? null
                  : (committedAmount! - declared)
                      .clamp(0, double.infinity)
                      .toDouble();
          final canDeclare =
              (available == null || available > 0) &&
              acceptedLegs != null &&
              (acceptedLegs.isEmpty ||
                  acceptedLegs.any((leg) => leg.undeclared > 0));
          return ListView(
            padding: const EdgeInsetsDirectional.fromSTEB(
              FopxSpacing.pageGutter,
              FopxSpacing.md,
              FopxSpacing.pageGutter,
              FopxSpacing.xl,
            ),
            children: <Widget>[
              Text(title, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: FopxSpacing.xs),
              Text('${context.l10n.investor}: $investorName'),
              const SizedBox(height: FopxSpacing.md),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(FopxSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        context.l10n.fundingPosition,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: FopxSpacing.sm),
                      if (committedAmount != null)
                        _FundingLine(
                          label: context.l10n.fundingCommitted,
                          value: _money(committedAmount!, currency, locale),
                        ),
                      _FundingLine(
                        label: context.l10n.fundingDeclared,
                        value: _money(declared, currency, locale),
                      ),
                      _FundingLine(
                        label: context.l10n.fundingAwaitingConfirmation,
                        value: _money(awaiting, currency, locale),
                      ),
                      _FundingLine(
                        label: context.l10n.fundingDisputed,
                        value: _money(disputed, currency, locale),
                      ),
                      _FundingLine(
                        label: context.l10n.fundingConfirmed,
                        value: _money(confirmed, currency, locale),
                      ),
                      if (outstanding != null)
                        _FundingLine(
                          label: context.l10n.fundingOutstanding,
                          value: _money(outstanding, currency, locale),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: FopxSpacing.sm),
              Text(
                context.l10n.fundsTransferredOutsideFopx,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              if (legsState.hasError)
                TextButton(
                  onPressed:
                      () => ref.invalidate(founderFundingLegsProvider(key)),
                  child: Text(context.l10n.acceptedTermsLoadFailed),
                ),
              if (contractId != null) ...<Widget>[
                const SizedBox(height: FopxSpacing.sm),
                OutlinedButton.icon(
                  onPressed: () => context.push('/deals/$contractId'),
                  icon: const Icon(Icons.description_outlined),
                  label: Text(context.l10n.contractDetails),
                ),
              ],
              if (canDeclare) ...<Widget>[
                const SizedBox(height: FopxSpacing.md),
                FilledButton.icon(
                  onPressed: () async {
                    final created = await showDialog<bool>(
                      context: context,
                      builder:
                          (_) => _FundingDeclarationDialog(
                            opportunityId: opportunityId,
                            participationId: participationId,
                            currency: currency,
                            legs: acceptedLegs,
                          ),
                    );
                    if (created == true) {
                      ref.invalidate(founderFundingDeclarationsProvider(key));
                    }
                  },
                  icon: const Icon(Icons.add_circle_outline),
                  label: Text(context.l10n.declareFundingReceived),
                ),
              ],
              const SizedBox(height: FopxSpacing.lg),
              Text(
                context.l10n.fundingDeclarations,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: FopxSpacing.sm),
              if (declarations.isEmpty)
                FopxEmptyState(
                  title: context.l10n.noFundingDeclarations,
                  body: context.l10n.noFundingDeclarationsBody,
                  icon: Icons.account_balance_outlined,
                )
              else
                for (final declaration in declarations)
                  _DeclarationCard(declaration: declaration, locale: locale),
              if ((acceptedLegs ?? const <FounderFundingLeg>[]).any(
                (leg) => leg.type.toLowerCase() == 'profitsharing',
              )) ...<Widget>[
                const SizedBox(height: FopxSpacing.md),
                FounderProfitSharingPanel(
                  opportunityId: opportunityId,
                  participationId: participationId,
                ),
              ],
              if ((acceptedLegs ?? const <FounderFundingLeg>[]).any(
                (leg) => leg.type.toLowerCase() == 'equity',
              )) ...<Widget>[
                const SizedBox(height: FopxSpacing.md),
                FounderEquityPanel(
                  opportunityId: opportunityId,
                  participationId: participationId,
                ),
              ],
              for (final leg in acceptedLegs ?? const <FounderFundingLeg>[])
                if (leg.type.toLowerCase() == 'loan')
                  _LoanLifecycleCard(
                    opportunityId: opportunityId,
                    participationId: participationId,
                    leg: leg,
                    locale: locale,
                  ),
            ],
          );
        },
      ),
    );
  }

  String _money(double amount, String code, String locale) =>
      FopxFormatters.formatCurrency(amount, currencyCode: code, locale: locale);
}

class _FundingLine extends StatelessWidget {
  const _FundingLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: FopxSpacing.xs),
    child: Row(
      children: <Widget>[
        Expanded(child: Text(label)),
        const SizedBox(width: FopxSpacing.sm),
        Text(value, style: Theme.of(context).textTheme.labelLarge),
      ],
    ),
  );
}

class _DeclarationCard extends ConsumerWidget {
  const _DeclarationCard({required this.declaration, required this.locale});

  final FounderFundingDeclaration declaration;
  final String locale;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = switch (declaration.status.toLowerCase()) {
      'confirmed' => context.l10n.fundingConfirmed,
      'disputed' => context.l10n.fundingDisputed,
      'pendingconfirmation' => context.l10n.fundingAwaitingConfirmation,
      _ => declaration.status,
    };
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    FopxFormatters.formatCurrency(
                      declaration.amount,
                      currencyCode: declaration.currency,
                      locale: locale,
                    ),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                FopxStatusBadge(label: status),
              ],
            ),
            if (declaration.receivedDate != null)
              Text(
                '${context.l10n.fundingReceivedDate}: ${FopxFormatters.date(declaration.receivedDate!, locale: locale)}',
              ),
            Text(
              '${context.l10n.fundingPaymentMethod}: ${declaration.paymentMethod}',
            ),
            if (declaration.externalReference != null)
              Text(
                '${context.l10n.fundingExternalReference}: ${declaration.externalReference}',
              ),
            if (declaration.notes != null) Text(declaration.notes!),
            if (declaration.proofAvailable)
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      '${context.l10n.fundingEvidence}: ${declaration.proofFileName ?? context.l10n.fundingEvidenceAvailable}',
                    ),
                  ),
                  IconButton(
                    tooltip: context.l10n.fundingEvidence,
                    onPressed: () async {
                      final evidenceLabel = context.l10n.fundingEvidence;
                      try {
                        final bytes = await ref
                            .read(founderFundingRepositoryProvider)
                            .downloadProof(declaration.id);
                        final name =
                            declaration.proofFileName ??
                            'funding-evidence-${declaration.id}';
                        await FilePicker.platform.saveFile(
                          dialogTitle: evidenceLabel,
                          fileName: name,
                          bytes: Uint8List.fromList(bytes),
                        );
                      } catch (_) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                context.l10n.fundingDeclarationFailed,
                              ),
                            ),
                          );
                        }
                      }
                    },
                    icon: const Icon(Icons.download_outlined),
                  ),
                ],
              ),
            if (declaration.confirmationComment != null)
              Text(
                '${context.l10n.fundingConfirmationNote}: ${declaration.confirmationComment}',
              ),
            if (declaration.disputeReason != null)
              Text(
                '${context.l10n.fundingDisputeReason}: ${declaration.disputeReason}',
              ),
            for (final allocation in declaration.allocations)
              Text(
                '${context.l10n.offerVersion} ${allocation.legNumber} · ${allocation.legType}: '
                '${FopxFormatters.formatCurrency(allocation.amount, currencyCode: allocation.currency, locale: locale)}',
              ),
          ],
        ),
      ),
    );
  }
}

class _FundingDeclarationDialog extends ConsumerStatefulWidget {
  const _FundingDeclarationDialog({
    required this.opportunityId,
    required this.participationId,
    required this.currency,
    required this.legs,
  });

  final int opportunityId;
  final int participationId;
  final String currency;
  final List<FounderFundingLeg> legs;

  @override
  ConsumerState<_FundingDeclarationDialog> createState() =>
      _FundingDeclarationDialogState();
}

class _FundingDeclarationDialogState
    extends ConsumerState<_FundingDeclarationDialog> {
  final _formKey = GlobalKey<FormState>();
  final _amount = TextEditingController();
  final _date = TextEditingController();
  final _reference = TextEditingController();
  final _notes = TextEditingController();
  final _allocations = <int, TextEditingController>{};
  String _paymentMethod = 'BankTransfer';
  PlatformFile? _proofFile;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _date.text =
        '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _amount.dispose();
    _date.dispose();
    _reference.dispose();
    _notes.dispose();
    for (final controller in _allocations.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(context.l10n.declareFundingReceived),
    content: Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(context.l10n.fundsTransferredOutsideFopx),
            const SizedBox(height: FopxSpacing.md),
            TextFormField(
              controller: _amount,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                labelText: '${context.l10n.fundingAmount} (${widget.currency})',
              ),
              validator: (value) {
                final amount = double.tryParse(value?.trim() ?? '');
                return amount == null || !amount.isFinite || amount <= 0
                    ? context.l10n.invalidAmount
                    : null;
              },
            ),
            TextFormField(
              controller: _date,
              keyboardType: TextInputType.datetime,
              decoration: InputDecoration(
                labelText: context.l10n.fundingReceivedDate,
              ),
              validator:
                  (value) =>
                      DateTime.tryParse(value?.trim() ?? '') == null
                          ? context.l10n.invalidDate
                          : null,
            ),
            DropdownButtonFormField<String>(
              initialValue: _paymentMethod,
              decoration: InputDecoration(
                labelText: context.l10n.fundingPaymentMethod,
              ),
              items: const <String>['BankTransfer', 'Cash', 'Cheque', 'Other']
                  .map(
                    (method) =>
                        DropdownMenuItem(value: method, child: Text(method)),
                  )
                  .toList(growable: false),
              onChanged:
                  _saving
                      ? null
                      : (value) => setState(
                        () => _paymentMethod = value ?? _paymentMethod,
                      ),
            ),
            TextFormField(
              controller: _reference,
              maxLength: 200,
              decoration: InputDecoration(
                labelText: context.l10n.fundingExternalReference,
              ),
            ),
            TextFormField(
              controller: _notes,
              maxLength: 2000,
              maxLines: 3,
              decoration: InputDecoration(labelText: context.l10n.notes),
            ),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: OutlinedButton.icon(
                onPressed: _saving ? null : _pickProof,
                icon: const Icon(Icons.attach_file),
                label: Text(
                  _proofFile?.name ?? context.l10n.fundingEvidence,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
            if (widget.legs.length > 1) ...<Widget>[
              const SizedBox(height: FopxSpacing.md),
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: Text(context.l10n.allocateAcrossOfferLegs),
              ),
              for (final leg in widget.legs.where(
                (item) => item.undeclared > 0,
              ))
                TextFormField(
                  controller: _allocations.putIfAbsent(
                    leg.id,
                    TextEditingController.new,
                  ),
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(
                    labelText: context.l10n.fundingLegAllocation
                        .replaceAll('{number}', '${leg.number}')
                        .replaceAll('{type}', leg.type),
                    helperText: context.l10n.fundingLegUndeclaredCapacity
                        .replaceAll(
                          '{amount}',
                          FopxFormatters.formatCurrency(
                            leg.undeclared,
                            currencyCode: leg.currency,
                            locale:
                                Localizations.localeOf(context).toLanguageTag(),
                          ),
                        ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return null;
                    final parsed = double.tryParse(value.trim());
                    return parsed == null ||
                            !parsed.isFinite ||
                            parsed <= 0 ||
                            parsed > leg.undeclared
                        ? context.l10n.fundingAllocationExceedsCapacity
                        : null;
                  },
                ),
            ],
          ],
        ),
      ),
    ),
    actions: <Widget>[
      TextButton(
        onPressed: _saving ? null : () => Navigator.pop(context, false),
        child: Text(context.l10n.cancel),
      ),
      FilledButton(
        onPressed: _saving ? null : _submit,
        child:
            _saving
                ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : Text(context.l10n.submit),
      ),
    ],
  );

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final totalAmount = double.parse(_amount.text.trim());
    final allocations = <({int offerLegId, double amount})>[];
    for (final entry in _allocations.entries) {
      if (entry.value.text.trim().isEmpty) continue;
      allocations.add((
        offerLegId: entry.key,
        amount: double.parse(entry.value.text.trim()),
      ));
    }
    if (widget.legs.length > 1 &&
        (allocations.isEmpty ||
            (allocations.fold<double>(0, (sum, item) => sum + item.amount) -
                        totalAmount)
                    .abs() >
                0.005)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.fundingAllocationMustReconcile)),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      await ref
          .read(founderFundingRepositoryProvider)
          .declare(
            opportunityId: widget.opportunityId,
            participationId: widget.participationId,
            amount: totalAmount,
            currency: widget.currency,
            receivedDate: DateTime.parse(_date.text.trim()),
            paymentMethod: _paymentMethod,
            externalReference: _reference.text,
            notes: _notes.text,
            proofBytes: _proofFile?.bytes,
            proofFileName: _proofFile?.name,
            proofContentType: _proofMimeType(_proofFile?.extension),
            allocations: allocations,
          );
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.fundingDeclarationFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _pickProof() async {
    try {
      final file = await pickFounderFile(
        allowedExtensions: const <String>['pdf', 'png', 'jpg', 'jpeg'],
        maxFileSizeBytes: 25 * 1024 * 1024,
      );
      if (file == null || !mounted) return;
      setState(() => _proofFile = file);
    } on FounderFileSelectionException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.fundingDeclarationFailed)),
      );
    }
  }

  String _proofMimeType(String? extension) => switch (extension
      ?.toLowerCase()) {
    'pdf' => 'application/pdf',
    'png' => 'image/png',
    'jpg' || 'jpeg' => 'image/jpeg',
    _ => 'application/octet-stream',
  };
}

class _LoanLifecycleCard extends ConsumerWidget {
  const _LoanLifecycleCard({
    required this.opportunityId,
    required this.participationId,
    required this.leg,
    required this.locale,
  });

  final int opportunityId;
  final int participationId;
  final FounderFundingLeg leg;
  final String locale;

  String _money(double value) => FopxFormatters.formatCurrency(
    value,
    currencyCode: leg.currency,
    locale: locale,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = leg.repayment;
    if (summary == null) return const SizedBox.shrink();
    final pending = summary.pendingConfirmationAmount;
    final canDeclare =
        leg.loanObligationId != null &&
        leg.loanObligationStatus?.toLowerCase() == 'active' &&
        summary.totalOutstanding > pending;
    return Card(
      margin: const EdgeInsets.only(top: FopxSpacing.md),
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    context.l10n.loanLifecycle,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                FopxStatusBadge(label: summary.lifecycleStatus),
              ],
            ),
            Text(
              '${context.l10n.returnRate}: ${leg.returnRate ?? 0}% · ${leg.termMonths ?? 0} ${context.l10n.termMonths}',
            ),
            _FundingLine(
              label: context.l10n.principalOutstanding,
              value: _money(summary.principalOutstanding),
            ),
            _FundingLine(
              label: context.l10n.interestOutstanding,
              value: _money(summary.interestOutstanding),
            ),
            _FundingLine(
              label: context.l10n.loanOutstanding,
              value: _money(summary.totalOutstanding),
            ),
            _FundingLine(
              label: context.l10n.confirmedRepaid,
              value: _money(summary.confirmedRepaidAmount),
            ),
            _FundingLine(
              label: context.l10n.pendingRepaymentConfirmation,
              value: _money(summary.pendingConfirmationAmount),
            ),
            if (summary.disputedAmount > 0)
              _FundingLine(
                label: context.l10n.repaymentDisputed,
                value: _money(summary.disputedAmount),
              ),
            if (summary.overdueAmount > 0)
              _FundingLine(
                label: context.l10n.overdueAmount,
                value: _money(summary.overdueAmount),
              ),
            if (summary.nextDueAmount != null && summary.nextDueDate != null)
              _FundingLine(
                label: context.l10n.nextPayment,
                value:
                    '${_money(summary.nextDueAmount!)} · ${FopxFormatters.date(summary.nextDueDate!, locale: locale)}',
              ),
            if (summary.maturityDate != null)
              _FundingLine(
                label: context.l10n.maturityDate,
                value: FopxFormatters.date(
                  summary.maturityDate!,
                  locale: locale,
                ),
              ),
            if (summary.defaultReason != null)
              Text('${context.l10n.defaultReason}: ${summary.defaultReason}'),
            if (summary.closureReason != null)
              Text('${context.l10n.closureReason}: ${summary.closureReason}'),
            if (leg.isPersistedSchedule) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              Text(
                context.l10n.persistedLoanSchedule,
                style: Theme.of(context).textTheme.titleSmall,
              ),
              for (final installment in leg.cashFlows)
                Text(
                  '${context.l10n.installment} ${installment.number} · '
                  '${installment.dueDate == null ? '' : FopxFormatters.date(installment.dueDate!, locale: locale)} · '
                  '${_money(installment.expectedTotal)} · ${installment.status}',
                ),
            ] else
              Padding(
                padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xs),
                child: Text(context.l10n.persistedLoanScheduleUnavailable),
              ),
            if (summary.records.isNotEmpty) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              Text(
                context.l10n.loanRepaymentHistory,
                style: Theme.of(context).textTheme.titleSmall,
              ),
              for (final record in summary.records)
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        '${_money(record.amount)} · ${record.status}'
                        '${record.externalPaymentDate == null ? '' : ' · ${FopxFormatters.date(record.externalPaymentDate!, locale: locale)}'}'
                        '${record.targetInstallmentNumbers.isEmpty ? '' : ' · ${context.l10n.installments} ${record.targetInstallmentNumbers.join(', ')}'}'
                        '${record.disputeReason == null ? '' : ' · ${record.disputeReason}'}',
                      ),
                    ),
                    if (record.proofAvailable)
                      IconButton(
                        tooltip: context.l10n.fundingEvidence,
                        onPressed: () async {
                          final label = context.l10n.fundingEvidence;
                          try {
                            final bytes = await ref
                                .read(founderFundingRepositoryProvider)
                                .downloadLoanRepaymentProof(record.id);
                            await FilePicker.platform.saveFile(
                              dialogTitle: label,
                              fileName:
                                  record.proofFileName ??
                                  'loan-repayment-proof-${record.id}',
                              bytes: Uint8List.fromList(bytes),
                            );
                          } catch (_) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    context.l10n.loanRepaymentDeclarationFailed,
                                  ),
                                ),
                              );
                            }
                          }
                        },
                        icon: const Icon(Icons.download_outlined),
                      ),
                  ],
                ),
            ],
            if (canDeclare) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              OutlinedButton.icon(
                onPressed: () async {
                  final created = await showDialog<bool>(
                    context: context,
                    builder:
                        (_) => _LoanRepaymentDialog(
                          opportunityId: opportunityId,
                          obligationId: leg.loanObligationId!,
                          currency: leg.currency,
                          maximum: summary.totalOutstanding - pending,
                          installments: leg.cashFlows,
                        ),
                  );
                  if (created == true) {
                    ref.invalidate(
                      founderFundingLegsProvider((
                        opportunityId: opportunityId,
                        participationId: participationId,
                      )),
                    );
                  }
                },
                icon: const Icon(Icons.payments_outlined),
                label: Text(context.l10n.declareLoanRepayment),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LoanRepaymentDialog extends ConsumerStatefulWidget {
  const _LoanRepaymentDialog({
    required this.opportunityId,
    required this.obligationId,
    required this.currency,
    required this.maximum,
    required this.installments,
  });

  final int opportunityId;
  final int obligationId;
  final String currency;
  final double maximum;
  final List<FounderLoanInstallment> installments;

  @override
  ConsumerState<_LoanRepaymentDialog> createState() =>
      _LoanRepaymentDialogState();
}

class _LoanRepaymentDialogState extends ConsumerState<_LoanRepaymentDialog> {
  final _formKey = GlobalKey<FormState>();
  final _amount = TextEditingController();
  final _date = TextEditingController();
  final _reference = TextEditingController();
  bool _saving = false;
  PlatformFile? _proofFile;
  final Set<int> _installmentIds = <int>{};

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _date.text =
        '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _amount.dispose();
    _date.dispose();
    _reference.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(context.l10n.declareLoanRepayment),
    content: Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(context.l10n.loanFundsTransferredOutsideFopx),
            TextFormField(
              controller: _amount,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                labelText:
                    '${context.l10n.repaymentAmount} (${widget.currency})',
                helperText: context.l10n.loanRepaymentMaximum.replaceAll(
                  '{amount}',
                  FopxFormatters.formatCurrency(
                    widget.maximum,
                    currencyCode: widget.currency,
                    locale: Localizations.localeOf(context).toLanguageTag(),
                  ),
                ),
              ),
              validator: (value) {
                final amount = double.tryParse(value?.trim() ?? '');
                return amount == null ||
                        !amount.isFinite ||
                        amount <= 0 ||
                        amount > widget.maximum
                    ? context.l10n.invalidAmount
                    : null;
              },
            ),
            TextFormField(
              controller: _date,
              decoration: InputDecoration(
                labelText: context.l10n.externalPaymentDate,
              ),
              validator:
                  (value) =>
                      DateTime.tryParse(value?.trim() ?? '') == null
                          ? context.l10n.invalidDate
                          : null,
            ),
            TextFormField(
              controller: _reference,
              maxLength: 200,
              decoration: InputDecoration(
                labelText: context.l10n.fundingExternalReference,
              ),
            ),
            if (widget.installments.isNotEmpty) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: Text(context.l10n.installments),
              ),
              for (final installment in widget.installments)
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _installmentIds.contains(installment.number),
                  title: Text(
                    '${context.l10n.installment} ${installment.number} · ${FopxFormatters.formatCurrency(installment.remainingAmount, currencyCode: widget.currency, locale: Localizations.localeOf(context).toLanguageTag())}',
                  ),
                  onChanged:
                      _saving
                          ? null
                          : (checked) => setState(() {
                            if (checked == true) {
                              _installmentIds.add(installment.number);
                            } else {
                              _installmentIds.remove(installment.number);
                            }
                          }),
                ),
            ],
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: OutlinedButton.icon(
                onPressed: _saving ? null : _pickProof,
                icon: const Icon(Icons.attach_file),
                label: Text(
                  _proofFile?.name ?? context.l10n.fundingEvidence,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ),
      ),
    ),
    actions: <Widget>[
      TextButton(
        onPressed: _saving ? null : () => Navigator.pop(context, false),
        child: Text(context.l10n.cancel),
      ),
      FilledButton(
        onPressed: _saving ? null : _submit,
        child:
            _saving
                ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
                : Text(context.l10n.submit),
      ),
    ],
  );

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref
          .read(founderFundingRepositoryProvider)
          .declareLoanRepayment(
            opportunityId: widget.opportunityId,
            loanObligationId: widget.obligationId,
            amount: double.parse(_amount.text.trim()),
            currency: widget.currency,
            externalPaymentDate: DateTime.parse(_date.text.trim()),
            externalReference: _reference.text,
            proofBytes: _proofFile?.bytes,
            proofFileName: _proofFile?.name,
            proofContentType: _proofMimeType(_proofFile?.extension),
            installmentIds: _installmentIds.toList()..sort(),
          );
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.loanRepaymentDeclarationFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _pickProof() async {
    try {
      final file = await pickFounderFile(
        allowedExtensions: const <String>['pdf', 'png', 'jpg', 'jpeg'],
        maxFileSizeBytes: 25 * 1024 * 1024,
      );
      if (file == null || !mounted) return;
      setState(() => _proofFile = file);
    } on FounderFileSelectionException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.loanRepaymentDeclarationFailed)),
      );
    }
  }

  String _proofMimeType(String? extension) => switch (extension
      ?.toLowerCase()) {
    'pdf' => 'application/pdf',
    'png' => 'image/png',
    'jpg' || 'jpeg' => 'image/jpeg',
    _ => 'application/octet-stream',
  };
}
