import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

enum FopxFeedbackKind { success, info, warning, error }

class FopxInlineFeedback extends StatelessWidget {
  const FopxInlineFeedback({super.key, required this.message, this.kind = FopxFeedbackKind.info, this.actionLabel, this.onAction});

  final String message;
  final FopxFeedbackKind kind;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final semantic = Theme.of(context).extension<FopxSemanticColors>();
    final (color, icon) = switch (kind) {
      FopxFeedbackKind.success => (semantic?.success ?? Colors.green, FopxIcons.success),
      FopxFeedbackKind.info => (semantic?.info ?? Theme.of(context).colorScheme.primary, FopxIcons.info),
      FopxFeedbackKind.warning => (semantic?.warning ?? Colors.orange, FopxIcons.warning),
      FopxFeedbackKind.error => (semantic?.error ?? Theme.of(context).colorScheme.error, FopxIcons.error),
    };
    return Semantics(
      liveRegion: true,
      label: message,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(FopxSpacing.md),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(FopxRadii.control),
          border: Border.all(color: color.withValues(alpha: 0.22)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Icon(icon, color: color, size: FopxIconSizes.action),
            const SizedBox(width: FopxSpacing.sm),
            Expanded(child: Text(message, style: Theme.of(context).textTheme.bodyMedium)),
            if (actionLabel != null && onAction != null)
              TextButton(onPressed: onAction, child: Text(actionLabel!)),
          ],
        ),
      ),
    );
  }
}

class FopxFeedback {
  const FopxFeedback._();

  static void showSnackBar(BuildContext context, String message, {FopxFeedbackKind kind = FopxFeedbackKind.info}) {
    final color = switch (kind) {
      FopxFeedbackKind.success => Theme.of(context).colorScheme.primary,
      FopxFeedbackKind.info => Theme.of(context).colorScheme.inverseSurface,
      FopxFeedbackKind.warning => Theme.of(context).colorScheme.tertiary,
      FopxFeedbackKind.error => Theme.of(context).colorScheme.error,
    };
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          backgroundColor: color,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FopxRadii.control)),
          duration: const Duration(seconds: 4),
        ),
      );
  }

  static Future<bool?> showConfirmDialog(
    BuildContext context, {
    required String title,
    required String message,
    required String confirmLabel,
    required String cancelLabel,
    bool destructive = false,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: <Widget>[
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: Text(cancelLabel)),
          FilledButton(
            style: destructive ? FilledButton.styleFrom(backgroundColor: Theme.of(dialogContext).colorScheme.error) : null,
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(confirmLabel),
          ),
        ],
      ),
    );
  }
}

Future<T?> showFopxBottomSheet<T>(BuildContext context, {required WidgetBuilder builder, bool isScrollControlled = false}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: isScrollControlled,
    useSafeArea: true,
    builder: (sheetContext) => Padding(
      padding: const EdgeInsets.all(FopxSpacing.xl),
      child: builder(sheetContext),
    ),
  );
}
