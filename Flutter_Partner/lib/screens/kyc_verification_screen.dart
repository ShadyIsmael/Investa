import 'package:flutter/material.dart';
import '../widgets/app_background.dart';
import '../services/profile_service.dart';
import '../models/credit_transaction.dart';
import '../widgets/credit_history_widget.dart';
import '../widgets/credibility_score_badge.dart';
import '../l10n/app_localizations.dart';

/// Screen for KYC verification and credit history
class KycVerificationScreen extends StatefulWidget {
  final Profile? profile;

  const KycVerificationScreen({Key? key, this.profile}) : super(key: key);

  @override
  State<KycVerificationScreen> createState() => _KycVerificationScreenState();
}

class _KycVerificationScreenState extends State<KycVerificationScreen> {
  bool _isStartingKyc = false;
  bool _isLoadingHistory = false;
  List<CreditTransaction> _creditHistory = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadCreditHistory();
  }

  Future<void> _loadCreditHistory() async {
    setState(() {
      _isLoadingHistory = true;
      _errorMessage = null;
    });

    try {
      final historyData = await ProfileService().getCreditHistory();
      if (historyData != null) {
        setState(() {
          _creditHistory = historyData
              .map((json) => CreditTransaction.fromJson(json))
              .toList();
          _isLoadingHistory = false;
        });
      } else {
        setState(() {
          _isLoadingHistory = false;
          _errorMessage = 'Failed to load credit history';
        });
      }
    } catch (e) {
      setState(() {
        _isLoadingHistory = false;
        _errorMessage = 'Error: $e';
      });
    }
  }

  Future<void> _startKyc() async {
    final l10n = AppLocalizations.of(context);

    setState(() {
      _isStartingKyc = true;
      _errorMessage = null;
    });

    try {
      final result = await ProfileService().startKyc();

      if (result != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              l10n.t('KYC verification started! You earned +10 points'),
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 3),
          ),
        );

        // Reload credit history to show the new transaction
        await _loadCreditHistory();

        // Navigate back to profile screen
        if (mounted) {
          Navigator.pop(context, true); // true indicates profile should refresh
        }
      } else {
        if (mounted) {
          setState(() {
            _errorMessage = l10n.t('Failed to start KYC verification');
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error: $e';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isStartingKyc = false;
        });
      }
    }
  }

  String _getVerificationStatusText(String? status) {
    switch (status?.toLowerCase()) {
      case 'none':
        return 'Not Started';
      case 'pending':
        return 'Pending Review';
      case 'verified':
        return 'Verified ✓';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  Color _getVerificationStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'verified':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final verificationStatus =
        widget.profile?.identityCompliance?.verificationStatus;
    final isVerified = verificationStatus?.toLowerCase() == 'verified';
    final isPending = verificationStatus?.toLowerCase() == 'pending';
    final canStartKyc = verificationStatus == null ||
        verificationStatus.isEmpty ||
        verificationStatus.toLowerCase() == 'none';
    final credibilityScore = widget.profile?.currentCredibilityScore ?? 0.0;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.t('KYC Verification')),
        elevation: 0,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        foregroundColor: Theme.of(context).textTheme.bodyLarge?.color,
      ),
      body: AppBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Credibility Score Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text(
                        l10n.t('Credibility Score'),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      CredibilityScoreBadge(
                        score: credibilityScore,
                        size: 120,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        l10n.t(
                            'Build your credibility by completing verifications'),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Verification Status Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            isVerified ? Icons.verified_user : Icons.shield,
                            color:
                                _getVerificationStatusColor(verificationStatus),
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l10n.t('Verification Status'),
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _getVerificationStatusText(
                                      verificationStatus),
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: _getVerificationStatusColor(
                                        verificationStatus),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      if (_errorMessage != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.withAlpha((0.1 * 255).round()),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error, color: Colors.red),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _errorMessage!,
                                    style: const TextStyle(color: Colors.red),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      if (canStartKyc)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _isStartingKyc ? null : _startKyc,
                            icon: _isStartingKyc
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.white),
                                    ),
                                  )
                                : const Icon(Icons.verified_user),
                            label: Text(
                              _isStartingKyc
                                  ? l10n.t('Starting...')
                                  : l10n.t('Start KYC Verification'),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).primaryColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      if (isPending)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.orange.withAlpha((0.1 * 255).round()),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.hourglass_empty,
                                  color: Colors.orange),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  l10n.t('Your verification is under review'),
                                  style: const TextStyle(
                                    color: Colors.orange,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      if (isVerified)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green.withAlpha((0.1 * 255).round()),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle,
                                  color: Colors.green),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  l10n.t('Your identity has been verified!'),
                                  style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Credit History Section
              Text(
                l10n.t('Credit History'),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              CreditHistoryWidget(
                transactions: _creditHistory,
                isLoading: _isLoadingHistory,
                onRefresh: _loadCreditHistory,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
