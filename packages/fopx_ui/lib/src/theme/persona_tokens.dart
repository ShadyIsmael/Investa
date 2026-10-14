import 'package:flutter/material.dart';

class FopxPersonaTokens {
  const FopxPersonaTokens({
    required this.primary,
    required this.primaryDeep,
    required this.primarySoft,
    required this.ink,
    required this.canvas,
    required this.surface,
    required this.surfaceMuted,
    required this.outline,
    required this.success,
    required this.warning,
    required this.danger,
    required this.surfaceElevated,
    required this.textPrimary,
    required this.textSecondary,
    required this.border,
    required this.divider,
    required this.info,
    required this.neutral,
    required this.lifecycleCurrent,
    required this.lifecycleComplete,
    required this.lifecycleUpcoming,
    required this.disabledFill,
    required this.disabledText,
  });

  final Color primary;
  final Color primaryDeep;
  final Color primarySoft;
  final Color ink;
  final Color canvas;
  final Color surface;
  final Color surfaceMuted;
  final Color outline;
  final Color success;
  final Color warning;
  final Color danger;
  final Color surfaceElevated;
  final Color textPrimary;
  final Color textSecondary;
  final Color border;
  final Color divider;
  final Color info;
  final Color neutral;
  final Color lifecycleCurrent;
  final Color lifecycleComplete;
  final Color lifecycleUpcoming;
  final Color disabledFill;
  final Color disabledText;

  static const founder = FopxPersonaTokens(
    primary: Color(0xFF6D4AFF),
    primaryDeep: Color(0xFF3E276F),
    primarySoft: Color(0xFFF2EEFF),
    ink: Color(0xFF17151C),
    canvas: Color(0xFFF8F7FA),
    surface: Color(0xFFFFFFFF),
    surfaceMuted: Color(0xFFF0EDF4),
    outline: Color(0xFFE3DFE9),
    success: Color(0xFF197A58),
    warning: Color(0xFF9A6400),
    danger: Color(0xFFB6404E),
    surfaceElevated: Color(0xFFFFFFFF),
    textPrimary: Color(0xFF17151C),
    textSecondary: Color(0xFF67616F),
    border: Color(0xFFE3DFE9),
    divider: Color(0xFFEDEAF1),
    info: Color(0xFF376BC7),
    neutral: Color(0xFF67616F),
    lifecycleCurrent: Color(0xFF6D4AFF),
    lifecycleComplete: Color(0xFF197A58),
    lifecycleUpcoming: Color(0xFF9B95A4),
    disabledFill: Color(0xFFE8E5EC),
    disabledText: Color(0xFF9B95A4),
  );

  Color get background => canvas;
}
