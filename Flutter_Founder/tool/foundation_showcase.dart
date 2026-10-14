import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

/// Development-only visual gallery for the Phase 0.1 foundation.
///
/// This entrypoint is intentionally outside lib/ and is not part of the
/// production route graph. Run it with:
/// `flutter run -d web-server -t tool/foundation_showcase.dart`
void main() => runApp(const FoundationShowcaseApp());

class FoundationShowcaseApp extends StatefulWidget {
  const FoundationShowcaseApp({super.key});

  @override
  State<FoundationShowcaseApp> createState() => _FoundationShowcaseAppState();
}

class _FoundationShowcaseAppState extends State<FoundationShowcaseApp> {
  Locale _locale = const Locale('en');
  ThemeMode _themeMode = ThemeMode.light;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FOPX Foundation Showcase',
      debugShowCheckedModeBanner: false,
      theme: FopxTheme.founderLight(),
      darkTheme: FopxTheme.founderDark(),
      themeMode: _themeMode,
      locale: _locale,
      supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
      localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
        FopxLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: FoundationShowcasePage(
        locale: _locale,
        themeMode: _themeMode,
        onLocaleChanged: (locale) => setState(() => _locale = locale),
        onThemeModeChanged: (mode) => setState(() => _themeMode = mode),
      ),
    );
  }
}

class FoundationShowcasePage extends StatelessWidget {
  const FoundationShowcasePage({
    super.key,
    required this.locale,
    required this.themeMode,
    required this.onLocaleChanged,
    required this.onThemeModeChanged,
  });

  final Locale locale;
  final ThemeMode themeMode;
  final ValueChanged<Locale> onLocaleChanged;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  Widget build(BuildContext context) {
    final isArabic = locale.languageCode == 'ar';
    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: AppBar(
          titleSpacing: FopxSpacing.pageGutter,
          title: Text(isArabic ? 'FOPX / الأساس' : 'FOPX / Foundation'),
          actions: <Widget>[
            FopxNotificationBell(onPressed: () => FopxFeedback.showSnackBar(context, isArabic ? 'مركز الإشعارات' : 'Notification center'), unreadCount: 10, tooltip: isArabic ? 'الإشعارات' : 'Notifications'),
            IconButton(onPressed: () {}, tooltip: isArabic ? 'الملف الشخصي' : 'Profile', icon: const Icon(FopxIcons.profile)),
            const SizedBox(width: FopxSpacing.sm),
          ],
        ),
        body: LayoutBuilder(
          builder: (context, constraints) {
            final gutter = constraints.maxWidth < 420 ? FopxSpacing.compactPageGutter : FopxSpacing.pageGutter;
            return SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(gutter, FopxSpacing.xl, gutter, FopxSpacing.largeSectionGap),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 980),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: <Widget>[
                      _IntroHeader(
                        isArabic: isArabic,
                        themeMode: themeMode,
                        locale: locale,
                        onLocaleChanged: onLocaleChanged,
                        onThemeModeChanged: onThemeModeChanged,
                      ),
                      const SizedBox(height: FopxSpacing.xl),
                      _ShowcaseSection(
                        title: isArabic ? 'الخط والألوان' : 'Type and semantic color',
                        child: _TypeAndStatusPanel(isArabic: isArabic),
                      ),
                      const SizedBox(height: FopxSpacing.sectionGap),
                      _ShowcaseSection(
                        title: isArabic ? 'الحالات التفاعلية' : 'Interaction states',
                        child: _ControlsPanel(isArabic: isArabic),
                      ),
                      const SizedBox(height: FopxSpacing.sectionGap),
                      _ShowcaseSection(
                        title: isArabic ? 'الحالات التشغيلية' : 'Operational states',
                        child: _OperationalStatesPanel(isArabic: isArabic),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _IntroHeader extends StatelessWidget {
  const _IntroHeader({required this.isArabic, required this.themeMode, required this.locale, required this.onLocaleChanged, required this.onThemeModeChanged});

  final bool isArabic;
  final ThemeMode themeMode;
  final Locale locale;
  final ValueChanged<Locale> onLocaleChanged;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  Widget build(BuildContext context) {
    return FopxSurface(
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Wrap(
        alignment: WrapAlignment.spaceBetween,
        runSpacing: FopxSpacing.lg,
        spacing: FopxSpacing.xl,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: <Widget>[
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(isArabic ? 'معرض أساس التصميم' : 'Foundation gallery', style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: FopxSpacing.sm),
                Text(isArabic ? 'معاينة تطويرية للخطوط، الحالات، الحركة، وإمكانية الوصول.' : 'A development-only view of type, states, motion, and accessibility.', style: Theme.of(context).textTheme.bodyLarge),
              ],
            ),
          ),
          Wrap(
            spacing: FopxSpacing.sm,
            runSpacing: FopxSpacing.sm,
            children: <Widget>[
              FopxButton(
                label: locale.languageCode == 'ar' ? 'العربية' : 'English',
                icon: Icons.translate_rounded,
                variant: FopxButtonVariant.secondary,
                onPressed: () => onLocaleChanged(locale.languageCode == 'ar' ? const Locale('en') : const Locale('ar')),
              ),
              FopxButton(
                label: themeMode == ThemeMode.dark ? (isArabic ? 'فاتح' : 'Light') : (isArabic ? 'داكن' : 'Dark'),
                icon: themeMode == ThemeMode.dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                variant: FopxButtonVariant.tertiary,
                onPressed: () => onThemeModeChanged(themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ShowcaseSection extends StatelessWidget {
  const _ShowcaseSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: FopxSpacing.md),
        FopxSurface(child: child),
      ],
    );
  }
}

class _TypeAndStatusPanel extends StatelessWidget {
  const _TypeAndStatusPanel({required this.isArabic});

  final bool isArabic;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: FopxSpacing.xxl,
      runSpacing: FopxSpacing.xl,
      children: <Widget>[
        SizedBox(
          width: 360,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(isArabic ? 'عنوان الصفحة' : 'Page title', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: FopxSpacing.sm),
              Text(isArabic ? 'نص أساسي واضح ومتوازن.' : 'Readable body copy with calm hierarchy.', style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: FopxSpacing.lg),
              FopxFinancialValue(value: '—', currencyCode: 'USD', label: isArabic ? 'قيمة مالية' : 'Financial value', unavailable: true, unavailableLabel: isArabic ? 'غير متاح' : 'Unavailable'),
            ],
          ),
        ),
        SizedBox(
          width: 360,
          child: Wrap(
            spacing: FopxSpacing.sm,
            runSpacing: FopxSpacing.sm,
            children: <Widget>[
              FopxStatusBadge(label: isArabic ? 'مكتمل' : 'Complete', status: FopxStatus.success),
              FopxStatusBadge(label: isArabic ? 'قيد المراجعة' : 'In review', status: FopxStatus.warning),
              FopxStatusBadge(label: isArabic ? 'معلومة' : 'Information', status: FopxStatus.info),
              FopxStatusBadge(label: isArabic ? 'قادم' : 'Upcoming', status: FopxStatus.neutral),
            ],
          ),
        ),
      ],
    );
  }
}

class _ControlsPanel extends StatefulWidget {
  const _ControlsPanel({required this.isArabic});

  final bool isArabic;

  @override
  State<_ControlsPanel> createState() => _ControlsPanelState();
}

class _ControlsPanelState extends State<_ControlsPanel> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.isArabic ? 'حقل إدخال' : 'Input field';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        FopxTextField(controller: _controller, label: label, hintText: widget.isArabic ? 'أدخل قيمة' : 'Enter a value', helperText: widget.isArabic ? 'نص مساعد' : 'Supporting guidance'),
        const SizedBox(height: FopxSpacing.lg),
        Wrap(
          spacing: FopxSpacing.sm,
          runSpacing: FopxSpacing.sm,
          children: <Widget>[
            FopxButton(label: widget.isArabic ? 'أساسي' : 'Primary', onPressed: () => FopxFeedback.showSnackBar(context, widget.isArabic ? 'تم' : 'Pressed', kind: FopxFeedbackKind.success)),
            FopxButton(label: widget.isArabic ? 'ثانوي' : 'Secondary', variant: FopxButtonVariant.secondary, onPressed: () {}),
            FopxButton(label: widget.isArabic ? 'هادئ' : 'Tertiary', variant: FopxButtonVariant.tertiary, onPressed: () {}),
            FopxButton(label: widget.isArabic ? 'حذف' : 'Destructive', variant: FopxButtonVariant.destructive, onPressed: () {}),
          ],
        ),
      ],
    );
  }
}

class _OperationalStatesPanel extends StatelessWidget {
  const _OperationalStatesPanel({required this.isArabic});

  final bool isArabic;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        FopxLifecycleTimeline(
          steps: <FopxLifecycleStep>[
            FopxLifecycleStep(label: isArabic ? 'مكتمل' : 'Complete', state: FopxLifecycleState.complete),
            FopxLifecycleStep(label: isArabic ? 'حالي' : 'Current', state: FopxLifecycleState.current),
            FopxLifecycleStep(label: isArabic ? 'قادم' : 'Upcoming', state: FopxLifecycleState.upcoming),
          ],
        ),
        const SizedBox(height: FopxSpacing.xl),
        Wrap(
          spacing: FopxSpacing.xl,
          runSpacing: FopxSpacing.xl,
          children: <Widget>[
            SizedBox(width: 270, height: 150, child: FopxLoadingState(height: 150)),
            SizedBox(width: 270, child: FopxEmptyState(title: isArabic ? 'لا توجد عناصر' : 'Nothing here yet', body: isArabic ? 'ستظهر العناصر عند توفرها.' : 'Items will appear when available.')),
            SizedBox(width: 270, child: FopxErrorState(title: isArabic ? 'تعذر التحميل' : 'Unable to load', body: isArabic ? 'تحقق من الاتصال وحاول مرة أخرى.' : 'Check the connection and try again.', actionLabel: isArabic ? 'إعادة المحاولة' : 'Retry', onAction: () {})),
          ],
        ),
      ],
    );
  }
}
