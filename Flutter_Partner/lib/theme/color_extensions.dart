import 'package:flutter/material.dart';

/// Compatibility helper to replace deprecated `withOpacity` usages in older
/// Flutter SDKs. This preserves behavior by computing an equivalent alpha.
extension ColorExtensions on Color {
  /// Return a color with the given opacity (0.0 - 1.0) using `withAlpha`.
  ///
  /// Keeps values clamped and rounded to integer alpha (0-255).
  Color withOpacityCompat(double opacity) {
    final alpha = (opacity * 255).round().clamp(0, 255);
    return withAlpha(alpha);
  }
}
