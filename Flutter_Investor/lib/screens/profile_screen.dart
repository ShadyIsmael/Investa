import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../services/app_logger.dart';
import '../services/profile_service.dart';
import '../services/secure_storage.dart';
import 'package:provider/provider.dart';
import '../controllers/chat_controller.dart';
import '../core/services/signalr_service.dart';
import '../core/services/logger_service.dart';
import '../core/services/secure_storage_service.dart';
import '../core/network/network_config.dart';
import '../services/app_state.dart';
import 'settings_screen.dart';
import 'edit_profile_screen.dart';
import 'investments_screen.dart';
import 'dashboard_screen.dart';
import 'trace_score_screen.dart';
import 'trace_credit_screen.dart';
import 'support_choice_screen.dart';
import '../services/messages.dart';
import '../models/chat_user.dart';
import 'chat_box_screen.dart';

class ProfileScreen extends StatefulWidget {
  final ThemeMode themeMode;
  final Locale? currentLocale;
  final ValueChanged<Locale>? onLocaleChanged;
  final ValueChanged<ThemeMode>? onThemeChanged;
  final VoidCallback? onLogout;

  const ProfileScreen(
      {Key? key,
      required this.themeMode,
      this.currentLocale,
      this.onLocaleChanged,
      this.onThemeChanged,
      this.onLogout})
      : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Profile? _profile;
  bool _isLoading = true;
  String? _error;

  StreamSubscription<AdminJoinedDto>? _adminSub;

  @override
  void initState() {
    super.initState();
    _logAuthToken();
    _loadProfile();
  }

  Future<void> _logAuthToken() async {
    try {
      final token = await SecureStorage().read('auth_token');
      debugPrint('ProfileScreen opened with token: ${token ?? 'none'}');
    } catch (e) {
      debugPrint('ProfileScreen token read failed: $e');
    }
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await AppState.instance.loadFromStorage();
      if (AppState.instance.profile != null) {
        setState(() {
          _profile = AppState.instance.profile;
          _isLoading = false;
        });
        AppLogger.logInfo(
            'ProfileScreen._loadProfile', 'Loaded profile from AppState');
        return;
      }

      final profile = await ProfileService().fetchProfile();
      AppLogger.logInfo('ProfileScreen._loadProfile',
          'fetchProfile returned ${profile == null ? 'null' : 'Profile object'}');
      if (profile != null) {
        final raw = AppState.instance.profileJson;
        await AppState.instance.setProfile(profile, raw);
      }
      setState(() {
        _profile = profile;
        _isLoading = false;
      });

      // Start SignalR connection with JWT token from secure storage
      try {
        final service = SignalRService(
            networkConfig: NetworkConfig(),
            secureStorage: SecureStorageService(),
            logger: LoggerService());
        await service.connect();
        // Initialize chat controller if provided via Provider
        try {
          final controller =
              Provider.of<ChatController>(context, listen: false);
          await controller.init();
        } catch (_) {}

        // Listen for AdminJoined events while on Profile screen and navigate (auto-open) or notify
        _adminSub?.cancel();
        _adminSub = service.onAdminJoined.listen((adminJoined) {
          try {
            final conv = adminJoined.conversationId;
            final admName = adminJoined.adminName;
            if (!mounted) return;

            final controller =
                Provider.of<ChatController>(context, listen: false);

            // Only auto-open if the controller already references this conversation
            // or the user doesn't have an active conversation yet (so it likely belongs to them)
            final belongsToMe = (controller.conversationId == null) ||
                (controller.conversationId == conv);

            if (!belongsToMe) return;

            // Show a transient snackbar and auto-open the chat screen
            ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('$admName joined your support chat.')));

            final user = ChatUser(
              id: conv ?? '',
              name: admName ?? 'Support',
              avatarUrl: '',
              lastMessage: '',
              lastSeen: DateTime.now(),
              online: true,
            );

            Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => ChatBoxScreen(user: user)));
          } catch (_) {}
        });
      } catch (e) {
        debugPrint('SignalR connect from ProfileScreen failed: $e');
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to load profile: $e';
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _adminSub?.cancel();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    final loc = AppLocalizations.of(context);
    if (widget.onLogout == null) return;
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(loc.t('logout')),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text(loc.t('logout'))),
        ],
      ),
    );
    if (shouldLogout == true) {
      widget.onLogout!.call();
      // Clear navigation stack and return to the login screen/root.
      Navigator.of(context).popUntil((route) => route.isFirst);
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text(AppMessages.signedOut)));
    }
  }

  Future<void> _openEdit() async {
    final result = await Navigator.push<Map<String, String?>>(
        context,
        MaterialPageRoute(
            builder: (_) => EditProfileScreen(profile: _profile)));
    if (result != null) {
      _loadProfile();
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppMessages.profileUpdated)));
    }
  }

  Future<void> _showLogs() async {
    final logs = await AppLogger.readLog();
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('App Logs (debug)'),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: SelectableText(logs.isEmpty ? 'No logs available.' : logs),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: logs));
              Navigator.of(ctx).pop();
            },
            child: const Text('Copy'),
          ),
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Close')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textTheme = theme.textTheme;
    final loc = AppLocalizations.of(context);

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error!,
                style: textTheme.bodyLarge?.copyWith(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadProfile, child: const Text('Retry')),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDarkMode ? null : const Color(0xFFF8F9FC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _ProfileHeader(
                profile: _profile,
                onEdit: _openEdit,
                isDarkMode: isDarkMode,
              ),
              const SizedBox(height: 32),
              _SectionHeader(title: loc.t('activity')),
              const SizedBox(height: 12),
              _MenuContainer(
                children: [
                  _MenuItem(
                    icon: Icons.trending_up_rounded,
                    title: loc.t('investments'),
                    color: AppPalette.flame,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const InvestmentsScreen())),
                  ),
                  const _Divider(),
                  _MenuItem(
                    icon: Icons.folder_shared_rounded,
                    title: loc.t('projects'),
                    color: AppPalette.aqua,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const DashboardScreen())),
                  ),
                  const _Divider(),
                  _MenuItem(
                    icon: Icons.show_chart_rounded,
                    title: loc.t('trace_score'),
                    color: AppPalette.flame,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const TraceScoreScreen())),
                  ),
                  const _Divider(),
                  _MenuItem(
                    icon: Icons.credit_score_rounded,
                    title: loc.t('trace_credit'),
                    color: AppPalette.aqua,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const TraceCreditScreen())),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _SectionHeader(title: loc.t('general')),
              const SizedBox(height: 12),
              _MenuContainer(
                children: [
                  _MenuItem(
                    icon: Icons.support_agent_rounded,
                    title: loc.t('customer_support'),
                    color: AppPalette.flame,
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const SupportChoiceScreen())),
                  ),
                  const _Divider(),
                  _MenuItem(
                    icon: Icons.settings_rounded,
                    title: loc.t('settings'),
                    color: AppPalette.aqua,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => SettingsScreen(
                            themeMode: widget.themeMode,
                            currentLocale: widget.currentLocale,
                            onLocaleChanged: widget.onLocaleChanged,
                            onThemeChanged: widget.onThemeChanged,
                            onLogout: widget.onLogout,
                          ),
                        ),
                      );
                    },
                  ),
                  if (widget.onLogout != null) ...[
                    const _Divider(),
                    _MenuItem(
                      icon: Icons.logout_rounded,
                      title: loc.t('logout'),
                      color: theme.colorScheme.error,
                      textColor: theme.colorScheme.error,
                      onTap: _handleLogout,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final Profile? profile;
  final VoidCallback onEdit;
  final bool isDarkMode;

  const _ProfileHeader({
    Key? key,
    required this.profile,
    required this.onEdit,
    required this.isDarkMode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Column(
      children: [
        Stack(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [AppPalette.flame, AppPalette.aqua],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: CircleAvatar(
                radius: 55,
                backgroundColor: theme.scaffoldBackgroundColor,
                backgroundImage: profile?.avatarUrl != null
                    ? NetworkImage(profile!.avatarUrl!)
                    : null,
                child: profile?.avatarUrl == null
                    ? Icon(Icons.person_rounded,
                        size: 55,
                        color: theme.colorScheme.onSurface.withOpacity(0.5))
                    : null,
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: GestureDetector(
                onTap: onEdit,
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: theme.scaffoldBackgroundColor, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      )
                    ],
                  ),
                  child: const Icon(Icons.edit_rounded,
                      size: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          profile?.fullName ?? 'User',
          style: textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _StatBadge(
              label: AppLocalizations.of(context).t('score'),
              value: profile?.basicInfo?.score?.toString() ?? '0',
              color: AppPalette.flame,
              isDarkMode: isDarkMode,
            ),
            const SizedBox(width: 16),
            _StatBadge(
              label: AppLocalizations.of(context).t('credit'),
              value: profile?.basicInfo?.credit?.toString() ?? '0',
              color: AppPalette.aqua,
              isDarkMode: isDarkMode,
            ),
          ],
        ),
      ],
    );
  }
}

class _StatBadge extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final bool isDarkMode;

  const _StatBadge({
    Key? key,
    required this.label,
    required this.value,
    required this.color,
    required this.isDarkMode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            value,
            style: TextStyle(
              color: isDarkMode ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({Key? key, required this.title}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
            ),
      ),
    );
  }
}

class _MenuContainer extends StatelessWidget {
  final List<Widget> children;

  const _MenuContainer({Key? key, required this.children}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDarkMode ? theme.colorScheme.surface : Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: isDarkMode
            ? []
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
        border: isDarkMode
            ? Border.all(color: Colors.white.withOpacity(0.05))
            : null,
      ),
      child: Column(
        children: children,
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final Color? textColor;
  final VoidCallback onTap;

  const _MenuItem({
    Key? key,
    required this.icon,
    required this.title,
    required this.color,
    this.textColor,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 20, color: color),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                    color: textColor ?? theme.colorScheme.onSurface,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                size: 20,
                color: theme.colorScheme.onSurface.withOpacity(0.3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      thickness: 1,
      indent: 60,
      color: Theme.of(context).dividerColor.withOpacity(0.1),
    );
  }
}
