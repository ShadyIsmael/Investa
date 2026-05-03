import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Centralized premium theme configuration for Investa ecosystem.
/// Designed for a modern Fintech experience, emphasizing trust,
/// clarity, and sophisticated aesthetics.
class AppTheme {
  // Core Brand Colors
  static const Color primaryColor =
      Color(0xFF0F172A); // Slate 900 (Luxury Dark)
  static const Color primaryAccent =
      Color(0xFF3B82F6); // Blue 500 (Vibrant action)
  static const Color secondaryColor =
      Color(0xFF10B981); // Emerald 500 (Success/Growth)

  // Semantic Colors
  static const Color errorColor = Color(0xFFEF4444); // Red 500
  static const Color successColor = Color(0xFF10B981);
  static const Color warningColor = Color(0xFFF59E0B);

  // Gradients for cards/buttons
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Light Theme - Clean, high contrast, elegant spacing
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: primaryAccent,
        secondary: secondaryColor,
        error: errorColor,
        surface: Color(0xFFFFFFFF),
        onSurface: Color(0xFF0F172A),
      ),
      scaffoldBackgroundColor: const Color(0xFFF8FAFC), // Slate 50

      // Typography - High legibility geometric font
      textTheme: GoogleFonts.outfitTextTheme(
        ThemeData.light().textTheme,
      ).copyWith(
        displayLarge: GoogleFonts.outfit(
            fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
        titleLarge: GoogleFonts.outfit(
            fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
        bodyLarge: GoogleFonts.outfit(color: const Color(0xFF334155)),
        bodyMedium: GoogleFonts.outfit(color: const Color(0xFF475569)),
      ),

      // AppBar - Invisible boundaries, clean layout
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: true,
        backgroundColor: const Color(0xFFF8FAFC),
        foregroundColor: const Color(0xFF0F172A),
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: const Color(0xFF0F172A),
          letterSpacing: 0.15,
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),

      // Cards - Soft glass-like shadows
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side:
              const BorderSide(color: Color(0xFFE2E8F0), width: 1), // Slate 200
        ),
        margin: const EdgeInsets.symmetric(vertical: 8),
        color: Colors.white,
      ),

      // Inputs - Modern Fintech float fields
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.transparent,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)), // Slate 300
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryAccent, width: 2),
        ),
        labelStyle: GoogleFonts.outfit(color: const Color(0xFF64748B)),
      ),

      // Elevated Buttons - Vibrant Action
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryAccent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          textStyle: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.3,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ).copyWith(
          overlayColor: WidgetStateProperty.resolveWith(
            (states) => Colors.white.withValues(alpha: 0.1),
          ),
        ),
      ),

      // Floating Action Button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryAccent,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
    );
  }

  /// Dark Theme - Deep luxury slate, striking neon-esque branding
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: primaryAccent,
        secondary: secondaryColor,
        error: errorColor,
        surface: Color(0xFF1E293B), // Slate 800
        onSurface: Color(0xFFF8FAFC),
      ),
      scaffoldBackgroundColor: const Color(0xFF0F172A), // Slate 900 base

      // Typography - High legibility geometric font
      textTheme: GoogleFonts.outfitTextTheme(
        ThemeData.dark().textTheme,
      ).copyWith(
        displayLarge: GoogleFonts.outfit(
            fontWeight: FontWeight.w700, color: const Color(0xFFF8FAFC)),
        titleLarge: GoogleFonts.outfit(
            fontWeight: FontWeight.w600, color: const Color(0xFFF8FAFC)),
        bodyLarge: GoogleFonts.outfit(color: const Color(0xFFE2E8F0)),
        bodyMedium: GoogleFonts.outfit(color: const Color(0xFFCBD5E1)),
      ),

      // AppBar - Invisible boundaries, deep immersion
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: true,
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: const Color(0xFFF8FAFC),
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: const Color(0xFFF8FAFC),
          letterSpacing: 0.15,
        ),
      ),

      // Cards - Deep rich elevation
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side:
              const BorderSide(color: Color(0xFF334155), width: 1), // Slate 700
        ),
        margin: const EdgeInsets.symmetric(vertical: 8),
        color: const Color(0xFF1E293B), // Slate 800
      ),

      // Inputs - Matte dark mode text fields
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1E293B), // Slate 800
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryAccent, width: 2),
        ),
        labelStyle:
            GoogleFonts.outfit(color: const Color(0xFF94A3B8)), // Slate 400
      ),

      // Elevated Buttons
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryAccent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          textStyle: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.3,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ).copyWith(
          overlayColor: WidgetStateProperty.resolveWith(
            (states) => Colors.white.withValues(alpha: 0.1),
          ),
        ),
      ),

      // Floating Action Button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryAccent,
        foregroundColor: Colors.white,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
    );
  }
}
