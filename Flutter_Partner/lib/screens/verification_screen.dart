import 'package:flutter/material.dart';
import 'package:flutter_partner/models/trust_profile.dart';
import 'package:flutter_partner/services/trust_service.dart';
import 'package:flutter_partner/widgets/trust_badge_widget.dart';

/// Guides the user through the trust verification steps to upgrade their level.
class VerificationScreen extends StatefulWidget {
  final TrustProfile? currentProfile;

  const VerificationScreen({super.key, this.currentProfile});

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  final TrustService _trustService = TrustService();
  TrustProfile? _profile;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _profile = widget.currentProfile;
    if (_profile == null) _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _loading = true);
    final p = await _trustService.fetchMyTrustProfile();
    setState(() {
      _profile = p;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trust & Verification'),
        actions: [
          if (_profile != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: TrustBadgeWidget(trustLevel: _profile!.trustLevel),
              ),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _profile == null
              ? _buildError()
              : _buildContent(),
    );
  }

  Widget _buildError() => Center(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.error_outline, color: Colors.red, size: 48),
        const SizedBox(height: 8),
        const Text('Could not load trust profile'),
        TextButton(onPressed: _loadProfile, child: const Text('Retry'))
      ],
    ),
  );

  Widget _buildContent() {
    final p = _profile!;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Progress card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Profile Completion', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('${p.profileCompletionPercentage}%'),
                  ],
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: p.profileCompletionPercentage / 100,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    p.profileCompletionPercentage >= 60 ? Colors.green : Colors.blue,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Reputation: ${p.reputationScore}/10000', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    TrustBadgeWidget(trustLevel: p.trustLevel),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Verification status
        const Text('Verifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 8),
        _VerificationItem(
          label: 'Email Verified',
          icon: Icons.email_outlined,
          isDone: p.isEmailVerified,
          onTap: p.isEmailVerified ? null : () => _submitVerification(VerificationType.email),
        ),
        _VerificationItem(
          label: 'Phone Verified',
          icon: Icons.phone_outlined,
          isDone: p.isPhoneVerified,
          onTap: p.isPhoneVerified ? null : () => _submitVerification(VerificationType.phone),
        ),
        _VerificationItem(
          label: 'Identity Document',
          icon: Icons.badge_outlined,
          isDone: p.isIdentityVerified,
          onTap: p.isIdentityVerified
              ? null
              : () => _submitVerification(VerificationType.legalAgreement),
        ),

        // Next level requirements
        if (p.nextLevelRequirements.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text('What\'s needed to level up:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          ...p.nextLevelRequirements.map((req) => ListTile(
            leading: Icon(
              req.isMet ? Icons.check_circle : Icons.radio_button_unchecked,
              color: req.isMet ? Colors.green : Colors.grey,
            ),
            title: Text(req.labelEn),
            dense: true,
          )),
        ],
      ],
    );
  }

  Future<void> _submitVerification(VerificationType type) async {
    final ok = await _trustService.submitVerification(verificationType: type.value);
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification submitted! Awaiting review.'))
      );
      _loadProfile();
    }
  }
}

class _VerificationItem extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isDone;
  final VoidCallback? onTap;

  const _VerificationItem({
    required this.label,
    required this.icon,
    required this.isDone,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      leading: Icon(icon, color: isDone ? Colors.green : Colors.grey),
      title: Text(label),
      trailing: isDone
          ? const Icon(Icons.check_circle, color: Colors.green)
          : TextButton(onPressed: onTap, child: const Text('Submit')),
    ),
  );
}

