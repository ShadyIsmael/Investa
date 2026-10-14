import 'package:flutter/material.dart';

import '../theme/fopx_tokens.dart';

class FopxAvatar extends StatelessWidget {
  const FopxAvatar({super.key, this.label = 'F', this.imageUrl, this.size = 42});

  final String label;
  final String? imageUrl;
  final double size;

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Semantics(
      image: true,
      label: label,
      child: CircleAvatar(
        radius: size / 2,
        backgroundColor: primary.withValues(alpha: 0.12),
        backgroundImage: imageUrl == null ? null : NetworkImage(imageUrl!),
        child: imageUrl == null ? Text(label.characters.take(1).toString().toUpperCase(), style: Theme.of(context).textTheme.titleMedium?.copyWith(color: primary, fontWeight: FontWeight.w800)) : null,
      ),
    );
  }
}
