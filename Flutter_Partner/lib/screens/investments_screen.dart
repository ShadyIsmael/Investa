import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../utils/opportunity_status_ui.dart';

import '../services/categories_service.dart';
import '../services/investments_service.dart';
import '../services/config.dart';
import '../services/messages.dart';
import '../services/requests_service.dart';
import '../services/profile_service.dart';
import '../services/app_state.dart';
import '../services/app_logger.dart';
import '../widgets/engagement_confirmation_dialog.dart';
import 'investment_info_screen.dart';

class InvestmentFilter {
  final String? keyword;
  final double? minAmount;
  final double? maxAmount;
  final Set<String>? riskLevels; // e.g., {'Low','Medium','High'}
  final String? status; // e.g., 'Active','Closed'

  InvestmentFilter(
      {this.keyword,
      this.minAmount,
      this.maxAmount,
      this.riskLevels,
      this.status});
}

class InvestmentsScreen extends StatefulWidget {
  const InvestmentsScreen({Key? key}) : super(key: key);

  @override
  State<InvestmentsScreen> createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen> {
  final ValueNotifier<InvestmentFilter?> _filterNotifier = ValueNotifier(null);

  @override
  void dispose() {
    _filterNotifier.dispose();
    super.dispose();
  }

  Future<void> _openSearch(
      BuildContext context, InvestmentFilter? initial) async {
    final result = await showModalBottomSheet<InvestmentFilter>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: _AdvancedSearchSheet(initial: initial),
      ),
    );

    if (result != null) {
      _filterNotifier.value = result;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppPalette.midnightDeep : const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          'Investments',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            fontSize: 28,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () => _openSearch(context, _filterNotifier.value),
            icon: CircleAvatar(
              radius: 20,
              backgroundColor: theme.colorScheme.surface.withOpacityCompat(0.1),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(Icons.search, color: theme.colorScheme.onSurface),
                  if (_filterNotifier.value != null)
                    Positioned(
                      right: -2,
                      top: -2,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                            color: AppPalette.flame, shape: BoxShape.circle),
                      ),
                    )
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: FutureBuilder<List<Category>>(
        future: CategoriesService().fetchCategories(),
        builder: (fCtx, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator.adaptive());
          }
          final apiCats = snap.data ?? [];
          final categories = <Category>[
            Category(id: -1, key: 'all', value: 'All', valueAr: '????')
          ];
          categories.addAll(apiCats);

          return DefaultTabController(
            length: categories.length,
            child: Column(
              children: [
                _buildTabBar(context, categories),
                Expanded(
                  child: TabBarView(
                    physics: const BouncingScrollPhysics(),
                    children: categories
                        .map((c) => _InvestmentsList(
                            category: c, filterListenable: _filterNotifier))
                        .toList(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTabBar(BuildContext context, List<Category> categories) {
    final theme = Theme.of(context);
    return Container(
      height: 48,
      margin: const EdgeInsets.only(bottom: 8),
      child: TabBar(
        isScrollable: true,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        labelPadding: const EdgeInsets.only(right: 24),
        indicator: UnderlineTabIndicator(
          borderSide: BorderSide(width: 3, color: theme.colorScheme.primary),
          insets: const EdgeInsets.only(right: 24),
        ),
        labelStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
        unselectedLabelStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
        labelColor: theme.colorScheme.primary,
        unselectedLabelColor:
            theme.textTheme.bodyMedium?.color?.withOpacityCompat(0.5),
        tabs: categories
            .map((c) => Tab(
                text: context.isArabic && c.valueAr.isNotEmpty
                    ? c.valueAr
                    : c.value))
            .toList(),
      ),
    );
  }
}

class _InvestmentsList extends StatefulWidget {
  final Category category;
  final ValueNotifier<InvestmentFilter?>? filterListenable;

  const _InvestmentsList(
      {Key? key, required this.category, this.filterListenable})
      : super(key: key);

  @override
  State<_InvestmentsList> createState() => _InvestmentsListState();
}

class _InvestmentsListState extends State<_InvestmentsList>
    with AutomaticKeepAliveClientMixin {
  late Future<List<dynamic>> _future;

  @override
  bool get wantKeepAlive => true;

  List<dynamic> _original = [];
  List<dynamic> _filtered = [];
  VoidCallback? _filterListener;

  void _load() {
    final catId = widget.category.id == -1 ? null : widget.category.id;
    _future = InvestmentsService().fetchByCategory(catId);
  }

  @override
  void initState() {
    super.initState();
    _load();
    if (widget.filterListenable != null) {
      _filterListener =
          () => setState(() => _applyFilter(widget.filterListenable!.value));
      widget.filterListenable!.addListener(_filterListener!);
    }
  }

  @override
  void dispose() {
    if (widget.filterListenable != null && _filterListener != null) {
      widget.filterListenable!.removeListener(_filterListener!);
    }
    super.dispose();
  }

  void _applyFilter(InvestmentFilter? f) {
    if (f == null) {
      _filtered = List.from(_original);
      return;
    }

    _filtered = _original.where((it) {
      final item = it as Map<String, dynamic>;

      // Keyword
      if (f.keyword != null && f.keyword!.isNotEmpty) {
        final kw = f.keyword!.toLowerCase();
        final title = (item['businessName'] ?? item['title'] ?? '')
            .toString()
            .toLowerCase();
        final desc = (item['description'] ?? item['details'] ?? '')
            .toString()
            .toLowerCase();
        if (!title.contains(kw) && !desc.contains(kw)) return false;
      }

      // Amount bounds
      double target = 0.0;
      final tgt = item['targetFund'] ?? item['target'] ?? item['goal'];
      if (tgt is num) target = tgt.toDouble();
      if (tgt is String) {
        target = double.tryParse(tgt.replaceAll(',', '')) ?? 0.0;
      }
      if (f.minAmount != null && target < f.minAmount!) return false;
      if (f.maxAmount != null && target > f.maxAmount!) return false;

      // Risk
      final risk = (item['riskLevel'] as String? ?? '').toLowerCase();
      if (f.riskLevels != null && f.riskLevels!.isNotEmpty) {
        final matches = f.riskLevels!.any((r) => r.toLowerCase() == risk);
        if (!matches) return false;
      }

      // Status (simple match)
      if (f.status != null && f.status!.isNotEmpty) {
        final st = (item['status'] ?? '').toString().toLowerCase();
        if (!st.contains(f.status!.toLowerCase())) return false;
      }

      return true;
    }).toList();

    // If no results but filters are active, keep empty list; otherwise, fall back to all
    if (_filtered.isEmpty &&
        (f.keyword == null &&
            f.minAmount == null &&
            f.maxAmount == null &&
            (f.riskLevels == null || f.riskLevels!.isEmpty) &&
            (f.status == null || f.status!.isEmpty))) {
      _filtered = List.from(_original);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final theme = Theme.of(context);

    return FutureBuilder<List<dynamic>>(
      future: _future,
      builder: (ctx, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator.adaptive());
        }
        if (snap.hasError) {
          return Center(child: Text('Error: ${snap.error}'));
        }
        _original = snap.data ?? <dynamic>[];
        if (_filtered.isEmpty && _original.isNotEmpty) {
          _applyFilter(widget.filterListenable?.value);
        }

        final list = _filtered;
        if (list.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.folder_open_rounded,
                    size: 64, color: theme.disabledColor),
                const SizedBox(height: 16),
                Text('No investments found',
                    style: theme.textTheme.bodyLarge
                        ?.copyWith(color: theme.disabledColor)),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: list.length,
          separatorBuilder: (_, __) => const SizedBox(height: 20),
          physics: const BouncingScrollPhysics(),
          itemBuilder: (ctx, i) {
            final item = list[i] as Map<String, dynamic>;
            return _InvestmentCard(item: item, category: widget.category);
          },
        );
      },
    );
  }
}

class _InvestmentCard extends StatefulWidget {
  final Map<String, dynamic> item;
  final Category category;
  const _InvestmentCard({Key? key, required this.item, required this.category})
      : super(key: key);

  @override
  State<_InvestmentCard> createState() => _InvestmentCardState();
}

class _InvestmentCardState extends State<_InvestmentCard> {
  bool _fav = false;

  void _toggleFav() {
    setState(() => _fav = !_fav);
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(_fav
            ? AppMessages.addedToFavorites
            : AppMessages.removedFromFavorites),
        duration: const Duration(seconds: 1)));
  }

  void _share() {
    final title =
        widget.item['businessName'] ?? widget.item['title'] ?? 'Investment';
    final desc = widget.item['description'] ?? widget.item['details'] ?? '';
    Clipboard.setData(ClipboardData(text: '$title\n$desc')).then((_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Copied!')));
    });
  }

  /// Handles engagement flow with two-step confirmation.
  ///
  /// Mirrors the Angular client portal flow:
  /// 1. Refresh user profile to get latest credits
  /// 2. Show confirmation dialog with credit details
  /// 3. On confirm, call API to create investment request
  /// 4. Refresh profile again after API call
  /// 5. Show success/error message
  Future<void> _handleEngage() async {
    try {
      // Step 1: Refresh user profile to get latest wallet balance
      // This mirrors Angular's refreshUser() call before showing engagement modal
      AppLogger.logInfo(
          'InvestmentsScreen', 'Refreshing user profile before engagement');

      final profileService = ProfileService();
      await profileService.fetchProfile();

      if (!mounted) return;

      // Step 2: Show confirmation dialog with credit details
      // This mirrors Angular's engagementConfirmationOpen signal
      final profile = AppState.instance.profile;
      final initialCredits = (profile?.credit?.toDouble()) ??
          profile?.coreMetrics?.walletBalance ??
          0.0;

      // Debug: log the values passed to the confirmation dialog
      try {
        AppLogger.logInfo('InvestmentsScreen',
            'Opening engagement dialog - initialCredits=$initialCredits, investmentKeys=${widget.item.keys.toList()}');
      } catch (_) {}

      final confirmed = await showEngagementConfirmationDialog(
        context: context,
        investment: widget.item,
        initialCredits: initialCredits,
        onConfirm: () async {
          // Step 3: Create investment request via API
          // This mirrors Angular's createInvestmentRequest() call
          final requestsService = RequestsService();
          final engagementCost = Env.engageCreditCost.toDouble();

          await requestsService.createInvestmentRequest(
            investment: widget.item,
            amount: engagementCost,
            shares: 0, // Engagement/Funding type has 0 shares
          );

          AppLogger.logInfo(
              'InvestmentsScreen', 'Engagement request created successfully');
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
          'InvestmentsScreen', 'Failed to create engagement request: $e');

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

  Future<void> _handleInvest() async {
    final isEquity = _isEquity(widget.item);
    final title =
        widget.item['businessName'] ?? widget.item['title'] ?? 'Investment';
    final currency =
        widget.item['currency']?.toString().trim().isNotEmpty == true
            ? widget.item['currency'].toString()
            : r'$';

    if (isEquity) {
      final sharePrice = _parseDouble(widget.item['sharePrice'] ??
          widget.item['share_price'] ??
          widget.item['share_price_usd']);
      final available = _parseInt(widget.item['availableShares'] ??
          widget.item['available_shares'] ??
          widget.item['availableSharesCount']);
      final expectedRoi = _parseDouble(widget.item['expectedROI'] ??
          widget.item['expected_roi'] ??
          widget.item['roi']);

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
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(AppMessages.investRequestSent(title))));
      }
    } else {
      await _handleEngage();
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
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: theme.scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
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
          child: StatefulBuilder(
            builder: (ctx, setModalState) {
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
                        color: theme.colorScheme.onSurface,
                      )),
                  const SizedBox(height: 16),

                  // Share info
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: theme.dividerColor),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(AppMessages.sharePriceLabel,
                                  style: GoogleFonts.dmSans(
                                      fontSize: 12,
                                      color: theme.disabledColor,
                                      fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              Text('$currency${sharePrice.toStringAsFixed(2)}',
                                  style: GoogleFonts.outfit(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.onSurface)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(AppMessages.sharesAvailableLabel,
                                style: GoogleFonts.dmSans(
                                    fontSize: 12,
                                    color: theme.disabledColor,
                                    fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text('$availableShares',
                                style: GoogleFonts.outfit(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: theme.colorScheme.primary)),
                          ],
                        )
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Shares input
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
                        onTap:
                            shares > 1 ? () => updateShares(shares - 1) : null,
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

                  // Summary
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      color: theme.colorScheme.surfaceContainerHighest,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(AppMessages.totalInvestmentLabel,
                                style: GoogleFonts.dmSans(
                                    color: theme.disabledColor,
                                    fontWeight: FontWeight.w600)),
                            Text('$currency${total.toStringAsFixed(2)}',
                                style: GoogleFonts.outfit(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w700,
                                    color: theme.colorScheme.onSurface)),
                          ],
                        ),
                        if (expectedRoi != null && expectedRoi > 0) ...[
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(AppMessages.expectedRoiLabel,
                                  style: GoogleFonts.dmSans(
                                      color: theme.disabledColor,
                                      fontWeight: FontWeight.w600)),
                              Text('${expectedRoi.toStringAsFixed(1)}%',
                                  style: GoogleFonts.outfit(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF10B981))),
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
            },
          ),
        );
      },
    );
  }

  bool _isEquity(Map<String, dynamic> item) {
    final raw = (item['investmentType'] ?? item['type'] ?? '').toString();
    return raw.toLowerCase() == 'equity';
  }

  String? _getCoverImage(Map<String, dynamic> item) {
    // Try to get cover image from images array
    final images = item['images'] as List?;
    if (images != null && images.isNotEmpty) {
      for (final img in images) {
        if (img is Map) {
          // Check for primary image
          if (img['isPrimary'] == true) {
            return img['url'] as String?;
          }
        }
      }
      // Fall back to first image
      if (images.first is Map) {
        return images.first['url'] as String?;
      }
    }
    // Fall back to legacy imageUrl field
    return item['imageUrl'] as String?;
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

  void _showReviews() {
    final reviews = widget.item['reviews'] as List?;
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Reviews',
                style: GoogleFonts.outfit(
                    fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (reviews == null || reviews.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('No reviews yet.', textAlign: TextAlign.center),
              )
            else
              Expanded(
                child: ListView.separated(
                  itemCount: reviews.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (ctx, i) {
                    final r = reviews[i] as Map<String, dynamic>;
                    return ListTile(
                      title: Text(r['author'] ?? 'User'),
                      subtitle: Text(r['text'] ?? r['comment'] ?? ''),
                      trailing:
                          r['score'] != null ? Text('? ${r['score']}') : null,
                    );
                  },
                ),
              )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Data Preparation
    final item = widget.item;
    final title = item['businessName'] ?? item['title'] ?? 'Venture';
    final desc = item['description'] ?? item['details'] ?? '';
    final avatar = item['authorAvatar'] ?? item['avatar'];
    final risk = (item['riskLevel'] as String? ?? 'Medium');
    final targetVal = item['targetFund'];
    final currency = item['currency'] ?? '\$';

    // Progress Logic
    double raised = 0.0;
    double target = 0.0;

    // Parse target
    if (targetVal is num) {
      target = targetVal.toDouble();
    } else if (targetVal is String) {
      target = double.tryParse(targetVal.replaceAll(',', '')) ?? 0.0;
    }

    // Parse raised
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
    final percentStr = '${(progress * 100).toStringAsFixed(0)}%';

    // Modern color scheme based on risk level
    Color riskColor;
    Color riskBgColor;
    switch (risk.toLowerCase()) {
      case 'low':
        riskColor = const Color(0xFF10B981);
        riskBgColor = const Color(0xFF10B981).withOpacity(0.1);
        break;
      case 'high':
        riskColor = const Color(0xFFEF4444);
        riskBgColor = const Color(0xFFEF4444).withOpacity(0.1);
        break;
      default:
        riskColor = const Color(0xFFF59E0B);
        riskBgColor = const Color(0xFFF59E0B).withOpacity(0.1);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [
                  const Color(0xFF1E293B),
                  const Color(0xFF0F172A),
                ]
              : [
                  Colors.white,
                  const Color(0xFFF8FAFC),
                ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark
              ? const Color(0xFF334155).withOpacity(0.3)
              : Colors.grey.shade200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withOpacity(0.4)
                : const Color(0xFF3B82F6).withOpacity(0.08),
            offset: const Offset(0, 4),
            blurRadius: 24,
            spreadRadius: 0,
          ),
          BoxShadow(
            color: isDark
                ? const Color(0xFF0F172A).withOpacity(0.5)
                : Colors.white.withOpacity(0.8),
            offset: const Offset(0, -2),
            blurRadius: 12,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => InvestmentInfoScreen(
                        item: item, category: widget.category)));
          },
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              // Subtle inner glow effect
              boxShadow: [
                BoxShadow(
                  color: theme.colorScheme.primary.withOpacity(0.05),
                  offset: const Offset(0, 0),
                  blurRadius: 8,
                  spreadRadius: -2,
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cover Image
                  if (_getCoverImage(item) != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        _getCoverImage(item)!,
                        height: 120,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 120,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            Icons.image_not_supported_outlined,
                            size: 48,
                            color: theme.colorScheme.onSurface
                                .withOpacityCompat(0.3),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  // Header with Avatar and Status
                  Row(
                    children: [
                      // Enhanced Avatar with gradient border
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              theme.colorScheme.primary,
                              theme.colorScheme.primary.withOpacity(0.5),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        padding: const EdgeInsets.all(2),
                        child: Container(
                          decoration: BoxDecoration(
                            color:
                                isDark ? const Color(0xFF1E293B) : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: _buildAvatar(avatar),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.w700,
                                fontSize: 17,
                                letterSpacing: -0.3,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 6),
                            // Status badge (Opportunity Lifecycle)
                            OpportunityStatusUi.badge(
                              raw: item['status'] ??
                                  item['opportunityStatus'] ??
                                  item['opportunity_status'] ??
                                  item['lifecycleStatus'],
                              textStyle: TextStyle(fontSize: 11),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                            ),

                            // Risk badge (existing UI)
                            Container(
                              margin: const EdgeInsets.only(top: 6),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: riskBgColor,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: riskColor.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: riskColor,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '$risk Risk',
                                    style: GoogleFonts.dmSans(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: riskColor,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Favorite button with modern styling
                      Container(
                        decoration: BoxDecoration(
                          color: _fav
                              ? AppPalette.flame.withOpacity(0.1)
                              : theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: IconButton(
                          icon: Icon(
                            _fav ? Icons.favorite : Icons.favorite_border,
                            size: 20,
                          ),
                          color: _fav ? AppPalette.flame : theme.disabledColor,
                          onPressed: _toggleFav,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // Description with better styling
                  Text(
                    desc,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color:
                          theme.colorScheme.onSurface.withOpacityCompat(0.65),
                      height: 1.6,
                      letterSpacing: 0.1,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Equity-only quick metrics with enhanced styling
                  if (_isEquity(widget.item))
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [
                                  const Color(0xFF334155).withOpacity(0.3),
                                  const Color(0xFF1E293B).withOpacity(0.2),
                                ]
                              : [
                                  const Color(0xFFF1F5F9),
                                  const Color(0xFFE2E8F0),
                                ],
                        ),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF475569).withOpacity(0.2)
                              : const Color(0xFFCBD5E1),
                          width: 1,
                        ),
                      ),
                      child: _EquityQuickMetrics(item: widget.item),
                    ),

                  if (_isEquity(widget.item)) const SizedBox(height: 18),

                  // Funding Progress with modern design
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF0F172A).withOpacity(0.5)
                          : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark
                            ? const Color(0xFF334155).withOpacity(0.3)
                            : const Color(0xFFE2E8F0),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: progress >= 0.75
                                        ? const Color(0xFF10B981)
                                            .withOpacity(0.1)
                                        : progress >= 0.4
                                            ? AppPalette.amber.withOpacity(0.1)
                                            : AppPalette.flame.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Icon(
                                    Icons.trending_up_rounded,
                                    size: 16,
                                    color: progress >= 0.75
                                        ? const Color(0xFF10B981)
                                        : progress >= 0.4
                                            ? AppPalette.amber
                                            : AppPalette.flame,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  'Funded',
                                  style: GoogleFonts.dmSans(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.7),
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    theme.colorScheme.primary.withOpacity(0.1),
                                    theme.colorScheme.primary.withOpacity(0.05),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: theme.colorScheme.primary
                                      .withOpacity(0.2),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                percentStr,
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Raised',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: theme.disabledColor,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$currency${raised.toStringAsFixed(0)}',
                                  style: GoogleFonts.outfit(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: theme.colorScheme.onSurface,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Target',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: theme.disabledColor,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$currency${target.toStringAsFixed(0)}',
                                  style: GoogleFonts.outfit(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: theme.disabledColor,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Enhanced progress bar with gradient
                        Container(
                          height: 8,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(6),
                            color: isDark
                                ? const Color(0xFF1E293B)
                                : const Color(0xFFE2E8F0),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: Stack(
                              children: [
                                LinearProgressIndicator(
                                  value: progress,
                                  minHeight: 8,
                                  backgroundColor: Colors.transparent,
                                  valueColor: AlwaysStoppedAnimation(
                                    progress >= 0.75
                                        ? const Color(0xFF10B981)
                                        : progress >= 0.4
                                            ? AppPalette.amber
                                            : AppPalette.flame,
                                  ),
                                ),
                                // Animated shimmer effect on progress
                                if (progress > 0)
                                  Positioned.fill(
                                    child: FractionallySizedBox(
                                      alignment: Alignment.centerLeft,
                                      widthFactor: progress,
                                      child: Container(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              Colors.white.withOpacity(0.0),
                                              Colors.white.withOpacity(0.2),
                                              Colors.white.withOpacity(0.0),
                                            ],
                                            stops: const [0.0, 0.5, 1.0],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Actions with modern button design
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _showReviews,
                          icon: const Icon(Icons.star_border_rounded, size: 18),
                          label: const Text('Reviews'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: theme.colorScheme.onSurface,
                            side: BorderSide(
                              color: isDark
                                  ? const Color(0xFF475569)
                                  : const Color(0xFFCBD5E1),
                              width: 1.5,
                            ),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark
                                ? const Color(0xFF475569).withOpacity(0.3)
                                : const Color(0xFFE2E8F0),
                            width: 1,
                          ),
                        ),
                        child: IconButton(
                          onPressed: _share,
                          icon: const Icon(Icons.ios_share_rounded, size: 20),
                          padding: const EdgeInsets.all(12),
                          constraints: const BoxConstraints(
                            minWidth: 48,
                            minHeight: 48,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                theme.colorScheme.primary,
                                theme.colorScheme.primary.withOpacity(0.8),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color:
                                    theme.colorScheme.primary.withOpacity(0.4),
                                offset: const Offset(0, 4),
                                blurRadius: 12,
                                spreadRadius: 0,
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: _handleInvest,
                            icon: const Icon(Icons.rocket_launch_rounded,
                                size: 18),
                            label: const Text('Invest'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              foregroundColor: Colors.white,
                              shadowColor: Colors.transparent,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              textStyle: GoogleFonts.outfit(
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(String? url) {
    if (url == null || url.isEmpty) {
      return Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppPalette.midnight.withOpacityCompat(0.8),
              AppPalette.midnight.withOpacityCompat(0.5),
            ],
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Icon(Icons.apartment_rounded,
            color: Colors.white70, size: 28),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Image.network(
        url,
        width: 56,
        height: 56,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppPalette.midnight.withOpacityCompat(0.8),
                AppPalette.midnight.withOpacityCompat(0.5),
              ],
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Icon(Icons.apartment_rounded,
              color: Colors.white70, size: 28),
        ),
      ),
    );
  }

  Widget _buildRiskBadge(String level, ThemeData theme) {
    Color color;
    switch (level.toUpperCase()) {
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacityCompat(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacityCompat(0.2)),
      ),
      child: Text(level.toUpperCase(),
          style: GoogleFonts.dmSans(
              fontSize: 10, fontWeight: FontWeight.bold, color: color)),
    );
  }
}

/// Screen that shows the investments the logged-in user has engaged with.
class MyInvestmentsScreen extends StatefulWidget {
  const MyInvestmentsScreen({Key? key}) : super(key: key);

  @override
  State<MyInvestmentsScreen> createState() => _MyInvestmentsScreenState();
}

class _MyInvestmentsScreenState extends State<MyInvestmentsScreen> {
  late Future<List<dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _future = InvestmentsService().fetchMyInvestments();
  }

  Future<void> _refresh() async {
    _load();
    setState(() {});
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor:
          isDark ? AppPalette.midnightDeep : const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          loc.t('investments'),
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            fontSize: 28,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _future,
        builder: (ctx, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator.adaptive());
          }
          if (snap.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline,
                        size: 44,
                        color:
                            theme.colorScheme.onSurface.withOpacityCompat(0.5)),
                    const SizedBox(height: 12),
                    Text('Failed to load investments.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurface
                                .withOpacityCompat(0.7))),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final items = snap.data ?? <dynamic>[];
          if (items.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.18),
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
                        Text('No engaged investments found',
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        Text('Pull to refresh',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
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
            onRefresh: _refresh,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 20),
              physics: const BouncingScrollPhysics(),
              itemBuilder: (ctx, i) {
                final item = items[i] as Map<String, dynamic>;
                final category = Category(
                    id: -1,
                    key: 'my',
                    value: loc.t('investments'),
                    valueAr: '????');
                return _InvestmentCard(item: item, category: category);
              },
            ),
          );
        },
      ),
    );
  }
}

class _EquityQuickMetrics extends StatelessWidget {
  final Map<String, dynamic> item;
  const _EquityQuickMetrics({required this.item});

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
    final currency = item['currency']?.toString().trim().isNotEmpty == true
        ? item['currency'].toString()
        : r'$';

    final sharePrice = _parseDouble(
        item['sharePrice'] ?? item['share_price'] ?? item['share_price_usd']);
    final expectedRoi = _parseDouble(
        item['expectedROI'] ?? item['expected_roi'] ?? item['roi']);
    final available = _parseInt(item['availableShares'] ??
        item['available_shares'] ??
        item['availableSharesCount']);
    final valuationCap = _parseDouble(
        item['valuationCap'] ?? item['valuation_cap'] ?? item['valuation']);

    final chips = <Widget>[];
    if (sharePrice > 0) {
      chips.add(_pill(theme, 'Share: $currency${sharePrice.toStringAsFixed(2)}',
          Icons.payments_rounded));
    }
    if (expectedRoi > 0) {
      chips.add(_pill(theme, 'ROI: ${expectedRoi.toStringAsFixed(1)}%',
          Icons.trending_up_rounded));
    }
    if (available > 0) {
      chips.add(_pill(theme, 'Avail: $available', Icons.inventory_2_rounded));
    }
    if (valuationCap > 0) {
      chips.add(_pill(
          theme,
          'Valuation: $currency${valuationCap.toStringAsFixed(0)}',
          Icons.analytics_outlined));
    }

    if (chips.isEmpty) return const SizedBox.shrink();

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: chips,
    );
  }

  Widget _pill(ThemeData theme, String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        border: Border.all(color: theme.dividerColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: 6),
          Text(text, style: GoogleFonts.dmSans(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
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

// Advanced search bottom sheet
class _AdvancedSearchSheet extends StatefulWidget {
  final InvestmentFilter? initial;
  const _AdvancedSearchSheet({Key? key, this.initial}) : super(key: key);

  @override
  State<_AdvancedSearchSheet> createState() => _AdvancedSearchSheetState();
}

class _AdvancedSearchSheetState extends State<_AdvancedSearchSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _keywordCtrl;
  late TextEditingController _minCtrl;
  late TextEditingController _maxCtrl;
  Set<String> _risk = {};
  String? _status;

  @override
  void initState() {
    super.initState();
    _keywordCtrl = TextEditingController(text: widget.initial?.keyword ?? '');
    _minCtrl = TextEditingController(
        text: widget.initial?.minAmount?.toString() ?? '');
    _maxCtrl = TextEditingController(
        text: widget.initial?.maxAmount?.toString() ?? '');
    _risk = widget.initial?.riskLevels != null
        ? Set.from(widget.initial!.riskLevels!)
        : {};
    _status = widget.initial?.status;
  }

  @override
  void dispose() {
    _keywordCtrl.dispose();
    _minCtrl.dispose();
    _maxCtrl.dispose();
    super.dispose();
  }

  void _apply() {
    if (!_formKey.currentState!.validate()) return;
    final min = double.tryParse(_minCtrl.text.trim());
    final max = double.tryParse(_maxCtrl.text.trim());
    final f = InvestmentFilter(
      keyword:
          _keywordCtrl.text.trim().isEmpty ? null : _keywordCtrl.text.trim(),
      minAmount: min,
      maxAmount: max,
      riskLevels: _risk.isEmpty ? null : _risk,
      status: _status,
    );
    Navigator.of(context).pop(f);
  }

  void _clear() {
    setState(() {
      _keywordCtrl.clear();
      _minCtrl.clear();
      _maxCtrl.clear();
      _risk.clear();
      _status = null;
    });
    // Return null to indicate cleared filters
    Navigator.of(context).pop(null);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Advanced Search',
              style: GoogleFonts.outfit(
                  fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _keywordCtrl,
                  decoration: const InputDecoration(labelText: 'Keyword'),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                        child: TextFormField(
                            controller: _minCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                                labelText: 'Min amount'))),
                    const SizedBox(width: 12),
                    Expanded(
                        child: TextFormField(
                            controller: _maxCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                                labelText: 'Max amount'))),
                  ],
                ),
                const SizedBox(height: 12),
                // Risk checkboxes
                Align(
                    alignment: Alignment.centerLeft,
                    child:
                        Text('Risk level', style: theme.textTheme.bodyMedium)),
                Row(
                  children: ['Low', 'Medium', 'High']
                      .map((r) => Padding(
                            padding: const EdgeInsets.only(right: 12.0),
                            child: FilterChip(
                              label: Text(r),
                              selected: _risk.contains(r),
                              onSelected: (s) => setState(
                                  () => s ? _risk.add(r) : _risk.remove(r)),
                            ),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: null, child: Text('Any')),
                    DropdownMenuItem(value: 'Active', child: Text('Active')),
                    DropdownMenuItem(value: 'Closed', child: Text('Closed')),
                  ],
                  onChanged: (v) => setState(() => _status = v),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                        child: OutlinedButton(
                            onPressed: _clear, child: const Text('Clear'))),
                    const SizedBox(width: 12),
                    Expanded(
                        child: ElevatedButton(
                            onPressed: _apply, child: const Text('Apply'))),
                  ],
                ),
                const SizedBox(height: 8),
              ],
            ),
          )
        ],
      ),
    );
  }
}
