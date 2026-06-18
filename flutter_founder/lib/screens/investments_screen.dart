import 'package:flutter/material.dart';
import '../models/investment.dart';
import '../theme/color_extensions.dart';
import '../l10n/app_localizations.dart';
import 'new_investment_screen.dart';
import 'investment_info_screen.dart';
import '../services/investments_service.dart';

class InvestmentsScreen extends StatefulWidget {
  const InvestmentsScreen({super.key});

  @override
  State<InvestmentsScreen> createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  bool _filtersExpanded = false;
  final Set<String> _selectedTypes = {}; // empty = all types
  double _minProgress = 0;
  double _maxProgress = 100;
  final Set<String> _pinnedInvestmentIds = {}; // Track pinned investments
  final InvestmentsService _service = InvestmentsService();
  List<Investment> investments = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(
          () => _searchQuery = _searchController.text.trim().toLowerCase());
    });
    _loadInvestments();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInvestments() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _service.fetchMyInvestments();
      final parsed = data
          .whereType<Map>()
          .map((raw) => _mapToInvestment(Map<String, dynamic>.from(raw)))
          .toList();
      setState(() {
        investments = parsed;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load your investments.';
        _loading = false;
      });
    }
  }

  Investment _mapToInvestment(Map<String, dynamic> raw) {
    double toDouble(dynamic v) {
      if (v is num) return v.toDouble();
      if (v is String) return double.tryParse(v.replaceAll(',', '')) ?? 0.0;
      return 0.0;
    }

    final id = (raw['id'] ?? raw['investmentId'] ?? raw['Id'] ?? '').toString();
    final title =
        (raw['businessName'] ?? raw['title'] ?? raw['name'] ?? '-').toString();
    final description = (raw['description'] ?? raw['details'] ?? '').toString();

    final typeValue = raw['type'] ?? raw['investmentType'] ?? raw['typeId'];
    String type = 'founding';
    if (typeValue is String) {
      type = typeValue.toLowerCase().contains('equity') ? 'equity' : 'founding';
    } else if (typeValue is num) {
      type = typeValue == 2 ? 'equity' : 'founding';
    }

    final targetAmount =
        toDouble(raw['targetAmount'] ?? raw['targetFund'] ?? raw['target']);
    final currentAmount = toDouble(raw['currentAmount'] ??
        raw['collected'] ??
        raw['collectedAmount'] ??
        raw['raised'] ??
        raw['raisedAmount'] ??
        raw['amountRaised'] ??
        raw['fundedAmount']);

    return Investment(
      id: id.isEmpty ? title : id,
      title: title,
      type: type,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      description: description,
      rawData: raw,
    );
  }

  List<Investment> _getFilteredInvestments() {
    var filtered = investments.where((inv) {
      // Search query filter
      if (_searchQuery.isNotEmpty) {
        final titleMatch = inv.title.toLowerCase().contains(_searchQuery);
        final descMatch = inv.description.toLowerCase().contains(_searchQuery);
        if (!titleMatch && !descMatch) return false;
      }

      // Type filter
      if (_selectedTypes.isNotEmpty && !_selectedTypes.contains(inv.type)) {
        return false;
      }

      // Progress range filter
      final progress = inv.progressPercent;
      if (progress < _minProgress || progress > _maxProgress) {
        return false;
      }

      return true;
    }).toList();

    // Sort: pinned investments first, then by current amount (descending)
    filtered.sort((a, b) {
      final aPinned = _pinnedInvestmentIds.contains(a.id);
      final bPinned = _pinnedInvestmentIds.contains(b.id);
      if (aPinned != bPinned) {
        return aPinned ? -1 : 1;
      }
      return b.currentAmount.compareTo(a.currentAmount);
    });

    return filtered;
  }

  void _clearFilters() {
    _searchController.clear();
    setState(() {
      _searchQuery = '';
      _selectedTypes.clear();
      _minProgress = 0;
      _maxProgress = 100;
      _filtersExpanded = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    if (_loading) {
      return Scaffold(
        backgroundColor:
            isDarkMode ? Colors.black : theme.scaffoldBackgroundColor,
        body: Center(
          child: CircularProgressIndicator(
            color: theme.colorScheme.primary,
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor:
            isDarkMode ? Colors.black : theme.scaffoldBackgroundColor,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline,
                    size: 44,
                    color: theme.colorScheme.onSurface.withOpacityCompat(0.5)),
                const SizedBox(height: 12),
                Text(_error!,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface
                            .withOpacityCompat(0.7))),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _loadInvestments,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Show empty state if no investments
    if (investments.isEmpty) {
      return _buildEmptyState(context, theme, loc);
    }

    final filteredInvestments = _getFilteredInvestments();
    final hasFilters = _searchQuery.isNotEmpty ||
        _selectedTypes.isNotEmpty ||
        _minProgress > 0 ||
        _maxProgress < 100;

    return Scaffold(
      backgroundColor:
          isDarkMode ? Colors.black : theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Text(
          loc.t('investments'),
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Search Panel
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: _buildSearchPanel(theme, loc, isDarkMode),
            ),
          ),
          // New Investment Button
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: ElevatedButton.icon(
                icon: const Icon(Icons.add_rounded, size: 20),
                label: Text(loc.t('new_investment')),
                style: ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: () async {
                  final result = await Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const NewInvestmentScreen(),
                    ),
                  );
                  if (result == true && mounted) {
                    setState(() {
                      // Refresh investments list
                    });
                  }
                },
              ),
            ),
          ),
          // Investments List
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
            sliver: filteredInvestments.isEmpty
                ? SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(Icons.search_off_rounded,
                                size: 44,
                                color: theme.colorScheme.onSurface
                                    .withOpacityCompat(0.35)),
                            const SizedBox(height: 12),
                            Text(
                              'No investments match your filters',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurface
                                    .withOpacityCompat(0.7),
                              ),
                              textAlign: TextAlign.center,
                            ),
                            if (hasFilters)
                              Padding(
                                padding: const EdgeInsets.only(top: 16),
                                child: TextButton(
                                  onPressed: _clearFilters,
                                  child:
                                      Text(loc.t('engagement_clear_filters')),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  )
                : SliverList.separated(
                    itemCount: filteredInvestments.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final investment = filteredInvestments[index];
                      final isPinned =
                          _pinnedInvestmentIds.contains(investment.id);
                      return _InvestmentCard(
                        investment: investment,
                        theme: theme,
                        isDarkMode: isDarkMode,
                        loc: loc,
                        isPinned: isPinned,
                        onPinToggle: () {
                          setState(() {
                            if (isPinned) {
                              // Unpin if already pinned
                              _pinnedInvestmentIds.remove(investment.id);
                            } else {
                              // Clear previous pin and set new one
                              _pinnedInvestmentIds.clear();
                              _pinnedInvestmentIds.add(investment.id);
                            }
                          });
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchPanel(
      ThemeData theme, AppLocalizations loc, bool isDarkMode) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border:
            Border.all(color: theme.colorScheme.outline.withOpacityCompat(0.4)),
        boxShadow: isDarkMode
            ? null
            : [
                BoxShadow(
                    color: Colors.black.withOpacityCompat(0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 8))
              ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.search_rounded,
                  size: 20,
                  color: theme.colorScheme.onSurface.withOpacityCompat(0.6)),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by title or description',
                    border: InputBorder.none,
                  ),
                ),
              ),
              if (_searchController.text.trim().isNotEmpty)
                IconButton(
                  onPressed: () {
                    _searchController.clear();
                  },
                  icon: const Icon(Icons.close, size: 18),
                  color: theme.colorScheme.onSurface.withOpacityCompat(0.6),
                ),
              IconButton(
                onPressed: () =>
                    setState(() => _filtersExpanded = !_filtersExpanded),
                icon: Icon(_filtersExpanded
                    ? Icons.tune_rounded
                    : Icons.tune_outlined),
                tooltip: 'Filters',
              ),
            ],
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOut,
            child: _filtersExpanded
                ? Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Type Filter
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Investment Type',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                children: ['founding', 'equity']
                                    .map((type) => FilterChip(
                                          label: Text(type == 'equity'
                                              ? 'Equity'
                                              : 'Founding'),
                                          selected:
                                              _selectedTypes.contains(type),
                                          onSelected: (selected) {
                                            setState(() {
                                              if (selected) {
                                                _selectedTypes.add(type);
                                              } else {
                                                _selectedTypes.remove(type);
                                              }
                                            });
                                          },
                                        ))
                                    .toList(),
                              ),
                            ],
                          ),
                        ),
                        // Progress Range Filter
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Target Progress',
                                    style: theme.textTheme.labelSmall?.copyWith(
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  Text(
                                    '${_minProgress.toStringAsFixed(0)}% - ${_maxProgress.toStringAsFixed(0)}%',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              RangeSlider(
                                values: RangeValues(_minProgress, _maxProgress),
                                min: 0,
                                max: 100,
                                onChanged: (RangeValues values) {
                                  setState(() {
                                    _minProgress = values.start;
                                    _maxProgress = values.end;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                        // Clear Filters Button
                        if (_searchController.text.trim().isNotEmpty ||
                            _selectedTypes.isNotEmpty ||
                            _minProgress > 0 ||
                            _maxProgress < 100)
                          SizedBox(
                            width: double.infinity,
                            child: TextButton(
                              onPressed: _clearFilters,
                              child: Text(loc.t('engagement_clear_filters')),
                            ),
                          ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(
      BuildContext context, ThemeData theme, AppLocalizations loc) {
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacityCompat(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.trending_up_rounded,
                  size: 60,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                loc.t('no_investments_title'),
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                loc.t('no_investments_subtitle'),
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacityCompat(0.7),
                ),
              ),
              const SizedBox(height: 48),
              ElevatedButton.icon(
                icon: const Icon(Icons.add_rounded, size: 22),
                label: Text(loc.t('create_investment')),
                style: ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () async {
                  final result = await Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const NewInvestmentScreen(),
                    ),
                  );
                  if (result == true && mounted) {
                    setState(() {
                      // Refresh after creation
                    });
                  }
                },
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}

class _InvestmentCard extends StatelessWidget {
  final Investment investment;
  final ThemeData theme;
  final bool isDarkMode;
  final AppLocalizations loc;
  final bool isPinned;
  final VoidCallback onPinToggle;

  const _InvestmentCard({
    required this.investment,
    required this.theme,
    required this.isDarkMode,
    required this.loc,
    required this.isPinned,
    required this.onPinToggle,
  });

  @override
  Widget build(BuildContext context) {
    final progress = investment.currentAmount / investment.targetAmount;
    final progressPercent = (progress * 100).toStringAsFixed(0);
    final typeLabel = investment.type == 'equity' ? 'Equity' : 'Founding';
    final typeColor = investment.type == 'equity'
        ? const Color(0xFF8B5CF6)
        : const Color(0xFFF59E0B);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacityCompat(0.3),
        ),
        boxShadow: isDarkMode
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacityCompat(0.06),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                )
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            // Navigate to investment details
            final investmentMap = <String, dynamic>{
              ...investment.rawData,
              'id': investment.id,
              'title': investment.title,
              'businessName': investment.title,
              'description': investment.description,
              'details': investment.description,
              'type': investment.type,
              'targetAmount': investment.targetAmount,
              'currentAmount': investment.currentAmount,
              'isFavorite': investment.rawData['isFavorite'] ?? false,
            };
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => InvestmentInfoScreen(item: investmentMap),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: Title + Type Badge + Pin
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            investment.title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            investment.description,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface
                                  .withOpacityCompat(0.7),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: typeColor.withOpacityCompat(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        typeLabel,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: typeColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    IconButton(
                      iconSize: 20,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(
                        minWidth: 40,
                        minHeight: 40,
                      ),
                      icon: Icon(
                        isPinned
                            ? Icons.push_pin_rounded
                            : Icons.push_pin_outlined,
                        color: isPinned
                            ? theme.colorScheme.primary
                            : theme.colorScheme.onSurface
                                .withOpacityCompat(0.5),
                      ),
                      onPressed: onPinToggle,
                      tooltip: isPinned ? 'Unpin' : 'Pin to top',
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Progress Bar
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Target Progress',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onSurface
                                .withOpacityCompat(0.7),
                          ),
                        ),
                        Text(
                          '$progressPercent%',
                          style: theme.textTheme.labelSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: progress > 1 ? 1 : progress,
                        minHeight: 8,
                        backgroundColor:
                            theme.colorScheme.surfaceContainerHighest,
                        valueColor: AlwaysStoppedAnimation(
                          progress >= 0.75
                              ? const Color(0xFF10B981)
                              : progress >= 0.4
                                  ? const Color(0xFFF59E0B)
                                  : const Color(0xFFEF4444),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Amount Info
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${_formatAmount(investment.currentAmount)}',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      'of \$${_formatAmount(investment.targetAmount)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color:
                            theme.colorScheme.onSurface.withOpacityCompat(0.6),
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

  String _formatAmount(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(1)}K';
    }
    return amount.toStringAsFixed(0);
  }
}
