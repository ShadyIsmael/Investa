import 'package:flutter/material.dart';
import 'package:flutter_partner/services/app_state.dart';
import 'package:flutter_partner/services/config.dart';

/// Engagement confirmation dialog that mirrors the Angular client portal's
/// two-step engagement flow.
///
/// This dialog shows:
/// - Investment details
/// - Engagement cost (credits)
/// - Current wallet balance
/// - Remaining balance after engagement
/// - Warning message about the irreversible action
///
/// **Usage:**
/// ```dart
/// showEngagementConfirmationDialog(
///   context: context,
///   investment: investmentData,
///   onConfirm: () async {
///     // Handle engagement confirmation
///   },
/// );
/// ```
Future<bool?> showEngagementConfirmationDialog({
  required BuildContext context,
  required Map<String, dynamic> investment,
  required Future<void> Function() onConfirm,
  double? initialCredits,
}) {
  return showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext context) {
      return _EngagementConfirmationDialog(
        investment: investment,
        onConfirm: onConfirm,
        initialCredits: initialCredits,
      );
    },
  );
}

class _EngagementConfirmationDialog extends StatefulWidget {
  final Map<String, dynamic> investment;
  final Future<void> Function() onConfirm;
  final double? initialCredits;

  const _EngagementConfirmationDialog({
    required this.investment,
    required this.onConfirm,
    this.initialCredits,
  });

  @override
  State<_EngagementConfirmationDialog> createState() =>
      _EngagementConfirmationDialogState();
}

class _EngagementConfirmationDialogState
    extends State<_EngagementConfirmationDialog> {
  bool _isProcessing = false;

  Future<void> _handleConfirm() async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      await widget.onConfirm();
      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
      // Error is handled by the caller
      rethrow;
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = AppState.instance.profile;
    final currentCredits = widget.initialCredits ??
        (profile?.credit?.toDouble()) ??
        profile?.coreMetrics?.walletBalance ??
        0.0;
    final engagementCost = Env.engageCreditCost.toDouble();
    final remainingCredits = currentCredits - engagementCost;
    final hasInsufficientCredits = remainingCredits < 0;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0F172A), // slate-900
              Color(0xFF1E293B), // slate-800
            ],
          ),
          border: Border.all(
            color: const Color(0xFF334155), // slate-700
            width: 1,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    const Color(0xFF3B82F6).withOpacity(0.1), // blue-500/10
                    const Color(0xFFA855F7).withOpacity(0.1), // purple-500/10
                  ],
                ),
                border: const Border(
                  bottom: BorderSide(
                    color: Color(0xFF334155), // slate-700
                    width: 1,
                  ),
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(
                      Icons.warning_outlined,
                      color: Color(0xFF60A5FA), // blue-400
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Confirm Engagement',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Please review and confirm your engagement request',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF9CA3AF), // gray-400
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Body
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Investment Details Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B).withOpacity(0.5),
                      border: Border.all(
                        color: const Color(0xFF334155),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _buildDetailRow(
                          'Investment:',
                          _investmentDisplayName(widget.investment),
                          valueColor: Colors.white,
                          valueWeight: FontWeight.w600,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailRow(
                          'Engagement Cost:',
                          '${engagementCost.toStringAsFixed(0)} Credits',
                          valueColor: Colors.white,
                          valueWeight: FontWeight.bold,
                          valueFontSize: 18,
                        ),
                        const SizedBox(height: 12),
                        const Divider(
                          color: Color(0xFF334155),
                          height: 1,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailRow(
                          'Current Credits:',
                          currentCredits.toStringAsFixed(2),
                          valueColor: const Color(0xFF93C5FD), // blue-300
                          valueWeight: FontWeight.w600,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailRow(
                          'Remaining After:',
                          remainingCredits.toStringAsFixed(2),
                          valueColor: hasInsufficientCredits
                              ? const Color(0xFFFCA5A5) // red-300
                              : const Color(0xFF86EFAC), // green-300
                          valueWeight: FontWeight.w600,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Warning Message
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF97316).withOpacity(0.1),
                      border: Border.all(
                        color: const Color(0xFFF97316).withOpacity(0.3),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.info,
                          color: Color(0xFFFB923C), // orange-400
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Important Notice',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFFDBA74), // orange-300
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'This action will deduct credits from your account and submit a request to the founder. This action cannot be undone.',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: const Color(0xFFFED7AA)
                                      .withOpacity(0.8), // orange-200/80
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Footer
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withOpacity(0.5),
                border: const Border(
                  top: BorderSide(
                    color: Color(0xFF334155),
                    width: 1,
                  ),
                ),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isProcessing
                          ? null
                          : () => Navigator.of(context).pop(false),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: const Color(0xFF334155), // slate-700
                        foregroundColor: Colors.white,
                        disabledForegroundColor: Colors.white.withOpacity(0.5),
                        disabledBackgroundColor:
                            const Color(0xFF334155).withOpacity(0.5),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        side: BorderSide.none,
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isProcessing || hasInsufficientCredits
                          ? null
                          : _handleConfirm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        disabledBackgroundColor: Colors.transparent,
                        foregroundColor: Colors.white,
                        disabledForegroundColor: Colors.white.withOpacity(0.5),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ).copyWith(
                        backgroundColor: WidgetStateProperty.resolveWith(
                          (states) {
                            if (states.contains(WidgetState.disabled)) {
                              return Colors.grey.withOpacity(0.3);
                            }
                            return null;
                          },
                        ),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: (_isProcessing || hasInsufficientCredits)
                              ? null
                              : const LinearGradient(
                                  begin: Alignment.centerLeft,
                                  end: Alignment.centerRight,
                                  colors: [
                                    Color(0xFF3B82F6), // blue-500
                                    Color(0xFFA855F7), // purple-600
                                  ],
                                ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        alignment: Alignment.center,
                        child: _isProcessing
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : Text(
                                hasInsufficientCredits
                                    ? 'Insufficient Credits'
                                    : 'Confirm and Proceed',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _investmentDisplayName(Map<String, dynamic> inv) {
    return inv['name'] as String? ??
        inv['businessName'] as String? ??
        inv['title'] as String? ??
        inv['projectName'] as String? ??
        'Investment';
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    Color? valueColor,
    FontWeight? valueWeight,
    double? valueFontSize,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF9CA3AF), // gray-400
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: valueFontSize ?? 14,
            color: valueColor ?? Colors.white,
            fontWeight: valueWeight ?? FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
