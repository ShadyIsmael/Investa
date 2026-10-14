import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

class FopxLifecycleStep {
  const FopxLifecycleStep({required this.label, required this.state});

  final String label;
  final FopxLifecycleState state;
}

enum FopxLifecycleState { complete, current, upcoming, disabled }

class FopxLifecycleTimeline extends StatelessWidget {
  const FopxLifecycleTimeline({super.key, required this.steps});

  final List<FopxLifecycleStep> steps;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: steps.asMap().entries.map((entry) {
        final isLast = entry.key == steps.length - 1;
        final step = entry.value;
        final color = switch (step.state) {
          FopxLifecycleState.complete => scheme.primary,
          FopxLifecycleState.current => scheme.primary,
          FopxLifecycleState.upcoming => scheme.outline,
          FopxLifecycleState.disabled => scheme.onSurface.withValues(alpha: 0.35),
        };
        return Expanded(
          child: Semantics(
            label: '${step.label}, ${step.state.name}',
            child: Column(
            children: <Widget>[
              Row(children: <Widget>[
                Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                if (!isLast) Expanded(child: Container(height: 2, color: color.withValues(alpha: 0.3))),
              ]),
              const SizedBox(height: FopxSpacing.sm),
              Align(alignment: AlignmentDirectional.centerStart, child: Text(step.label, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: color))),
            ],
            ),
          ),
        );
      }).toList(growable: false),
    );
  }
}
