import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../l10n/app_localizations.dart';
import '../services/mock_data.dart';
import '../services/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import 'activities_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DashboardData> _dataFuture;
  final String _selectedInterval = 'month';

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

    return Scaffold(
      backgroundColor:
          isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
      body: AppBackground(
        child: FutureBuilder<DashboardData>(
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
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(
                        top: 60, left: 24, right: 24, bottom: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(loc.t('welcome_back'),
                            style: theme.textTheme.titleMedium?.copyWith(
                                color: theme.colorScheme.onSurface
                                    .withAlpha((0.6 * 255).round()))),
                        Text(loc.t('founder'),
                            style: theme.textTheme.headlineMedium
                                ?.copyWith(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: _buildScoreCard(context, data),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(20),
                  sliver: SliverGrid.count(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.3,
                    children: [
                      _StatCard(
                          title: loc.t('portfolio_balance'),
                          value: '\$${_formatAmount(data.walletBalance)}',
                          icon: Icons.account_balance_wallet_rounded,
                          color: const Color(0xFF6366F1)),
                      _StatCard(
                          title: loc.t('investments_owned'),
                          value: '${data.numberOfInvestments}',
                          icon: Icons.pie_chart_rounded,
                          color: const Color(0xFFEC4899)),
                      _StatCard(
                          title: loc.t('partners'),
                          value: '${data.numberOfPartners}',
                          icon: Icons.groups_rounded,
                          color: const Color(0xFFF59E0B)),
                      _StatCard(
                          title: loc.t('requests_awaiting'),
                          value: '${data.numberOfRequestsAwaiting}',
                          icon: Icons.hourglass_top_rounded,
                          color: const Color(0xFF10B981)),
                    ],
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 12),
                    child: LineChartCard(
                        creditHistory: data.creditHistory,
                        scoreHistory: data.scoreHistory),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
                    child: _buildActivityPreview(context, data),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildScoreCard(BuildContext context, DashboardData data) {
    final loc = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: isDark
          ? AppDecorations.glass(radius: 24)
          : BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: AppShadows.soft),
      child: Row(
        children: [
          Expanded(
              child: _ScoreItem(
                  label: loc.t('credit_points'),
                  value: '${data.creditPoints}',
                  color: AppPalette.flame)),
          Container(width: 1, height: 40, color: theme.dividerColor),
          Expanded(
              child: _ScoreItem(
                  label: loc.t('credibility_score'),
                  value: '${data.credibilityScore}',
                  color: AppPalette.aqua)),
        ],
      ),
    );
  }

  Widget _buildActivityPreview(BuildContext context, DashboardData data) {
    final loc = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(loc.t('recent_activities'),
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
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
        if (data.activities.isNotEmpty)
          _ActivityTile(activity: data.activities.first),
      ],
    );
  }
}

class _ScoreItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _ScoreItem(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(label,
            style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha((0.7 * 255).round()))),
        const SizedBox(height: 8),
        Text(value,
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w800, color: color)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard(
      {required this.title,
      required this.value,
      required this.icon,
      required this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: isDark
          ? AppDecorations.glass(radius: 20)
              .copyWith(border: Border.all(color: color.withAlpha((0.3 * 255).round())))
          : BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                  BoxShadow(
                      color: color.withAlpha((0.1 * 255).round()),
                      blurRadius: 10,
                      offset: const Offset(0, 4))
                ]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
                color: color.withAlpha((0.1 * 255).round()), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: theme.textTheme.titleLarge
                      ?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha((0.6 * 255).round()))),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActivityTile extends StatelessWidget {
  final Activity activity;
  const _ActivityTile({required this.activity});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: isDark
          ? AppDecorations.glass(radius: 16)
          : BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: theme.dividerColor.withAlpha((0.1 * 255).round())),
            ),
      child: Row(
        children: [
          const Icon(Icons.history, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity.title,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(activity.subtitle, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

String _formatAmount(double? v) => (v ?? 0.0).toStringAsFixed(2);

class LineChartCard extends StatelessWidget {
  final List<MonthlyCredit> creditHistory;
  final List<MonthlyMetric> scoreHistory;

  const LineChartCard(
      {super.key, required this.creditHistory, required this.scoreHistory});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final spots = creditHistory
        .asMap()
        .entries
        .map((e) => FlSpot(e.key.toDouble(), e.value.credits.toDouble()))
        .toList();

    return Container(
      height: 250,
      padding: const EdgeInsets.all(24),
      decoration: isDark
          ? AppDecorations.glass(radius: 24)
          : BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: AppShadows.soft),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Credit History',
              style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: FlGridData(show: false),
                titlesData: FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    color: theme.colorScheme.primary,
                    barWidth: 3,
                    dotData: FlDotData(show: false),
                    belowBarData: BarAreaData(
                        show: true,
                        color: theme.colorScheme.primary.withAlpha((0.1 * 255).round())),
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
