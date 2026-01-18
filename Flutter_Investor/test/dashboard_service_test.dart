import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_investor/services/dashboard_service.dart';

void main() {
  test('DashboardSummary parsing example response', () {
    final json = {
      "credibilityScore": 3500,
      "walletBalance": 123.45,
      "clientScore": 12.34,
      "credit": 123.45,
      "creditTransactions": [
        { "id": 1, "userId": "GUID", "amount": 50.00, "type": "Earn", "referenceId": null, "description": null, "createdAt": "2025-12-28T12:34:56Z" }
      ],
      "scoreTransactions": [
        { "id": 1, "userId": "GUID", "score": 2.5, "transactionTypeId": 200, "transactionTypeKey": "Review", "reviewerId": "GUID?", "createdAt": "2025-12-28T12:00:00Z" }
      ],
      "topInvestmentCategories": []
    };

    final s = DashboardSummary.fromJson(json);
    expect(s.credibilityScore, 3500);
    expect(s.creditTransactions.length, 1);
    expect(s.scoreTransactions.length, 1);
    expect(s.scoreTransactions[0].score, 2.5);
  });
}
