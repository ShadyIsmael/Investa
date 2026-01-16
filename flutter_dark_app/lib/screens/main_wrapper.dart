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
    Key? key,
    required this.themeMode,
    this.currentLocale,
    this.onLocaleChanged,
    this.onThemeChanged,
    this.onLogout,
  }) : super(key: key);

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return;
    setState(() => _selectedIndex = index);
  }

  Widget _currentScreen() {
    switch (_selectedIndex) {
      case 0:
        return const DashboardScreen(key: ValueKey('dashboard'));
      case 1:
        return EngagementScreen(key: const ValueKey('engagement'));
      case 2:
        return const InvestmentsScreen(key: ValueKey('investments'));
      case 3:
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
    const orangeInvesta = Color(0xFFFF9800);

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
          if (_selectedIndex == 2)
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
                    backgroundColor: orangeInvesta,
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
                if (_selectedIndex != 2) {
                  _onItemTapped(2);
                  return;
                }
                final res = await Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const NewInvestmentScreen()));
                if (res == true && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(loc.t('investment_created'))));
                }
              },
              backgroundColor: orangeInvesta,
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
                _buildNavItem(Icons.dashboard_rounded, loc.t('dashboard'), 0,
                    isSelected: _selectedIndex == 0),
                _buildNavItem(Icons.people_alt_rounded, loc.t('engagement'), 1,
                    isSelected: _selectedIndex == 1),

                // فراغ للـ Notch
                const SizedBox(width: 80),

                // اليمين
                _buildNavItem(Icons.request_page_rounded, loc.t('requests'), 3,
                    isSelected: _selectedIndex == 3),
                _buildNavItem(Icons.person_rounded, loc.t('profile'), 4,
                    isSelected: _selectedIndex == 4),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index,
      {required bool isSelected}) {
    final color = isSelected ? const Color(0xFFFF9800) : Colors.grey;
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
