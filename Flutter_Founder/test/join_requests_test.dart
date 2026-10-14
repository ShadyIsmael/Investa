import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_founder/features/projects/data/join_requests_controller.dart';

void main() {
  test('parses the founder join-request API DTO and review capabilities', () {
    final request = FounderJoinRequest.fromJson(<String, dynamic>{
      'id': 108,
      'opportunityId': 23,
      'investorName': 'Investor One',
      'requestType': 'InvestmentParticipation',
      'fundingAmount': 25000,
      'fundingCurrency': 'USD',
      'message': 'Interested in the current round.',
      'status': 'Pending',
      'createdAt': '2026-09-23T09:15:00Z',
    });

    expect(request.id, 108);
    expect(request.opportunityId, 23);
    expect(request.investorName, 'Investor One');
    expect(request.amount, 25000);
    expect(request.currency, 'USD');
    expect(request.message, 'Interested in the current round.');
    expect(request.canApprove, isTrue);
    expect(request.canReject, isTrue);
  });

  test('does not expose review actions for an already reviewed request', () {
    final request = FounderJoinRequest.fromJson(<String, dynamic>{
      'requestId': 109,
      'investorDisplayName': 'Investor Two',
      'status': 'Approved',
      'canApprove': false,
      'canReject': false,
    });

    expect(request.id, 109);
    expect(request.canApprove, isFalse);
    expect(request.canReject, isFalse);
  });
}
