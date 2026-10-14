import 'dart:ui' show FontFeature;

import 'package:flutter/material.dart';

import 'persona_tokens.dart';

/// Shared rhythm, shape, type, motion, and state values for FOPX Mobile.
///
/// These values are deliberately platform-neutral. Persona-specific colors
/// live in [FopxPersonaTokens], while composition remains in the app.
class FopxSpacing {
  const FopxSpacing._();

  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double pageGutter = 22;
  static const double compactPageGutter = 16;
  static const double controlGap = 12;
  static const double formGap = 16;
  static const double sectionGap = 24;
  static const double largeSectionGap = 32;
  static const double surfacePadding = 20;
}

class FopxRadii {
  const FopxRadii._();

  static const double control = 18;
  static const double surface = 24;
  static const double feature = 30;
  static const double modal = 30;
  static const double pill = 999;
}

class FopxMotion {
  const FopxMotion._();

  static const Duration instant = Duration.zero;
  static const Duration fast = Duration(milliseconds: 120);
  static const Duration standard = Duration(milliseconds: 220);
  static const Duration emphasized = Duration(milliseconds: 360);

  static const Curve standardCurve = Curves.easeOutCubic;
  static const Curve emphasizedCurve = Curves.easeInOutCubic;

  static Duration duration(BuildContext context, Duration requested) {
    return MediaQuery.maybeOf(context)?.disableAnimations == true ? instant : requested;
  }
}

class FopxTypography {
  const FopxTypography._();

  static const String englishFamily = 'Aptos';
  static const String arabicFamily = 'NotoNaskhArabic';
  static const List<String> fallbackFamilies = <String>[
    'Segoe UI',
    'Tahoma',
    'Arial',
    'sans-serif',
  ];

  /// Requests lining, tabular numerals for financial values.
  ///
  /// Fonts that do not expose the OpenType `tnum` feature safely fall back to
  /// their normal numeral widths; the value remains readable and explicit.
  static const List<FontFeature> financialFontFeatures = <FontFeature>[
    FontFeature.tabularFigures(),
  ];

  static TextStyle _style({
    required Color color,
    required double size,
    required double height,
    required FontWeight weight,
    double letterSpacing = 0,
    List<FontFeature>? fontFeatures,
  }) {
    return TextStyle(
      color: color,
      fontFamily: englishFamily,
      fontFamilyFallback: <String>[arabicFamily, ...fallbackFamilies],
      fontSize: size,
      height: height,
      fontWeight: weight,
      letterSpacing: letterSpacing,
      fontFeatures: fontFeatures,
    );
  }

  static TextTheme textTheme(FopxPersonaTokens tokens) {
    return TextTheme(
      displaySmall: _style(color: tokens.textPrimary, size: 36, height: 1.05, weight: FontWeight.w700, letterSpacing: -1.1),
      headlineMedium: _style(color: tokens.textPrimary, size: 28, height: 1.1, weight: FontWeight.w700, letterSpacing: -0.7),
      titleLarge: _style(color: tokens.textPrimary, size: 21, height: 1.2, weight: FontWeight.w700, letterSpacing: -0.25),
      titleMedium: _style(color: tokens.textPrimary, size: 16, height: 1.25, weight: FontWeight.w700),
      bodyLarge: _style(color: tokens.textPrimary, size: 16, height: 1.45, weight: FontWeight.w400),
      bodyMedium: _style(color: tokens.textPrimary, size: 14, height: 1.4, weight: FontWeight.w400),
      bodySmall: _style(color: tokens.textSecondary, size: 12, height: 1.35, weight: FontWeight.w400),
      labelLarge: _style(color: tokens.textPrimary, size: 14, height: 1.1, weight: FontWeight.w700),
      labelMedium: _style(color: tokens.textPrimary, size: 12, height: 1.15, weight: FontWeight.w700),
      labelSmall: _style(color: tokens.textSecondary, size: 11, height: 1.15, weight: FontWeight.w700),
    );
  }

  static TextStyle financialHero(FopxPersonaTokens tokens) => _style(
        color: tokens.textPrimary,
        size: 32,
        height: 1.05,
        weight: FontWeight.w700,
        letterSpacing: -0.8,
        fontFeatures: financialFontFeatures,
      );

  static TextStyle financialValue(FopxPersonaTokens tokens) => _style(
        color: tokens.textPrimary,
        size: 24,
        height: 1.1,
        weight: FontWeight.w700,
        letterSpacing: -0.4,
        fontFeatures: financialFontFeatures,
      );

  static TextStyle financialSupporting(FopxPersonaTokens tokens) => _style(
        color: tokens.textSecondary,
        size: 12,
        height: 1.2,
        weight: FontWeight.w700,
        letterSpacing: 0.2,
        fontFeatures: financialFontFeatures,
      );
}

class FopxIconSizes {
  const FopxIconSizes._();

  static const double navigation = 22;
  static const double action = 20;
  static const double status = 16;
  static const double decorative = 30;
}

class FopxIcons {
  const FopxIcons._();

  static const IconData notifications = Icons.notifications_none_rounded;
  static const IconData profile = Icons.person_outline_rounded;
  static const IconData home = Icons.home_outlined;
  static const IconData projects = Icons.folder_open_outlined;
  static const IconData deals = Icons.handshake_outlined;
  static const IconData chat = Icons.chat_bubble_outline_rounded;
  static const IconData success = Icons.check_circle_outline_rounded;
  static const IconData warning = Icons.warning_amber_rounded;
  static const IconData error = Icons.error_outline_rounded;
  static const IconData info = Icons.info_outline_rounded;
  static const IconData empty = Icons.auto_awesome_outlined;
}

class FopxSemanticColors extends ThemeExtension<FopxSemanticColors> {
  const FopxSemanticColors({required this.success, required this.warning, required this.error, required this.info, required this.neutral, required this.current});

  final Color success;
  final Color warning;
  final Color error;
  final Color info;
  final Color neutral;
  final Color current;

  @override
  FopxSemanticColors copyWith({Color? success, Color? warning, Color? error, Color? info, Color? neutral, Color? current}) {
    return FopxSemanticColors(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      error: error ?? this.error,
      info: info ?? this.info,
      neutral: neutral ?? this.neutral,
      current: current ?? this.current,
    );
  }

  @override
  FopxSemanticColors lerp(covariant FopxSemanticColors? other, double t) {
    if (other == null) return this;
    return FopxSemanticColors(
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      error: Color.lerp(error, other.error, t)!,
      info: Color.lerp(info, other.info, t)!,
      neutral: Color.lerp(neutral, other.neutral, t)!,
      current: Color.lerp(current, other.current, t)!,
    );
  }
}

class FopxFinancialTextStyles extends ThemeExtension<FopxFinancialTextStyles> {
  const FopxFinancialTextStyles({required this.value, required this.supporting});

  final TextStyle value;
  final TextStyle supporting;

  @override
  FopxFinancialTextStyles copyWith({TextStyle? value, TextStyle? supporting}) {
    return FopxFinancialTextStyles(value: value ?? this.value, supporting: supporting ?? this.supporting);
  }

  @override
  FopxFinancialTextStyles lerp(covariant FopxFinancialTextStyles? other, double t) {
    if (other == null) return this;
    return FopxFinancialTextStyles(
      value: TextStyle.lerp(value, other.value, t)!,
      supporting: TextStyle.lerp(supporting, other.supporting, t)!,
    );
  }
}

/// Shared visualization contract for future charts.
///
/// This is a semantic palette, not a feature palette. Chart implementations
/// must consume these roles instead of inventing per-screen colors.
class FopxChartColors extends ThemeExtension<FopxChartColors> {
  const FopxChartColors({
    required this.text,
    required this.axis,
    required this.grid,
    required this.primarySeries,
    required this.secondarySeries,
    required this.neutralSeries,
    required this.positive,
    required this.warning,
    required this.negative,
    required this.selected,
    required this.tooltip,
    required this.legend,
    required this.unavailable,
  });

  final Color text;
  final Color axis;
  final Color grid;
  final Color primarySeries;
  final Color secondarySeries;
  final Color neutralSeries;
  final Color positive;
  final Color warning;
  final Color negative;
  final Color selected;
  final Color tooltip;
  final Color legend;
  final Color unavailable;

  @override
  FopxChartColors copyWith({
    Color? text,
    Color? axis,
    Color? grid,
    Color? primarySeries,
    Color? secondarySeries,
    Color? neutralSeries,
    Color? positive,
    Color? warning,
    Color? negative,
    Color? selected,
    Color? tooltip,
    Color? legend,
    Color? unavailable,
  }) {
    return FopxChartColors(
      text: text ?? this.text,
      axis: axis ?? this.axis,
      grid: grid ?? this.grid,
      primarySeries: primarySeries ?? this.primarySeries,
      secondarySeries: secondarySeries ?? this.secondarySeries,
      neutralSeries: neutralSeries ?? this.neutralSeries,
      positive: positive ?? this.positive,
      warning: warning ?? this.warning,
      negative: negative ?? this.negative,
      selected: selected ?? this.selected,
      tooltip: tooltip ?? this.tooltip,
      legend: legend ?? this.legend,
      unavailable: unavailable ?? this.unavailable,
    );
  }

  @override
  FopxChartColors lerp(covariant FopxChartColors? other, double t) {
    if (other == null) return this;
    return FopxChartColors(
      text: Color.lerp(text, other.text, t)!,
      axis: Color.lerp(axis, other.axis, t)!,
      grid: Color.lerp(grid, other.grid, t)!,
      primarySeries: Color.lerp(primarySeries, other.primarySeries, t)!,
      secondarySeries: Color.lerp(secondarySeries, other.secondarySeries, t)!,
      neutralSeries: Color.lerp(neutralSeries, other.neutralSeries, t)!,
      positive: Color.lerp(positive, other.positive, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      negative: Color.lerp(negative, other.negative, t)!,
      selected: Color.lerp(selected, other.selected, t)!,
      tooltip: Color.lerp(tooltip, other.tooltip, t)!,
      legend: Color.lerp(legend, other.legend, t)!,
      unavailable: Color.lerp(unavailable, other.unavailable, t)!,
    );
  }
}
