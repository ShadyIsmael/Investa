import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../services/profile_service.dart';
import '../services/app_logger.dart';
import 'credit_charge_screen.dart';

/// Credit History (Trace Credits) Screen
///
/// Fetches real credit transaction history from
/// [GET /api/Profile/me/credits] and displays a bilingual,
/// paginated list mirroring the Angular /admin/transactions page.
class TraceCreditScreen extends StatefulWidget {
  const TraceCreditScreen({Key? key}) : super(key: key);

  @override
  State<TraceCreditScreen> createState() => _TraceCreditScreenState();
}

class _TraceCreditScreenState extends State<TraceCreditScreen> {
  static const _pageSize = 10;

  final _profileService = ProfileService();

  List<CreditTransactionItem> _all = [];
  bool _loading = true;
  String? _error;

  int _currentPage = 0;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final raw = await _profileService.getCreditHistory();
      if (!mounted) return;
      if (raw == null) {
        setState(() {
          _error = 'Failed to load transactions. Please try again.';
          _loading = false;
        });
        return;
      }
      final items = raw.map((e) => CreditTransactionItem.fromJson(e)).toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      setState(() {
        _all = items;
        _currentPage = 0;
        _loading = false;
      });
    } catch (e, s) {
      AppLogger.logError('TraceCreditScreen', 'load error: $e', s);
      if (!mounted) return;
      setState(() {
        _error = 'Failed to load transactions. Please try again.';
        _loading = false;
      });
    }
  }

  // ── Computed values ──────────────────────────────────────────────────────

  int get _totalPages => (_all.length / _pageSize).ceil().clamp(1, 99999);

  List<CreditTransactionItem> get _paged {
    final start = _currentPage * _pageSize;
    final end = (start + _pageSize).clamp(0, _all.length);
    return _all.sublist(start, end);
  }

  int get _runningTotal => _all.fold(0, (sum, tx) => sum + tx.amount);

  // ── Detail bottom-sheet ──────────────────────────────────────────────────

  void _showDetail(BuildContext ctx, CreditTransactionItem tx) {
    final theme = Theme.of(ctx);
    final isAr = Localizations.localeOf(ctx).languageCode == 'ar';
    final justification = isAr ? tx.justificationAr : tx.justificationEn;
    final fmt = DateFormat('dd MMM yyyy – HH:mm');

    showModalBottomSheet(
      context: ctx,
      backgroundColor: theme.colorScheme.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface.withAlpha(50),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text('Transaction Details',
                style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface)),
            const SizedBox(height: 20),
            _detailRow(theme, 'Date', fmt.format(tx.createdAt.toLocal())),
            const SizedBox(height: 12),
            _detailRow(theme, 'Type', tx.type),
            const SizedBox(height: 12),
            _detailRow(
              theme,
              'Amount',
              '${tx.amount > 0 ? '+' : ''}${tx.amount} Credits',
              valueColor: tx.amount >= 0 ? Colors.green : AppPalette.danger,
            ),
            if (justification.isNotEmpty) ...[
              const SizedBox(height: 12),
              _detailRow(theme, 'Note', justification),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(_),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(ThemeData theme, String label, String value,
      {Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(label,
              style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withAlpha(140))),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: valueColor ?? theme.colorScheme.onSurface,
              )),
        ),
      ],
    );
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? AppPalette.midnightDeep : const Color(0xFFF1F5F9);
    final loc = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              color: theme.colorScheme.onSurface, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          loc.t('credit_records'),
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          IconButton(
            icon:
                Icon(Icons.refresh_rounded, color: theme.colorScheme.onSurface),
            onPressed: _loading ? null : _loadHistory,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError(theme)
              : _buildContent(theme, isDark, loc),
    );
  }

  Widget _buildError(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline,
                size: 56, color: theme.colorScheme.error.withAlpha(160)),
            const SizedBox(height: 16),
            Text(_error!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: theme.colorScheme.error)),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _loadHistory,
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(ThemeData theme, bool isDark, AppLocalizations loc) {
    return CustomScrollView(
      slivers: [
        // ── Balance summary card ───────────────────────────────────────────
        SliverToBoxAdapter(
          child: _buildSummaryCard(theme, isDark),
        ),

        // ── Charge CTA ────────────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CreditChargeScreen()),
              ),
              icon: const Icon(Icons.add_card_rounded),
              label: Text(loc.t('charge_now')),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ),

        // ── Section title ─────────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              loc.t('previous_transactions'),
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
        ),

        // ── Transaction list or empty ──────────────────────────────────────
        _all.isEmpty
            ? SliverToBoxAdapter(child: _buildEmpty(theme, loc))
            : SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => _TransactionTile(
                    tx: _paged[i],
                    isDark: isDark,
                    onTap: () => _showDetail(ctx, _paged[i]),
                  ),
                  childCount: _paged.length,
                ),
              ),

        // ── Pagination controls ────────────────────────────────────────────
        if (_all.isNotEmpty)
          SliverToBoxAdapter(
            child: _buildPagination(theme),
          ),

        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ],
    );
  }

  Widget _buildSummaryCard(ThemeData theme, bool isDark) {
    final positive =
        _all.where((t) => t.amount > 0).fold(0, (s, t) => s + t.amount);
    final negative =
        _all.where((t) => t.amount < 0).fold(0, (s, t) => s + t.amount);

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppPalette.plum, AppPalette.plumDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppShadows.medium,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Credit Balance',
              style: TextStyle(color: Colors.white60, fontSize: 13)),
          const SizedBox(height: 4),
          Text(
            '$_runningTotal Credits',
            style: GoogleFonts.outfit(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _statChip('+$positive', 'Earned', Colors.green),
              const SizedBox(width: 12),
              _statChip('$negative', 'Spent', AppPalette.danger),
              const SizedBox(width: 12),
              _statChip(
                  '${_all.length}', 'Total Txns', Colors.white.withAlpha(160)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statChip(String value, String label, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value,
            style: TextStyle(
                color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        Text(label,
            style: const TextStyle(color: Colors.white60, fontSize: 11)),
      ],
    );
  }

  Widget _buildEmpty(ThemeData theme, AppLocalizations loc) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.receipt_long_outlined,
              size: 56, color: theme.colorScheme.onSurface.withAlpha(80)),
          const SizedBox(height: 16),
          Text(
            loc.t('credit_tracing_message'),
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: theme.colorScheme.onSurface.withAlpha(140)),
          ),
        ],
      ),
    );
  }

  Widget _buildPagination(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed:
                _currentPage > 0 ? () => setState(() => _currentPage--) : null,
          ),
          Text(
            'Page ${_currentPage + 1} of $_totalPages',
            style: theme.textTheme.bodySmall,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: _currentPage < _totalPages - 1
                ? () => setState(() => _currentPage++)
                : null,
          ),
        ],
      ),
    );
  }
}

// ── Model ────────────────────────────────────────────────────────────────────

class CreditTransactionItem {
  final int id;
  final int amount;
  final String type;
  final String justificationEn;
  final String justificationAr;
  final DateTime createdAt;

  const CreditTransactionItem({
    required this.id,
    required this.amount,
    required this.type,
    required this.justificationEn,
    required this.justificationAr,
    required this.createdAt,
  });

  factory CreditTransactionItem.fromJson(Map<String, dynamic> json) {
    dynamic get(String lower, String pascal) => json[lower] ?? json[pascal];
    return CreditTransactionItem(
      id: (get('id', 'Id') as num?)?.toInt() ?? 0,
      amount: (get('amount', 'Amount') as num?)?.toInt() ?? 0,
      type: get('type', 'Type') as String? ?? '',
      justificationEn:
          get('justificationEn', 'JustificationEn') as String? ?? '',
      justificationAr:
          get('justificationAr', 'JustificationAr') as String? ?? '',
      createdAt:
          DateTime.tryParse((get('createdAt', 'CreatedAt') as String?) ?? '') ??
              DateTime.now(),
    );
  }
}

// ── Transaction Tile ──────────────────────────────────────────────────────────

class _TransactionTile extends StatelessWidget {
  final CreditTransactionItem tx;
  final bool isDark;
  final VoidCallback onTap;

  const _TransactionTile({
    required this.tx,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    final justification =
        (isAr ? tx.justificationAr : tx.justificationEn).trim();
    final isPositive = tx.amount >= 0;
    final amountColor = isPositive ? Colors.green : AppPalette.danger;
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;
    final fmt = DateFormat('dd MMM yyyy');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border(
            left: BorderSide(color: amountColor, width: 3),
          ),
        ),
        child: Row(
          children: [
            // Type icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: amountColor.withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isPositive ? Icons.arrow_downward : Icons.arrow_upward,
                color: amountColor,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            // Middle section
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    justification.isNotEmpty ? justification : tx.type,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      // Type badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.onSurface.withAlpha(20),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          tx.type,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onSurface.withAlpha(180),
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        fmt.format(tx.createdAt.toLocal()),
                        style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onSurface.withAlpha(120)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Amount
            Text(
              '${isPositive ? '+' : ''}${tx.amount}',
              style: GoogleFonts.outfit(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: amountColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
