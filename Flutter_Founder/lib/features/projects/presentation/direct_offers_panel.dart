import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../chat/data/chat_controller.dart';
import '../../chat/data/chat_models.dart';
import '../../deals/data/deals_controller.dart';
import '../data/project_overview_controller.dart';
import '../data/projects_controller.dart';

class FounderDirectOffersPanel extends ConsumerWidget {
  const FounderDirectOffersPanel({required this.opportunityId, super.key});

  final int opportunityId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(founderDirectOffersProvider(opportunityId));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          context.l10n.negotiationOffers,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: FopxSpacing.sm),
        state.when(
          loading: () => const SizedBox(height: 24),
          error:
              (_, _) => Row(
                children: <Widget>[
                  Expanded(child: Text(context.l10n.chatLoadFailedBody)),
                  TextButton(
                    onPressed:
                        () => ref.invalidate(
                          founderDirectOffersProvider(opportunityId),
                        ),
                    child: Text(context.l10n.retry),
                  ),
                ],
              ),
          data: (offers) {
            if (offers.isEmpty) {
              return Text(
                context.l10n.noDirectOffers,
                style: Theme.of(context).textTheme.bodyMedium,
              );
            }
            return Column(
              children: <Widget>[
                for (final offer in offers) ...<Widget>[
                  _DirectOfferCard(opportunityId: opportunityId, offer: offer),
                  const SizedBox(height: FopxSpacing.sm),
                ],
              ],
            );
          },
        ),
      ],
    );
  }
}

class _DirectOfferCard extends ConsumerStatefulWidget {
  const _DirectOfferCard({required this.opportunityId, required this.offer});

  final int opportunityId;
  final FounderNegotiationOffer offer;

  @override
  ConsumerState<_DirectOfferCard> createState() => _DirectOfferCardState();
}

class _DirectOfferCardState extends ConsumerState<_DirectOfferCard> {
  bool _busy = false;

  Future<void> _respond({required bool accept}) async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(accept ? l10n.acceptOffer : l10n.rejectOffer),
            content: Text(
              accept ? l10n.acceptOfferConfirm : l10n.rejectOfferConfirm,
            ),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(l10n.cancel),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(accept ? l10n.acceptOffer : l10n.rejectOffer),
              ),
            ],
          ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _busy = true);
    try {
      final repository = ref.read(founderChatRepositoryProvider);
      if (accept) {
        await repository.acceptDirectOffer(
          widget.opportunityId,
          widget.offer.id,
        );
      } else {
        await repository.rejectDirectOffer(
          widget.opportunityId,
          widget.offer.id,
        );
      }
      ref.invalidate(founderDirectOffersProvider(widget.opportunityId));
      ref.invalidate(founderDealsProvider);
      ref.invalidate(projectOpportunityProvider(widget.opportunityId));
      ref.invalidate(projectsControllerProvider);
      ref.invalidate(founderConversationsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(accept ? l10n.offerAccepted : l10n.offerRejected),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.offerActionFailed)));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final offer = widget.offer;
    final locale = Localizations.localeOf(context).toLanguageTag();
    final theme = Theme.of(context);
    final total = offer.legs.fold<double>(0, (sum, leg) => sum + leg.amount);
    String number(double value) => FopxFormatters.number(value, locale: locale);

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
                    offer.createdByName,
                    style: theme.textTheme.titleSmall,
                  ),
                ),
                FopxStatusBadge(label: offer.status),
              ],
            ),
            Text('${context.l10n.offerVersion} ${offer.version}'),
            for (final leg in offer.legs) ...<Widget>[
              const SizedBox(height: FopxSpacing.xs),
              Text(
                '${_legLabel(context, leg.type)} · ${context.l10n.offerAmount}: ${number(leg.amount)} ${offer.currency}',
                style: theme.textTheme.labelLarge,
              ),
              if (leg.equityPercentage != null)
                Text(
                  '${context.l10n.equityPercent}: ${number(leg.equityPercentage!)}%',
                ),
              if (leg.investorShareCount != null)
                Text(
                  '${context.l10n.investorShareCount}: ${number(leg.investorShareCount!)} / ${number(leg.totalIssuedShares ?? 0)}',
                ),
              if (leg.returnRate != null)
                Text('${context.l10n.returnRate}: ${number(leg.returnRate!)}%'),
              if (leg.termMonths != null)
                Text('${context.l10n.termMonths}: ${leg.termMonths}'),
              if (leg.repaymentModel != null)
                Text('${context.l10n.repaymentModel}: ${leg.repaymentModel}'),
              if (leg.profitSharePercentage != null)
                Text(
                  '${context.l10n.profitSharePercentage}: ${number(leg.profitSharePercentage!)}%',
                ),
              if (leg.profitSharingPayoutFrequency != null)
                Text(
                  '${context.l10n.payoutFrequency}: ${leg.profitSharingPayoutFrequency}',
                ),
              if (leg.exitTerms?.isNotEmpty == true) Text(leg.exitTerms!),
            ],
            if (offer.legs.isNotEmpty) ...<Widget>[
              const SizedBox(height: FopxSpacing.xs),
              Text(
                '${context.l10n.totalOfferAmount}: ${number(total)} ${offer.currency}',
                style: theme.textTheme.labelLarge,
              ),
            ],
            if (offer.note.isNotEmpty) ...<Widget>[
              const SizedBox(height: FopxSpacing.xs),
              Text(offer.note),
            ],
            if (_busy)
              const Padding(
                padding: EdgeInsets.only(top: FopxSpacing.sm),
                child: LinearProgressIndicator(),
              )
            else if (offer.canAccept || offer.canReject)
              Wrap(
                spacing: FopxSpacing.xs,
                children: <Widget>[
                  if (offer.canReject)
                    TextButton(
                      onPressed: () => _respond(accept: false),
                      child: Text(context.l10n.rejectOffer),
                    ),
                  if (offer.canAccept)
                    FilledButton(
                      onPressed: () => _respond(accept: true),
                      child: Text(context.l10n.acceptOffer),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  String _legLabel(BuildContext context, String type) => switch (type
      .toLowerCase()) {
    'equity' => context.l10n.equityOffer,
    'loan' => context.l10n.loanOffer,
    'profitsharing' => context.l10n.profitSharingOffer,
    _ => type,
  };
}
