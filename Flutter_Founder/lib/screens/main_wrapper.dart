import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import 'dashboard_screen.dart';
import 'investments_screen.dart';
import 'requests_screen.dart';
import 'engagement_screen.dart';
import 'profile_screen.dart';
import 'new_investment_screen.dart';

class MainWrapper extends StatefulWidget {
  final ThemeMode themeMode;
  final Locale? currentLocale;
  final ValueChanged<Locale>? onLocaleChanged;
  final ValueChanged<ThemeMode>? onThemeChanged;
  final VoidCallback? onLogout;

  const MainWrapper({
    super.key,
    required this.themeMode,
    this.currentLocale,
    this.onLocaleChanged,
    this.onThemeChanged,
    this.onLogout,
  });

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  // CTO Note: Using constants prevents "Magic Numbers" and makes code readable.
  static const int _tabDashboard = 0;
  static const int _tabEngagement = 1;
  static const int _tabInvestments = 2;
  static const int _tabRequests = 3;
  static const int _tabProfile = 4;

  static const Color _investaOrange = Color(0xFFFF9800);

  int _selectedIndex = _tabDashboard;

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return;
    setState(() => _selectedIndex = index);
  }

  Widget _currentScreen() {
    switch (_selectedIndex) {
      case _tabDashboard:
        return const DashboardScreen(key: ValueKey('dashboard'));
      case _tabEngagement:
        return EngagementScreen(key: const ValueKey('engagement'));
      case _tabInvestments:
        return const InvestmentsScreen(key: ValueKey('investments'));
      case _tabRequests:
        return const RequestsScreen(key: ValueKey('requests'));
      default:
        return ProfileScreen(
          key: const ValueKey('profile'),
          themeMode: widget.themeMode,
          currentLocale: widget.currentLocale,
          onLocaleChanged: widget.onLocaleChanged,
          onThemeChanged: widget.onThemeChanged,
          onLogout: widget.onLogout,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor:
          isDarkMode ? Colors.black : theme.scaffoldBackgroundColor,
      extendBody: true, // مهم جداً عشان الكيرف يبان تحته خلفية الشاشة

      body: Stack(
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _currentScreen(),
          ),

          // Right-side small Initiate FAB displayed only on Investments tab
          if (_selectedIndex == _tabInvestments)
            SafeArea(
              child: Padding(
                padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewPadding.bottom + 16,
                    right: 16),
                child: Align(
                  alignment: Alignment.bottomRight,
                  child: FloatingActionButton.extended(
                    heroTag: 'initiate_right_fab',
                    onPressed: () async {
                      final res = await Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const NewInvestmentScreen()));
                      if (res == true && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            content: Text(loc.t('investment_created'))));
                      }
                    },
                    backgroundColor: _investaOrange,
                    icon: const Icon(Icons.rocket_launch),
                    label: Text(loc.t('initiation')),
                    tooltip: loc.t('initiation'),
                  ),
                ),
              ),
            ),
        ],
      ),

      // الزرار الكبير (Investments) مع زر صغير 'Initiate' تحته عندما نكون على تاب Investments
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: 70,
            width: 70,
            child: FloatingActionButton(
              heroTag: 'main_fab',
              onPressed: () async {
                if (_selectedIndex != _tabInvestments) {
                  _onItemTapped(_tabInvestments);
                  return;
                }
                final res = await Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const NewInvestmentScreen()));
                if (res == true && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(loc.t('investment_created'))));
                }
              },
              backgroundColor: _investaOrange,
              elevation: 8,
              shape: const CircleBorder(),
              child: const Icon(Icons.trending_up_rounded,
                  color: Colors.white, size: 35),
            ),
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      bottomNavigationBar: BottomAppBar(
        color: isDarkMode ? const Color(0xFF1A1A1A) : Colors.white,
        padding: EdgeInsets.zero,
        notchMargin: 10, // المسافة بين الزرار والبار (الكيرف)
        shape:
            const CircularNotchedRectangle(), // ده اللي بيعمل "الدلعة" أو الكيرف بتاع أنا فودافون
        clipBehavior: Clip.antiAlias,
        child: SizedBox(
          height: 70,
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // اليسار
                _buildNavItem(
                    Icons.dashboard_rounded, loc.t('dashboard'), _tabDashboard,
                    isSelected: _selectedIndex == _tabDashboard),
                _buildNavItem(Icons.people_alt_rounded, loc.t('engagement'),
                    _tabEngagement,
                    isSelected: _selectedIndex == _tabEngagement),

                // فراغ للـ Notch
                const SizedBox(width: 80),

                // اليمين
                _buildNavItem(
                    Icons.request_page_rounded, loc.t('requests'), _tabRequests,
                    isSelected: _selectedIndex == _tabRequests),
                _buildNavItem(
                    Icons.person_rounded, loc.t('profile'), _tabProfile,
                    isSelected: _selectedIndex == _tabProfile),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index,
      {required bool isSelected}) {
    final color = isSelected ? _investaOrange : Colors.grey;
    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 26),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal)),
          ],
        ),
      ),
    );
  }
}
