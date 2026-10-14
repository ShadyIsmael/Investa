import 'package:flutter_test/flutter_test.dart';

import 'package:fopx_founder/features/deals/data/founder_deals.dart';

void main() {
  test('joins approved participations to their server contract', () {
    final deals = assembleFounderDeals(
      opportunities: const <FounderOwnedOpportunity>[
        FounderOwnedOpportunity(id: 3, title: 'Expansion round'),
      ],
      joinRequests: <int, List<Map<String, dynamic>>>{
        3: <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 18,
            'opportunityTitle': 'Expansion round',
            'investorName': 'Investor One',
            'requestType': 'InvestmentParticipation',
            'status': 'Approved',
            'fundingAmount': 12500,
            'fundingCurrency': 'USD',
            'reviewedAt': '2026-09-22T10:00:00Z',
          },
          <String, dynamic>{
            'id': 19,
            'requestType': 'InvestmentParticipation',
            'status': 'Pending',
          },
        ],
      },
      contracts: <int, List<Map<String, dynamic>>>{
        3: <Map<String, dynamic>>[
          <String, dynamic>{
            'contractId': 77,
            'contractNumber': 'FOPX-77',
            'participationRequestId': 18,
            'status': 'Active',
            'acceptedAmount': 12500,
            'acceptedCurrency': 'USD',
            'acceptanceTimestamp': '2026-09-22T10:30:00Z',
          },
        ],
      },
    );

    expect(deals, hasLength(1));
    expect(deals.single.opportunityTitle, 'Expansion round');
    expect(deals.single.investorName, 'Investor One');
    expect(deals.single.participationRequestId, 18);
    expect(deals.single.contractId, 77);
    expect(deals.single.contractNumber, 'FOPX-77');
    expect(deals.single.contractStatus, 'Active');
    expect(deals.single.amount, 12500);
    expect(deals.single.currency, 'USD');
    expect(deals.single.acceptedAt, isNotNull);
  });
}
