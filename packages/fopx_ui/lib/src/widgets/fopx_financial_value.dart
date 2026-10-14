import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

class FopxFinancialValue extends StatelessWidget {
  const FopxFinancialValue({super.key, required this.value, required this.currencyCode, this.label, this.approximate = false, this.unavailable = false, this.unavailableLabel = 'Unavailable'});

  final String value;
  final String currencyCode;
  final String? label;
  final bool approximate;
  final bool unavailable;
  final String unavailableLabel;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<FopxFinancialTextStyles>();
    final displayValue = unavailable ? unavailableLabel : value;
    final semantics = '${label == null ? '' : '$label, '}${approximate ? 'approximately ' : ''}$displayValue $currencyCode';
    return Semantics(
      label: semantics,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (label != null) Text(label!, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.58))),
          Text('${approximate ? '~' : ''}$displayValue', style: unavailable ? Theme.of(context).textTheme.headlineMedium?.copyWith(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)) : tokens?.value ?? Theme.of(context).textTheme.headlineMedium),
          Text(currencyCode, style: tokens?.supporting ?? Theme.of(context).textTheme.labelMedium?.copyWith(color: Theme.of(context).colorScheme.primary)),
        ],
      ),
    );
  }
}
