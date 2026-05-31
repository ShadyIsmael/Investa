import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_founder/services/credits_service.dart';

void main() {
  test('CreditTransaction parsing from example JSON', () {
    final jsonList = [
      {
        "id": 6,
        "userId": "168b6970-299d-47d9-9128-d6b61b508eea",
        "amount": 10.00,
        "type": "Adjustment",
        "referenceId": null,
        "description": "Test adj +10",
        "createdAt": "2025-12-28T13:58:01Z"
      },
      {
        "id": 5,
        "userId": "168b6970-299d-47d9-9128-d6b61b508eea",
        "amount": -20.00,
        "type": "Spend",
        "referenceId": null,
        "description": "Test spend -20",
        "createdAt": "2025-12-28T13:58:01Z"
      },
    ];

    final list = jsonList.map((e) => CreditTransaction.fromJson(e)).toList();
    expect(list.length, 2);
    expect(list[0].id, 6);
    expect(list[0].userId, '168b6970-299d-47d9-9128-d6b61b508eea');
    expect(list[0].amount, 10.0);
    expect(list[0].type, 'Adjustment');
    expect(list[1].amount, -20.0);
    expect(list[1].type, 'Spend');
    expect(list[0].createdAt.year, 2025);
  });
}
