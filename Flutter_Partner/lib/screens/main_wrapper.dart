import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import '../l10n/app_localizations.dart';
import 'dashboard_screen.dart';
import 'investments_screen.dart';
import 'requests_screen.dart';
import 'engagement_screen.dart';
import 'profile_screen.dart';

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
  int _pendingRequestsCount = 0;
  int _unreadMessagesCount = 0;

  void _safeSetState(VoidCallback updater) {
    if (!mounted) return;
    final phase = SchedulerBinding.instance.schedulerPhase;
    if (phase == SchedulerPhase.persistentCallbacks) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        setState(updater);
      });
      return;
    }
    setState(updater);
  }

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return;
    _safeSetState(() => _selectedIndex = index);
  }

  void _updatePendingRequestsCount(int count) {
    if (_pendingRequestsCount != count) {
      _safeSetState(() => _pendingRequestsCount = count);
    }
  }

  void _updateUnreadMessagesCount(int count) {
    if (_unreadMessagesCount != count) {
      _safeSetState(() => _unreadMessagesCount = count);
    }
  }

  Widget _currentScreen() {
    switch (_selectedIndex) {
      case 0:
        return const DashboardScreen(key: ValueKey('dashboard'));
      case 1:
        return EngagementScreen(
          key: const ValueKey('engagement'),
          onUnreadCountChanged: _updateUnreadMessagesCount,
        );
      case 2:
        return const InvestmentsScreen(key: ValueKey('investments'));
      case 3:
        return RequestsScreen(
          key: const ValueKey('requests'),
          onPendingCountChanged: _updatePendingRequestsCount,
        );
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
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('This action is not available.')));
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
                _buildEngagementNavItem(loc.t('engagement'), 1,
                    isSelected: _selectedIndex == 1),

                // فراغ للـ Notch
                const SizedBox(width: 80),

                // اليمين
                _buildRequestsNavItem(loc.t('requests'), 3,
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

  Widget _buildEngagementNavItem(String label, int index,
      {required bool isSelected}) {
    final color = isSelected ? const Color(0xFFFF9800) : Colors.grey;
    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              children: [
                Icon(Icons.people_alt_rounded, color: color, size: 26),
                if (_unreadMessagesCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        _unreadMessagesCount > 99
                            ? '99+'
                            : _unreadMessagesCount.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
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

  Widget _buildRequestsNavItem(String label, int index,
      {required bool isSelected}) {
    final color = isSelected ? const Color(0xFFFF9800) : Colors.grey;
    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              children: [
                Icon(Icons.request_page_rounded, color: color, size: 26),
                if (_pendingRequestsCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        _pendingRequestsCount > 99
                            ? '99+'
                            : _pendingRequestsCount.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
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
