import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';

class SettingsScreen extends StatefulWidget {
  final ThemeMode themeMode;
  final Locale? currentLocale;
  final ValueChanged<Locale>? onLocaleChanged;
  final ValueChanged<ThemeMode>? onThemeChanged;
  final VoidCallback? onLogout;

  const SettingsScreen(
      {super.key,
      required this.themeMode,
      this.currentLocale,
      this.onLocaleChanged,
      this.onThemeChanged,
      this.onLogout});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late bool _darkMode;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncDarkModeWithWidget();
  }

  @override
  void didUpdateWidget(covariant SettingsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.themeMode != widget.themeMode) {
      _syncDarkModeWithWidget();
    }
  }

  void _syncDarkModeWithWidget() {
    final brightness = Theme.of(context).brightness;
    final bool effectiveDark = widget.themeMode == ThemeMode.system
        ? brightness == Brightness.dark
        : widget.themeMode == ThemeMode.dark;
    if (mounted) setState(() => _darkMode = effectiveDark);
  }

  void _toggleTheme(bool value) {
    setState(() => _darkMode = value);
    widget.onThemeChanged?.call(value ? ThemeMode.dark : ThemeMode.light);
  }

  Future<void> _pickLanguage() async {
    final loc = AppLocalizations.of(context);
    final choice = await showDialog<Locale>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(loc.t('language')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(loc.t('english')),
              onTap: () => Navigator.pop(ctx, const Locale('en')),
            ),
            ListTile(
              title: Text(loc.t('arabic')),
              onTap: () => Navigator.pop(ctx, const Locale('ar')),
            ),
          ],
        ),
      ),
    );
    if (choice != null) widget.onLocaleChanged?.call(choice);
  }

  void _openTerms() {
    Navigator.push(
        context, MaterialPageRoute(builder: (_) => const _TermsScreen()));
  }

  void _logout() {
    widget.onLogout?.call();
    Navigator.popUntil(context, (route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    final currentLanguage = widget.currentLocale?.languageCode == 'ar'
        ? loc.t('arabic')
        : loc.t('english');

    final body = SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: isDarkMode
                        ? AppDecorations.glass(radius: 12)
                        : BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: theme.colorScheme.outline
                                    .withAlpha((0.5 * 255).round())),
                          ),
                    child: Icon(Icons.arrow_back_rounded,
                        color: isDarkMode
                            ? Colors.white
                            : theme.colorScheme.onSurface),
                  ),
                ),
                const SizedBox(width: 16),
                Text(loc.t('settings'),
                    style: theme.textTheme.headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 32),
            _SectionHeader(title: loc.t('preferences')),
            const SizedBox(height: 12),
            _MenuContainer(
              children: [
                _MenuItem(
                  icon: Icons.dark_mode_rounded,
                  title: loc.t('dark_mode'),
                  color: AppPalette.aqua,
                  trailing: Switch(
                    value: _darkMode,
                    onChanged: _toggleTheme,
                    activeColor: AppPalette.flame,
                  ),
                  onTap: () => _toggleTheme(!_darkMode),
                ),
                const _Divider(),
                _MenuItem(
                  icon: Icons.language_rounded,
                  title: loc.t('language'),
                  subtitle: currentLanguage,
                  color: AppPalette.flame,
                  onTap: _pickLanguage,
                ),
              ],
            ),
            const SizedBox(height: 24),
            _SectionHeader(title: loc.t('about')),
            const SizedBox(height: 12),
            _MenuContainer(
              children: [
                _MenuItem(
                  icon: Icons.article_rounded,
                  title: loc.t('terms_title'),
                  color: AppPalette.aqua,
                  onTap: _openTerms,
                ),
              ],
            ),
          ],
        ),
      ),
    );

    return Scaffold(
      backgroundColor:
          isDarkMode ? Colors.transparent : const Color(0xFFF8F9FC),
      body: isDarkMode ? AppBackground(child: body) : body,
    );
  }
}

class _TermsScreen extends StatelessWidget {
  const _TermsScreen();

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final body = SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: isDarkMode
                        ? AppDecorations.glass(radius: 16)
                        : BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                                color:
                                    theme.colorScheme.outline.withOpacity(0.5)),
                          ),
                    child: Icon(Icons.arrow_back_rounded,
                        color: isDarkMode
                            ? Colors.white
                            : theme.colorScheme.onSurface),
                  ),
                ),
                const SizedBox(width: 16),
                Text(loc.t('terms_title'),
                    style: theme.textTheme.titleLarge
                        ?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: SingleChildScrollView(
                child: Container(
                  decoration: isDarkMode
                      ? AppDecorations.glass(radius: 26)
                      : BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(26),
                          border: Border.all(
                              color:
                                  theme.colorScheme.outline.withOpacity(0.5)),
                        ),
                  padding: const EdgeInsets.all(20),
                  child: Text(loc.t('terms_content'),
                      style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withAlpha((0.7 * 255).round()))),
                ),
              ),
            ),
          ],
        ),
      ),
    );

    return Scaffold(
      backgroundColor:
          isDarkMode ? Colors.transparent : const Color(0xFFF8F9FC),
      body: isDarkMode ? AppBackground(child: body) : body,
    );
  }
}

// Reused widgets for consistency

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: Theme.of(context)
                  .colorScheme
                  .onSurface
                  .withAlpha((0.5 * 255).round()),
            ),
      ),
    );
  }
}

class _MenuContainer extends StatelessWidget {
  final List<Widget> children;

  const _MenuContainer({required this.children});

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
                  color: Colors.black.withAlpha((0.03 * 255).round()),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
        border: isDarkMode
            ? Border.all(color: Colors.white.withAlpha((0.05 * 255).round()))
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
  final String? subtitle;
  final Color color;
  final Color? textColor = null;
  final VoidCallback? onTap;
  final Widget? trailing;

  const _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.color,
    this.onTap,
    this.trailing,
  });

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
                  color: color.withAlpha((0.1 * 255).round()),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 20, color: color),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w500,
                        color: textColor ?? theme.colorScheme.onSurface,
                      ),
                    ),
                    if (subtitle != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          subtitle!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface
                                .withAlpha((0.6 * 255).round()),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              if (trailing != null)
                trailing!
              else
                Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: theme.colorScheme.onSurface
                      .withAlpha((0.3 * 255).round()),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      thickness: 1,
      indent: 60,
      color: Theme.of(context).dividerColor.withAlpha((0.1 * 255).round()),
    );
  }
}
