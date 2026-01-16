import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppPalette {
  AppPalette._();

  static const Color midnight = Color(0xFF0F172A);
  static const Color midnightAlt = Color(0xFF111827);
  static const Color midnightDeep = Color(0xFF020617);

  static const Color plum = Color(0xFF312E81);
  static const Color plumDeep = Color(0xFF1E1B4B);

  // Orchid glow / purple accents
  static const Color orchidLight = Color(0xFFCE93D8);
  static const Color orchidDeep = Color(0xFF6A1B9A);
  static const Color purpleAccent = Color(0xFF7C4DFF);

  static const Color flame = Color(0xFFFF7A45);
  static const Color amber = Color(0xFFFFB74D);
  static const Color aqua = Color(0xFF38BDF8);
  static const Color sky = Color(0xFF0EA5E9);

  static const Color danger = Color(0xFFEF4444);
  static const Color success = Color.fromARGB(255, 5, 146, 52);
}

class AppGradients {
  AppGradients._();

  static const LinearGradient background = LinearGradient(
    colors: [
      Color(0xFF1E1B4B), // Deep Plum
      AppPalette.midnight,
      AppPalette.midnightDeep
    ],
    stops: [0.0, 0.4, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient hero = LinearGradient(
    colors: [AppPalette.plum, AppPalette.plumDeep],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient navBar = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppShadows {
  AppShadows._();

  static List<BoxShadow> medium = [
    BoxShadow(
        color: Colors.black.withAlpha(64),
        blurRadius: 24,
        offset: const Offset(0, 14)),
  ];

  static List<BoxShadow> soft = [
    BoxShadow(
        color: Colors.black.withAlpha(31),
        blurRadius: 16,
        offset: const Offset(0, 8)),
  ];
}

class AppDecorations {
  AppDecorations._();

  static BoxDecoration glass({Color? tint, double radius = 20}) {
    return BoxDecoration(
      color: (tint ?? Colors.white).withAlpha(15),
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: Colors.white.withAlpha(15)),
      boxShadow: [
        BoxShadow(
            color: Colors.black.withAlpha(46),
            blurRadius: 20,
            offset: const Offset(0, 10))
      ],
    );
  }

  static BoxDecoration premiumGlass({
    Color? tint,
    double radius = 24,
    BorderRadiusGeometry? customBorderRadius,
  }) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          (tint ?? Colors.white).withAlpha(30),
          (tint ?? Colors.white).withAlpha(10),
        ],
      ),
      borderRadius: customBorderRadius ?? BorderRadius.circular(radius),
      border: Border.all(color: Colors.white.withAlpha(30), width: 1.0),
      boxShadow: [
        BoxShadow(
            color: Colors.black.withAlpha(50),
            blurRadius: 30,
            spreadRadius: -5,
            offset: const Offset(0, 20)),
      ],
    );
  }

  static BoxDecoration pillGradient(Color color) {
    return BoxDecoration(
      gradient: LinearGradient(
          colors: [color, color.withAlpha(153)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight),
      borderRadius: BorderRadius.circular(16),
    );
  }
}

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    final base = ThemeData(brightness: Brightness.light, useMaterial3: true);
    final scheme = ColorScheme.fromSeed(
      seedColor: AppPalette.flame,
      brightness: Brightness.light,
      primary: AppPalette.flame,
      secondary: AppPalette.aqua,
      // background: const Color(0xFFF3F4F6), // Removed deprecated
      surface: Colors.white,
      onSurface: const Color(0xFF1F2937), // A dark gray for text
    );

    return base.copyWith(
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFFF3F4F6), // Light gray background
      canvasColor: const Color(0xFFF3F4F6),
      textTheme: GoogleFonts.poppinsTextTheme(base.textTheme).apply(
        bodyColor: scheme.onSurface,
        displayColor: scheme.onSurface,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
            fontWeight: FontWeight.w600, fontSize: 20, color: scheme.onSurface),
        foregroundColor: scheme.onSurface,
        iconTheme: IconThemeData(color: scheme.onSurface),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        shadowColor: Colors.black.withAlpha(13),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppPalette.flame,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: TextStyle(
            color: scheme.onSurface.withAlpha(230),
            fontWeight: FontWeight.w600),
        hintStyle: TextStyle(color: scheme.onSurface.withAlpha(153)),
        errorStyle: const TextStyle(color: AppPalette.danger),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.flame, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.danger, width: 2),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppPalette.flame,
        foregroundColor: Colors.white,
        elevation: 8,
      ),
      dividerColor: Colors.grey.shade200,
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  static ThemeData dark() {
    final base = ThemeData(brightness: Brightness.dark, useMaterial3: true);
    final scheme = ColorScheme.fromSeed(
      seedColor: AppPalette.flame,
      brightness: Brightness.dark,
      primary: AppPalette.flame,
      secondary: AppPalette.aqua,
      // background: AppPalette.midnightDeep, // Removed deprecated
      surface: Colors.white.withAlpha(20),
    );

    return base.copyWith(
      colorScheme: scheme,
      scaffoldBackgroundColor: Colors.transparent,
      canvasColor: Colors.transparent,
      textTheme: GoogleFonts.poppinsTextTheme(base.textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
            fontWeight: FontWeight.w600, fontSize: 20, color: Colors.white),
        foregroundColor: Colors.white,
      ),
      cardTheme: CardTheme(
        color: Colors.white.withAlpha(13),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color.fromARGB(255, 5, 146, 52),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withAlpha(8),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: TextStyle(
            color: Colors.white.withAlpha(230), fontWeight: FontWeight.w600),
        hintStyle: TextStyle(color: Colors.white.withAlpha(153)),
        errorStyle: const TextStyle(color: AppPalette.danger),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.white.withAlpha(15)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.flame, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.danger, width: 2),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppPalette.flame,
        foregroundColor: Colors.white,
        elevation: 8,
      ),
      dividerColor: Colors.white.withAlpha(20),
      dialogTheme: DialogThemeData(
        backgroundColor: AppPalette.midnightAlt,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        elevation: 8,
        titleTextStyle: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        contentTextStyle: GoogleFonts.poppins(
          color: Colors.white.withAlpha(217),
          fontSize: 15,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppPalette.midnightAlt,
        contentTextStyle: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        behavior: SnackBarBehavior.floating,
        elevation: 8,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppPalette.midnightAlt,
        modalBackgroundColor: AppPalette.midnightAlt,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        elevation: 8,
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: AppPalette.midnightAlt,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 8,
        textStyle: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 15,
        ),
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: AppPalette.midnight,
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: GoogleFonts.poppins(
          color: Colors.white,
          fontSize: 13,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }
}
