import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../data/deals_controller.dart';
import '../data/founder_deals.dart';

class DealsPage extends ConsumerWidget {
  const DealsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(founderDealsProvider);
    final deals = state.valueOrNull;
    return ListView(
      padding: const EdgeInsetsDirectional.fromSTEB(
        FopxSpacing.pageGutter,
        FopxSpacing.md,
        FopxSpacing.pageGutter,
        FopxSpacing.xl,
      ),
      children: <Widget>[
        Text(
          context.l10n.deals,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: FopxSpacing.sm),
        Text(
          context.l10n.dealsSubtitle,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: FopxSpacing.xl),
        if (state.isLoading && deals == null)
          const FopxLoadingState(height: 220)
        else if (state.hasError && deals == null)
          FopxErrorState(
            title: context.l10n.dealsLoadFailed,
            body: context.l10n.dealsLoadFailedBody,
            actionLabel: context.l10n.retry,
            kind: FopxErrorKind.network,
            onAction: () => ref.invalidate(founderDealsProvider),
          )
        else if ((deals ?? const <FounderDeal>[]).isEmpty)
          FopxEmptyState(
            title: context.l10n.dealsEmptyTitle,
            body: context.l10n.dealsEmptyBody,
            icon: Icons.handshake_outlined,
          )
        else
          for (final deal in deals!) ...<Widget>[
            _DealCard(
              deal: deal,
              onTap:
                  deal.participationRequestId <= 0
                      ? null
                      : () => context.push(
                        '/deals/${deal.opportunityId}/participations/${deal.participationRequestId}',
                        extra: deal,
                      ),
            ),
            const SizedBox(height: FopxSpacing.md),
          ],
      ],
    );
  }
}

class _DealCard extends StatelessWidget {
  const _DealCard({required this.deal, required this.onTap});

  final FounderDeal deal;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context).toLanguageTag();
    final detail =
        deal.contractNumber.isNotEmpty
            ? '${context.l10n.contractNumber} ${deal.contractNumber}'
            : deal.status;
    final amount =
        deal.amount != null && deal.currency.isNotEmpty
            ? FopxFormatters.formatCurrency(
              deal.amount,
              currencyCode: deal.currency,
              locale: locale,
            )
            : null;
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(FopxSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      deal.opportunityTitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  Icon(
                    Icons.handshake_outlined,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ],
              ),
              const SizedBox(height: FopxSpacing.xs),
              Text('${context.l10n.investor}: ${deal.investorName}'),
              const SizedBox(height: FopxSpacing.sm),
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      detail,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (deal.contractStatus.isNotEmpty)
                    FopxStatusBadge(label: deal.contractStatus),
                ],
              ),
              if (amount != null) ...<Widget>[
                const SizedBox(height: FopxSpacing.md),
                Text(amount, style: Theme.of(context).textTheme.titleLarge),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
