import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

enum FopxStatus { success, warning, error, info, neutral, current }

class FopxStatusBadge extends StatelessWidget {
  const FopxStatusBadge({super.key, required this.label, this.status = FopxStatus.current, this.color});

  final String label;
  final FopxStatus status;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<FopxSemanticColors>();
    final tint = color ?? switch (status) {
      FopxStatus.success => tokens?.success ?? Theme.of(context).colorScheme.primary,
      FopxStatus.warning => tokens?.warning ?? Theme.of(context).colorScheme.primary,
      FopxStatus.error => tokens?.error ?? Theme.of(context).colorScheme.error,
      FopxStatus.info => tokens?.info ?? Theme.of(context).colorScheme.primary,
      FopxStatus.neutral => tokens?.neutral ?? Theme.of(context).colorScheme.outline,
      FopxStatus.current => tokens?.current ?? Theme.of(context).colorScheme.primary,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: FopxSpacing.md, vertical: FopxSpacing.sm),
      decoration: BoxDecoration(color: tint.withValues(alpha: 0.11), borderRadius: BorderRadius.circular(FopxRadii.pill)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(width: 6, height: 6, decoration: BoxDecoration(color: tint, shape: BoxShape.circle)),
          const SizedBox(width: FopxSpacing.sm),
          Text(label, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: tint)),
        ],
      ),
    );
  }
}
