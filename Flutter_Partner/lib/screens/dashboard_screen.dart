import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/mock_data.dart';
import '../services/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import '../widgets/simple_pie_chart.dart';
import 'package:fl_chart/fl_chart.dart';
import 'activities_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DashboardData> _dataFuture;
  int _touchedIndex = -1;
  String _selectedInterval = 'month';

  @override
  void initState() {
    super.initState();
    _dataFuture = fetchDashboardData(interval: _selectedInterval);
    AppState.instance.addListener(_onAppStateChanged);
  }

  @override
  void dispose() {
    AppState.instance.removeListener(_onAppStateChanged);
    super.dispose();
  }

  void _onAppStateChanged() {
    setState(() {
      _dataFuture = fetchDashboardData(interval: _selectedInterval);
    });
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final body = FutureBuilder<DashboardData>(
      future: _dataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (!snapshot.hasData) {
          return Center(child: Text(loc.t('unable_to_load_data')));
        }

        final data = snapshot.data!;
        return CustomScrollView(
          slivers: [
            SliverPersistentHeader(
              pinned: true,
              delegate: _HeroHeaderDelegate(data: data, loc: loc),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text('${loc.t('period')}:',
                            style: theme.textTheme.bodySmall),
                        const SizedBox(width: 8),
                        DropdownButton<String>(
                          value: _selectedInterval,
                          dropdownColor: theme.colorScheme.surface,
                          style: theme.textTheme.bodySmall,
                          items: [
                            DropdownMenuItem(
                                value: 'day', child: Text(loc.t('day'))),
                            DropdownMenuItem(
                                value: 'month', child: Text(loc.t('month'))),
                            DropdownMenuItem(
                                value: 'year', child: Text(loc.t('year'))),
                          ],
                          onChanged: (v) {
                            if (v == null) return;
                            setState(() {
                              _selectedInterval = v;
                              _dataFuture = fetchDashboardData(
                                  interval: _selectedInterval);
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    LineChartCard(
                        creditHistory: data.creditHistory,
                        scoreHistory: data.scoreHistory,
                        interval: _selectedInterval,
                        fromServer: data.timeseriesFromServer,
                        serverAttempted: data.timeseriesAttempted),
                    const SizedBox(height: 24),
                    _buildStatWrap(data, loc),
                    const SizedBox(height: 24),
                    _buildAllocationCard(data),
                    const SizedBox(height: 28),
                    _buildRecentActivities(data),
                    const SizedBox(height: 80), // Extra padding for bottom
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );

    return Scaffold(
        backgroundColor:
            isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
        body: isDarkMode ? AppBackground(child: body) : body);
  }

  Widget _buildStatWrap(DashboardData data, AppLocalizations loc) {
    return LayoutBuilder(builder: (context, constraints) {
      // Subtract a small slack to avoid fractional-overflow on tight layouts
      final w = ((constraints.maxWidth - 16) / 2).floorToDouble() - 2;
      return Wrap(
        spacing: 16,
        runSpacing: 16,
        children: [
          SizedBox(
            width: w,
            child: _StatCard(
              icon: Icons.arrow_upward_rounded,
              title: loc.t('income'),
              value: '\$${_formatAmount(data.totalIncome, decimals: 0)}',
              color: const Color(0xFF22C55E), // Success Green
            ),
          ),
          SizedBox(
            width: w,
            child: _StatCard(
              icon: Icons.arrow_downward_rounded,
              title: loc.t('outcome'),
              value: '\$${_formatAmount(data.totalOutcome, decimals: 0)}',
              color: Colors.redAccent,
            ),
          ),
          SizedBox(
            width: w,
            child: _StatCard(
              icon: Icons.pie_chart_rounded,
              title: loc.t('investments'),
              value: '${data.categories.length}',
              color: AppPalette.aqua,
            ),
          ),
          SizedBox(
            width: w,
            child: _StatCard(
              icon: Icons.verified_rounded,
              title: loc.t('score'),
              value: '${data.credibilityScore}',
              color: AppPalette.flame,
            ),
          ),
        ],
      );
    });
  }

  Widget _buildAllocationCard(DashboardData data) {
    final loc = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final scheme = theme.colorScheme;
    final categories = data.categories;
    final isLive = data.categoriesFromServer;

    return Container(
      decoration: isDarkMode
          ? AppDecorations.glass(radius: 28)
          : BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                  color:
                      theme.colorScheme.outline.withAlpha((0.5 * 255).round())),
            ),
      padding: const EdgeInsets.all(20),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isStacked = constraints.maxWidth < 560;

          final chart = SizedBox(
            height: isStacked ? 200 : 220,
            child: Center(
              child: SimplePieChart(
                categories: categories,
                size: isStacked ? 160 : 190,
                onSliceTap: (index) => setState(() => _touchedIndex = index),
              ),
            ),
          );

          final legend = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: categories.asMap().entries.map((entry) {
              final index = entry.key;
              final category = entry.value;
              final isSelected = _touchedIndex == index;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: _LegendEntry(
                  label: context.isArabic &&
                          (category.nameAr != null &&
                              category.nameAr!.isNotEmpty)
                      ? category.nameAr!
                      : category.name,
                  percent: category.percent,
                  color: _colorForLabel(category.name, scheme),
                  selected: isSelected,
                ),
              );
            }).toList(),
          );

          final content = isStacked
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [chart, const SizedBox(height: 20), legend],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(child: chart),
                    const SizedBox(width: 24),
                    SizedBox(width: 200, child: legend)
                  ],
                );

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(loc.t('allocation'),
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  Text(isLive ? loc.t('live') : loc.t('mock'),
                      style: theme.textTheme.bodySmall?.copyWith(
                          color: isLive
                              ? Colors.greenAccent
                              : theme.colorScheme.onSurface
                                  .withAlpha((0.7 * 255).round()))),
                ],
              ),
              const SizedBox(height: 12),
              content,
            ],
          );
        },
      ),
    );
  }

  Widget _buildRecentActivities(DashboardData data) {
    final loc = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final activities = data.activities.take(4).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              loc.t('recent_activities'),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) =>
                          ActivitiesScreen(activities: data.activities)),
                );
              },
              child: Text(loc.t('viewMore')),
            ),
          ],
        ),
        const SizedBox(height: 12),
        for (final activity in activities)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _ActivityItem(
              title: activity.title,
              subtitle: '${_timeAgo(activity.time)} • ${activity.subtitle}',
            ),
          ),
      ],
    );
  }

  String _timeAgo(DateTime time) {
    final loc = AppLocalizations.of(context);
    final diff = DateTime.now().difference(time);
    if (diff.inHours < 24) {
      return loc.t('hours_ago').replaceFirst('{0}', diff.inHours.toString());
    }
    if (diff.inDays < 7) {
      return loc.t('days_ago').replaceFirst('{0}', diff.inDays.toString());
    }
    return loc
        .t('weeks_ago')
        .replaceFirst('{0}', ((diff.inDays / 7).floor()).toString());
  }

  Color _colorForLabel(String label, ColorScheme scheme) {
    return colorForLabel(label);
  }
}

class LineChartCard extends StatefulWidget {
  final List<MonthlyCredit> creditHistory;
  final List<MonthlyMetric> scoreHistory;
  final String interval;
  final bool fromServer;
  final bool serverAttempted;

  const LineChartCard(
      {super.key,
      required this.creditHistory,
      required this.scoreHistory,
      required this.interval,
      this.fromServer = false,
      this.serverAttempted = false});

  @override
  State<LineChartCard> createState() => _LineChartCardState();
}

class _LineChartCardState extends State<LineChartCard> {
  int _touchedIndex = -1;

  static const List<String> _monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final scheme = theme.colorScheme;

    final creditHistory = widget.creditHistory;
    final scoreHistory = widget.scoreHistory;

    final spots = creditHistory
        .asMap()
        .entries
        .map((e) => FlSpot(e.key.toDouble(), e.value.credits.toDouble()))
        .toList();
    final scoreSpots = scoreHistory
        .asMap()
        .entries
        .map((e) => FlSpot(e.key.toDouble(), e.value.value))
        .toList();

    final allY = <double>[];
    allY.addAll(spots.map((s) => s.y));
    allY.addAll(scoreSpots.map((s) => s.y));
    double minY, maxY;
    if (allY.isEmpty) {
      minY = 0.0;
      maxY = 1.0;
    } else {
      final minVal = allY.reduce((a, b) => a < b ? a : b);
      final maxVal = allY.reduce((a, b) => a > b ? a : b);
      minY = (minVal * 0.8).floorToDouble();
      maxY = (maxVal * 1.2).ceilToDouble();
      if (minY == maxY) maxY = minY + 1.0;
    }

    return Container(
      decoration: isDarkMode
          ? AppDecorations.glass(radius: 20)
          : BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color:
                      theme.colorScheme.outline.withAlpha((0.5 * 255).round())),
            ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Monthly Credit',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(widget.fromServer ? 'Live' : 'Mock',
                      style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withAlpha((0.7 * 255).round()))),
                  if (!widget.fromServer && widget.serverAttempted)
                    Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text('No server data — showing mock',
                          style: theme.textTheme.bodySmall?.copyWith(
                              color: AppPalette.orchidLight, fontSize: 11)),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(width: 12, height: 8, color: scheme.primary),
              const SizedBox(width: 8),
              Text('Credit', style: theme.textTheme.bodySmall),
              const SizedBox(width: 16),
              Container(width: 12, height: 8, color: scheme.secondary),
              const SizedBox(width: 8),
              Text('Score', style: theme.textTheme.bodySmall),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: (spots.isEmpty && scoreSpots.isEmpty)
                ? Container(
                    decoration: BoxDecoration(
                        color: theme.colorScheme.secondaryContainer
                            .withAlpha((0.2 * 255).round()),
                        borderRadius: BorderRadius.circular(12)),
                    child: Center(
                        child:
                            Text('No data', style: theme.textTheme.bodySmall)),
                  )
                : LineChart(
                    LineChartData(
                      minY: minY,
                      maxY: maxY,
                      lineTouchData: LineTouchData(
                        touchCallback:
                            (FlTouchEvent event, LineTouchResponse? resp) {
                          if (resp == null || resp.lineBarSpots == null) return;
                          final spot = resp.lineBarSpots!.first;
                          setState(() {
                            _touchedIndex = spot.x.toInt();
                          });
                        },
                        handleBuiltInTouches: true,
                        touchTooltipData: LineTouchTooltipData(
                          getTooltipItems: (spots) {
                            final idx =
                                spots.isNotEmpty ? spots.first.x.toInt() : -1;
                            if (idx < 0 || idx >= creditHistory.length) {
                              return <LineTooltipItem>[];
                            }
                            final dt = creditHistory[idx].month;
                            String label;
                            if (widget.interval == 'day') {
                              label = '${dt.day}/${dt.month}/${dt.year}';
                            } else if (widget.interval == 'year')
                              label = '${dt.year}';
                            else
                              label =
                                  '${_monthNames[dt.month - 1]} ${dt.year.toString().substring(2)}';

                            final creditVal =
                                creditHistory[idx].credits.toDouble();
                            final scoreVal = idx < scoreHistory.length
                                ? scoreHistory[idx].value
                                : 0.0;

                            return [
                              LineTooltipItem(
                                  '$label\nCredit: ${creditVal.toStringAsFixed(0)}',
                                  theme.textTheme.bodySmall
                                          ?.copyWith(color: scheme.primary) ??
                                      const TextStyle()),
                              LineTooltipItem(
                                  '\nScore: ${scoreVal.toStringAsFixed(0)}',
                                  theme.textTheme.bodySmall
                                          ?.copyWith(color: scheme.secondary) ??
                                      const TextStyle()),
                            ];
                          },
                        ),
                      ),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                                showTitles: true,
                                reservedSize: 36,
                                interval: ((maxY - minY) / 4))),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                final idx = value.toInt();
                                if (idx < 0 || idx >= creditHistory.length) {
                                  return const SizedBox.shrink();
                                }
                                final dt = creditHistory[idx].month;
                                String label;
                                if (widget.interval == 'day') {
                                  label = '${dt.day}/${dt.month}';
                                } else if (widget.interval == 'year')
                                  label = '${dt.year}';
                                else
                                  label =
                                      '${_monthNames[dt.month - 1]} ${dt.year.toString().substring(2)}';
                                return Text(label,
                                    style: theme.textTheme.bodySmall);
                              },
                              interval: 1),
                        ),
                        topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                      ),
                      gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          horizontalInterval: (maxY - minY) / 4,
                          getDrawingHorizontalLine: (v) => FlLine(
                              color: theme.colorScheme.onSurface
                                  .withAlpha((0.1 * 255).round()),
                              strokeWidth: 1)),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: spots,
                          isCurved: true,
                          color: scheme.primary,
                          barWidth: 3,
                          dotData: FlDotData(
                            show: true,
                            getDotPainter: (spot, percent, bar, index) {
                              if (index == _touchedIndex) {
                                return FlDotCirclePainter(
                                    radius: 5,
                                    color: scheme.primary,
                                    strokeWidth: 2,
                                    strokeColor: theme.colorScheme.surface);
                              }
                              return FlDotCirclePainter(
                                  radius: 3, color: scheme.primary);
                            },
                          ),
                          belowBarData: BarAreaData(
                              show: true,
                              color: scheme.primary
                                  .withAlpha((0.12 * 255).round())),
                        ),
                        LineChartBarData(
                          spots: scoreSpots,
                          isCurved: true,
                          color: scheme.secondary,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(show: false),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _HeroHeaderDelegate extends SliverPersistentHeaderDelegate {
  final DashboardData data;
  final AppLocalizations loc;

  _HeroHeaderDelegate({required this.data, required this.loc});

  @override
  double get minExtent => 110;

  @override
  double get maxExtent => 300;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final paddingTop = MediaQuery.of(context).padding.top;

    // 0.0 -> Expanded, 1.0 -> Collapsed
    final progress = shrinkOffset / (maxExtent - minExtent);
    final clampedProgress = progress.clamp(0.0, 1.0);

    // Animations
    // Quick fade out for stats to avoid clutter (0.0 to 0.3)
    final statsOpacity = (1.0 - (clampedProgress * 3.3)).clamp(0.0, 1.0);

    // Scale balance text (1.0 -> 0.8)
    final textScale = 1.0 - (0.2 * clampedProgress);

    // Corner radius interpolation
    final radius = 36.0 * (1 - clampedProgress);

    // Dynamic padding calculations
    final topBarY = paddingTop + 16;
    final balanceY =
        topBarY + 32 + (24 * (1 - clampedProgress)); // Moves up as we scroll

    return Container(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Background (Pinned)
          Positioned.fill(
            bottom: 0,
            child: ClipRRect(
              borderRadius:
                  BorderRadius.vertical(bottom: Radius.circular(radius)),
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppGradients.hero,
                  boxShadow: AppShadows.medium,
                ),
              ),
            ),
          ),

          // 2. Top Bar Area (Label + Wallet Icon)
          Positioned(
            top: topBarY,
            left: 24,
            right: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  clampedProgress > 0.6
                      ? loc.t('balance')
                      : loc.t('total_balance'),
                  style: textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withAlpha((0.8 * 255).round()),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                      color: Colors.white.withAlpha(50),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.account_balance_wallet_rounded,
                      color: Colors.white, size: 18),
                )
              ],
            ),
          ),

          // 3. Balance Text (Absolute positioning to prevent overflow)
          Positioned(
            top: balanceY,
            left: 24,
            right: 24,
            child: Transform.scale(
              scale: textScale,
              alignment: Alignment.centerLeft,
              child: Text(
                '\$${_formatAmount(data.walletBalance)}',
                style: textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                  height: 1.0,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),

          // 4. Stats Row (Bottom aligned, fades out)
          if (statsOpacity > 0)
            Positioned(
              bottom: 30, // Fixed distance from bottom
              left: 24,
              right: 24,
              child: Opacity(
                opacity: statsOpacity,
                child: Row(
                  children: [
                    Expanded(
                      child: _HeroStat(
                        label: loc.t('credit_points'),
                        value: '${data.creditPoints}',
                        icon: Icons.speed,
                      ),
                    ),
                    Container(width: 1, height: 40, color: Colors.white24),
                    Expanded(
                      child: _HeroStat(
                        label: loc.t('credibility'),
                        value: '${data.credibilityScore}',
                        icon: Icons.verified,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _HeroHeaderDelegate oldDelegate) =>
      oldDelegate.data != data || oldDelegate.loc != loc;
}

String _formatAmount(double? v, {int decimals = 2}) {
  try {
    final d = v ?? 0.0;
    return d.toStringAsFixed(decimals);
  } catch (_) {
    return (0.0).toStringAsFixed(decimals);
  }
}

class _HeroStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _HeroStat(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white70, size: 16),
            const SizedBox(width: 6),
            Text(label,
                style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _StatCard(
      {required this.icon,
      required this.title,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textTheme = theme.textTheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      decoration: BoxDecoration(
        gradient: isDarkMode
            ? LinearGradient(colors: [
                color.withAlpha((0.22 * 255).round()),
                Colors.white.withAlpha((0.08 * 255).round())
              ], begin: Alignment.topLeft, end: Alignment.bottomRight)
            : null,
        color: isDarkMode ? null : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: isDarkMode
            ? Border.all(color: Colors.white.withAlpha((0.06 * 255).round()))
            : null,
        boxShadow: AppShadows.soft,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withAlpha((0.16 * 255).round()),
              shape: BoxShape.circle,
            ),
            child:
                Icon(icon, color: isDarkMode ? Colors.white : color, size: 26),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    overflow: TextOverflow.ellipsis,
                    style: textTheme.bodySmall?.copyWith(
                        color: isDarkMode
                            ? Colors.white70
                            : theme.colorScheme.onSurface
                                .withAlpha((0.7 * 255).round()))),
                const SizedBox(height: 6),
                Text(value,
                    overflow: TextOverflow.ellipsis,
                    style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDarkMode
                            ? Colors.white
                            : theme.colorScheme.onSurface)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendEntry extends StatelessWidget {
  final String label;
  final double percent;
  final Color color;
  final bool selected;

  const _LegendEntry(
      {required this.label,
      required this.percent,
      required this.color,
      required this.selected});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textTheme = theme.textTheme;
    final color = selected
        ? AppPalette.flame
        : (isDarkMode
            ? Colors.white70
            : theme.colorScheme.onSurface.withAlpha((0.7 * 255).round()));

    return Row(
      children: [
        Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
                color: color, borderRadius: BorderRadius.circular(4))),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: textTheme.bodySmall?.copyWith(color: color),
          ),
        ),
        Text(
          '${percent.toInt()}%',
          style: textTheme.bodySmall
              ?.copyWith(fontWeight: FontWeight.w700, color: color),
        ),
      ],
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final String title;
  final String subtitle;

  const _ActivityItem({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textTheme = theme.textTheme;

    return Container(
      decoration: isDarkMode
          ? AppDecorations.glass(radius: 22)
          : BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                  color:
                      theme.colorScheme.outline.withAlpha((0.5 * 255).round())),
            ),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: AppDecorations.pillGradient(AppPalette.aqua),
            child: const Icon(Icons.trending_up_rounded, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(subtitle,
                    style: textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface
                            .withAlpha((0.7 * 255).round()))),
              ],
            ),
          ),
          Icon(Icons.arrow_forward_ios,
              color: Colors.grey.withAlpha((0.6 * 255).round()), size: 16),
        ],
      ),
    );
  }
}
