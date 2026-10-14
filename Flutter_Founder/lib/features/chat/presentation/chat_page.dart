import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import '../../../app/shell/secondary_scaffold.dart';
import '../../deals/data/deals_controller.dart';
import '../../projects/data/project_overview_controller.dart';
import '../data/chat_controller.dart';
import '../data/chat_models.dart';
import 'send_offer_sheet.dart';

class ChatPage extends ConsumerWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(founderConversationsProvider);
    final requestsState = ref.watch(founderConversationRequestsProvider);
    final conversations = state.valueOrNull;
    final requests = (requestsState.valueOrNull ??
            const <FounderConversationRequest>[])
        .where(
          (request) =>
              request.canAccept || request.canReject || request.canWithdraw,
        )
        .toList(growable: false);
    return ListView(
      padding: const EdgeInsetsDirectional.fromSTEB(
        FopxSpacing.pageGutter,
        FopxSpacing.md,
        FopxSpacing.pageGutter,
        FopxSpacing.xl,
      ),
      children: <Widget>[
        Text(
          context.l10n.chat,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: FopxSpacing.sm),
        Text(
          context.l10n.chatSubtitle,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: FopxSpacing.xl),
        if (requests.isNotEmpty) ...<Widget>[
          Text(
            context.l10n.conversationRequests,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: FopxSpacing.sm),
          for (final request in requests) ...<Widget>[
            _ConversationRequestTile(request: request),
            const SizedBox(height: FopxSpacing.sm),
          ],
          const SizedBox(height: FopxSpacing.lg),
        ] else if (requestsState.hasError)
          Padding(
            padding: const EdgeInsets.only(bottom: FopxSpacing.lg),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Text(context.l10n.conversationRequestsLoadFailed),
                ),
                TextButton(
                  onPressed:
                      () => ref.invalidate(founderConversationRequestsProvider),
                  child: Text(context.l10n.retry),
                ),
              ],
            ),
          ),
        if (state.isLoading && conversations == null)
          const FopxLoadingState(height: 220)
        else if (state.hasError && conversations == null)
          FopxErrorState(
            title: context.l10n.chatLoadFailed,
            body: context.l10n.chatLoadFailedBody,
            actionLabel: context.l10n.retry,
            kind: FopxErrorKind.network,
            onAction: () => ref.invalidate(founderConversationsProvider),
          )
        else if ((conversations ?? const <FounderConversation>[]).isEmpty &&
            requests.isEmpty &&
            !requestsState.isLoading)
          FopxEmptyState(
            title: context.l10n.chatEmptyTitle,
            body: context.l10n.chatEmptyBody,
            icon: Icons.forum_outlined,
          )
        else if (conversations?.isNotEmpty == true) ...<Widget>[
          Text(
            context.l10n.conversations,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: FopxSpacing.sm),
          for (final conversation in conversations!) ...<Widget>[
            _ConversationTile(
              conversation: conversation,
              onTap:
                  () => context.push(
                    '/chat/${conversation.id}',
                    extra: conversation,
                  ),
            ),
            const SizedBox(height: FopxSpacing.sm),
          ],
        ] else if (requestsState.isLoading)
          const FopxLoadingState(height: 100),
      ],
    );
  }
}

class _ConversationRequestTile extends ConsumerStatefulWidget {
  const _ConversationRequestTile({required this.request});

  final FounderConversationRequest request;

  @override
  ConsumerState<_ConversationRequestTile> createState() =>
      _ConversationRequestTileState();
}

class _ConversationRequestTileState
    extends ConsumerState<_ConversationRequestTile> {
  bool _busy = false;

  Future<void> _respond({required bool accept, bool withdraw = false}) async {
    final request = widget.request;
    if (!accept) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder:
            (dialogContext) => AlertDialog(
              title: Text(
                withdraw
                    ? context.l10n.withdrawConversationRequest
                    : context.l10n.rejectConversationRequest,
              ),
              content: Text(
                withdraw
                    ? context.l10n.withdrawConversationRequestConfirm
                    : context.l10n.rejectConversationRequestConfirm,
              ),
              actions: <Widget>[
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext, false),
                  child: Text(context.l10n.cancel),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(dialogContext, true),
                  child: Text(
                    withdraw
                        ? context.l10n.withdrawConversationRequest
                        : context.l10n.reject,
                  ),
                ),
              ],
            ),
      );
      if (confirmed != true || !mounted) return;
    }
    setState(() => _busy = true);
    try {
      final repository = ref.read(founderChatRepositoryProvider);
      if (accept) {
        await repository.acceptConversationRequest(request.id);
      } else if (withdraw) {
        await repository.withdrawConversationRequest(request.id);
      } else {
        await repository.rejectConversationRequest(request.id);
      }
      ref.invalidate(founderConversationRequestsProvider);
      ref.invalidate(founderConversationsProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            accept
                ? context.l10n.conversationRequestAccepted
                : withdraw
                ? context.l10n.conversationRequestWithdrawn
                : context.l10n.conversationRequestRejected,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error is ApiError
                ? error.message
                : context.l10n.conversationRequestActionFailed,
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final request = widget.request;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              request.opportunityTitle.isNotEmpty
                  ? request.opportunityTitle
                  : context.l10n.opportunityContext,
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: FopxSpacing.xs),
            Text(request.counterpartyName),
            if (request.message?.isNotEmpty == true) ...<Widget>[
              const SizedBox(height: FopxSpacing.sm),
              Text(request.message!),
            ],
            const SizedBox(height: FopxSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                if (request.canReject)
                  TextButton(
                    onPressed: _busy ? null : () => _respond(accept: false),
                    child: Text(context.l10n.reject),
                  ),
                if (request.canWithdraw)
                  TextButton(
                    onPressed:
                        _busy
                            ? null
                            : () => _respond(accept: false, withdraw: true),
                    child: Text(context.l10n.withdrawConversationRequest),
                  ),
                if (request.canAccept) ...<Widget>[
                  const SizedBox(width: FopxSpacing.sm),
                  FilledButton(
                    onPressed: _busy ? null : () => _respond(accept: true),
                    child:
                        _busy
                            ? const SizedBox.square(
                              dimension: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                            : Text(context.l10n.acceptConversationRequest),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ConversationTile extends StatelessWidget {
  const _ConversationTile({required this.conversation, required this.onTap});

  final FounderConversation conversation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title =
        conversation.opportunityTitle.isNotEmpty
            ? conversation.opportunityTitle
            : conversation.counterpartyName;
    final detail = <String>[
      conversation.counterpartyName,
      conversation.status,
    ].where((value) => value.isNotEmpty).join(' · ');
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          child: Text(
            conversation.counterpartyName.isEmpty
                ? '•'
                : conversation.counterpartyName.characters.first.toUpperCase(),
          ),
        ),
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(detail, maxLines: 1, overflow: TextOverflow.ellipsis),
        trailing:
            conversation.unreadCount > 0
                ? CircleAvatar(
                  radius: 14,
                  backgroundColor: theme.colorScheme.primary,
                  child: Text(
                    conversation.unreadCount.toString(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onPrimary,
                    ),
                  ),
                )
                : const Icon(Icons.chevron_right_rounded),
      ),
    );
  }
}

class ConversationPage extends ConsumerStatefulWidget {
  const ConversationPage({required this.conversation, super.key});

  final FounderConversation conversation;

  @override
  ConsumerState<ConversationPage> createState() => _ConversationPageState();
}

class _ConversationPageState extends ConsumerState<ConversationPage> {
  final _messageController = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _markMessagesRead());
  }

  Future<void> _markMessagesRead() async {
    final id = widget.conversation.id;
    try {
      await ref.read(founderConversationProvider(id).future);
      await ref.read(founderChatRepositoryProvider).markMessagesRead(id);
      ref.invalidate(founderConversationsProvider);
    } catch (_) {
      // Keep the conversation view usable if reading receipts are unavailable.
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = founderChatMessagesProvider(widget.conversation.id);
    final conversationState = ref.watch(
      founderConversationProvider(widget.conversation.id),
    );
    final conversation = conversationState.valueOrNull ?? widget.conversation;
    final canInteract =
        conversation.isVisibleToCurrentUser && !conversation.isClosed;
    final messagesState = ref.watch(provider);
    final offersState = ref.watch(
      founderChatOffersProvider(widget.conversation.id),
    );
    final title =
        conversation.counterpartyName.isNotEmpty
            ? conversation.counterpartyName
            : conversation.opportunityTitle;
    return FopxSecondaryScaffold(
      title: title,
      subtitle: conversation.opportunityTitle,
      child: Column(
        children: <Widget>[
          if (!conversation.isVisibleToCurrentUser)
            Padding(
              padding: const EdgeInsets.all(FopxSpacing.md),
              child: Text(context.l10n.conversationNotVisible),
            )
          else ...<Widget>[
            _ConversationReadiness(conversation: conversation),
            Padding(
              padding: const EdgeInsetsDirectional.only(
                start: FopxSpacing.pageGutter,
                end: FopxSpacing.pageGutter,
                top: FopxSpacing.xs,
              ),
              child: Wrap(
                spacing: FopxSpacing.sm,
                runSpacing: FopxSpacing.xs,
                children: <Widget>[
                  if (canInteract && !conversation.currentUserReady)
                    OutlinedButton.icon(
                      onPressed: _markReady,
                      icon: const Icon(Icons.check_circle_outline),
                      label: Text(context.l10n.readyToProceed),
                    ),
                  if (canInteract)
                    TextButton.icon(
                      onPressed: _closeConversation,
                      icon: const Icon(Icons.archive_outlined),
                      label: Text(context.l10n.closeConversation),
                    ),
                  if (conversation.isClosed)
                    Text(context.l10n.conversationClosed),
                ],
              ),
            ),
          ],
          if (offersState.valueOrNull?.any(
                    (offer) => offer.status.toLowerCase() == 'pending',
                  ) !=
                  true &&
              canInteract)
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: Padding(
                padding: const EdgeInsetsDirectional.only(
                  start: FopxSpacing.pageGutter,
                  end: FopxSpacing.pageGutter,
                  top: FopxSpacing.sm,
                ),
                child: OutlinedButton.icon(
                  onPressed: _makeOffer,
                  icon: const Icon(Icons.handshake_outlined),
                  label: Text(context.l10n.makeOffer),
                ),
              ),
            ),
          _ConversationOffers(
            conversation: conversation,
            offersState: offersState,
          ),
          const SizedBox(height: FopxSpacing.sm),
          Expanded(
            child: messagesState.when(
              loading: () => const FopxLoadingState(height: 220),
              error:
                  (_, _) => FopxErrorState(
                    title: context.l10n.chatLoadFailed,
                    body: context.l10n.chatLoadFailedBody,
                    actionLabel: context.l10n.retry,
                    kind: FopxErrorKind.network,
                    onAction: () => ref.invalidate(provider),
                  ),
              data:
                  (messages) =>
                      messages.isEmpty
                          ? FopxEmptyState(
                            title: context.l10n.chatNoMessages,
                            body: context.l10n.chatNoMessagesBody,
                            icon: Icons.chat_bubble_outline_rounded,
                          )
                          : RefreshIndicator(
                            onRefresh: () => ref.refresh(provider.future),
                            child: ListView.builder(
                              reverse: true,
                              physics: const AlwaysScrollableScrollPhysics(),
                              itemCount: messages.length,
                              itemBuilder: (context, index) {
                                final message =
                                    messages[messages.length - index - 1];
                                return _MessageBubble(message: message);
                              },
                            ),
                          ),
            ),
          ),
          if (conversation.isVisibleToCurrentUser)
            const SizedBox(height: FopxSpacing.md),
          if (canInteract)
            SafeArea(
              top: false,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      minLines: 1,
                      maxLines: 4,
                      maxLength: 4000,
                      decoration: InputDecoration(
                        hintText: context.l10n.chatMessageHint,
                        counterText: '',
                        border: const OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: FopxSpacing.sm),
                  IconButton.filled(
                    tooltip: context.l10n.chatSend,
                    onPressed: _sending ? null : _send,
                    icon:
                        _sending
                            ? const SizedBox.square(
                              dimension: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                            : const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _send() async {
    final conversation =
        ref
            .read(founderConversationProvider(widget.conversation.id))
            .valueOrNull ??
        widget.conversation;
    if (!conversation.isVisibleToCurrentUser || conversation.isClosed) return;
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref
          .read(founderChatRepositoryProvider)
          .sendMessage(widget.conversation.id, text);
      _messageController.clear();
      ref.invalidate(founderChatMessagesProvider(widget.conversation.id));
      ref.invalidate(founderConversationsProvider);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(context.l10n.chatSendFailed)));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _makeOffer() async {
    final conversation =
        ref
            .read(founderConversationProvider(widget.conversation.id))
            .valueOrNull ??
        widget.conversation;
    if (!conversation.isVisibleToCurrentUser || conversation.isClosed) return;
    final currentOffers =
        ref.read(founderChatOffersProvider(widget.conversation.id)).valueOrNull;
    final sent = await showSendOfferSheet(
      context,
      conversationId: widget.conversation.id,
      initialCurrency:
          currentOffers == null || currentOffers.isEmpty
              ? null
              : currentOffers.first.currency,
    );
    if (!mounted || sent != true) return;
    ref.invalidate(founderChatOffersProvider(widget.conversation.id));
    ref.invalidate(founderConversationsProvider);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.offerSent)));
  }

  Future<void> _markReady() async {
    try {
      await ref
          .read(founderChatRepositoryProvider)
          .markReadyToProceed(widget.conversation.id);
      ref.invalidate(founderConversationProvider(widget.conversation.id));
      ref.invalidate(founderConversationsProvider);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.conversationActionFailed)),
        );
      }
    }
  }

  Future<void> _closeConversation() async {
    final reasonController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(context.l10n.closeConversation),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(context.l10n.closeConversationConfirm),
                const SizedBox(height: FopxSpacing.md),
                TextField(
                  controller: reasonController,
                  maxLength: 500,
                  decoration: InputDecoration(
                    labelText: context.l10n.closeReasonOptional,
                  ),
                ),
              ],
            ),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(context.l10n.cancel),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(context.l10n.closeConversation),
              ),
            ],
          ),
    );
    if (confirmed != true) {
      reasonController.dispose();
      return;
    }
    try {
      await ref
          .read(founderChatRepositoryProvider)
          .closeConversation(
            widget.conversation.id,
            reasonController.text.trim().isEmpty
                ? null
                : reasonController.text.trim(),
          );
      ref.invalidate(founderConversationProvider(widget.conversation.id));
      ref.invalidate(founderConversationsProvider);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.conversationActionFailed)),
        );
      }
    } finally {
      reasonController.dispose();
    }
  }
}

class _ConversationReadiness extends StatelessWidget {
  const _ConversationReadiness({required this.conversation});

  final FounderConversation conversation;

  @override
  Widget build(BuildContext context) {
    if (conversation.isClosed || !conversation.isVisibleToCurrentUser) {
      return const SizedBox.shrink();
    }
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(
        FopxSpacing.pageGutter,
        FopxSpacing.sm,
        FopxSpacing.pageGutter,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            '${context.l10n.founderReady}: ${conversation.founderReady ? context.l10n.yes : context.l10n.no} · '
            '${context.l10n.investorReady}: ${conversation.investorReady ? context.l10n.yes : context.l10n.no}',
            style: theme.textTheme.bodySmall,
          ),
          if (conversation.canContinue || conversation.projectRoomUnlocked)
            Padding(
              padding: const EdgeInsets.only(top: FopxSpacing.xs),
              child: Text(
                conversation.projectRoomUnlocked
                    ? context.l10n.projectRoomUnlocked
                    : context.l10n.canContinueNegotiation,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ConversationOffers extends ConsumerWidget {
  const _ConversationOffers({
    required this.conversation,
    required this.offersState,
  });

  final FounderConversation conversation;
  final AsyncValue<List<FounderNegotiationOffer>> offersState;

  @override
  Widget build(BuildContext context, WidgetRef ref) => offersState.when(
    loading: () => const SizedBox.shrink(),
    error:
        (_, _) => Padding(
          padding: const EdgeInsets.symmetric(vertical: FopxSpacing.xs),
          child: Row(
            children: <Widget>[
              Expanded(child: Text(context.l10n.chatLoadFailedBody)),
              TextButton(
                onPressed:
                    () => ref.invalidate(
                      founderChatOffersProvider(conversation.id),
                    ),
                child: Text(context.l10n.retry),
              ),
            ],
          ),
        ),
    data: (offers) {
      if (offers.isEmpty) return const SizedBox.shrink();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Align(
            alignment: AlignmentDirectional.centerStart,
            child: Text(
              context.l10n.negotiationOffers,
              style: Theme.of(context).textTheme.titleSmall,
            ),
          ),
          const SizedBox(height: FopxSpacing.xs),
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 230),
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: offers.length,
              separatorBuilder:
                  (_, _) => const SizedBox(height: FopxSpacing.xs),
              itemBuilder:
                  (context, index) => _NegotiationOfferCard(
                    conversation: conversation,
                    offer: offers[index],
                  ),
            ),
          ),
          const SizedBox(height: FopxSpacing.sm),
        ],
      );
    },
  );
}

class _NegotiationOfferCard extends ConsumerStatefulWidget {
  const _NegotiationOfferCard({
    required this.conversation,
    required this.offer,
  });

  final FounderConversation conversation;
  final FounderNegotiationOffer offer;

  @override
  ConsumerState<_NegotiationOfferCard> createState() =>
      _NegotiationOfferCardState();
}

class _NegotiationOfferCardState extends ConsumerState<_NegotiationOfferCard> {
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
    if (confirmed != true) return;

    setState(() => _busy = true);
    try {
      final repository = ref.read(founderChatRepositoryProvider);
      if (accept) {
        await repository.acceptOffer(widget.conversation.id, widget.offer.id);
      } else {
        await repository.rejectOffer(widget.conversation.id, widget.offer.id);
      }
      if (!mounted) return;
      ref.invalidate(founderChatOffersProvider(widget.conversation.id));
      ref.invalidate(founderConversationsProvider);
      if (accept) {
        ref.invalidate(founderDealsProvider);
        ref.invalidate(
          projectOverviewProvider(widget.conversation.opportunityId),
        );
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(accept ? l10n.offerAccepted : l10n.offerRejected),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.offerActionFailed)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _counterOffer() async {
    final result = await showSendOfferSheet(
      context,
      conversationId: widget.conversation.id,
      initialCurrency: widget.offer.currency,
      replacementOfferId: widget.offer.id,
      initialOffer: widget.offer,
    );
    if (!mounted || result != true) return;
    ref.invalidate(founderChatOffersProvider(widget.conversation.id));
    ref.invalidate(founderConversationsProvider);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.l10n.offerReplaced)));
  }

  Future<void> _withdrawOffer() async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(l10n.withdrawOffer),
            content: Text(l10n.withdrawOfferConfirm),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(l10n.cancel),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: Text(l10n.withdrawOffer),
              ),
            ],
          ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref
          .read(founderChatRepositoryProvider)
          .withdrawOffer(widget.conversation.id, widget.offer.id);
      if (!mounted) return;
      ref.invalidate(founderChatOffersProvider(widget.conversation.id));
      ref.invalidate(founderConversationsProvider);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.offerWithdrawn)));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.offerActionFailed)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final offer = widget.offer;
    final theme = Theme.of(context);
    final locale = Localizations.localeOf(context).toLanguageTag();
    final total = offer.legs.fold<double>(0, (sum, leg) => sum + leg.amount);
    String number(double value) => FopxFormatters.number(value, locale: locale);
    final status = switch (offer.status.toLowerCase()) {
      'pending' => context.l10n.pending,
      'accepted' => context.l10n.requestApprovedStatus,
      'rejected' => context.l10n.requestRejectedStatus,
      'withdrawn' => context.l10n.requestCancelledStatus,
      _ => offer.status,
    };
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    '${context.l10n.offerFrom} ${offer.createdByName}'
                    '${offer.createdByRole.isEmpty ? '' : ' · ${offer.createdByRole.toLowerCase() == 'founder'
                            ? context.l10n.founder
                            : offer.createdByRole.toLowerCase() == 'investor'
                            ? context.l10n.investor
                            : offer.createdByRole}'}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelLarge,
                  ),
                ),
                FopxStatusBadge(label: status),
              ],
            ),
            Text(
              '${context.l10n.offerVersion} ${offer.version}'
              '${offer.createdAt == null ? '' : ' · ${FopxFormatters.date(offer.createdAt!, locale: locale)}'}',
            ),
            if (offer.replacesOfferId != null)
              Text(
                '${context.l10n.offerReplacesVersion} ${offer.replacesOfferId}',
                style: theme.textTheme.bodySmall,
              ),
            for (final leg in offer.legs) ...<Widget>[
              const SizedBox(height: FopxSpacing.xs),
              Text(
                '${switch (leg.type.toLowerCase()) {
                  'equity' => context.l10n.equityOffer,
                  'loan' => context.l10n.loanOffer,
                  'profitsharing' => context.l10n.profitSharingOffer,
                  _ => leg.type,
                }} · ${context.l10n.offerAmount}: ${number(leg.amount)} ${offer.currency}',
                style: theme.textTheme.labelLarge,
              ),
              if (leg.type.toLowerCase() == 'equity') ...<Widget>[
                if (leg.equityOwnershipModel != null)
                  Text(
                    '${context.l10n.equityOwnership}: ${switch (leg.equityOwnershipModel) {
                      'PercentageBased' => context.l10n.percentageBased,
                      'ShareBased' => context.l10n.shareBased,
                      _ => leg.equityOwnershipModel!,
                    }}',
                  ),
                if (leg.equityPercentage != null)
                  Text(
                    '${context.l10n.equityPercent}: ${number(leg.equityPercentage!)}%',
                  ),
                if (leg.investorShareCount != null)
                  Text(
                    '${context.l10n.investorShareCount}: ${number(leg.investorShareCount!)}',
                  ),
                if (leg.totalIssuedShares != null)
                  Text(
                    '${context.l10n.totalIssuedShares}: ${number(leg.totalIssuedShares!)}',
                  ),
                if (leg.shareClass != null)
                  Text('${context.l10n.shareClass}: ${leg.shareClass}'),
                if (leg.pricePerShare != null)
                  Text(
                    '${context.l10n.pricePerShare}: ${number(leg.pricePerShare!)} ${offer.currency}',
                  ),
                if (leg.preMoneyValuation != null)
                  Text(
                    '${context.l10n.preMoneyValuation}: ${number(leg.preMoneyValuation!)} ${offer.currency}',
                  ),
                if (leg.postMoneyValuation != null)
                  Text(
                    '${context.l10n.postMoneyValuation}: ${number(leg.postMoneyValuation!)} ${offer.currency}',
                  ),
                if (leg.effectiveOwnershipDate != null)
                  Text(
                    '${context.l10n.effectiveOwnershipDate}: ${FopxFormatters.date(leg.effectiveOwnershipDate!, locale: locale)}',
                  ),
                if (leg.sharesTerms != null)
                  Text('${context.l10n.sharesTerms}: ${leg.sharesTerms}'),
              ],
              if (leg.type.toLowerCase() == 'loan') ...<Widget>[
                if (leg.returnRate != null)
                  Text(
                    '${context.l10n.returnRate}: ${number(leg.returnRate!)}%',
                  ),
                if (leg.termMonths != null)
                  Text('${context.l10n.termMonths}: ${leg.termMonths}'),
                if (leg.repaymentModel != null)
                  Text('${context.l10n.repaymentModel}: ${leg.repaymentModel}'),
              ],
              if (leg.type.toLowerCase() == 'profitsharing') ...<Widget>[
                if (leg.profitSharePercentage != null)
                  Text(
                    '${context.l10n.profitSharePercentage}: ${number(leg.profitSharePercentage!)}%',
                  ),
                if (leg.termMonths != null)
                  Text('${context.l10n.termMonths}: ${leg.termMonths}'),
                if (leg.profitSharingPayoutFrequency != null)
                  Text(
                    '${context.l10n.payoutFrequency}: ${leg.profitSharingPayoutFrequency}',
                  ),
                if (leg.exitTerms != null)
                  Text('${context.l10n.exitTerms}: ${leg.exitTerms}'),
              ],
            ],
            if (offer.legs.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: FopxSpacing.xs),
                child: Text(
                  '${context.l10n.totalOfferAmount}: ${number(total)} ${offer.currency}',
                  style: theme.textTheme.labelLarge,
                ),
              ),
            if (offer.note.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: FopxSpacing.xs),
                child: Text(
                  offer.note,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            if (_busy)
              const Padding(
                padding: EdgeInsets.only(top: FopxSpacing.xs),
                child: LinearProgressIndicator(),
              )
            else if (offer.canAccept ||
                offer.canReject ||
                offer.canRespond ||
                offer.canWithdraw)
              Wrap(
                spacing: FopxSpacing.xs,
                children: <Widget>[
                  if (offer.canRespond)
                    TextButton(
                      onPressed: _counterOffer,
                      child: Text(context.l10n.counterOffer),
                    ),
                  if (offer.canAccept)
                    TextButton(
                      onPressed: () => _respond(accept: true),
                      child: Text(context.l10n.acceptOffer),
                    ),
                  if (offer.canReject)
                    TextButton(
                      onPressed: () => _respond(accept: false),
                      child: Text(context.l10n.rejectOffer),
                    ),
                  if (offer.canWithdraw)
                    TextButton(
                      onPressed: _withdrawOffer,
                      child: Text(context.l10n.withdrawOffer),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final FounderChatMessage message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Align(
      alignment: AlignmentDirectional.centerStart,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        margin: const EdgeInsets.symmetric(vertical: FopxSpacing.xs),
        padding: const EdgeInsets.all(FopxSpacing.md),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(FopxRadii.surface),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            if (message.senderName.isNotEmpty)
              Text(
                message.senderName,
                style: Theme.of(context).textTheme.labelSmall,
              ),
            Text(
              message.isDeleted
                  ? context.l10n.chatMessageRemoved
                  : message.message,
            ),
          ],
        ),
      ),
    );
  }
}
