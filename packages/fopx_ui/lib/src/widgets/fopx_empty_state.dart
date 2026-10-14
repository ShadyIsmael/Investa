import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';
import 'fopx_button.dart';

class FopxEmptyState extends StatelessWidget {
  const FopxEmptyState({super.key, required this.title, required this.body, this.icon = FopxIcons.empty, this.actionLabel, this.onAction});

  final String title;
  final String body;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(FopxSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(color: scheme.primaryContainer, borderRadius: BorderRadius.circular(FopxRadii.surface)),
              child: Icon(icon, color: scheme.primary, size: FopxIconSizes.decorative),
            ),
            const SizedBox(height: FopxSpacing.xl),
            Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: FopxSpacing.sm),
            Text(body, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: scheme.onSurface.withValues(alpha: 0.62))),
            if (actionLabel != null && onAction != null) ...<Widget>[
              const SizedBox(height: FopxSpacing.xl),
              FopxButton(label: actionLabel!, onPressed: onAction, variant: FopxButtonVariant.secondary),
            ],
          ],
        ),
      ),
    );
  }
}
