import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_founder/widgets/request_summary_row.dart';

void main() {
  testWidgets('RequestSummaryRow builds and shows counts',
      (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: Padding(
          padding: EdgeInsets.all(16.0),
          child: RequestSummaryRow(total: 5, income: 3, outcome: 2),
        ),
      ),
    ));

    expect(find.text('Total'), findsOneWidget);
    expect(find.text('Income'), findsOneWidget);
    expect(find.text('Outcome'), findsOneWidget);
    expect(find.text('5'), findsOneWidget);
    expect(find.text('3'), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
  });
}
