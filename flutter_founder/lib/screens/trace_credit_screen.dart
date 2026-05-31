import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';

class TraceCreditScreen extends StatelessWidget {
  const TraceCreditScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final transactions = List.generate(
        25,
        (i) => {
              'date': '2026-01-${(i % 30 + 1).toString().padLeft(2, '0')}',
              'credit': (i + 1) * 10,
              'pay': (i % 2 == 0) ? 50 : 0,
              'type':
                  i % 3 == 0 ? 'Charge' : (i % 3 == 1 ? 'Refund' : 'Payment'),
            });

    int rowsPerPage = 5;
    int pageCount = (transactions.length / rowsPerPage).ceil();
    int currentPage = 0;

    void setPage(int page) {
      if (page < 0 || page >= pageCount) return;
      currentPage = page;
      (context as Element).markNeedsBuild();
    }

    final pagedTransactions =
        transactions.skip(currentPage * rowsPerPage).take(rowsPerPage).toList();

    void showTransactionDetails(BuildContext context, Map<String, dynamic> tx) {
      final theme = Theme.of(context);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          backgroundColor: theme.colorScheme.surface,
          title:
              Text('Transaction Details', style: theme.textTheme.titleMedium),
          content: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Date: ${tx['date']}',
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w500)),
                const SizedBox(height: 8),
                Text('Credit Amount: ${tx['credit']}',
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(color: theme.colorScheme.primary)),
                const SizedBox(height: 8),
                Text('Pay Amount: ${tx['pay']}',
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(color: theme.colorScheme.error)),
                const SizedBox(height: 8),
                Text('Type: ${tx['type']}', style: theme.textTheme.bodyMedium),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text('Close',
                  style: theme.textTheme.labelLarge
                      ?.copyWith(color: theme.colorScheme.primary)),
            ),
          ],
        ),
      );
    }

    final body = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            elevation: 2,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text('Credit tracing and details will appear here.',
                      style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.add_card_rounded),
                    onPressed: () {
                      // TODO: Implement charge action
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Charge Now pressed!')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    label: const Text('Charge Now'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text('Previous Transactions',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          // Transactions table: fills available space and keeps pagination row at the bottom
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.onSurface.withOpacityCompat(0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  // Table area
                  Expanded(
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: ConstrainedBox(
                            constraints:
                                BoxConstraints(minWidth: constraints.maxWidth),
                            child: SingleChildScrollView(
                              child: DataTable(
                                columnSpacing: constraints.maxWidth / 12,
                                headingRowColor:
                                    WidgetStateProperty.resolveWith<Color?>(
                                        (states) => theme.colorScheme.primary
                                            .withOpacityCompat(0.08)),
                                dataRowColor:
                                    WidgetStateProperty.resolveWith<Color?>(
                                        (states) => theme
                                            .colorScheme.surfaceContainerHighest
                                            .withOpacityCompat(0.08)),
                                columns: const [
                                  DataColumn(
                                      label: Text('Credit',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold)),
                                      numeric: true),
                                  DataColumn(
                                      label: Text('Date',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold))),
                                  DataColumn(
                                      label: Text('View',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold))),
                                ],
                                rows: pagedTransactions
                                    .map((tx) => DataRow(cells: [
                                          DataCell(Text(tx['credit'].toString(),
                                              style: TextStyle(
                                                  color:
                                                      theme.colorScheme.primary,
                                                  fontWeight:
                                                      FontWeight.w600))),
                                          DataCell(Text(tx['date'].toString(),
                                              style: TextStyle(
                                                  fontWeight: FontWeight.w500,
                                                  color: theme
                                                      .colorScheme.onSurface))),
                                          DataCell(IconButton(
                                              icon: Icon(
                                                  Icons.visibility_rounded,
                                                  color: theme
                                                      .colorScheme.secondary),
                                              tooltip: 'View Details',
                                              onPressed: () =>
                                                  showTransactionDetails(
                                                      context, tx))),
                                        ]))
                                    .toList(),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Pagination controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.chevron_left),
                        onPressed: currentPage > 0
                            ? () => setPage(currentPage - 1)
                            : null,
                      ),
                      Text('Page ${currentPage + 1} of $pageCount',
                          style: theme.textTheme.bodyMedium),
                      IconButton(
                        icon: const Icon(Icons.chevron_right),
                        onPressed: currentPage < pageCount - 1
                            ? () => setPage(currentPage + 1)
                            : null,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Trace Credit'),
      ),
      backgroundColor:
          isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
      body: isDarkMode ? AppBackground(child: body) : body,
    );
  }
}
