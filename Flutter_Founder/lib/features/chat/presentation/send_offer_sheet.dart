import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../data/chat_controller.dart';
import '../data/chat_models.dart';

Future<bool?> showSendOfferSheet(
  BuildContext context, {
  required String conversationId,
  String? initialCurrency,
  int? replacementOfferId,
  FounderNegotiationOffer? initialOffer,
}) => showModalBottomSheet<bool>(
  context: context,
  isScrollControlled: true,
  useSafeArea: true,
  showDragHandle: true,
  builder:
      (_) => _SendOfferSheet(
        conversationId: conversationId,
        initialCurrency: initialCurrency,
        replacementOfferId: replacementOfferId,
        initialOffer: initialOffer,
      ),
);

class _SendOfferSheet extends ConsumerStatefulWidget {
  const _SendOfferSheet({
    required this.conversationId,
    this.initialCurrency,
    this.replacementOfferId,
    this.initialOffer,
  });

  final String conversationId;
  final String? initialCurrency;
  final int? replacementOfferId;
  final FounderNegotiationOffer? initialOffer;

  @override
  ConsumerState<_SendOfferSheet> createState() => _SendOfferSheetState();
}

class _SendOfferSheetState extends ConsumerState<_SendOfferSheet> {
  final _formKey = GlobalKey<FormState>();
  final _controllers = <String, TextEditingController>{};
  final _types = <String>{'Equity'};
  final _note = TextEditingController();
  String? _currency;
  String _ownershipModel = 'PercentageBased';
  String _repaymentModel = 'Monthly';
  String _payoutFrequency = 'Quarterly';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final offer = widget.initialOffer;
    if (offer == null) return;
    _currency = offer.currency;
    _note.text = offer.note;
    _types.clear();
    for (final leg in offer.legs) {
      final type = switch (leg.type.toLowerCase()) {
        'equity' => 'Equity',
        'loan' => 'Loan',
        'profitsharing' => 'ProfitSharing',
        _ => null,
      };
      if (type == null) continue;
      _types.add(type);
      _setInitial('${type}Amount', leg.amount);
      if (type == 'Equity') {
        _ownershipModel = leg.equityOwnershipModel ?? 'PercentageBased';
        _setInitial('equityPercentage', leg.equityPercentage);
        _setInitial('investorShareCount', leg.investorShareCount);
        _setInitial('totalIssuedShares', leg.totalIssuedShares);
        _setInitial('pricePerShare', leg.pricePerShare);
        _setInitial('preMoneyValuation', leg.preMoneyValuation);
        _setInitial('postMoneyValuation', leg.postMoneyValuation);
        _setInitial('shareClass', leg.shareClass);
        _setInitial(
          'effectiveOwnershipDate',
          leg.effectiveOwnershipDate == null
              ? null
              : _dateOnly(leg.effectiveOwnershipDate!),
        );
        _setInitial('sharesTerms', leg.sharesTerms);
      } else if (type == 'Loan') {
        _setInitial('returnRate', leg.returnRate);
        _setInitial('loanTermMonths', leg.termMonths);
        _repaymentModel = leg.repaymentModel ?? 'Monthly';
      } else {
        _setInitial('profitSharePercentage', leg.profitSharePercentage);
        _setInitial('profitTermMonths', leg.termMonths);
        _payoutFrequency = leg.profitSharingPayoutFrequency ?? 'Quarterly';
        _setInitial('exitTerms', leg.exitTerms);
      }
    }
    if (_types.isEmpty) _types.add('Equity');
  }

  void _setInitial(String key, Object? value) {
    if (value != null) _controller(key).text = value.toString();
  }

  String _dateOnly(DateTime value) =>
      '${value.year.toString().padLeft(4, '0')}-${value.month.toString().padLeft(2, '0')}-${value.day.toString().padLeft(2, '0')}';

  TextEditingController _controller(String key) =>
      _controllers.putIfAbsent(key, TextEditingController.new);

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currencies = ref.watch(
      founderOfferCurrenciesProvider(widget.conversationId),
    );
    final language = Localizations.localeOf(context).languageCode;
    final title =
        widget.replacementOfferId == null
            ? context.l10n.makeOffer
            : context.l10n.counterOffer;
    return FractionallySizedBox(
      heightFactor: 0.94,
      child: Material(
        color: Theme.of(context).colorScheme.surface,
        child: SafeArea(
          top: false,
          child: Column(
            children: <Widget>[
              Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  FopxSpacing.pageGutter,
                  FopxSpacing.sm,
                  FopxSpacing.pageGutter,
                  FopxSpacing.xs,
                ),
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              ),
              Expanded(
                child: Form(
                  key: _formKey,
                  child: ListView(
                    padding: const EdgeInsetsDirectional.fromSTEB(
                      FopxSpacing.pageGutter,
                      FopxSpacing.xs,
                      FopxSpacing.pageGutter,
                      FopxSpacing.lg,
                    ),
                    children: <Widget>[
                      currencies.when(
                        loading: () => const FopxLoadingState(height: 64),
                        error:
                            (_, _) => Row(
                              children: <Widget>[
                                Expanded(
                                  child: Text(context.l10n.chatLoadFailedBody),
                                ),
                                TextButton(
                                  onPressed:
                                      () => ref.invalidate(
                                        founderOfferCurrenciesProvider(
                                          widget.conversationId,
                                        ),
                                      ),
                                  child: Text(context.l10n.retry),
                                ),
                              ],
                            ),
                        data: (items) {
                          if (items.isEmpty) {
                            return Text(context.l10n.offerSubmitFailed);
                          }
                          final preferred =
                              _currency ??
                              widget.initialCurrency?.toUpperCase() ??
                              'EGP';
                          final selected =
                              items.any((item) => item.code == preferred)
                                  ? preferred
                                  : items.any((item) => item.code == 'EGP')
                                  ? 'EGP'
                                  : items.first.code;
                          return DropdownButtonFormField<String>(
                            initialValue: selected,
                            decoration: InputDecoration(
                              labelText: context.l10n.offerCurrency,
                            ),
                            items: items
                                .map(
                                  (item) => DropdownMenuItem<String>(
                                    value: item.code,
                                    child: Text(item.label(language)),
                                  ),
                                )
                                .toList(growable: false),
                            onChanged:
                                _submitting
                                    ? null
                                    : (value) =>
                                        setState(() => _currency = value),
                          );
                        },
                      ),
                      const SizedBox(height: FopxSpacing.md),
                      Text(
                        context.l10n.offerType,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: FopxSpacing.xs),
                      Wrap(
                        spacing: FopxSpacing.xs,
                        runSpacing: FopxSpacing.xs,
                        children: <String>['Equity', 'Loan', 'ProfitSharing']
                            .map((type) {
                              final label = switch (type) {
                                'Equity' => context.l10n.equityOffer,
                                'Loan' => context.l10n.loanOffer,
                                _ => context.l10n.profitSharingOffer,
                              };
                              return FilterChip(
                                label: Text(label),
                                selected: _types.contains(type),
                                onSelected:
                                    _submitting
                                        ? null
                                        : (selected) => setState(() {
                                          if (selected) {
                                            _types.add(type);
                                          } else if (_types.length > 1) {
                                            _types.remove(type);
                                          }
                                        }),
                              );
                            })
                            .toList(growable: false),
                      ),
                      for (final type in <String>[
                        'Equity',
                        'Loan',
                        'ProfitSharing',
                      ])
                        if (_types.contains(type)) ...<Widget>[
                          const SizedBox(height: FopxSpacing.md),
                          _legFields(type),
                        ],
                      const SizedBox(height: FopxSpacing.md),
                      TextFormField(
                        controller: _note,
                        maxLength: 1000,
                        maxLines: 2,
                        decoration: InputDecoration(
                          labelText: context.l10n.offerNote,
                          alignLabelWithHint: true,
                        ),
                        enabled: !_submitting,
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(
                  FopxSpacing.pageGutter,
                  FopxSpacing.sm,
                  FopxSpacing.pageGutter,
                  MediaQuery.viewInsetsOf(context).bottom + FopxSpacing.md,
                ),
                child: FopxButton(
                  label:
                      _submitting
                          ? context.l10n.saving
                          : widget.replacementOfferId == null
                          ? context.l10n.sendOffer
                          : context.l10n.counterOffer,
                  icon: Icons.send_rounded,
                  expanded: true,
                  onPressed:
                      _submitting || currencies.valueOrNull?.isEmpty != false
                          ? null
                          : _submit,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _legFields(String type) {
    final l10n = context.l10n;
    final label = switch (type) {
      'Equity' => l10n.equityOffer,
      'Loan' => l10n.loanOffer,
      _ => l10n.profitSharingOffer,
    };
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Text(label, style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: FopxSpacing.xs),
            _numberField('${type}Amount', l10n.offerAmount),
            if (type == 'Equity') ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              DropdownButtonFormField<String>(
                initialValue: _ownershipModel,
                decoration: InputDecoration(labelText: l10n.equityOwnership),
                items: <DropdownMenuItem<String>>[
                  DropdownMenuItem(
                    value: 'PercentageBased',
                    child: Text(l10n.percentageBased),
                  ),
                  DropdownMenuItem(
                    value: 'ShareBased',
                    child: Text(l10n.shareBased),
                  ),
                ],
                onChanged:
                    _submitting
                        ? null
                        : (value) => setState(
                          () => _ownershipModel = value ?? 'PercentageBased',
                        ),
              ),
              const SizedBox(height: FopxSpacing.sm),
              if (_ownershipModel == 'PercentageBased')
                _numberField('equityPercentage', l10n.equityPercent)
              else ...<Widget>[
                _numberField('investorShareCount', l10n.investorShareCount),
                const SizedBox(height: FopxSpacing.sm),
                _numberField('totalIssuedShares', l10n.totalIssuedShares),
              ],
              const SizedBox(height: FopxSpacing.sm),
              TextFormField(
                controller: _controller('shareClass'),
                maxLength: 100,
                decoration: InputDecoration(labelText: l10n.shareClass),
              ),
              const SizedBox(height: FopxSpacing.sm),
              _optionalNumberField('pricePerShare', l10n.pricePerShare),
              const SizedBox(height: FopxSpacing.sm),
              _optionalNumberField('preMoneyValuation', l10n.preMoneyValuation),
              const SizedBox(height: FopxSpacing.sm),
              _optionalNumberField(
                'postMoneyValuation',
                l10n.postMoneyValuation,
              ),
              const SizedBox(height: FopxSpacing.sm),
              TextFormField(
                controller: _controller('effectiveOwnershipDate'),
                keyboardType: TextInputType.datetime,
                decoration: InputDecoration(
                  labelText: l10n.effectiveOwnershipDate,
                  hintText: 'YYYY-MM-DD',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) return null;
                  return DateTime.tryParse(value.trim()) == null
                      ? l10n.invalidDate
                      : null;
                },
              ),
              const SizedBox(height: FopxSpacing.sm),
              TextFormField(
                controller: _controller('sharesTerms'),
                maxLength: 500,
                maxLines: 2,
                decoration: InputDecoration(labelText: l10n.sharesTerms),
              ),
            ],
            if (type == 'Loan') ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              _numberField('returnRate', l10n.returnRate),
              const SizedBox(height: FopxSpacing.sm),
              _numberField('loanTermMonths', l10n.termMonths, whole: true),
              const SizedBox(height: FopxSpacing.sm),
              _canonicalChoice(
                label: l10n.repaymentModel,
                value: _repaymentModel,
                values: const <String>[
                  'Monthly',
                  'Quarterly',
                  'SemiAnnual',
                  'Annual',
                ],
                onChanged: (value) => _repaymentModel = value,
              ),
            ],
            if (type == 'ProfitSharing') ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              _numberField('profitSharePercentage', l10n.profitSharePercentage),
              const SizedBox(height: FopxSpacing.sm),
              _numberField('profitTermMonths', l10n.termMonths, whole: true),
              const SizedBox(height: FopxSpacing.sm),
              _canonicalChoice(
                label: l10n.payoutFrequency,
                value: _payoutFrequency,
                values: const <String>[
                  'Monthly',
                  'Quarterly',
                  'SemiAnnual',
                  'Annual',
                ],
                onChanged: (value) => _payoutFrequency = value,
              ),
              const SizedBox(height: FopxSpacing.sm),
              TextFormField(
                controller: _controller('exitTerms'),
                maxLength: 1000,
                decoration: InputDecoration(labelText: l10n.exitTerms),
                validator:
                    (value) =>
                        value == null || value.trim().isEmpty
                            ? l10n.exitTerms
                            : null,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _numberField(String key, String label, {bool whole = false}) =>
      TextFormField(
        controller: _controller(key),
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(labelText: label),
        validator: (value) {
          final parsed = num.tryParse(value?.trim() ?? '');
          if (parsed == null || parsed <= 0 || (whole && parsed % 1 != 0)) {
            return context.l10n.invalidAmount;
          }
          return null;
        },
      );

  Widget _optionalNumberField(String key, String label) => TextFormField(
    controller: _controller(key),
    keyboardType: const TextInputType.numberWithOptions(decimal: true),
    decoration: InputDecoration(labelText: label),
    validator: (value) {
      if (value == null || value.trim().isEmpty) return null;
      final parsed = num.tryParse(value.trim());
      if (parsed == null || parsed < 0) return context.l10n.invalidAmount;
      return null;
    },
  );

  Widget _canonicalChoice({
    required String label,
    required String value,
    required List<String> values,
    required ValueChanged<String> onChanged,
  }) => DropdownButtonFormField<String>(
    initialValue: value,
    decoration: InputDecoration(labelText: label),
    items: values
        .map((item) => DropdownMenuItem<String>(value: item, child: Text(item)))
        .toList(growable: false),
    onChanged:
        _submitting
            ? null
            : (item) => setState(() => onChanged(item ?? values.first)),
  );

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final currencies =
        ref
            .read(founderOfferCurrenciesProvider(widget.conversationId))
            .valueOrNull;
    if (currencies == null || currencies.isEmpty) return;
    final preferred =
        _currency ?? widget.initialCurrency?.toUpperCase() ?? 'EGP';
    final currency =
        currencies.any((item) => item.code == preferred)
            ? preferred
            : currencies.any((item) => item.code == 'EGP')
            ? 'EGP'
            : currencies.first.code;
    final legs = <Map<String, dynamic>>[];
    for (final type in <String>['Equity', 'Loan', 'ProfitSharing']) {
      if (!_types.contains(type)) continue;
      final amount = num.parse(_controller('${type}Amount').text.trim());
      final leg = <String, dynamic>{'legType': type, 'amount': amount};
      if (type == 'Equity') {
        leg['equityOwnershipModel'] = _ownershipModel;
        if (_ownershipModel == 'PercentageBased') {
          leg['equityPercentage'] = num.parse(
            _controller('equityPercentage').text.trim(),
          );
        } else {
          final investorShares = num.parse(
            _controller('investorShareCount').text.trim(),
          );
          final totalShares = num.parse(
            _controller('totalIssuedShares').text.trim(),
          );
          if (investorShares > totalShares) {
            _showError(context.l10n.offerSubmitFailed);
            return;
          }
          leg['investorShareCount'] = investorShares;
          leg['totalIssuedShares'] = totalShares;
        }
        final shareClass = _controller('shareClass').text.trim();
        if (shareClass.isNotEmpty) leg['shareClass'] = shareClass;
        for (final key in <String>[
          'pricePerShare',
          'preMoneyValuation',
          'postMoneyValuation',
        ]) {
          final value = _controller(key).text.trim();
          if (value.isNotEmpty) leg[key] = num.parse(value);
        }
        final effectiveDate = _controller('effectiveOwnershipDate').text.trim();
        if (effectiveDate.isNotEmpty) {
          leg['effectiveOwnershipDate'] =
              DateTime.parse(effectiveDate).toUtc().toIso8601String();
        }
        final sharesTerms = _controller('sharesTerms').text.trim();
        if (sharesTerms.isNotEmpty) leg['sharesTerms'] = sharesTerms;
      } else if (type == 'Loan') {
        leg['returnRate'] = num.parse(_controller('returnRate').text.trim());
        leg['termMonths'] = int.parse(
          _controller('loanTermMonths').text.trim(),
        );
        leg['repaymentModel'] = _repaymentModel;
      } else {
        leg['profitSharePercentage'] = num.parse(
          _controller('profitSharePercentage').text.trim(),
        );
        leg['termMonths'] = int.parse(
          _controller('profitTermMonths').text.trim(),
        );
        leg['profitSharingPayoutFrequency'] = _payoutFrequency;
        leg['exitTerms'] = _controller('exitTerms').text.trim();
      }
      legs.add(leg);
    }
    setState(() => _submitting = true);
    try {
      final repository = ref.read(founderChatRepositoryProvider);
      final quote =
          widget.replacementOfferId == null
              ? await repository.quoteFirstOffer()
              : await repository.quoteOfferReplacement();
      if (!mounted) return;
      if (!quote.hasSufficientCredit) {
        _showError(context.l10n.insufficientOfferCredit);
        return;
      }
      final cost = _formatCredit(quote.creditCost);
      final balance = _formatCredit(quote.currentBalance);
      final confirmed = await showDialog<bool>(
        context: context,
        builder:
            (dialogContext) => AlertDialog(
              title: Text(
                widget.replacementOfferId == null
                    ? context.l10n.sendOffer
                    : context.l10n.counterOffer,
              ),
              content: Text(context.l10n.offerCostConfirmation(cost, balance)),
              actions: <Widget>[
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext, false),
                  child: Text(context.l10n.cancel),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(dialogContext, true),
                  child: Text(
                    widget.replacementOfferId == null
                        ? context.l10n.sendOffer
                        : context.l10n.counterOffer,
                  ),
                ),
              ],
            ),
      );
      if (confirmed != true || !mounted) return;
      final offerBody = <String, dynamic>{
        'note': _note.text.trim().isEmpty ? null : _note.text.trim(),
        'currency': currency,
        'legs': legs,
      };
      if (widget.replacementOfferId == null) {
        await repository.sendOffer(widget.conversationId, offerBody);
      } else {
        await repository.replaceOffer(
          widget.conversationId,
          widget.replacementOfferId!,
          offerBody,
        );
      }
      ref.invalidate(founderChatOffersProvider(widget.conversationId));
      if (mounted) Navigator.of(context).pop(true);
    } catch (_) {
      if (mounted) _showError(context.l10n.offerSubmitFailed);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showError(String message) => ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(message)));

  String _formatCredit(double value) =>
      value == value.roundToDouble()
          ? value.toInt().toString()
          : value.toStringAsFixed(2);
}
