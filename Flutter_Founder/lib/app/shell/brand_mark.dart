import 'package:flutter/material.dart';
import 'package:fopx_ui/fopx_ui.dart';

class FopxBrandMark extends StatelessWidget {
  const FopxBrandMark({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: <Color>[primary, Theme.of(context).colorScheme.secondary]),
            borderRadius: BorderRadius.circular(compact ? FopxRadii.control - 6 : FopxRadii.control - 3),
          ),
          child: const Icon(Icons.all_inclusive_rounded, color: Colors.white, size: 23),
        ),
        if (!compact) ...<Widget>[
          const SizedBox(width: FopxSpacing.md),
          Text('FOPX', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800, letterSpacing: 1.3)),
        ],
      ],
    );
  }
}
