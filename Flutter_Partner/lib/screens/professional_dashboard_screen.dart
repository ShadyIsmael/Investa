import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';

class ProfessionalDashboardScreen extends StatefulWidget {
  const ProfessionalDashboardScreen({Key? key}) : super(key: key);

  @override
  State<ProfessionalDashboardScreen> createState() =>
      _ProfessionalDashboardScreenState();
}

class _ProfessionalDashboardScreenState
    extends State<ProfessionalDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = context.read<ThemeProvider>().isDarkMode;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Professional App Bar
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor:
                isDark ? InvestmentColors.darkCard : InvestmentColors.lightCard,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'Investment Partner',
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      InvestmentColors.primary,
                      InvestmentColors.secondary,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'Welcome Back',
                          style: textTheme.displaySmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'Track your investments and grow your portfolio',
                          style: textTheme.bodyMedium?.copyWith(
                            color: Colors.white70,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: GestureDetector(
                  onTap: () => context.read<ThemeProvider>().toggleTheme(),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isDark
                          ? InvestmentColors.darkSurface
                          : InvestmentColors.lightSurface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      isDark ? Icons.light_mode : Icons.dark_mode,
                      color: InvestmentColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Portfolio Value Card
                  _buildPortfolioCard(context, textTheme),
                  const SizedBox(height: 24),

                  // Quick Stats
                  Text(
                    'Your Statistics',
                    style: textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildStatsGrid(context, textTheme),
                  const SizedBox(height: 24),

                  // Recent Investments
                  Text(
                    'Active Investments',
                    style: textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildInvestmentsList(context, textTheme),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPortfolioCard(BuildContext context, TextTheme textTheme) {
    final isDark = context.read<ThemeProvider>().isDarkMode;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            InvestmentColors.primary.withOpacity(0.1),
            InvestmentColors.secondary.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: InvestmentColors.primary.withOpacity(0.3),
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Portfolio Value',
                style: textTheme.bodyMedium?.copyWith(
                  color: isDark
                      ? InvestmentColors.darkTextSecondary
                      : InvestmentColors.lightTextSecondary,
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: InvestmentColors.success.withOpacity(0.1),
                  border: Border.all(
                    color: InvestmentColors.success.withOpacity(0.3),
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.trending_up,
                      color: InvestmentColors.success,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '+12.5%',
                      style: textTheme.bodySmall?.copyWith(
                        color: InvestmentColors.success,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '\$245,680.50',
            style: textTheme.displayMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Monthly Return',
                      style: textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? InvestmentColors.darkTextSecondary
                            : InvestmentColors.lightTextSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '+\$8,456.00',
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: InvestmentColors.success,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Invested',
                      style: textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? InvestmentColors.darkTextSecondary
                            : InvestmentColors.lightTextSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '\$200,000.00',
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(BuildContext context, TextTheme textTheme) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      children: [
        _buildStatCard(
          context,
          'Active Investments',
          '12',
          Icons.trending_up,
          InvestmentColors.primary,
          textTheme,
        ),
        _buildStatCard(
          context,
          'Pending Transactions',
          '3',
          Icons.schedule,
          InvestmentColors.warning,
          textTheme,
        ),
        _buildStatCard(
          context,
          'Total Returns',
          '+\$45,680',
          Icons.attach_money,
          InvestmentColors.success,
          textTheme,
        ),
        _buildStatCard(
          context,
          'Avg. ROI',
          '18.5%',
          Icons.bar_chart,
          InvestmentColors.secondary,
          textTheme,
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
    TextTheme textTheme,
  ) {
    final isDark = context.read<ThemeProvider>().isDarkMode;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? InvestmentColors.darkTextSecondary
                      : InvestmentColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInvestmentsList(BuildContext context, TextTheme textTheme) {
    final isDark = context.read<ThemeProvider>().isDarkMode;
    final investments = [
      {
        'name': 'Tech Startup Fund',
        'amount': '\$15,000',
        'progress': 0.65,
        'return': '+8.5%',
        'icon': Icons.computer,
      },
      {
        'name': 'Real Estate Portfolio',
        'amount': '\$25,000',
        'progress': 0.42,
        'return': '+5.2%',
        'icon': Icons.home,
      },
      {
        'name': 'Green Energy Project',
        'amount': '\$10,000',
        'progress': 0.78,
        'return': '+12.3%',
        'icon': Icons.bolt,
      },
    ];

    return Column(
      children: List.generate(
        investments.length,
        (index) {
          final inv = investments[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark
                    ? InvestmentColors.darkCard
                    : InvestmentColors.lightCard,
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF334155)
                      : InvestmentColors.divider,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: InvestmentColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          inv['icon'] as IconData,
                          color: InvestmentColors.primary,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              inv['name'] as String,
                              style: textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              inv['amount'] as String,
                              style: textTheme.bodySmall?.copyWith(
                                color: isDark
                                    ? InvestmentColors.darkTextSecondary
                                    : InvestmentColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: InvestmentColors.success.withOpacity(0.1),
                          border: Border.all(
                            color: InvestmentColors.success.withOpacity(0.3),
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          inv['return'] as String,
                          style: textTheme.bodySmall?.copyWith(
                            color: InvestmentColors.success,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: inv['progress'] as double,
                      minHeight: 6,
                      backgroundColor:
                          InvestmentColors.primary.withOpacity(0.1),
                      valueColor: const AlwaysStoppedAnimation(
                        InvestmentColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      '${((inv['progress'] as double) * 100).toStringAsFixed(0)}% Funded',
                      style: textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? InvestmentColors.darkTextSecondary
                            : InvestmentColors.lightTextSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
