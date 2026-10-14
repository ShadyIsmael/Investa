import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_founder/features/deals/data/equity.dart';
import 'package:fopx_founder/features/deals/data/equity_controller.dart';

void main() {
  test(
    'parses authoritative equity position, ledger and capitalization state',
    () {
      final position = FounderEquityPosition.fromJson(<String, dynamic>{
        'id': 18,
        'participationId': 81,
        'offerId': 21,
        'offerVersion': 2,
        'offerLegId': 44,
        'opportunityId': 7,
        'investmentAmount': 25000,
        'currency': 'EGP',
        'ownershipModel': 'ShareBased',
        'status': 'Active',
        'contractualOwnershipPercentage': 12.5,
        'currentOwnershipPercentage': 11.25,
        'currentInvestorShares': 900,
        'currentTotalIssuedShares': 8000,
        'dilutionPercentagePoints': 1.25,
        'shareClass': 'A',
        'pricePerShare': 27.78,
        'effectiveOwnershipDate': '2026-01-01T00:00:00Z',
        'ledger': <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 3,
            'eventType': 'ShareIssuance',
            'effectiveDate': '2026-02-01T00:00:00Z',
            'shareDelta': 100,
            'resultingInvestorShares': 900,
            'resultingTotalIssuedShares': 8000,
            'resultingOwnershipPercentage': 11.25,
            'previousOwnershipPercentage': 12.5,
            'corporateEventId': 12,
          },
        ],
      });

      expect(position.currentOwnership, 11.25);
      expect(position.investorShares, 900);
      expect(position.totalIssuedShares, 8000);
      expect(position.ledger.single.corporateEventId, 12);
      expect(position.status, 'Active');
    },
  );

  test('reads founder equity records from real API resources', () async {
    final adapter = _EquityAdapter();
    final api = FopxApiClient(
      environment: const AppEnvironment(
        apiBaseUrl: 'https://founder.test/api/v1',
      ),
      sessionStore: _EmptySessionStore(),
      httpClientAdapter: adapter,
    );
    final summary = await ApiFounderEquityRepository(api).fetch(7, 81);

    expect(summary.positions.single.id, 18);
    expect(summary.capitalization.single.totalIssuedShares, 8000);
    expect(summary.corporateEvents.single.status, 'PendingApproval');
    expect(summary.dividends.single.entitlements.single.outstanding, 250);
    expect(summary.transfers.single.quantity, 40);
    expect(
      adapter.requests.map((request) => request.uri.path).toSet(),
      <String>{
        '/api/v1/equity/opportunities/7/participations/81',
        '/api/v1/equity/opportunities/7/capitalization',
        '/api/v1/equity/opportunities/7/corporate-events',
        '/api/v1/equity/opportunities/7/dividend-declarations',
        '/api/v1/equity/opportunities/7/transfers',
      },
    );
  });

  test(
    'submits founder capitalization request and then approval submission',
    () async {
      final adapter = _EquityAdapter();
      final api = FopxApiClient(
        environment: const AppEnvironment(
          apiBaseUrl: 'https://founder.test/api/v1',
        ),
        sessionStore: _EmptySessionStore(),
        httpClientAdapter: adapter,
      );

      await ApiFounderEquityRepository(api).createCorporateEvent(
        opportunityId: 7,
        eventType: 'ShareIssuance',
        effectiveDate: DateTime.utc(2026, 3, 1),
        reason: 'Approved round allocation',
        sharesIssued: 500,
        positionIds: <int>[18],
      );

      final create = adapter.requests.first;
      expect(create.uri.path, '/api/v1/equity/corporate-events');
      expect(create.data, containsPair('opportunityId', 7));
      expect(create.data, containsPair('sharesIssued', 500.0));
      expect(create.data, containsPair('positionIds', <int>[18]));
      expect(
        adapter.requests.last.uri.path,
        '/api/v1/equity/corporate-events/12/submit',
      );
    },
  );

  test('reads the backend-owned exit and closure snapshot', () async {
    final adapter = _EquityAdapter();
    final api = FopxApiClient(
      environment: const AppEnvironment(
        apiBaseUrl: 'https://founder.test/api/v1',
      ),
      sessionStore: _EmptySessionStore(),
      httpClientAdapter: adapter,
    );
    final snapshot = await ApiFounderEquityRepository(api).closureSnapshot(18);

    expect(snapshot!.finalOwnership, 0);
    expect(snapshot.finalInvestorShares, 0);
    expect(snapshot.totalDistributionsConfirmed, 120);
    expect(snapshot.closureReason, 'Position fully exited');
    expect(
      adapter.requests.single.uri.path,
      '/api/v1/equity/positions/18/closure',
    );
  });
}

class _EquityAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    final path = options.uri.path;
    dynamic data = <String, dynamic>{};
    if (path.endsWith('/participations/81') ||
        path.endsWith('/capitalization')) {
      data = <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 18,
          'participationId': 81,
          'offerId': 21,
          'offerVersion': 2,
          'offerLegId': 44,
          'opportunityId': 7,
          'investmentAmount': 25000,
          'currency': 'EGP',
          'ownershipModel': 'ShareBased',
          'status': 'Active',
          'currentOwnershipPercentage': 11.25,
          'totalIssuedShares': 8000,
        },
      ];
    } else if (path.endsWith('/corporate-events') && options.method == 'GET') {
      data = <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 12,
          'eventType': 'ShareIssuance',
          'status': 'PendingApproval',
          'effectiveDate': '2026-03-01T00:00:00Z',
          'reason': 'Round issuance',
        },
      ];
    } else if (path.endsWith('/dividend-declarations')) {
      data = <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 9,
          'status': 'Declared',
          'recordDate': '2026-02-01T00:00:00Z',
          'currency': 'EGP',
          'entitlements': <Map<String, dynamic>>[
            <String, dynamic>{
              'id': 10,
              'entitlementAmount': 300,
              'currency': 'EGP',
              'confirmedDistributed': 50,
              'pendingConfirmation': 0,
              'disputedAmount': 0,
              'outstanding': 250,
            },
          ],
        },
      ];
    } else if (path.endsWith('/transfers')) {
      data = <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 15,
          'transferType': 'Partial',
          'status': 'PendingAcknowledgment',
          'quantity': 40,
          'effectiveDate': '2026-03-01T00:00:00Z',
          'reason': 'Transfer request',
        },
      ];
    } else if (path.endsWith('/closure')) {
      data = <String, dynamic>{
        'closedAt': '2026-03-15T00:00:00Z',
        'fullyExitedAt': '2026-03-14T00:00:00Z',
        'finalOwnershipPercentage': 0,
        'finalInvestorShares': 0,
        'totalDistributionsConfirmed': 120,
        'closureReason': 'Position fully exited',
      };
    } else if (path.endsWith('/corporate-events') && options.method == 'POST') {
      data = <String, dynamic>{'id': 12};
    }

    return ResponseBody.fromString(
      jsonEncode(<String, dynamic>{'success': true, 'data': data}),
      path == '/api/v1/equity/corporate-events' ? 201 : 200,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

class _EmptySessionStore extends SessionStore {
  @override
  Future<SessionTokens?> read() async => null;

  @override
  Future<void> save(SessionTokens tokens) async {}

  @override
  Future<void> clear() async {}
}
