import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../../app/shell/secondary_scaffold.dart';
import '../data/join_requests_controller.dart';

class OpportunityRequestsPage extends ConsumerWidget {
  const OpportunityRequestsPage({
    required this.opportunityId,
    required this.title,
    super.key,
  });

  final int opportunityId;
  final String title;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final provider = founderJoinRequestsProvider(opportunityId);
    final state = ref.watch(provider);
    return FopxSecondaryScaffold(
      title: context.l10n.investorRequests,
      subtitle: title,
      child: state.when(
        loading: () => const FopxLoadingState(height: 220),
        error:
            (_, _) => FopxErrorState(
              title: context.l10n.requestsLoadFailed,
              body: context.l10n.dealsLoadFailedBody,
              actionLabel: context.l10n.retry,
              kind: FopxErrorKind.network,
              onAction: () => ref.invalidate(provider),
            ),
        data:
            (requests) =>
                requests.isEmpty
                    ? FopxEmptyState(
                      title: context.l10n.noInvestorRequests,
                      body: context.l10n.noInvestorRequestsBody,
                      icon: Icons.inbox_outlined,
                    )
                    : RefreshIndicator(
                      onRefresh: () => ref.refresh(provider.future),
                      child: ListView.separated(
                        physics: const AlwaysScrollableScrollPhysics(),
                        itemCount: requests.length,
                        separatorBuilder:
                            (_, _) => const SizedBox(height: FopxSpacing.sm),
                        itemBuilder:
                            (context, index) => _RequestCard(
                              request: requests[index],
                              onChanged: () => ref.invalidate(provider),
                            ),
                      ),
                    ),
      ),
    );
  }
}

class _RequestCard extends ConsumerStatefulWidget {
  const _RequestCard({required this.request, required this.onChanged});

  final FounderJoinRequest request;
  final VoidCallback onChanged;

  @override
  ConsumerState<_RequestCard> createState() => _RequestCardState();
}

class _RequestCardState extends ConsumerState<_RequestCard> {
  bool _busy = false;

  Future<void> _review({required bool approve}) async {
    final l10n = context.l10n;
    String? reason;
    if (!approve) {
      reason = await showDialog<String>(
        context: context,
        builder: (context) => _RejectReasonDialog(),
      );
      if (reason == null || reason.trim().isEmpty) return;
    } else {
      final confirmed = await showDialog<bool>(
        context: context,
        builder:
            (context) => AlertDialog(
              title: Text(l10n.approveJoinRequest),
              content: Text(l10n.approveJoinRequestConfirm),
              actions: <Widget>[
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: Text(l10n.cancel),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: Text(l10n.approve),
                ),
              ],
            ),
      );
      if (confirmed != true) return;
    }

    setState(() => _busy = true);
    try {
      final repository = ref.read(founderJoinRequestsRepositoryProvider);
      if (approve) {
        await repository.approve(widget.request.id);
      } else {
        await repository.reject(widget.request.id, reason!);
      }
      if (!mounted) return;
      widget.onChanged();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            approve ? l10n.joinRequestApproved : l10n.joinRequestRejected,
          ),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.joinRequestReviewFailed)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final request = widget.request;
    final theme = Theme.of(context);
    final locale = Localizations.localeOf(context).toLanguageTag();
    final status = switch (request.status.toLowerCase()) {
      'pending' => context.l10n.pending,
      'approved' => context.l10n.requestApprovedStatus,
      'rejected' => context.l10n.requestRejectedStatus,
      'cancelled' => context.l10n.requestCancelledStatus,
      _ => request.status,
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
                    request.investorName.isEmpty
                        ? context.l10n.investor
                        : request.investorName,
                    style: theme.textTheme.titleMedium,
                  ),
                ),
                FopxStatusBadge(label: status),
              ],
            ),
            const SizedBox(height: FopxSpacing.sm),
            if (request.requestType.isNotEmpty)
              Text('${context.l10n.requestType}: ${request.requestType}'),
            if (request.amount != null &&
                request.currency.isNotEmpty) ...<Widget>[
              const SizedBox(height: FopxSpacing.xs),
              Text(
                FopxFormatters.formatCurrency(
                  request.amount,
                  currencyCode: request.currency,
                  locale: locale,
                ),
                style: theme.textTheme.titleSmall,
              ),
            ],
            if (request.message.isNotEmpty) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              Text(request.message),
            ],
            if (request.createdAt != null) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              Text(
                '${context.l10n.created}: ${FopxFormatters.date(request.createdAt!, locale: locale)}',
                style: theme.textTheme.bodySmall,
              ),
            ],
            if ((request.canApprove || request.canReject) &&
                !_busy) ...<Widget>[
              const SizedBox(height: FopxSpacing.md),
              Wrap(
                spacing: FopxSpacing.sm,
                runSpacing: FopxSpacing.sm,
                children: <Widget>[
                  if (request.canApprove)
                    FilledButton.icon(
                      onPressed: () => _review(approve: true),
                      icon: const Icon(Icons.check_rounded),
                      label: Text(context.l10n.approve),
                    ),
                  if (request.canReject)
                    OutlinedButton.icon(
                      onPressed: () => _review(approve: false),
                      icon: const Icon(Icons.close_rounded),
                      label: Text(context.l10n.reject),
                    ),
                ],
              ),
            ] else if (_busy)
              const Padding(
                padding: EdgeInsets.only(top: FopxSpacing.md),
                child: LinearProgressIndicator(),
              ),
          ],
        ),
      ),
    );
  }
}

class _RejectReasonDialog extends StatefulWidget {
  @override
  State<_RejectReasonDialog> createState() => _RejectReasonDialogState();
}

class _RejectReasonDialogState extends State<_RejectReasonDialog> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(context.l10n.rejectJoinRequest),
      content: TextField(
        controller: _controller,
        autofocus: true,
        maxLines: 4,
        maxLength: 1000,
        decoration: InputDecoration(
          hintText: context.l10n.rejectionReasonHint,
          border: const OutlineInputBorder(),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(context.l10n.cancel),
        ),
        FilledButton(
          onPressed: () {
            if (_controller.text.trim().isNotEmpty) {
              Navigator.pop(context, _controller.text.trim());
            }
          },
          child: Text(context.l10n.reject),
        ),
      ],
    );
  }
}
