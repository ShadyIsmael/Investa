import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../services/app_logger.dart';
import '../services/profile_service.dart';
import '../services/secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

import '../controllers/chat_controller.dart';
import '../core/services/signalr_service.dart';
import '../core/services/logger_service.dart';
import '../core/services/secure_storage_service.dart';
import '../core/network/network_config.dart';
import '../services/app_state.dart';
import 'settings_screen.dart';
import 'edit_profile_screen.dart';
import 'investments_screen.dart';
import 'trace_score_screen.dart';
import 'trace_credit_screen.dart';
import 'credit_charge_screen.dart';
import 'support_choice_screen.dart';
import '../widgets/credibility_score_badge.dart';
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
    // Keep UI in sync with AppState changes (profile updates elsewhere)
    AppState.instance.addListener(_onAppStateChanged);
    _loadProfile();
  }

  void _onAppStateChanged() {
    if (!mounted) return;
    setState(() {
      _profile = AppState.instance.profile;
    });
  }

  @override
  void dispose() {
    AppState.instance.removeListener(_onAppStateChanged);
    _adminSub?.cancel();
    super.dispose();
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
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await AppState.instance.loadFromStorage();
      if (!mounted) return;
      if (AppState.instance.profile != null) {
        setState(() {
          _profile = AppState.instance.profile;
          _isLoading = false;
        });
        AppLogger.logInfo(
            'ProfileScreen._loadProfile', 'Loaded profile from AppState');
      }

      // Always refresh from API to ensure real data (even if cache exists)
      final profile = await ProfileService().fetchProfile();
      if (!mounted) return;
      AppLogger.logInfo('ProfileScreen._loadProfile',
          'fetchProfile returned ${profile == null ? 'null' : 'Profile object'}');
      if (profile != null) {
        final raw = AppState.instance.profileJson;
        await AppState.instance.setProfile(profile, raw);
      }
      if (!mounted) return;
      setState(() {
        _profile = profile ?? AppState.instance.profile;
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
      if (!mounted) return;
      setState(() {
        _error = 'Failed to load profile: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _handleLogout() async {
    final loc = AppLocalizations.of(context);
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(loc.t('logout')),
        content: Text(loc.t('logout_confirm_message')),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text(loc.t('cancel'))),
          ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text(loc.t('logout'))),
        ],
      ),
    );
    if (shouldLogout == true) {
      if (widget.onLogout != null) {
        widget.onLogout!.call();
      } else {
        // Fallback local logout if no parent-provided handler exists
        try {
          await FirebaseAuth.instance.signOut();
        } catch (e, s) {
          AppLogger.logError(
              'ProfileScreen._handleLogout', 'Firebase signOut failed: $e', s);
        }
        try {
          if (!kIsWeb) {
            final googleSignIn = GoogleSignIn();
            await googleSignIn.disconnect();
          } else {
            AppLogger.logInfo('ProfileScreen._handleLogout',
                'Skipping GoogleSignIn.disconnect on web: clientId not configured');
          }
        } catch (e) {
          AppLogger.logInfo('ProfileScreen._handleLogout',
              'GoogleSignIn disconnect skipped: $e');
        }
        try {
          await SecureStorage().deleteAll();
        } catch (_) {}
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.clear();
        } catch (_) {}
        try {
          await AppState.instance.clear();
        } catch (_) {}
      }

      // Clear navigation stack and return to the login screen/root.
      Navigator.of(context).popUntil((route) => route.isFirst);
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text(AppMessages.signedOut)));
    }
  }

  Future<void> _openEdit() async {
    final result = await Navigator.push<Map<String, dynamic>>(
        context,
        MaterialPageRoute(
            builder: (_) => EditProfileScreen(profile: _profile)));
    if (!mounted) return;
    if (result != null) {
      _loadProfile();
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppMessages.profileUpdated)));
    }
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
            ElevatedButton(
                onPressed: _loadProfile, child: Text(loc.t('retry'))),
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
                onRefresh: _loadProfile,
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
                            builder: (_) => const MyInvestmentsScreen())),
                  ),
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
                    title: loc.t('credit_records'),
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
                    color: AppPalette.aqua,
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
  final VoidCallback onRefresh;
  final bool isDarkMode;

  const _ProfileHeader({
    Key? key,
    required this.profile,
    required this.onEdit,
    required this.onRefresh,
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
                        color: theme.colorScheme.onSurface
                            .withAlpha((0.5 * 255).round()))
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
                        color: Colors.black.withAlpha((0.2 * 255).round()),
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
        // Compute display name safely with null checks
        Builder(builder: (ctx) {
          final basic = profile?.basicInfo;
          final displayName = (basic != null &&
                  (basic.fullName?.isNotEmpty == true))
              ? basic.fullName!
              : ((basic != null &&
                      ((basic.firstName?.isNotEmpty == true) ||
                          (basic.lastName?.isNotEmpty == true)))
                  ? '${basic.firstName ?? ''} ${basic.lastName ?? ''}'.trim()
                  : (profile?.fullName.isNotEmpty == true
                      ? profile!.fullName
                      : AppLocalizations.of(ctx).t('user')));
          return Text(
            displayName,
            style:
                textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          );
        }),
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
        const SizedBox(height: 16),
        // Charge Now Button
        ElevatedButton.icon(
          onPressed: () async {
            final result = await Navigator.push<bool>(
              context,
              MaterialPageRoute(builder: (_) => const CreditChargeScreen()),
            );
            if (result == true) {
              onRefresh(); // Refresh profile to show updated credits
            }
          },
          icon: const Icon(Icons.add_card_rounded, size: 18),
          label: Text(
            AppLocalizations.of(context).t('charge_now'),
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppPalette.aqua,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            elevation: 2,
          ),
        ),
        const SizedBox(height: 16),
        // Credibility Score Badge
        if (profile?.currentCredibilityScore != null &&
            (profile?.currentCredibilityScore ?? 0) > 0)
          Column(
            children: [
              const SizedBox(height: 8),
              CredibilityScoreBadge(
                score: profile!.currentCredibilityScore!,
                size: 60,
              ),
            ],
          ),
        // KYC Completion Progress
        const SizedBox(height: 24),
        _KycCompletionCard(
          completionPercentage:
              profile?.basicInfo?.kycCompletionPercentage ?? 0,
          isVerified: profile?.basicInfo?.isKycVerified ?? false,
          isDarkMode: isDarkMode,
        ),
      ],
    );
  }
}

class _KycCompletionCard extends StatelessWidget {
  final int completionPercentage;
  final bool isVerified;
  final bool isDarkMode;

  const _KycCompletionCard({
    Key? key,
    required this.completionPercentage,
    required this.isVerified,
    required this.isDarkMode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final loc = AppLocalizations.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isVerified
              ? Colors.green.withOpacity(0.5)
              : theme.colorScheme.primary.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha((0.1 * 255).round()),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    isVerified ? Icons.verified : Icons.pending_outlined,
                    color: isVerified ? Colors.green : AppPalette.flame,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    loc.t('KYC Completion'),
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              if (isVerified)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle,
                          color: Colors.green, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        loc.t('verified'),
                        style: const TextStyle(
                          color: Colors.green,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: completionPercentage / 100,
                    minHeight: 8,
                    backgroundColor:
                        isDarkMode ? Colors.grey[700] : Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(
                      isVerified ? Colors.green : AppPalette.flame,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '$completionPercentage%',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isVerified ? Colors.green : AppPalette.flame,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            isVerified
                ? loc.t('Your KYC is complete and verified')
                : completionPercentage >= 80
                    ? loc.t('Almost there! Complete your profile to verify')
                    : loc.t('Complete your profile to unlock verification'),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
            ),
          ),
        ],
      ),
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
