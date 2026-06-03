import 'package:flutter/material.dart';
import 'package:flutter_partner/models/trust_profile.dart';

/// Wraps a child widget and conditionally shows it or an upgrade prompt
/// based on the user's current trust level.
///
/// Usage:
/// ```dart
/// TrustGateWidget(
///   profile: myProfile,
///   requiredLevel: TrustLevel.interactive,
///   child: MyFeatureWidget(),
/// )
/// ```
class TrustGateWidget extends StatelessWidget {
  final TrustProfile? profile;
  final TrustLevel requiredLevel;
  final Widget child;
  final Widget? fallback;

  const TrustGateWidget({
    super.key,
    required this.profile,
    required this.requiredLevel,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    if (profile != null && profile!.meetsLevel(requiredLevel)) {
      return child;
    }
    return fallback ?? _UpgradePrompt(requiredLevel: requiredLevel, profile: profile);
  }
}

class _UpgradePrompt extends StatelessWidget {
  final TrustLevel requiredLevel;
  final TrustProfile? profile;

  const _UpgradePrompt({required this.requiredLevel, this.profile});

  @override
  Widget build(BuildContext context) {
    final color = requiredLevel == TrustLevel.trustedActive ? Colors.green : Colors.blue;

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        border: Border.all(color: color.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.lock_outline, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            'This feature requires ${requiredLevel.labelEn} status',
            style: const TextStyle(fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          if (profile != null && profile!.nextLevelRequirements.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...profile!.nextLevelRequirements.where((r) => !r.isMet).take(3).map(
              (r) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.circle, size: 6, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(r.labelEn, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: color),
            onPressed: () => Navigator.of(context).pushNamed('/verification'),
            child: const Text('Upgrade Now', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

