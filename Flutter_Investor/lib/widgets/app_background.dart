import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppBackground extends StatelessWidget {
  final Widget child;
  final bool applyPadding;

  const AppBackground(
      {super.key, required this.child, this.applyPadding = false});

  @override
  Widget build(BuildContext context) {
    Widget content = child;
    if (applyPadding) {
      content = Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: child);
    }

    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return DecoratedBox(
      decoration: isDarkMode
          ? const BoxDecoration(gradient: AppGradients.background)
          : BoxDecoration(color: theme.colorScheme.surface),
      // Ensure the background fills available space so child widgets receive
      // proper layout constraints when used as Scaffold.body.
      child: SizedBox.expand(child: content),
    );
  }
}
