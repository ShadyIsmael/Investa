import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';
import '../services/app_state.dart';
import '../services/app_logger.dart';

/// Screen for charging/adding credits to user's wallet
class CreditChargeScreen extends StatefulWidget {
  const CreditChargeScreen({Key? key}) : super(key: key);

  @override
  State<CreditChargeScreen> createState() => _CreditChargeScreenState();
}

class _CreditChargeScreenState extends State<CreditChargeScreen> {
  int? _selectedPackageIndex;
  final TextEditingController _customAmountController = TextEditingController();
  bool _isProcessing = false;

  // Predefined credit packages
  final List<CreditPackage> _packages = [
    CreditPackage(credits: 100, price: 10.00, discount: 0),
    CreditPackage(credits: 500, price: 45.00, discount: 10),
    CreditPackage(credits: 1000, price: 80.00, discount: 20),
    CreditPackage(credits: 5000, price: 350.00, discount: 30),
  ];

  @override
  void dispose() {
    _customAmountController.dispose();
    super.dispose();
  }

  Future<void> _handlePurchase() async {
    if (_selectedPackageIndex == null &&
        _customAmountController.text.trim().isEmpty) {
      _showError('Please select a package or enter a custom amount');
      return;
    }

    setState(() => _isProcessing = true);

    try {
      // Get selected amount
      int credits;
      double price;

      if (_selectedPackageIndex != null) {
        final package = _packages[_selectedPackageIndex!];
        credits = package.credits;
        price = package.price;
      } else {
        credits = int.tryParse(_customAmountController.text.trim()) ?? 0;
        if (credits <= 0) {
          _showError('Please enter a valid amount');
          setState(() => _isProcessing = false);
          return;
        }
        price = credits * 0.10; // $0.10 per credit for custom amounts
      }

      AppLogger.logInfo('CreditChargeScreen',
          'Initiating purchase: $credits credits for \$$price');

      // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
      // For now, simulate a successful purchase
      await Future.delayed(const Duration(seconds: 2));

      if (!mounted) return;

      // Show success dialog
      _showSuccessDialog(credits);
    } catch (e) {
      AppLogger.logError('CreditChargeScreen', 'Purchase failed: $e');
      _showError('Purchase failed. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showSuccessDialog(int credits) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppPalette.success.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded,
                  color: AppPalette.success, size: 32),
            ),
            const SizedBox(width: 12),
            const Expanded(child: Text('Purchase Successful!')),
          ],
        ),
        content: Text(
          '$credits credits have been added to your wallet.',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop(); // Close dialog
              Navigator.of(context)
                  .pop(true); // Return to previous screen with success flag
            },
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);
    final currentCredits =
        AppState.instance.profile?.basicInfo?.credit?.toDouble() ??
            AppState.instance.profile?.coreMetrics?.walletBalance ??
            0.0;

    return Scaffold(
      backgroundColor:
          isDark ? AppPalette.midnightDeep : const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Charge Credits',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            fontSize: 24,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Current Balance Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isDark
                        ? [AppPalette.midnight, AppPalette.midnightDeep]
                        : [AppPalette.aqua.withOpacity(0.1), Colors.white],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isDark
                        ? AppPalette.aqua.withOpacity(0.2)
                        : AppPalette.aqua.withOpacity(0.3),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      'Current Balance',
                      style: GoogleFonts.dmSans(
                        fontSize: 14,
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          currentCredits.toStringAsFixed(0),
                          style: GoogleFonts.outfit(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: AppPalette.aqua,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Credits',
                          style: GoogleFonts.dmSans(
                            fontSize: 16,
                            color: theme.colorScheme.onSurface.withOpacity(0.6),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Packages Section
              Text(
                'Select Package',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 16),

              // Package Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.85,
                ),
                itemCount: _packages.length,
                itemBuilder: (ctx, index) {
                  final package = _packages[index];
                  final isSelected = _selectedPackageIndex == index;

                  return _PackageCard(
                    package: package,
                    isSelected: isSelected,
                    isDark: isDark,
                    onTap: () {
                      setState(() {
                        _selectedPackageIndex = index;
                        _customAmountController.clear();
                      });
                    },
                  );
                },
              ),

              const SizedBox(height: 32),

              // Custom Amount Section
              Text(
                'Or Enter Custom Amount',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 16),

              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.dividerColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: _customAmountController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Credits Amount',
                        hintText: 'Enter amount',
                        prefixIcon: const Icon(Icons.paid_rounded),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onChanged: (value) {
                        if (value.isNotEmpty) {
                          setState(() => _selectedPackageIndex = null);
                        }
                      },
                    ),
                    if (_customAmountController.text.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        'Estimated Price: \$${(int.tryParse(_customAmountController.text) ?? 0) * 0.10}',
                        style: GoogleFonts.dmSans(
                          fontSize: 14,
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Purchase Button
              ElevatedButton(
                onPressed: _isProcessing ? null : _handlePurchase,
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 4,
                ),
                child: _isProcessing
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.shopping_cart_rounded, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Proceed to Payment',
                            style: GoogleFonts.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
              ),

              const SizedBox(height: 16),

              // Payment Methods Info
              Text(
                'Secure payment powered by Stripe',
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CreditPackage {
  final int credits;
  final double price;
  final int discount; // percentage

  CreditPackage({
    required this.credits,
    required this.price,
    required this.discount,
  });

  double get pricePerCredit => price / credits;
  double get savings => discount > 0 ? (credits * 0.10 * discount / 100) : 0.0;
}

class _PackageCard extends StatelessWidget {
  final CreditPackage package;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _PackageCard({
    required this.package,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: isDark
                      ? [
                          AppPalette.aqua.withOpacity(0.2),
                          AppPalette.aqua.withOpacity(0.1),
                        ]
                      : [
                          AppPalette.aqua.withOpacity(0.15),
                          AppPalette.aqua.withOpacity(0.05),
                        ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppPalette.aqua : theme.dividerColor,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppPalette.aqua.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Discount Badge
            if (package.discount > 0)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppPalette.flame,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Save ${package.discount}%',
                  style: GoogleFonts.dmSans(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            if (package.discount > 0) const SizedBox(height: 12),

            // Credits Icon
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppPalette.aqua.withOpacity(0.2)
                    : theme.colorScheme.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.account_balance_wallet_rounded,
                size: 32,
                color: isSelected ? AppPalette.aqua : theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 12),

            // Credits Amount
            Text(
              '${package.credits}',
              style: GoogleFonts.outfit(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color:
                    isSelected ? AppPalette.aqua : theme.colorScheme.onSurface,
              ),
            ),
            Text(
              'Credits',
              style: GoogleFonts.dmSans(
                fontSize: 12,
                color: theme.colorScheme.onSurface.withOpacity(0.6),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),

            // Price
            Text(
              '\$${package.price.toStringAsFixed(2)}',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.primary,
              ),
            ),

            // Price per credit
            Text(
              '\$${package.pricePerCredit.toStringAsFixed(3)}/credit',
              style: GoogleFonts.dmSans(
                fontSize: 10,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
                fontWeight: FontWeight.w500,
              ),
            ),

            // Checkmark for selected
            if (isSelected) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppPalette.aqua,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, size: 16, color: Colors.white),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
