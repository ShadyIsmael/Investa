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
            Category(id: -1, key: 'all', value: 'All', valueAr: 'الكل')
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
      if (tgt is String)
        target = double.tryParse(tgt.replaceAll(',', '')) ?? 0.0;
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
        if (_filtered.isEmpty && _original.isNotEmpty)
          _applyFilter(widget.filterListenable?.value);

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
                          r['score'] != null ? Text('⭐ ${r['score']}') : null,
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
                        onPressed: _handleEngage,
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
