import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../data/equity.dart';
import '../data/equity_controller.dart';

class FounderEquityPanel extends ConsumerWidget {
  const FounderEquityPanel({
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
    final state = ref.watch(founderEquityProvider(args));
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
                    context.l10n.equityTitle,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(context.l10n.equityLoadFailed),
                  TextButton(
                    onPressed:
                        () => ref.invalidate(founderEquityProvider(args)),
                    child: Text(context.l10n.retry),
                  ),
                ],
              ),
          data:
              (summary) => _EquitySummaryBody(
                summary: summary,
                opportunityId: opportunityId,
                args: args,
              ),
        ),
      ),
    );
  }
}

class _EquitySummaryBody extends ConsumerWidget {
  const _EquitySummaryBody({
    required this.summary,
    required this.opportunityId,
    required this.args,
  });

  final FounderEquitySummary summary;
  final int opportunityId;
  final ({int opportunityId, int participationId}) args;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context).toLanguageTag();
    final pending = summary.positions
        .where((p) => p.status.toLowerCase() == 'pendingcapitalization')
        .map((p) => p.id)
        .where((id) => id > 0)
        .toList(growable: false);
    final allPositions = <FounderEquityPosition>{
      ...summary.capitalization,
      ...summary.positions,
    }.toList(growable: false);
    final canPrepareEvent =
        allPositions.isNotEmpty &&
        allPositions.every(
          (p) => p.ownershipModel.toLowerCase() == 'sharebased',
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(l10n.equityTitle, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: FopxSpacing.sm),
        if (summary.positions.isEmpty)
          Text(l10n.equityNoPosition)
        else
          for (final position in summary.positions)
            _EquityPositionCard(position: position, locale: locale),
        const SizedBox(height: FopxSpacing.sm),
        _EquitySectionTitle(title: l10n.equityCapitalization),
        if (summary.capitalization.isEmpty)
          Text(l10n.equityCapTableEmpty)
        else
          for (final position in summary.capitalization)
            _PositionSummaryLine(position: position, locale: locale),
        if (canPrepareEvent) ...<Widget>[
          const SizedBox(height: FopxSpacing.xs),
          OutlinedButton.icon(
            onPressed: () async {
              final submitted = await showDialog<bool>(
                context: context,
                builder:
                    (_) => _EquityEventDialog(
                      opportunityId: opportunityId,
                      pendingPositionIds: pending,
                    ),
              );
              if (submitted == true) {
                ref.invalidate(founderEquityProvider(args));
              }
            },
            icon: const Icon(Icons.account_tree_outlined),
            label: Text(l10n.equityPrepareEvent),
          ),
          Text(
            l10n.equityEventApprovalNote,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
        const SizedBox(height: FopxSpacing.sm),
        _EquitySectionTitle(title: l10n.equityCorporateEvents),
        if (summary.corporateEvents.isEmpty)
          Text(l10n.equityEventsEmpty)
        else
          for (final event in summary.corporateEvents)
            _EquityEventRow(event: event, locale: locale),
        const SizedBox(height: FopxSpacing.sm),
        _EquitySectionTitle(title: l10n.equityDividends),
        if (summary.dividends.isEmpty)
          Text(l10n.equityDividendsEmpty)
        else
          for (final dividend in summary.dividends)
            _EquityDividendRow(dividend: dividend, locale: locale),
        const SizedBox(height: FopxSpacing.sm),
        _EquitySectionTitle(title: l10n.equityTransfers),
        if (summary.transfers.isEmpty)
          Text(l10n.equityTransfersEmpty)
        else
          for (final transfer in summary.transfers)
            _EquityTransferRow(transfer: transfer, locale: locale),
      ],
    );
  }
}

class _EquityPositionCard extends ConsumerWidget {
  const _EquityPositionCard({required this.position, required this.locale});
  final FounderEquityPosition position;
  final String locale;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final ownership = position.currentOwnership;
    final amount = FopxFormatters.formatCurrency(
      position.investmentAmount,
      currencyCode: position.currency,
      locale: locale,
    );
    return Card(
      margin: const EdgeInsets.only(bottom: FopxSpacing.xs),
      child: ExpansionTile(
        title: Text('${l10n.equityPosition} · ${position.status}'),
        subtitle: Text('$amount · ${position.ownershipModel}'),
        childrenPadding: const EdgeInsetsDirectional.fromSTEB(
          FopxSpacing.md,
          0,
          FopxSpacing.md,
          FopxSpacing.md,
        ),
        children: <Widget>[
          _EquityLine(
            label: l10n.equityContractualOwnership,
            value: _percent(position.contractualOwnership, locale),
          ),
          _EquityLine(
            label: l10n.equityCurrentOwnership,
            value: _percent(ownership, locale),
          ),
          _EquityLine(
            label: l10n.equityDilution,
            value: _percent(position.dilutionPoints, locale),
          ),
          if (position.investorShares != null)
            _EquityLine(
              label: l10n.equityInvestorShares,
              value: _number(position.investorShares!, locale),
            ),
          if (position.totalIssuedShares != null)
            _EquityLine(
              label: l10n.equityTotalShares,
              value: _number(position.totalIssuedShares!, locale),
            ),
          if (position.shareClass != null)
            _EquityLine(
              label: l10n.equityShareClass,
              value: position.shareClass!,
            ),
          if (position.pricePerShare != null)
            _EquityLine(
              label: l10n.equityPricePerShare,
              value: FopxFormatters.formatCurrency(
                position.pricePerShare!,
                currencyCode: position.currency,
                locale: locale,
              ),
            ),
          if (position.ledger.isNotEmpty) ...<Widget>[
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xs),
                child: Text(
                  l10n.equityLedger,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
              ),
            ),
            for (final entry in position.ledger)
              _EquityLine(
                label:
                    '${entry.eventType} · ${_date(entry.effectiveDate, locale)}',
                value:
                    entry.resultingOwnership == null
                        ? '—'
                        : _percent(entry.resultingOwnership, locale),
              ),
          ],
          if (position.id > 0)
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: TextButton.icon(
                onPressed: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateUtils.dateOnly(DateTime.now()),
                    firstDate: DateTime(2000),
                    lastDate: DateUtils.dateOnly(DateTime.now()),
                  );
                  if (date == null || !context.mounted) return;
                  try {
                    final result = await ref
                        .read(founderEquityRepositoryProvider)
                        .ownershipAtDate(position.id, date);
                    if (!context.mounted) return;
                    await showDialog<void>(
                      context: context,
                      builder:
                          (_) => AlertDialog(
                            title: Text(l10n.equityOwnershipAsOf),
                            content: Text(
                              '${_date(result.asOf, locale)}\n${_percent(result.ownershipPercentage, locale)}'
                              '${result.investorShares == null ? '' : '\n${_number(result.investorShares!, locale)} / ${_number(result.totalIssuedShares ?? 0, locale)}'}',
                            ),
                            actions: <Widget>[
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: Text(l10n.cancel),
                              ),
                            ],
                          ),
                    );
                  } catch (_) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(l10n.equityLoadFailed)),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.history),
                label: Text(l10n.equityOwnershipAsOf),
              ),
            ),
          if (position.status.toLowerCase() == 'closed')
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: TextButton.icon(
                onPressed: () async {
                  try {
                    final closure = await ref
                        .read(founderEquityRepositoryProvider)
                        .closureSnapshot(position.id);
                    if (!context.mounted) return;
                    await showDialog<void>(
                      context: context,
                      builder:
                          (_) => AlertDialog(
                            title: Text(l10n.equityClosure),
                            content:
                                closure == null
                                    ? Text(l10n.equityClosureUnavailable)
                                    : Text(
                                      '${l10n.equityFullyExitedAt}: ${_date(closure.fullyExitedAt, locale)}\n'
                                      '${l10n.equityClosedAt}: ${_date(closure.closedAt, locale)}\n'
                                      '${l10n.equityCurrentOwnership}: ${_percent(closure.finalOwnership, locale)}\n'
                                      '${l10n.equityInvestorShares}: ${closure.finalInvestorShares == null ? '—' : _number(closure.finalInvestorShares!, locale)}\n'
                                      '${l10n.equityConfirmedDistributions}: ${closure.totalDistributionsConfirmed == null ? '—' : FopxFormatters.formatCurrency(closure.totalDistributionsConfirmed!, currencyCode: position.currency, locale: locale)}\n\n'
                                      '${closure.closureReason}',
                                    ),
                            actions: <Widget>[
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: Text(l10n.cancel),
                              ),
                            ],
                          ),
                    );
                  } catch (_) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(l10n.equityLoadFailed)),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.fact_check_outlined),
                label: Text(l10n.equityClosure),
              ),
            ),
        ],
      ),
    );
  }
}

class _PositionSummaryLine extends StatelessWidget {
  const _PositionSummaryLine({required this.position, required this.locale});
  final FounderEquityPosition position;
  final String locale;

  @override
  Widget build(BuildContext context) => _EquityLine(
    label: '${position.status} · ${position.ownershipModel}',
    value:
        position.currentOwnership == null
            ? FopxFormatters.formatCurrency(
              position.investmentAmount,
              currencyCode: position.currency,
              locale: locale,
            )
            : _percent(position.currentOwnership, locale),
  );
}

class _EquityEventRow extends StatelessWidget {
  const _EquityEventRow({required this.event, required this.locale});
  final FounderEquityCorporateEvent event;
  final String locale;

  @override
  Widget build(BuildContext context) => _EquityLine(
    label:
        '${event.eventType} · ${event.status} · ${_date(event.effectiveDate, locale)}',
    value: event.reason,
  );
}

class _EquityDividendRow extends StatelessWidget {
  const _EquityDividendRow({required this.dividend, required this.locale});
  final FounderEquityDividend dividend;
  final String locale;

  @override
  Widget build(BuildContext context) => ExpansionTile(
    tilePadding: EdgeInsets.zero,
    title: Text('${context.l10n.equityDividendStatus}: ${dividend.status}'),
    subtitle: Text(
      '${_date(dividend.recordDate, locale)} · ${dividend.currency}',
    ),
    children: <Widget>[
      if (dividend.totalDeclared != null)
        _EquityLine(
          label: context.l10n.equityTotalDividend,
          value: FopxFormatters.formatCurrency(
            dividend.totalDeclared!,
            currencyCode: dividend.currency,
            locale: locale,
          ),
        ),
      for (final entitlement in dividend.entitlements)
        _EquityLine(
          label: '${context.l10n.equityEntitlement} · ${entitlement.id}',
          value: FopxFormatters.formatCurrency(
            entitlement.entitlementAmount,
            currencyCode: entitlement.currency,
            locale: locale,
          ),
        ),
    ],
  );
}

class _EquityTransferRow extends StatelessWidget {
  const _EquityTransferRow({required this.transfer, required this.locale});
  final FounderEquityTransfer transfer;
  final String locale;

  @override
  Widget build(BuildContext context) => _EquityLine(
    label:
        '${transfer.type} · ${transfer.status} · ${_date(transfer.effectiveDate, locale)}',
    value: '${_number(transfer.quantity, locale)} · ${transfer.reason}',
  );
}

class _EquityEventDialog extends ConsumerStatefulWidget {
  const _EquityEventDialog({
    required this.opportunityId,
    required this.pendingPositionIds,
  });
  final int opportunityId;
  final List<int> pendingPositionIds;

  @override
  ConsumerState<_EquityEventDialog> createState() => _EquityEventDialogState();
}

class _EquityEventDialogState extends ConsumerState<_EquityEventDialog> {
  final _reason = TextEditingController();
  final _shares = TextEditingController();
  final _numerator = TextEditingController();
  final _denominator = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _eventType = 'ShareIssuance';
  DateTime _effectiveDate = DateTime.now();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _reason.dispose();
    _shares.dispose();
    _numerator.dispose();
    _denominator.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final split = _eventType == 'ShareSplit' || _eventType == 'ReverseSplit';
    return AlertDialog(
      title: Text(l10n.equityPrepareEvent),
      content: SizedBox(
        width: 440,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                DropdownButtonFormField<String>(
                  initialValue: _eventType,
                  decoration: InputDecoration(labelText: l10n.equityEventType),
                  items:
                      const <String>[
                            'ShareIssuance',
                            'CapitalIncrease',
                            'ShareSplit',
                            'ReverseSplit',
                          ]
                          .map(
                            (type) => DropdownMenuItem(
                              value: type,
                              child: Text(type),
                            ),
                          )
                          .toList(),
                  onChanged:
                      _saving
                          ? null
                          : (value) =>
                              setState(() => _eventType = value ?? _eventType),
                ),
                if (split) ...<Widget>[
                  _numberField(_numerator, l10n.equitySplitNumerator),
                  _numberField(_denominator, l10n.equitySplitDenominator),
                ] else
                  _numberField(_shares, l10n.equitySharesIssued),
                TextFormField(
                  controller: _reason,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: l10n.equityEventReason,
                  ),
                  validator:
                      (value) =>
                          (value?.trim().isEmpty ?? true)
                              ? l10n.requiredField
                              : null,
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    _date(
                      _effectiveDate,
                      Localizations.localeOf(context).toLanguageTag(),
                    ),
                  ),
                  subtitle: Text(l10n.equityEffectiveDate),
                  trailing: const Icon(Icons.calendar_month_outlined),
                  onTap: _saving ? null : _pickDate,
                ),
                if (_error != null)
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Text(
                      _error!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: _saving ? null : () => Navigator.pop(context, false),
          child: Text(l10n.cancel),
        ),
        FilledButton(
          onPressed: _saving ? null : _submit,
          child:
              _saving
                  ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                  : Text(l10n.equitySubmitForApproval),
        ),
      ],
    );
  }

  Widget _numberField(TextEditingController controller, String label) =>
      TextFormField(
        controller: controller,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(labelText: label),
        validator: (value) {
          final number = double.tryParse(value?.trim() ?? '');
          return number == null || number <= 0
              ? context.l10n.requiredField
              : null;
        },
      );

  Future<void> _pickDate() async {
    final now = DateUtils.dateOnly(DateTime.now());
    final date = await showDatePicker(
      context: context,
      initialDate: DateUtils.dateOnly(_effectiveDate),
      firstDate: DateTime(2000),
      lastDate: now,
    );
    if (date != null && mounted) setState(() => _effectiveDate = date);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref
          .read(founderEquityRepositoryProvider)
          .createCorporateEvent(
            opportunityId: widget.opportunityId,
            eventType: _eventType,
            effectiveDate: _effectiveDate,
            reason: _reason.text,
            sharesIssued:
                _shares.text.isEmpty ? null : double.parse(_shares.text),
            splitNumerator:
                _numerator.text.isEmpty ? null : double.parse(_numerator.text),
            splitDenominator:
                _denominator.text.isEmpty
                    ? null
                    : double.parse(_denominator.text),
            positionIds: widget.pendingPositionIds,
          );
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted) {
        setState(() {
          _saving = false;
          _error = context.l10n.equityActionFailed;
        });
      }
    }
  }
}

class _EquitySectionTitle extends StatelessWidget {
  const _EquitySectionTitle({required this.title});
  final String title;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: FopxSpacing.xs),
    child: Text(title, style: Theme.of(context).textTheme.titleSmall),
  );
}

class _EquityLine extends StatelessWidget {
  const _EquityLine({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: FopxSpacing.xs),
    child: Row(
      children: <Widget>[
        Expanded(child: Text(label)),
        const SizedBox(width: FopxSpacing.sm),
        Flexible(child: Text(value, textAlign: TextAlign.end)),
      ],
    ),
  );
}

String _number(double value, String locale) =>
    FopxFormatters.number(value, locale: locale);
String _percent(double? value, String locale) =>
    value == null ? '—' : '${FopxFormatters.number(value, locale: locale)}%';
String _date(DateTime? value, String locale) =>
    value == null ? '—' : FopxFormatters.date(value, locale: locale);
