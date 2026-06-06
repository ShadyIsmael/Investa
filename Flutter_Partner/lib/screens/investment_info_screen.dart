import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../services/messages.dart';
import '../services/config.dart';
import '../services/requests_service.dart';
import '../services/profile_service.dart';
import '../services/app_state.dart';
import '../services/app_logger.dart';
import '../widgets/engagement_confirmation_dialog.dart';

// A small set of public test images (Unsplash) used when no images available.
const List<String> _kTestImages = [
  'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1400&q=80&auto=format&fit=crop',
];

class InvestmentInfoScreen extends StatefulWidget {
  final Map<String, dynamic> item;
  final dynamic category;
  const InvestmentInfoScreen({Key? key, required this.item, this.category})
      : super(key: key);

  @override
  State<InvestmentInfoScreen> createState() => _InvestmentInfoScreenState();
}

class _InvestmentInfoScreenState extends State<InvestmentInfoScreen> {
  late bool _fav;
  int _currentImageIndex = 0;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fav = widget.item['isFavorite'] as bool? ?? false;
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _toggleFav() {
    setState(() => _fav = !_fav);
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        backgroundColor: _fav ? AppPalette.flame : Colors.grey[800],
        duration: const Duration(seconds: 1),
        content: Text(_fav
            ? AppMessages.addedToFavorites
            : AppMessages.removedFromFavorites)));
  }

  void _share() {
    final title =
        widget.item['businessName'] ?? widget.item['title'] ?? 'Investment';
    final desc = widget.item['description'] ?? widget.item['details'] ?? '';
    final text = '$title\n$desc';
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppMessages.copiedShareText)));
  }

  Future<void> _handleInvest() async {
    final item = widget.item;
    final isEquity = _isEquity(item);
    final title = item['businessName'] ?? item['title'] ?? 'Investment';
    final currency = item['currency']?.toString().trim().isNotEmpty == true
        ? item['currency'].toString()
        : r'$';

    if (isEquity) {
      final sharePrice = _parseDouble(
          item['sharePrice'] ?? item['share_price'] ?? item['share_price_usd']);
      final available = _parseInt(item['availableShares'] ??
          item['available_shares'] ??
          item['availableSharesCount']);
      final expectedRoi = _parseDouble(
          item['expectedROI'] ?? item['expected_roi'] ?? item['roi']);

      if (sharePrice <= 0 || available <= 0) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text(AppMessages.shareInfoUnavailable)));
        return;
      }

      final confirmed = await _showEquitySheet(
        title: title,
        sharePrice: sharePrice,
        availableShares: available,
        currency: currency,
        expectedRoi: expectedRoi > 0 ? expectedRoi : null,
      );

      if (confirmed == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(AppMessages.investRequestSent(title)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
        ));
      }
    } else {
      // Engagement flow with two-step confirmation (mirrors Angular client portal)
      try {
        // Step 1: Refresh user profile to get latest wallet balance
        AppLogger.logInfo('InvestmentInfoScreen',
            'Refreshing user profile before engagement');

        final profileService = ProfileService();
        await profileService.fetchProfile();

        if (!mounted) return;

        // Step 2: Show confirmation dialog with credit details
        final profile = AppState.instance.profile;
        final initialCredits = (profile?.credit?.toDouble()) ??
            profile?.coreMetrics?.walletBalance ??
            0.0;

        // Debug: log values passed to dialog
        try {
          AppLogger.logInfo('InvestmentInfoScreen',
              'Opening engagement dialog - initialCredits=$initialCredits, investmentKeys=${item.keys.toList()}');
        } catch (_) {}

        final confirmed = await showEngagementConfirmationDialog(
          context: context,
          investment: item,
          initialCredits: initialCredits,
          onConfirm: () async {
            // Step 3: Create investment request via API
            final requestsService = RequestsService();
            final engagementCost = Env.engageCreditCost.toDouble();

            await requestsService.createInvestmentRequest(
              investment: item,
              amount: engagementCost,
              shares: 0, // Engagement/Funding type has 0 shares
            );

            AppLogger.logInfo('InvestmentInfoScreen',
                'Engagement request created successfully');
          },
        );

        if (!mounted) return;

        // Step 4: Show success message
        if (confirmed == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(AppMessages.engageRequestSent),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        AppLogger.logError(
            'InvestmentInfoScreen', 'Failed to create engagement request: $e');

        if (!mounted) return;

        // Show user-friendly error message
        String errorMessage = 'Failed to create engagement request.';

        if (e.toString().contains('500')) {
          errorMessage =
              'Server error occurred. Please try again later or contact support if the issue persists.';
        } else if (e.toString().contains('insufficient_credits') ||
            e.toString().contains('Insufficient credits')) {
          errorMessage =
              'Insufficient credits. Please add more credits to your account.';
        } else if (e.toString().contains('not_authenticated') ||
            e.toString().contains('401')) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (e.toString().contains('InvestmentRequestException:')) {
          errorMessage =
              e.toString().replaceFirst('InvestmentRequestException: ', '');
        } else if (e.toString().contains('Exception:')) {
          errorMessage = e.toString().replaceFirst('Exception: ', '');
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Dismiss',
              textColor: Colors.white,
              onPressed: () {},
            ),
          ),
        );
      }
    }
  }

  Future<bool?> _showEquitySheet({
    required String title,
    required double sharePrice,
    required int availableShares,
    required String currency,
    double? expectedRoi,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: theme.scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        int shares = 1;
        String? error;
        final controller = TextEditingController(text: '$shares');

        void validate() {
          if (shares < 1) {
            shares = 1;
            error = AppMessages.shareMinError;
          } else if (shares > availableShares) {
            error = AppMessages.shareMaxError(availableShares);
          } else {
            error = null;
          }
          controller.value = TextEditingValue(
            text: '$shares',
            selection: TextSelection.collapsed(offset: '$shares'.length),
          );
        }

        validate();

        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 16,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: StatefulBuilder(builder: (ctx, setModalState) {
            final total = sharePrice * shares;

            void updateShares(int next) {
              setModalState(() {
                shares = next;
                validate();
              });
            }

            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: theme.dividerColor,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Text(AppMessages.investIn(title),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface)),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: isDark
                          ? [
                              const Color(0xFF1E293B).withOpacity(0.6),
                              const Color(0xFF0F172A).withOpacity(0.4)
                            ]
                          : [
                              Colors.white.withOpacity(0.9),
                              const Color(0xFFF9FAFB).withOpacity(0.8)
                            ],
                    ),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: theme.colorScheme.outline.withOpacity(0.15),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: theme.colorScheme.primary.withOpacity(0.06),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(AppMessages.sharePriceLabel,
                                style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.6),
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.3)),
                            const SizedBox(height: 6),
                            Text('$currency${sharePrice.toStringAsFixed(2)}',
                                style: GoogleFonts.outfit(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                    color: theme.colorScheme.onSurface,
                                    letterSpacing: -0.5)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(AppMessages.sharesAvailableLabel,
                              style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.6),
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.3)),
                          const SizedBox(height: 6),
                          Text('$availableShares',
                              style: GoogleFonts.outfit(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.primary,
                                  letterSpacing: -0.3)),
                        ],
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(AppMessages.numberOfSharesLabel,
                    style: GoogleFonts.dmSans(
                        fontSize: 14,
                        color: theme.colorScheme.onSurface,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _RoundIconButton(
                      icon: Icons.remove,
                      onTap: shares > 1 ? () => updateShares(shares - 1) : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: theme.dividerColor),
                        ),
                        child: TextField(
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            isDense: true,
                            border: InputBorder.none,
                          ),
                          textAlign: TextAlign.center,
                          controller: controller,
                          onChanged: (val) {
                            final parsed = int.tryParse(val) ?? 1;
                            updateShares(parsed);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    _RoundIconButton(
                      icon: Icons.add,
                      onTap: shares < availableShares
                          ? () => updateShares(shares + 1)
                          : null,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${AppMessages.sharesAvailableLabel}: $availableShares',
                    style: GoogleFonts.dmSans(
                        fontSize: 12, color: theme.disabledColor)),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: isDark
                          ? [
                              const Color(0xFF1E293B).withOpacity(0.6),
                              const Color(0xFF0F172A).withOpacity(0.4)
                            ]
                          : [
                              Colors.white.withOpacity(0.9),
                              const Color(0xFFF9FAFB).withOpacity(0.8)
                            ],
                    ),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: theme.colorScheme.outline.withOpacity(0.15),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: theme.colorScheme.primary.withOpacity(0.06),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(AppMessages.totalInvestmentLabel,
                              style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.65),
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.3)),
                          Text('$currency${total.toStringAsFixed(2)}',
                              style: GoogleFonts.outfit(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.onSurface,
                                  letterSpacing: -0.5)),
                        ],
                      ),
                      if (expectedRoi != null && expectedRoi > 0) ...[
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(AppMessages.expectedRoiLabel,
                                style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.6),
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.3)),
                            Text('${expectedRoi.toStringAsFixed(1)}%',
                                style: GoogleFonts.outfit(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF10B981),
                                    letterSpacing: -0.3)),
                          ],
                        ),
                      ]
                    ],
                  ),
                ),
                if (error != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppPalette.danger.withOpacityCompat(0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: AppPalette.danger.withOpacityCompat(0.2)),
                    ),
                    child: Text(error!,
                        style: GoogleFonts.dmSans(
                            color: AppPalette.danger,
                            fontWeight: FontWeight.w600)),
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text(AppMessages.cancel),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: error == null
                            ? () => Navigator.pop(ctx, true)
                            : null,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text(AppMessages.confirmInvestment),
                      ),
                    )
                  ],
                )
              ],
            );
          }),
        );
      },
    );
  }

  bool _isEquity(Map<String, dynamic> item) {
    final raw = (item['investmentType'] ?? item['type'] ?? '').toString();
    return raw.toLowerCase() == 'equity';
  }

  double _parseDouble(dynamic v) {
    if (v is num) return v.toDouble();
    if (v is String) return double.tryParse(v.replaceAll(',', '')) ?? 0;
    return 0;
  }

  int _parseInt(dynamic v) {
    if (v is int) return v;
    if (v is num) return v.toInt();
    if (v is String) return int.tryParse(v.replaceAll(',', '')) ?? 0;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Data Extraction
    final item = widget.item;
    final title = item['businessName'] ?? item['title'] ?? 'Venture';
    final description = item['description'] ??
        item['details'] ??
        'No detailed description provided.';
    final founderName =
        item['founderName'] ?? item['FounderDisplay'] ?? 'Unknown Founder';
    final founderAvatar = item['founderAvatar'] ?? item['authorAvatar'];
    final riskLevel = (item['riskLevel'] as String? ?? 'Medium');

    // Images
    final images = <String>[];
    final rawImages = item['images'] ??
        item['imagesAlbum'] ??
        item['gallery'] ??
        item['photos'];
    if (rawImages is List) {
      for (final v in rawImages) {
        if (v is String && v.isNotEmpty) images.add(v);
        if (v is Map && v['url'] is String) images.add(v['url']);
      }
    }
    if (images.isEmpty) images.addAll(_kTestImages);

    // Financials
    final targetVal = item['targetFund'];
    final minInvest = item['minInvest'] ?? '5,000';
    final valuation = item['valuation'] ?? '2.5M';
    final currency = item['currency'] ?? '\$';

    // Parse raised for progress
    double raised = 0.0;
    double target = 0.0;
    if (targetVal is num) {
      target = targetVal.toDouble();
    } else if (targetVal is String) {
      target = double.tryParse(targetVal.replaceAll(',', '')) ?? 0.0;
    }

    const keys = [
      'collected',
      'collectedAmount',
      'raised',
      'raisedAmount',
      'amountRaised',
      'fundedAmount'
    ];
    for (var k in keys) {
      if (item[k] != null) {
        final val = item[k];
        if (val is num) {
          raised = val.toDouble();
        } else if (val is String) {
          raised = double.tryParse(val.replaceAll(',', '')) ?? 0.0;
        }
        break;
      }
    }
    final progress = target > 0 ? (raised / target).clamp(0.0, 1.0) : 0.0;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // 1. App Bar with Hero Image
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                elevation: 0,
                backgroundColor:
                    isDark ? AppPalette.midnightDeep : Colors.white,
                foregroundColor: isDark ? Colors.white : Colors.black,
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      PageView.builder(
                        itemCount: images.length,
                        onPageChanged: (i) =>
                            setState(() => _currentImageIndex = i),
                        itemBuilder: (_, i) => Image.network(
                          images[i],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(color: Colors.grey[900]),
                        ),
                      ),
                      // Gradient Overlay
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withOpacityCompat(0.3),
                                Colors.transparent,
                                isDark
                                    ? AppPalette.midnightDeep
                                    : theme.scaffoldBackgroundColor
                                        .withOpacityCompat(0.1),
                                isDark
                                    ? AppPalette.midnightDeep
                                    : theme.scaffoldBackgroundColor,
                              ],
                              stops: const [
                                0.0,
                                0.2,
                                0.8,
                                1.0
                              ]),
                        ),
                      ),
                      // Page Indicator
                      Positioned(
                        bottom: 40,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(images.length, (i) {
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              height: 6,
                              width: _currentImageIndex == i ? 24 : 6,
                              decoration: BoxDecoration(
                                color: _currentImageIndex == i
                                    ? theme.colorScheme.primary
                                    : Colors.white.withOpacityCompat(0.5),
                                borderRadius: BorderRadius.circular(3),
                              ),
                            );
                          }),
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  IconButton(
                    onPressed: _toggleFav,
                    icon: CircleAvatar(
                      backgroundColor: Colors.black.withOpacityCompat(0.3),
                      child: Icon(_fav ? Icons.favorite : Icons.favorite_border,
                          color: _fav ? AppPalette.flame : Colors.white),
                    ),
                  ),
                  IconButton(
                    onPressed: _share,
                    icon: CircleAvatar(
                      backgroundColor: Colors.black.withOpacityCompat(0.3),
                      child:
                          const Icon(Icons.share_rounded, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 16),
                ],
              ),

              // 2. Content Body
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge & Title
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildTag(riskLevel, theme),
                                const SizedBox(height: 12),
                                Text(
                                  title,
                                  style: GoogleFonts.outfit(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: theme.colorScheme.onSurface,
                                    height: 1.1,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Founder Avatar Large
                          Container(
                            decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                    color: theme.colorScheme.surface, width: 4),
                                boxShadow: [
                                  BoxShadow(
                                      color:
                                          Colors.black.withOpacityCompat(0.1),
                                      blurRadius: 10,
                                      offset: const Offset(0, 5))
                                ]),
                            child: CircleAvatar(
                              radius: 32,
                              backgroundImage: founderAvatar != null
                                  ? NetworkImage(founderAvatar)
                                  : null,
                              backgroundColor:
                                  theme.colorScheme.surfaceContainerHighest,
                              child: founderAvatar == null
                                  ? const Icon(Icons.person, size: 32)
                                  : null,
                            ),
                          )
                        ],
                      ),

                      const SizedBox(height: 8),
                      Text('by $founderName',
                          style: GoogleFonts.dmSans(
                              fontSize: 16,
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w500)),

                      const SizedBox(height: 32),

                      // Progress Bar Section
                      Text('Funding Status',
                          style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface)),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 12,
                          backgroundColor:
                              theme.colorScheme.surfaceContainerHighest,
                          valueColor: AlwaysStoppedAnimation(progress >= 0.75
                              ? const Color(0xFF10B981)
                              : progress >= 0.4
                                  ? AppPalette.amber
                                  : AppPalette.flame),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${(progress * 100).toStringAsFixed(0)}% Funded',
                              style: GoogleFonts.dmSans(
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.primary)),
                          Text(
                              '$currency${raised.toStringAsFixed(0)} / $currency${target.toStringAsFixed(0)}',
                              style: GoogleFonts.dmSans(
                                  color: theme.disabledColor)),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Project Stages Timeline
                      _ProjectStagesTimeline(
                          projectPhaseId: item['projectPhaseId']),

                      const SizedBox(height: 24),

                      // Key Financials Grid
                      Row(
                        children: [
                          Expanded(
                              child: _buildInfoCard(
                                  context,
                                  'Valuation',
                                  '$currency$valuation',
                                  Icons.analytics_outlined)),
                          const SizedBox(width: 16),
                          Expanded(
                              child: _buildInfoCard(
                                  context,
                                  'Min. Invest',
                                  '$currency$minInvest',
                                  Icons.monetization_on_outlined)),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Team Section
                      _TeamSection(members: item['teamMembers'] as List? ?? []),

                      const SizedBox(height: 24),

                      // Equity Metrics (only for equity)
                      if (_isEquity(item)) ...[
                        _EquityDetailMetrics(item: item),
                        const SizedBox(height: 32),
                      ],

                      // Description
                      Text('About',
                          style: GoogleFonts.outfit(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSurface)),
                      const SizedBox(height: 16),
                      Text(
                        description,
                        style: GoogleFonts.dmSans(
                            fontSize: 16,
                            height: 1.6,
                            color: theme.colorScheme.onSurface
                                .withOpacityCompat(0.8)),
                      ),

                      const SizedBox(height: 32),

                      // Video Player
                      if (item['videoUrl'] != null &&
                          item['videoUrl'].toString().isNotEmpty) ...[
                        const SizedBox(height: 24),
                        Text('Project Video',
                            style: GoogleFonts.outfit(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.onSurface)),
                        const SizedBox(height: 12),
                        AspectRatio(
                          aspectRatio: 16 / 9,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              item['videoUrl'],
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                color: Colors.grey[900],
                                child: const Center(
                                  child: Icon(Icons.play_circle_outline,
                                      size: 48, color: Colors.white),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],

                      // Additional lists (Investors, Reviews) could go here...
                      const SizedBox(
                          height: 100), // Bottom padding for fixed button
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Sticky Bottom Action Bar
          Positioned(
            bottom: 0,
            right: 0,
            left: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                    isDark
                        ? AppPalette.midnightDeep
                        : theme.scaffoldBackgroundColor,
                    isDark
                        ? AppPalette.midnightDeep.withOpacityCompat(0.9)
                        : theme.scaffoldBackgroundColor.withOpacityCompat(0.9),
                    isDark
                        ? AppPalette.midnightDeep.withOpacityCompat(0.0)
                        : theme.scaffoldBackgroundColor.withOpacityCompat(0.0),
                  ],
                      stops: const [
                    0.4,
                    0.8,
                    1.0
                  ])),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _handleInvest,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      elevation: 8,
                      shadowColor:
                          theme.colorScheme.primary.withOpacityCompat(0.4),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text('Invest Now',
                        style: GoogleFonts.outfit(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTag(String text, ThemeData theme) {
    Color color;
    switch (text.toUpperCase()) {
      case 'HIGH':
        color = AppPalette.danger;
        break;
      case 'LOW':
        color = const Color(0xFF10B981);
        break;
      default:
        color = AppPalette.amber;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacityCompat(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacityCompat(0.2)),
      ),
      child: Text(
        text.toUpperCase(),
        style: GoogleFonts.dmSans(
            fontWeight: FontWeight.bold,
            fontSize: 12,
            color: color,
            letterSpacing: 1),
      ),
    );
  }

  Widget _buildInfoCard(
      BuildContext context, String title, String value, IconData icon) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
              : [Colors.white, const Color(0xFFF9FAFB)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.primary.withOpacity(0.08),
            offset: const Offset(0, 8),
            blurRadius: 24,
            spreadRadius: 0,
          ),
          BoxShadow(
            color: isDark
                ? Colors.white.withOpacity(0.03)
                : Colors.white.withOpacity(0.9),
            offset: const Offset(-2, -2),
            blurRadius: 8,
          ),
        ],
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(isDark ? 0.15 : 0.08),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon with gradient background
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.colorScheme.primary.withOpacity(0.15),
                  theme.colorScheme.primary.withOpacity(0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: theme.colorScheme.primary, size: 24),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: theme.colorScheme.onSurface.withOpacity(0.6),
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}

// Project stages horizontal timeline widget
class _ProjectStagesTimeline extends StatelessWidget {
  final dynamic projectPhaseId;
  const _ProjectStagesTimeline({this.projectPhaseId});

  List<String> _getStages() {
    return [
      'MVP Development',
      'Beta Testing',
      'Market Launch',
      'User Acquisition',
      'Revenue Generation',
      'Scale Operations'
    ];
  }

  int _currentIndex() {
    if (projectPhaseId == null) return 0;
    try {
      final id = projectPhaseId is int
          ? projectPhaseId as int
          : int.tryParse(projectPhaseId.toString()) ?? 0;
      final idx = id - 6; // map 6-11 to 0-5
      return idx.clamp(0, 5);
    } catch (_) {
      return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final stages = _getStages();
    final cur = _currentIndex();
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Project Stages',
            style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface)),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: List.generate(stages.length, (i) {
              final done = i < cur;
              final active = i == cur;
              return Container(
                margin: const EdgeInsets.only(right: 12),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: active
                          ? theme.colorScheme.primary
                          : done
                              ? const Color(0xFF10B981)
                              : theme.colorScheme.surfaceContainerHighest,
                      child: active
                          ? const Icon(Icons.adjust,
                              color: Colors.white, size: 16)
                          : done
                              ? const Icon(Icons.check,
                                  color: Colors.white, size: 16)
                              : Text('${i + 1}',
                                  style: GoogleFonts.dmSans(
                                      color: theme.colorScheme.onSurface,
                                      fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 6),
                    SizedBox(
                      width: 100,
                      child: Text(stages[i],
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.dmSans(
                            fontSize: 12,
                            color: active
                                ? theme.colorScheme.primary
                                : theme.disabledColor,
                          )),
                    )
                  ],
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

// Team/Founders section
class _TeamSection extends StatelessWidget {
  final List members;
  const _TeamSection({required this.members});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (members.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.dividerColor),
        ),
        child: Center(
          child: Text('No team members added yet.',
              style: GoogleFonts.dmSans(color: theme.disabledColor)),
        ),
      );
    }
    final toShow = members.length > 5 ? 5 : members.length;
    final more = members.length - toShow;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Project Team',
            style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface)),
        const SizedBox(height: 12),
        Row(
          children: [
            for (var i = 0; i < toShow; i++)
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: GestureDetector(
                  onTap: () {
                    final m = members[i];
                    final name = m['name'] ?? m['memberName'] ?? 'Founder';
                    ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Opening: $name')));
                  },
                  child: CircleAvatar(
                    radius: 26,
                    backgroundImage: members[i]['avatar'] != null
                        ? NetworkImage(members[i]['avatar'])
                        : null,
                    backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    child: members[i]['avatar'] == null
                        ? Text((members[i]['name'] ?? 'U')
                            .toString()
                            .substring(0, 1))
                        : null,
                  ),
                ),
              ),
            if (more > 0)
              CircleAvatar(
                radius: 26,
                backgroundColor: theme.colorScheme.surfaceContainerHighest,
                child: Text('+$more', style: GoogleFonts.dmSans()),
              )
          ],
        ),
      ],
    );
  }
}

class _EquityDetailMetrics extends StatelessWidget {
  final Map item;
  const _EquityDetailMetrics({required this.item});

  double _parseDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }

  int _parseInt(dynamic v) {
    if (v == null) return 0;
    if (v is int) return v;
    return int.tryParse(v.toString()) ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currency = item['currency']?.toString().trim().isNotEmpty == true
        ? item['currency'].toString()
        : r'$';
    final sharePrice = _parseDouble(
        item['sharePrice'] ?? item['share_price'] ?? item['share_price_usd']);
    final totalShares =
        _parseInt(item['totalShares'] ?? item['total_shares'] ?? 0);
    final available = _parseInt(item['availableShares'] ??
        item['available_shares'] ??
        item['availableSharesCount']);
    final expectedRoi = _parseDouble(
        item['expectedROI'] ?? item['expected_roi'] ?? item['roi']);
    final valuationCap =
        _parseDouble(item['valuationCap'] ?? item['valuation_cap'] ?? 0);

    final List<Widget> tiles = [];
    if (sharePrice > 0) {
      tiles.add(_metricCard(context, 'Share Price',
          '$currency${sharePrice.toStringAsFixed(2)}', Icons.payments_rounded));
    }
    if (expectedRoi > 0) {
      tiles.add(_metricCard(context, 'Expected ROI',
          '${expectedRoi.toStringAsFixed(1)}%', Icons.trending_up_rounded));
    }
    if (totalShares > 0) {
      tiles.add(_metricCard(
          context, 'Total Shares', '$totalShares', Icons.grid_view_rounded));
    }
    if (available > 0) {
      tiles.add(_metricCard(context, 'Available Shares', '$available',
          Icons.inventory_2_rounded));
    }
    if (valuationCap > 0) {
      tiles.add(_metricCard(
          context,
          'Valuation Cap',
          '$currency${valuationCap.toStringAsFixed(0)}',
          Icons.analytics_outlined));
    }

    if (tiles.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Equity Details',
            style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface)),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 3.2,
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          children: tiles,
        ),
      ],
    );
  }
}

Widget _metricCard(
    BuildContext context, String title, String value, IconData icon) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;
  return Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: isDark
            ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
            : [Colors.white, const Color(0xFFF9FAFB)],
      ),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(
        color: theme.colorScheme.outline.withOpacity(isDark ? 0.15 : 0.08),
        width: 1,
      ),
      boxShadow: [
        BoxShadow(
          color: theme.colorScheme.primary.withOpacity(0.06),
          blurRadius: 16,
          offset: const Offset(0, 4),
          spreadRadius: 0,
        ),
        BoxShadow(
          color: isDark
              ? Colors.white.withOpacity(0.02)
              : Colors.white.withOpacity(0.8),
          blurRadius: 6,
          offset: const Offset(-1, -1),
        ),
      ],
    ),
    child: Row(
      children: [
        // Icon with gradient background
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primary.withOpacity(0.12),
                theme.colorScheme.primary.withOpacity(0.04),
              ],
            ),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: theme.colorScheme.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
        )
      ],
    ),
  );
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _RoundIconButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.dividerColor),
        ),
        child: Icon(icon,
            color: onTap != null
                ? theme.colorScheme.onSurface
                : theme.disabledColor),
      ),
    );
  }
}
