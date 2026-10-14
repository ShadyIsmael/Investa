import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/fopx_tokens.dart';

enum FopxButtonVariant { primary, secondary, tertiary, destructive }

class FopxButton extends StatefulWidget {
  const FopxButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.expanded = false,
    this.busy = false,
    this.variant = FopxButtonVariant.primary,
    this.tooltip,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool expanded;
  final bool busy;
  final FopxButtonVariant variant;
  final String? tooltip;

  @override
  State<FopxButton> createState() => _FopxButtonState();
}

class _FopxButtonState extends State<FopxButton> {
  bool _pressed = false;
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null && !widget.busy;
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final primary = scheme.primary;
    final foreground = switch (widget.variant) {
      FopxButtonVariant.primary => scheme.onPrimary,
      FopxButtonVariant.secondary => primary,
      FopxButtonVariant.tertiary => primary,
      FopxButtonVariant.destructive => scheme.onError,
    };
    final background = switch (widget.variant) {
      FopxButtonVariant.primary => primary,
      FopxButtonVariant.secondary => scheme.primaryContainer,
      FopxButtonVariant.tertiary => Colors.transparent,
      FopxButtonVariant.destructive => scheme.error,
    };
    final borderColor = switch (widget.variant) {
      FopxButtonVariant.primary => Colors.transparent,
      FopxButtonVariant.secondary => primary.withValues(alpha: 0.22),
      FopxButtonVariant.tertiary => Colors.transparent,
      FopxButtonVariant.destructive => scheme.error.withValues(alpha: 0.22),
    };
    final disabledBackground = widget.variant == FopxButtonVariant.tertiary ? Colors.transparent : theme.colorScheme.surfaceContainerHighest;
    final disabledForeground = theme.colorScheme.onSurface.withValues(alpha: 0.42);
    final child = AnimatedSwitcher(
      duration: FopxMotion.duration(context, FopxMotion.standard),
      child: widget.busy
          ? SizedBox(key: const ValueKey('progress'), width: 19, height: 19, child: CircularProgressIndicator(strokeWidth: 2, color: foreground))
          : Row(
              key: const ValueKey('content'),
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                if (widget.icon != null) ...<Widget>[Icon(widget.icon, size: 18), const SizedBox(width: 9)],
                Text(widget.label),
              ],
            ),
    );

    final button = Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      child: FocusableActionDetector(
        onShowFocusHighlight: (value) => setState(() => _focused = value),
        onFocusChange: (value) => setState(() => _focused = value),
        shortcuts: <ShortcutActivator, Intent>{
          SingleActivator(LogicalKeyboardKey.enter): const ActivateIntent(),
          SingleActivator(LogicalKeyboardKey.space): const ActivateIntent(),
        },
        actions: <Type, Action<Intent>>{
          ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) {
            if (enabled) widget.onPressed?.call();
            return null;
          }),
        },
        child: GestureDetector(
          onTap: enabled ? widget.onPressed : null,
          onTapDown: enabled ? (_) => setState(() => _pressed = true) : null,
          onTapCancel: enabled ? () => setState(() => _pressed = false) : null,
          onTapUp: enabled ? (_) => setState(() => _pressed = false) : null,
          child: AnimatedScale(
          scale: _pressed ? 0.985 : 1,
          duration: FopxMotion.duration(context, FopxMotion.fast),
          child: AnimatedContainer(
            duration: FopxMotion.duration(context, FopxMotion.standard),
            curve: FopxMotion.standardCurve,
            constraints: const BoxConstraints(minHeight: 48, minWidth: 120),
            width: widget.expanded ? double.infinity : null,
            padding: const EdgeInsets.symmetric(horizontal: FopxSpacing.xl, vertical: FopxSpacing.lg),
            decoration: BoxDecoration(
              color: enabled ? background : disabledBackground,
              borderRadius: BorderRadius.circular(FopxRadii.control),
              border: Border.all(color: _focused ? primary : (enabled ? borderColor : Colors.transparent), width: _focused ? 2 : 1),
              boxShadow: enabled && widget.variant == FopxButtonVariant.primary
                  ? <BoxShadow>[BoxShadow(color: primary.withValues(alpha: 0.22), blurRadius: 20, offset: const Offset(0, 9))]
                  : null,
            ),
            child: Center(child: DefaultTextStyle(style: theme.textTheme.labelLarge!.copyWith(color: enabled ? foreground : disabledForeground), child: child)),
          ),
        ),
          ),
        ),
      );
    return widget.tooltip == null ? button : Tooltip(message: widget.tooltip!, child: button);
  }
}
