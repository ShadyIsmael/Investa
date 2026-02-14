import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_background.dart';
import '../widgets/request_summary_row.dart';
import 'profile_screen.dart';
import '../services/requests_service.dart';

// UI/UX improvements (Jan 2026):
// - Moved search into the AppBar for quicker access
// - Replaced summary chips with a compact `RequestSummaryRow` widget
// - Restyled request cards: colored stripe (income/outcome), prominent amount,
//   and visible Accept/Decline/Cancel action buttons for pending requests
// - Added widget test for `RequestSummaryRow` and minor visual polishing

import '../services/messages.dart';

class RequestsScreen extends StatefulWidget {
  final Function(int)? onPendingCountChanged;

  const RequestsScreen({Key? key, this.onPendingCountChanged})
      : super(key: key);

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  final RequestsService _service = RequestsService();

  List<RequestItem> _income = [];
  List<RequestItem> _outcome = [];
  bool _loadingIncome = true;
  bool _loadingOutcome = true;
  String _query = '';
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _loadAll();
    _searchController.addListener(() {
      final v = _searchController.text.trim().toLowerCase();
      if (v != _query) setState(() => _query = v);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    setState(() {
      _loadingIncome = true;
      _loadingOutcome = true;
    });
    final income = await _service.fetchIncomeRequests();
    final outcome = await _service.fetchOutcomeRequests();
    setState(() {
      _income = income;
      _outcome = outcome;
      _loadingIncome = false;
      _loadingOutcome = false;
      _updatePendingCount();
    });
  }

  void _updatePendingCount() {
    final pendingCount =
        _income.where((r) => r.status == RequestStatus.pending).length +
            _outcome.where((r) => r.status == RequestStatus.pending).length;
    widget.onPendingCountChanged?.call(pendingCount);
  }

  Future<void> _refreshIncome() async {
    setState(() => _loadingIncome = true);
    final income = await _service.fetchIncomeRequests();
    setState(() {
      _income = income;
      _loadingIncome = false;
      _updatePendingCount();
    });
  }

  Future<void> _refreshOutcome() async {
    setState(() => _loadingOutcome = true);
    final outcome = await _service.fetchOutcomeRequests();
    setState(() {
      _outcome = outcome;
      _loadingOutcome = false;
      _updatePendingCount();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: loc.t('search_hint'),
                  border: InputBorder.none,
                ),
                onChanged: (v) =>
                    setState(() => _query = v.trim().toLowerCase()),
              )
            : Text(loc.t('requests')),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                if (_isSearching) {
                  _searchController.clear();
                  _query = '';
                }
                _isSearching = !_isSearching;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            tooltip: 'Profile',
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => ProfileScreen(
                themeMode: Theme.of(context).brightness == Brightness.dark
                    ? ThemeMode.dark
                    : ThemeMode.light,
              ),
            )),
          ),
        ],
        elevation: 0,
      ),
      backgroundColor:
          isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
      body: isDarkMode
          ? AppBackground(
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: DefaultTabController(
                    length: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Summary row
                        RequestSummaryRow(
                          total: _income.length + _outcome.length,
                          income: _income.length,
                          outcome: _outcome.length,
                        ),
                        const SizedBox(height: 12),
                        TabBar(
                          labelColor: theme.colorScheme.primary,
                          unselectedLabelColor:
                              theme.colorScheme.onSurface.withOpacity(0.7),
                          indicator: UnderlineTabIndicator(
                              borderSide: BorderSide(
                                  width: 3, color: theme.colorScheme.primary),
                              insets:
                                  const EdgeInsets.symmetric(horizontal: 24)),
                          tabs: [
                            Tab(text: loc.t('all')),
                            Tab(text: loc.t('income')),
                            Tab(text: loc.t('outcome'))
                          ],
                        ),
                        const SizedBox(height: 12),
                        Expanded(
                          child: TabBarView(
                            children: [
                              _RequestsList(
                                kind: RequestKind.income,
                                items: _filter([..._income, ..._outcome]),
                                loading: _loadingIncome || _loadingOutcome,
                                onRefresh: _loadAll,
                                onAccept: (id) async {
                                  await _service.acceptRequest(id);
                                  await _loadAll();
                                },
                                onDecline: (id) async {
                                  await _service.declineRequest(id);
                                  await _loadAll();
                                },
                                onCancel: (id) async {
                                  await _service.cancelRequest(id);
                                  await _loadAll();
                                },
                              ),
                              _RequestsList(
                                kind: RequestKind.income,
                                items: _filter(_income),
                                loading: _loadingIncome,
                                onRefresh: _refreshIncome,
                                onAccept: (id) async {
                                  await _service.acceptRequest(id);
                                  await _refreshIncome();
                                },
                                onDecline: (id) async {
                                  await _service.declineRequest(id);
                                  await _refreshIncome();
                                },
                              ),
                              _RequestsList(
                                kind: RequestKind.outcome,
                                items: _filter(_outcome),
                                loading: _loadingOutcome,
                                onRefresh: _refreshOutcome,
                                onCancel: (id) async {
                                  await _service.cancelRequest(id);
                                  await _refreshOutcome();
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            )
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: DefaultTabController(
                  length: 3,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Summary chips - use Wrap to avoid horizontal overflow
                      RequestSummaryRow(
                        total: _income.length + _outcome.length,
                        income: _income.length,
                        outcome: _outcome.length,
                      ),
                      const SizedBox(height: 12),
                      TabBar(
                        labelColor: theme.colorScheme.primary,
                        unselectedLabelColor:
                            theme.colorScheme.onSurface.withOpacity(0.7),
                        indicator: UnderlineTabIndicator(
                            borderSide: BorderSide(
                                width: 3, color: theme.colorScheme.primary),
                            insets: const EdgeInsets.symmetric(horizontal: 24)),
                        tabs: [
                          Tab(text: loc.t('all')),
                          Tab(text: loc.t('income')),
                          Tab(text: loc.t('outcome'))
                        ],
                      ),
                      const SizedBox(height: 12),
                      Expanded(
                        child: TabBarView(
                          children: [
                            _RequestsList(
                              kind: RequestKind.income,
                              items: _filter([..._income, ..._outcome]),
                              loading: _loadingIncome || _loadingOutcome,
                              onRefresh: _loadAll,
                              onAccept: (id) async {
                                await _service.acceptRequest(id);
                                await _loadAll();
                              },
                              onDecline: (id) async {
                                await _service.declineRequest(id);
                                await _loadAll();
                              },
                              onCancel: (id) async {
                                await _service.cancelRequest(id);
                                await _loadAll();
                              },
                            ),
                            _RequestsList(
                              kind: RequestKind.income,
                              items: _filter(_income),
                              loading: _loadingIncome,
                              onRefresh: _refreshIncome,
                              onAccept: (id) async {
                                await _service.acceptRequest(id);
                                await _refreshIncome();
                              },
                              onDecline: (id) async {
                                await _service.declineRequest(id);
                                await _refreshIncome();
                              },
                            ),
                            _RequestsList(
                              kind: RequestKind.outcome,
                              items: _filter(_outcome),
                              loading: _loadingOutcome,
                              onRefresh: _refreshOutcome,
                              onCancel: (id) async {
                                await _service.cancelRequest(id);
                                await _refreshOutcome();
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  List<RequestItem> _filter(List<RequestItem> list) {
    if (_query.isEmpty) return list;
    return list.where((r) {
      final q = _query;
      final id = r.id.toString().toLowerCase();
      final name = r.founderName.toLowerCase();
      final biz = r.businessName.toLowerCase();
      final title = r.investmentTitle.toLowerCase();
      final desc = r.shortDescription.toLowerCase();
      final sender = r.senderName.toLowerCase();
      final receiver = r.receiverName.toLowerCase();
      return id.contains(q) ||
          name.contains(q) ||
          biz.contains(q) ||
          title.contains(q) ||
          desc.contains(q) ||
          sender.contains(q) ||
          receiver.contains(q);
    }).toList();
  }
}

enum RequestKind { income, outcome }

class _RequestsList extends StatelessWidget {
  final RequestKind kind;
  final List<RequestItem> items;
  final bool loading;
  final Future<void> Function()? onRefresh;
  final Future<void> Function(String id)? onAccept;
  final Future<void> Function(String id)? onDecline;
  final Future<void> Function(String id)? onCancel;

  const _RequestsList({
    Key? key,
    required this.kind,
    required this.items,
    required this.loading,
    this.onRefresh,
    this.onAccept,
    this.onDecline,
    this.onCancel,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (items.isEmpty) {
      return RefreshIndicator(
        onRefresh: onRefresh ?? () async {},
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.16),
            Center(
              child: Column(
                children: [
                  Icon(Icons.inbox,
                      size: 72,
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withOpacity(0.25)),
                  const SizedBox(height: 12),
                  Text(
                      'No ${kind == RequestKind.income ? 'income' : 'outcome'} requests',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('Pull to refresh or create a new request',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withOpacity(0.6))),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh ?? () async {},
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (ctx, i) => _RequestCard(
          item: items[i],
          onAccept: onAccept,
          onDecline: onDecline,
          onCancel: onCancel,
        ),
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final RequestItem item;
  final Future<void> Function(String id)? onAccept;
  final Future<void> Function(String id)? onDecline;
  final Future<void> Function(String id)? onCancel;

  const _RequestCard(
      {Key? key,
      required this.item,
      this.onAccept,
      this.onDecline,
      this.onCancel})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final date = DateFormat.yMMMd().add_jm().format(item.createdAt);

    // Reusable local confirm dialog helper
    Future<bool?> confirm(BuildContext ctx, String title, String content,
            {String confirmLabel = 'Yes', String cancelLabel = 'No'}) =>
        showDialog<bool>(
          context: ctx,
          builder: (dCtx) => AlertDialog(
            title: Text(title),
            content: Text(content),
            actions: [
              TextButton(
                  onPressed: () => Navigator.of(dCtx).pop(false),
                  child: Text(cancelLabel)),
              TextButton(
                  onPressed: () => Navigator.of(dCtx).pop(true),
                  child: Text(confirmLabel)),
            ],
          ),
        );

    final Widget actionsWidget = item.status == RequestStatus.pending
        ? Wrap(
            spacing: 8,
            runSpacing: 6,
            alignment: WrapAlignment.end,
            children: [
              if (item.isIncome && onAccept != null)
                ElevatedButton(
                  onPressed: () async {
                    final ok = await confirm(context, 'Accept request',
                        'Are you sure you want to accept this request?',
                        confirmLabel: 'Accept', cancelLabel: 'Cancel');
                    if (ok == true) await onAccept!(item.id);
                  },
                  style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10)),
                  child: const Text('Accept'),
                ),
              if (item.isIncome && onDecline != null)
                OutlinedButton(
                  onPressed: () async {
                    final ok = await confirm(context, 'Decline request',
                        'Are you sure you want to decline this request?',
                        confirmLabel: 'Decline', cancelLabel: 'Cancel');
                    if (ok == true) await onDecline!(item.id);
                  },
                  child: const Text('Decline'),
                ),
              if (!item.isIncome && onCancel != null)
                OutlinedButton(
                  onPressed: () async {
                    final ok = await confirm(context, 'Cancel request',
                        'Are you sure you want to cancel this request?',
                        confirmLabel: 'Yes', cancelLabel: 'No');
                    if (ok == true) await onCancel!(item.id);
                  },
                  child: const Text('Cancel'),
                ),
              // View Profile button (always available)
              OutlinedButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => ProfileScreen(
                    themeMode: Theme.of(context).brightness == Brightness.dark
                        ? ThemeMode.dark
                        : ThemeMode.light,
                  ),
                )),
                child: const Text('View Profile'),
              ),
            ],
          )
        : Wrap(
            alignment: WrapAlignment.end,
            children: [
              OutlinedButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => ProfileScreen(
                    themeMode: Theme.of(context).brightness == Brightness.dark
                        ? ThemeMode.dark
                        : ThemeMode.light,
                  ),
                )),
                child: const Text('View Profile'),
              ),
            ],
          );

    return Card(
      clipBehavior: Clip.hardEdge,
      color: isDarkMode
          ? (item.isIncome
              ? Colors.green.withOpacity(0.02)
              : Colors.red.withOpacity(0.02))
          : theme.colorScheme.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Colored stripe to indicate income/outcome
          Container(
            width: 6,
            height: 120,
            decoration: BoxDecoration(
              color: item.isIncome ? Colors.greenAccent : Colors.redAccent,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                bottomLeft: Radius.circular(12),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      CircleAvatar(
                        backgroundImage: item.avatarUrl != null
                            ? NetworkImage(item.avatarUrl!)
                            : null,
                        radius: 20,
                        child: item.avatarUrl == null
                            ? const Icon(Icons.person)
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            GestureDetector(
                              onTap: () => ScaffoldMessenger.of(context)
                                  .showSnackBar(SnackBar(
                                      content: Text(AppMessages.openFounder(
                                          item.founderName)))),
                              child: Text(item.investmentTitle,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700)),
                            ),
                            const SizedBox(height: 2),
                            Text(item.businessName,
                                style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.w600),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 4),
                            Text(item.shortDescription,
                                style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.7)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text('From: ',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                        color: theme.colorScheme.onSurface
                                            .withOpacity(0.5),
                                        fontSize: 11)),
                                Text(item.senderName,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                        color: theme.colorScheme.onSurface
                                            .withOpacity(0.7),
                                        fontSize: 11)),
                                const SizedBox(width: 8),
                                Text('To: ',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                        color: theme.colorScheme.onSurface
                                            .withOpacity(0.5),
                                        fontSize: 11)),
                                Text(item.receiverName,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                        color: theme.colorScheme.onSurface
                                            .withOpacity(0.7),
                                        fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 120),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: <Widget>[
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isDarkMode
                                    ? theme.colorScheme.surfaceContainerHighest
                                    : theme.colorScheme.primary
                                        .withOpacity(0.06),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text('${item.amount.toInt()}',
                                  style: theme.textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700)),
                            ),
                            const SizedBox(height: 8),
                            // Credibility score badge (unified color with numeric value)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 6),
                              decoration: BoxDecoration(
                                color:
                                    theme.colorScheme.primary.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.star,
                                      size: 14,
                                      color: theme.colorScheme.primary),
                                  const SizedBox(width: 6),
                                  Text('Score ${item.credibilityScore}',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                              fontWeight: FontWeight.w700)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(date,
                      style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.7))),
                  const SizedBox(height: 10),
                  actionsWidget,
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
