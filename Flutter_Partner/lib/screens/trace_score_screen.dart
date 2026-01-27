import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';

class TraceScoreScreen extends StatefulWidget {
  const TraceScoreScreen({Key? key}) : super(key: key);

  @override
  State<TraceScoreScreen> createState() => _TraceScoreScreenState();
}

class _TraceScoreScreenState extends State<TraceScoreScreen> {
  late final List<Map<String, dynamic>> _entries;
  final int _rowsPerPage = 8;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _entries = List.generate(
      50,
      (i) => {
        'date': DateTime.now()
            .subtract(Duration(days: i * 2))
            .toIso8601String()
            .split('T')
            .first,
        'score': (600 + (i % 50) * 3),
        'change': (i % 2 == 0) ? 5 : -3,
        'note': i % 3 == 0 ? 'Periodic update' : 'Activity-based change'
      },
    );
  }

  void _setPage(int page) {
    final pageCount = (_entries.length / _rowsPerPage).ceil();
    if (page < 0 || page >= pageCount) return;
    setState(() {
      _currentPage = page;
    });
  }

  void _showDetails(BuildContext context, Map<String, dynamic> row) {
    final theme = Theme.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        backgroundColor: theme.colorScheme.surface,
        title: Text('Score Details', style: theme.textTheme.titleMedium),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Date: ${row['date']}', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 8),
            Text('Score: ${row['score']}',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('Change: ${row['change'] > 0 ? '+' : ''}${row['change']}',
                style: theme.textTheme.bodyMedium?.copyWith(
                    color: row['change'] > 0
                        ? theme.colorScheme.primary
                        : theme.colorScheme.error)),
            const SizedBox(height: 8),
            Text('Note: ${row['note']}', style: theme.textTheme.bodyMedium),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text('Close',
                  style: theme.textTheme.labelLarge
                      ?.copyWith(color: theme.colorScheme.primary))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final pageCount = (_entries.length / _rowsPerPage).ceil();
    final paged =
        _entries.skip(_currentPage * _rowsPerPage).take(_rowsPerPage).toList();

    final body = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Score History', style: theme.textTheme.titleMedium),
          const SizedBox(height: 12),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.onSurface.withOpacityCompat(0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  Expanded(
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: ConstrainedBox(
                            constraints:
                                BoxConstraints(minWidth: constraints.maxWidth),
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
                                          .withOpacityCompat(0.04)),
                              columns: const [
                                DataColumn(
                                    label: Text('Score',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold)),
                                    numeric: true),
                                DataColumn(
                                    label: Text('Change',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold))),
                                DataColumn(
                                    label: Text('Date',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold))),
                                DataColumn(
                                    label: Text('View',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold))),
                              ],
                              rows: paged
                                  .map((row) => DataRow(cells: [
                                        DataCell(Text(row['score'].toString(),
                                            style: TextStyle(
                                                fontWeight: FontWeight.w700,
                                                color: theme
                                                    .colorScheme.onSurface))),
                                        DataCell(Text(
                                            (row['change'] > 0 ? '+' : '') +
                                                row['change'].toString(),
                                            style: TextStyle(
                                                color: row['change'] > 0
                                                    ? theme.colorScheme.primary
                                                    : theme.colorScheme.error,
                                                fontWeight: FontWeight.w600))),
                                        DataCell(Text(row['date'],
                                            style: TextStyle(
                                                color:
                                                    theme.colorScheme.onSurface,
                                                fontWeight: FontWeight.w500))),
                                        DataCell(IconButton(
                                            icon: Icon(Icons.visibility_rounded,
                                                color: theme
                                                    .colorScheme.secondary),
                                            onPressed: () =>
                                                _showDetails(context, row))),
                                      ]))
                                  .toList(),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                          icon: const Icon(Icons.chevron_left),
                          onPressed: _currentPage > 0
                              ? () => _setPage(_currentPage - 1)
                              : null),
                      Text('Page ${_currentPage + 1} of $pageCount',
                          style: theme.textTheme.bodyMedium),
                      IconButton(
                          icon: const Icon(Icons.chevron_right),
                          onPressed: _currentPage < pageCount - 1
                              ? () => _setPage(_currentPage + 1)
                              : null),
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
        title: const Text('Trace Score'),
      ),
      backgroundColor:
          isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
      body: isDarkMode ? AppBackground(child: body) : body,
    );
  }
}
