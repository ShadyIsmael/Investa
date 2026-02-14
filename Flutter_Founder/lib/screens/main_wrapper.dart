import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import 'dashboard_screen.dart';
import 'requests_screen.dart';
import 'engagement_screen.dart';
import 'profile_screen.dart';
import 'investments_screen.dart';

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
  int _pendingRequestsCount = 0;
  int _unreadMessagesCount = 0;

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return;
    setState(() => _selectedIndex = index);
  }

  void _updatePendingRequestsCount(int count) {
    if (_pendingRequestsCount != count) {
      setState(() => _pendingRequestsCount = count);
    }
  }

  void _updateUnreadMessagesCount(int count) {
    if (_unreadMessagesCount != count) {
      setState(() => _unreadMessagesCount = count);
    }
  }

  Widget _currentScreen() {
    switch (_selectedIndex) {
      case _tabDashboard:
        return const DashboardScreen(key: ValueKey('dashboard'));
      case _tabEngagement:
        return EngagementScreen(
          key: const ValueKey('engagement'),
          onUnreadCountChanged: _updateUnreadMessagesCount,
        );
      case _tabInvestments:
        return const InvestmentsScreen(key: ValueKey('investments'));
      case _tabRequests:
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

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          _onItemTapped(index);
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: _investaOrange,
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.dashboard_rounded),
            label: loc.t('dashboard'),
          ),
          BottomNavigationBarItem(
            icon: _buildEngagementBadge(loc),
            label: loc.t('engagement'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.trending_up_rounded),
            label: loc.t('investments'),
          ),
          BottomNavigationBarItem(
            icon: _buildRequestsBadge(loc),
            label: loc.t('requests'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.person_rounded),
            label: loc.t('profile'),
          ),
        ],
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

  Widget _buildEngagementBadge(AppLocalizations loc) {
    return Stack(
      children: [
        const Icon(Icons.people_alt_rounded),
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
                minWidth: 18,
                minHeight: 18,
              ),
              child: Text(
                _unreadMessagesCount > 99
                    ? '99+'
                    : _unreadMessagesCount.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildRequestsBadge(AppLocalizations loc) {
    return Stack(
      children: [
        const Icon(Icons.request_page_rounded),
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
                minWidth: 18,
                minHeight: 18,
              ),
              child: Text(
                _pendingRequestsCount > 99
                    ? '99+'
                    : _pendingRequestsCount.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}
