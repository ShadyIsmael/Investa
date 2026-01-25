import 'package:flutter/material.dart';
import '../models/credit_transaction.dart';
import '../l10n/app_localizations.dart';

/// Widget to display credit transaction history
class CreditHistoryWidget extends StatelessWidget {
  final List<CreditTransaction> transactions;
  final bool isLoading;
  final VoidCallback? onRefresh;

  const CreditHistoryWidget({
    Key? key,
    required this.transactions,
    this.isLoading = false,
    this.onRefresh,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final locale = Localizations.localeOf(context).languageCode;

    if (isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (transactions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.history, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                l10n.t('No credit history yet'),
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        onRefresh?.call();
      },
      child: ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: transactions.length,
        itemBuilder: (context, index) {
          final transaction = transactions[index];
          final isPositive = transaction.amount >= 0;

          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              leading: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isPositive
                      ? Colors.green.withAlpha((0.1 * 255).round())
                      : Colors.red.withAlpha((0.1 * 255).round()),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(
                  isPositive ? Icons.add_circle : Icons.remove_circle,
                  color: isPositive ? Colors.green : Colors.red,
                  size: 28,
                ),
              ),
              title: Text(
                transaction.getJustification(locale),
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  _formatDate(transaction.createdAt),
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                  ),
                ),
              ),
              trailing: Text(
                '${isPositive ? '+' : ''}${transaction.amount.toStringAsFixed(1)}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isPositive ? Colors.green : Colors.red,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      return 'Today at ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
