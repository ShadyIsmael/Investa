import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/credit_plans_service.dart';
import '../services/profile_service.dart';
import '../services/app_state.dart';
import '../services/app_logger.dart';

/// Credit Charge Screen — mirrors the Angular client portal credit-charge page.
///
/// Loads admin-configured plans from [GET /api/credit-plans], lets the user
/// select one, then calls the real purchase endpoint
/// [POST /api/credit-plans/{id}/purchase].
class CreditChargeScreen extends StatefulWidget {
  const CreditChargeScreen({Key? key}) : super(key: key);

  @override
  State<CreditChargeScreen> createState() => _CreditChargeScreenState();
}

class _CreditChargeScreenState extends State<CreditChargeScreen> {
  final _service = CreditPlansService();

  List<CreditPlan> _plans = [];
  bool _plansLoading = true;
  String? _plansError;

  CreditPlan? _selectedPlan;
  bool _isPurchasing = false;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    setState(() {
      _plansLoading = true;
      _plansError = null;
    });
    try {
      final plans = await _service.fetchPlans();
      if (!mounted) return;
      setState(() {
        _plans = plans;
        _plansLoading = false;
      });
    } catch (e) {
      AppLogger.logError('CreditChargeScreen', 'loadPlans error: $e');
      if (!mounted) return;
      setState(() {
        _plansError = 'Could not load credit plans. Please try again.';
        _plansLoading = false;
      });
    }
  }

  // ── Purchase flow ───────────────────────────────────────────────────────────

  Future<void> _handlePurchase() async {
    final plan = _selectedPlan;
    if (plan == null) return;

    setState(() => _isPurchasing = true);
    try {
      AppLogger.logInfo(
          'CreditChargeScreen', 'Purchasing plan "${plan.name}" id=${plan.id}');
      final result = await _service.purchasePlan(plan.id);

      // Refresh profile so wallet balance is up to date globally
      try {
        final raw = await ProfileService().fetchProfileRaw();
        if (raw != null) {
          await AppState.instance.setProfile(Profile.fromJson(raw), raw);
        }
      } catch (_) {}

      if (!mounted) return;
      setState(() => _selectedPlan = null);
      _showSuccessDialog(result);
    } catch (e) {
      AppLogger.logError('CreditChargeScreen', 'purchase error: $e');
      if (!mounted) return;
      _showError(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isPurchasing = false);
    }
  }

  // ── Dialogs ─────────────────────────────────────────────────────────────────

  void _showSuccessDialog(PurchaseResult result) {
    final theme = Theme.of(context);
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.colorScheme.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.green.withAlpha(30),
                shape: BoxShape.circle,
              ),
              child:
                  const Icon(Icons.check_circle, color: Colors.green, size: 44),
            ),
            Text(
              'Purchase Successful!',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${result.creditsAdded} credits have been added to your account.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(180),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    'Reference Number',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(140),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    result.referenceNumber,
                    style: GoogleFonts.robotoMono(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pop(true);
                },
                style: FilledButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Done'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // ── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = isDark ? AppPalette.midnightDeep : const Color(0xFFF1F5F9);

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
          'Charge Credits',
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _plansLoading
                ? const Center(child: CircularProgressIndicator())
                : _plansError != null
                    ? _buildError(theme)
                    : _plans.isEmpty
                        ? _buildEmpty(theme)
                        : _buildContent(theme, isDark),
          ),
          if (!_plansLoading && _plansError == null && _plans.isNotEmpty)
            _buildOrderSummary(theme, isDark),
        ],
      ),
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
            Text(_plansError!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: theme.colorScheme.error)),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _loadPlans,
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.credit_card_off_outlined,
                size: 56, color: theme.colorScheme.onSurface.withAlpha(80)),
            const SizedBox(height: 16),
            Text(
              'No credit plans available.\nPlease check back later.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(140),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(ThemeData theme, bool isDark) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildBalanceHeader(theme)),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
            child: Text(
              'Select a Plan',
              style: GoogleFonts.outfit(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 240,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.75,
            ),
            delegate: SliverChildBuilderDelegate(
              (ctx, i) => _PlanCard(
                plan: _plans[i],
                isSelected: _selectedPlan?.id == _plans[i].id,
                isDark: isDark,
                onTap: () => setState(() => _selectedPlan = _plans[i]),
              ),
              childCount: _plans.length,
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 16)),
      ],
    );
  }

  Widget _buildBalanceHeader(ThemeData theme) {
    final balance =
        AppState.instance.profile?.coreMetrics?.walletBalance ?? 0.0;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppPalette.plum, AppPalette.plumDeep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.medium,
      ),
      child: Row(
        children: [
          const Icon(Icons.account_balance_wallet,
              color: Colors.white70, size: 28),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Current Balance',
                  style: TextStyle(color: Colors.white60, fontSize: 12)),
              Text(
                '${balance.toStringAsFixed(0)} Credits',
                style: GoogleFonts.outfit(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(ThemeData theme, bool isDark) {
    final plan = _selectedPlan;
    final bg = isDark ? const Color(0xFF1E293B) : Colors.white;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      decoration: BoxDecoration(
        color: bg,
        border: Border(top: BorderSide(color: theme.dividerColor)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(30),
              blurRadius: 12,
              offset: const Offset(0, -4)),
        ],
      ),
      child: plan == null
          ? Text(
              'Select a plan to continue',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: theme.colorScheme.onSurface.withAlpha(120)),
            )
          : Column(
              children: [
                _row(theme, 'Plan', plan.name),
                _row(theme, 'Credits', '${plan.credits}'),
                _row(theme, 'Billing', plan.billingLabel),
                const SizedBox(height: 4),
                Divider(color: theme.dividerColor),
                _row(theme, 'Total', '${plan.price.toStringAsFixed(0)} EGP',
                    highlight: true),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: FilledButton(
                    onPressed: _isPurchasing ? null : _handlePurchase,
                    style: FilledButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isPurchasing
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                                strokeWidth: 2.5, color: Colors.white))
                        : Text('Purchase Now',
                            style: GoogleFonts.outfit(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.lock_outline,
                        size: 12,
                        color: theme.colorScheme.onSurface.withAlpha(100)),
                    const SizedBox(width: 4),
                    Text('Secure Payment',
                        style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onSurface.withAlpha(100))),
                  ],
                ),
              ],
            ),
    );
  }

  Widget _row(ThemeData theme, String label, String value,
      {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withAlpha(160))),
          highlight
              ? Text(value,
                  style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary))
              : Text(value,
                  style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface)),
        ],
      ),
    );
  }
}

// ── Plan Card Widget ──────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  final CreditPlan plan;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _PlanCard({
    required this.plan,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary.withAlpha(20) : cardBg,
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: isSelected ? AppShadows.soft : [],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Billing period badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withAlpha(20),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                plan.billingLabel.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: theme.colorScheme.onSurface.withAlpha(180),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Plan name
            Text(
              plan.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const Spacer(),
            // Price row
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  plan.price.toStringAsFixed(0),
                  style: GoogleFonts.outfit(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: isSelected
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(width: 3),
                Padding(
                  padding: const EdgeInsets.only(bottom: 3),
                  child: Text(
                    'EGP',
                    style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(140)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Credits chip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.monetization_on_outlined,
                      size: 13, color: theme.colorScheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    '${plan.credits} Credits',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${plan.pricePerCredit.toStringAsFixed(2)} EGP/credit',
              style: theme.textTheme.labelSmall
                  ?.copyWith(color: theme.colorScheme.onSurface.withAlpha(100)),
            ),
            if (isSelected) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check, color: Colors.white, size: 14),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
