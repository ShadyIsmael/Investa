import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../services/categories_service.dart';
import '../services/investments_service.dart';
import '../services/config.dart';
import '../services/messages.dart';
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
        tabs: categories.map((c) => Tab(text: c.value)).toList(),
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

  Future<void> _handleEngage() async {
    final cost = Env.engageCreditCost;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Interest'),
        content: Text('Engaging will consume $cost credits. Proceed?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Engage',
                  style: TextStyle(fontWeight: FontWeight.bold))),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppMessages.engageRequestSent)));
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

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacityCompat(isDark ? 0.3 : 0.05),
            offset: const Offset(0, 8),
            blurRadius: 20,
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => InvestmentInfoScreen(
                        item: item, category: widget.category)));
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _buildAvatar(avatar),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          _buildRiskBadge(risk, theme),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(_fav ? Icons.favorite : Icons.favorite_border),
                      color: _fav ? AppPalette.flame : theme.disabledColor,
                      onPressed: _toggleFav,
                    )
                  ],
                ),

                const SizedBox(height: 16),

                // Description
                Text(
                  desc,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.dmSans(
                    fontSize: 14,
                    color: theme.colorScheme.onSurface.withOpacityCompat(0.7),
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 12),

                // Equity-only quick metrics
                if (_isEquity(widget.item))
                  _EquityQuickMetrics(item: widget.item),

                const SizedBox(height: 20),

                // Funding Progress
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Funded ($percentStr)',
                          style: GoogleFonts.dmSans(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: theme.disabledColor),
                        ),
                        RichText(
                          text: TextSpan(
                            style: GoogleFonts.outfit(
                                color: theme.colorScheme.onSurface),
                            children: [
                              TextSpan(
                                  text:
                                      '$currency${raised.toStringAsFixed(0)} ',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                              TextSpan(
                                  text:
                                      '/ $currency${target.toStringAsFixed(0)}',
                                  style: TextStyle(color: theme.disabledColor)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 6,
                        backgroundColor:
                            theme.colorScheme.surfaceContainerHighest,
                        valueColor: AlwaysStoppedAnimation(progress >= 0.75
                            ? const Color(0xFF10B981)
                            : progress >= 0.4
                                ? AppPalette.amber
                                : AppPalette.flame),
                      ),
                    ),
                  ],
                ),

                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Divider(height: 1),
                ),

                // Actions
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _showReviews,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: theme.colorScheme.onSurface,
                          side: BorderSide(color: theme.dividerColor),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Reviews'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: _share,
                      icon: const Icon(Icons.share_rounded, size: 20),
                      style: IconButton.styleFrom(
                        backgroundColor:
                            theme.colorScheme.surfaceContainerHighest,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.all(12),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: _handleInvest,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          textStyle:
                              GoogleFonts.outfit(fontWeight: FontWeight.w600),
                        ),
                        child: const Text('Invest Now'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(String? url) {
    if (url == null || url.isEmpty) {
      return Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: AppPalette.midnight.withOpacityCompat(0.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.business, color: Colors.white70),
      );
    }
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
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
