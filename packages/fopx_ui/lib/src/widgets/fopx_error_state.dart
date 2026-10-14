import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';
import 'fopx_button.dart';

enum FopxErrorKind { network, forbidden, validation, generic }

class FopxErrorState extends StatelessWidget {
  const FopxErrorState({super.key, required this.title, required this.body, this.actionLabel, this.onAction, this.kind = FopxErrorKind.generic});

  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;
  final FopxErrorKind kind;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final color = kind == FopxErrorKind.forbidden ? scheme.tertiary : scheme.error;
    final icon = switch (kind) {
      FopxErrorKind.network => Icons.cloud_off_outlined,
      FopxErrorKind.forbidden => Icons.lock_outline_rounded,
      FopxErrorKind.validation => Icons.rule_outlined,
      FopxErrorKind.generic => FopxIcons.error,
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(icon, color: color, size: FopxIconSizes.decorative),
            const SizedBox(height: FopxSpacing.md),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: FopxSpacing.xs),
            Text(body, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
            if (actionLabel != null && onAction != null) ...<Widget>[
              const SizedBox(height: FopxSpacing.lg),
              FopxButton(label: actionLabel!, onPressed: onAction, variant: FopxButtonVariant.secondary),
            ],
          ],
        ),
      ),
    );
  }
}
