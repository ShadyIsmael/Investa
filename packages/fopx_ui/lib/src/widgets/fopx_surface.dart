import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

class FopxSurface extends StatelessWidget {
  const FopxSurface({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(FopxSpacing.surfacePadding),
    this.color,
    this.borderRadius = FopxRadii.surface,
    this.border,
    this.onTap,
    this.semanticLabel,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final double borderRadius;
  final Border? border;
  final VoidCallback? onTap;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surface = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(borderRadius),
        border: border,
      ),
      child: child,
    );
    final interactive = onTap == null
        ? surface
        : Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(borderRadius),
              child: surface,
            ),
          );
    return semanticLabel == null ? interactive : Semantics(button: onTap != null, label: semanticLabel, child: interactive);
  }
}
