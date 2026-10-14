import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'persona_tokens.dart';
import 'fopx_tokens.dart';

class FopxTheme {
  const FopxTheme._();

  static ThemeData founderLight() => _build(FopxPersonaTokens.founder, Brightness.light);

  static ThemeData founderDark() => _build(
        const FopxPersonaTokens(
          primary: Color(0xFFB7A6FF),
          primaryDeep: Color(0xFF8F76F5),
          primarySoft: Color(0xFF2B2346),
          ink: Color(0xFFF5F2FA),
          canvas: Color(0xFF121016),
          surface: Color(0xFF1D1922),
          surfaceMuted: Color(0xFF29232F),
          outline: Color(0xFF3B3344),
          success: Color(0xFF6FD0A7),
          warning: Color(0xFFF2BF64),
          danger: Color(0xFFFF8692),
          surfaceElevated: Color(0xFF25202C),
          textPrimary: Color(0xFFF5F2FA),
          textSecondary: Color(0xFFBDB5C8),
          border: Color(0xFF3B3344),
          divider: Color(0xFF332C3B),
          info: Color(0xFF8FB3FF),
          neutral: Color(0xFFBDB5C8),
          lifecycleCurrent: Color(0xFFB7A6FF),
          lifecycleComplete: Color(0xFF6FD0A7),
          lifecycleUpcoming: Color(0xFF777080),
          disabledFill: Color(0xFF3B3344),
          disabledText: Color(0xFF777080),
        ),
        Brightness.dark,
      );

  static ThemeData _build(FopxPersonaTokens tokens, Brightness brightness) {
    final scheme = ColorScheme(
      brightness: brightness,
      primary: tokens.primary,
      onPrimary: brightness == Brightness.light ? Colors.white : const Color(0xFF201746),
      primaryContainer: tokens.primarySoft,
      onPrimaryContainer: tokens.primaryDeep,
      secondary: tokens.primaryDeep,
      onSecondary: Colors.white,
      secondaryContainer: tokens.surfaceMuted,
      onSecondaryContainer: tokens.textPrimary,
      error: tokens.danger,
      onError: Colors.white,
      surface: tokens.surface,
      onSurface: tokens.textPrimary,
      surfaceContainerHighest: tokens.surfaceMuted,
      outline: tokens.border,
      outlineVariant: tokens.divider,
    );

    final text = FopxTypography.textTheme(tokens);

    return ThemeData(
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: tokens.canvas,
      canvasColor: tokens.canvas,
      textTheme: text,
      extensions: <ThemeExtension<dynamic>>[
        FopxSemanticColors(
          success: tokens.success,
          warning: tokens.warning,
          error: tokens.danger,
          info: tokens.info,
          neutral: tokens.neutral,
          current: tokens.lifecycleCurrent,
        ),
        FopxFinancialTextStyles(
          value: FopxTypography.financialValue(tokens),
          supporting: FopxTypography.financialSupporting(tokens),
        ),
        FopxChartColors(
          text: tokens.textSecondary,
          axis: tokens.border,
          grid: tokens.divider,
          primarySeries: tokens.primary,
          secondarySeries: tokens.primaryDeep,
          neutralSeries: tokens.neutral,
          positive: tokens.success,
          warning: tokens.warning,
          negative: tokens.danger,
          selected: tokens.lifecycleCurrent,
          tooltip: tokens.surfaceElevated,
          legend: tokens.textPrimary,
          unavailable: tokens.disabledText,
        ),
      ],
      useMaterial3: true,
      visualDensity: VisualDensity.standard,
      splashFactory: InkSparkle.splashFactory,
      materialTapTargetSize: MaterialTapTargetSize.padded,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: <TargetPlatform, PageTransitionsBuilder>{
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.linux: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.fuchsia: FadeUpwardsPageTransitionsBuilder(),
        },
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: tokens.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: FopxSpacing.lg, vertical: FopxSpacing.lg),
        labelStyle: text.bodyMedium?.copyWith(color: tokens.textSecondary),
        hintStyle: text.bodyMedium?.copyWith(color: tokens.textSecondary),
        errorStyle: text.bodySmall?.copyWith(color: tokens.danger, fontWeight: FontWeight.w600),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(FopxRadii.control), borderSide: BorderSide(color: tokens.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(FopxRadii.control), borderSide: BorderSide(color: tokens.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(FopxRadii.control), borderSide: BorderSide(color: tokens.primary, width: 1.5)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(FopxRadii.control), borderSide: BorderSide(color: tokens.danger)),
        focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(FopxRadii.control), borderSide: BorderSide(color: tokens.danger, width: 1.5)),
      ),
      dividerTheme: DividerThemeData(color: tokens.divider, thickness: 1, space: FopxSpacing.sectionGap),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: tokens.surface,
        modalBackgroundColor: tokens.surface,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(FopxRadii.modal))),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: tokens.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FopxRadii.modal)),
        titleTextStyle: text.titleLarge,
        contentTextStyle: text.bodyMedium,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: tokens.canvas,
        foregroundColor: tokens.textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: text.titleLarge,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: FopxSpacing.xl, vertical: FopxSpacing.lg),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FopxRadii.control)),
          textStyle: text.labelLarge,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(48, 48),
          textStyle: text.labelLarge,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FopxRadii.control)),
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(foregroundColor: tokens.textPrimary, minimumSize: const Size(48, 48), tapTargetSize: MaterialTapTargetSize.padded),
      ),
    );
  }
}
