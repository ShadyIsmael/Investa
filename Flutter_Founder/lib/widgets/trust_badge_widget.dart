import 'package:flutter/material.dart';
import 'package:flutter_founder/models/trust_profile.dart';

/// A badge widget displaying the user's current trust level.
class TrustBadgeWidget extends StatelessWidget {
  final TrustLevel trustLevel;
  final bool compact;

  const TrustBadgeWidget({
    super.key,
    required this.trustLevel,
    this.compact = false,
  });

  Color get _color {
    switch (trustLevel) {
      case TrustLevel.visitor:
        return Colors.grey;
      case TrustLevel.registered:
        return Colors.blue;
      case TrustLevel.interactive:
        return Colors.amber;
      case TrustLevel.trustedActive:
      case TrustLevel.verified:
        return Colors.green;
    }
  }

  String get _icon {
    switch (trustLevel) {
      case TrustLevel.visitor:
        return '👤';
      case TrustLevel.registered:
        return '✅';
      case TrustLevel.interactive:
        return '⭐';
      case TrustLevel.trustedActive:
      case TrustLevel.verified:
        return '🛡️';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.12),
        border: Border.all(color: _color.withOpacity(0.5)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(_icon, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 4),
          Text(
            trustLevel.labelEn,
            style: TextStyle(
              color: _color,
              fontSize: compact ? 11 : 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
