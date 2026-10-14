import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

class FopxLoadingState extends StatefulWidget {
  const FopxLoadingState({super.key, this.height = 150});

  final double height;

  @override
  State<FopxLoadingState> createState() => _FopxLoadingStateState();
}

class _FopxLoadingStateState extends State<FopxLoadingState> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.of(context).disableAnimations) {
      _controller.stop();
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.surfaceContainerHighest;
    if (MediaQuery.of(context).disableAnimations) {
      return Container(
        height: widget.height,
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(FopxRadii.surface)),
      );
    }
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) => Container(
        height: widget.height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(FopxRadii.surface),
          gradient: LinearGradient(
            begin: Alignment(-1 + (_controller.value * 2), 0),
            end: Alignment(1 + (_controller.value * 2), 0),
            colors: <Color>[color, color.withValues(alpha: 0.42), color],
          ),
        ),
      ),
    );
  }
}
