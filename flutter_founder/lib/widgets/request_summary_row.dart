import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';

class RequestSummaryRow extends StatelessWidget {
  final int total;
  final int income;
  final int outcome;

  const RequestSummaryRow({
    Key? key,
    required this.total,
    required this.income,
    required this.outcome,
  }) : super(key: key);

  Widget _buildTile(BuildContext context, IconData icon, String label,
      int count, Color color) {
    final theme = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: theme.shadowColor.withOpacityCompat(0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            )
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: color.withOpacity(0.14),
              child: Icon(icon, size: 16, color: color),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7))),
                const SizedBox(height: 4),
                Text(count.toString(),
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold)),
              ],
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _buildTile(context, Icons.list_alt, 'Total', total, Colors.blueAccent),
        const SizedBox(width: 8),
        _buildTile(
            context, Icons.arrow_downward, 'Income', income, Colors.green),
        const SizedBox(width: 8),
        _buildTile(context, Icons.arrow_upward, 'Outcome', outcome, Colors.red),
      ],
    );
  }
}
