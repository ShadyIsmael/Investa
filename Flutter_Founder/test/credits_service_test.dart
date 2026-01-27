import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_founder/services/credits_service.dart';

void main() {
  test('TimeseriesPoint parsing from example JSON', () {
    final jsonList = [
      {"date": "2024-01-01T00:00:00Z", "value": 100.00},
      {"date": "2024-02-01T00:00:00Z", "value": 150.00},
    ];

    final points = jsonList.map((e) => TimeseriesPoint.fromJson(e)).toList();
    expect(points.length, 2);
    expect(points[0].date.year, 2024);
    expect(points[0].date.month, 1);
    expect(points[0].value, 100.0);
    expect(points[1].date.month, 2);
    expect(points[1].value, 150.0);
  });
}
