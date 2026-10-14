import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_founder/features/deals/data/profit_sharing.dart';
import 'package:fopx_founder/features/deals/data/profit_sharing_controller.dart';

void main() {
  test('parses server-owned Profit Sharing lifecycle and history', () {
    final summary = FounderProfitSharingSummary.fromJson(<String, dynamic>{
      'participationId': 81,
      'totalEntitlement': 75,
      'totalConfirmedDistributed': 25,
      'totalPendingConfirmation': 50,
      'totalDisputed': 0,
      'totalDistributionOutstanding': 50,
      'totalDeclaredResult': 300,
      'completedPeriods': 1,
      'totalPeriods': 2,
      'obligations': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 12,
          'contributionAmount': 1000,
          'currency': 'EGP',
          'profitSharePercentage': 25,
          'reportingFrequency': 'Quarterly',
          'calculationBasis': 'Profit',
          'contractualStartDate': '2026-01-01T00:00:00Z',
          'contractualEndDate': '2026-12-31T00:00:00Z',
          'status': 'Active',
          'settledAt': null,
          'closedAt': null,
          'completedPeriods': 1,
          'totalPeriods': 2,
          'totalEntitlement': 75,
          'totalConfirmedDistributed': 25,
          'totalPendingConfirmation': 50,
          'totalDisputed': 0,
          'totalDistributionOutstanding': 50,
          'reportingPeriods': <Map<String, dynamic>>[
            <String, dynamic>{
              'id': 30,
              'periodNumber': 1,
              'isFinalPeriod': false,
              'startDate': '2026-01-01T00:00:00Z',
              'endDate': '2026-03-31T00:00:00Z',
              'currency': 'EGP',
              'status': 'Completed',
              'hasDeclaration': true,
              'declaredBasisAmount': 300,
              'declaredResultAmount': 300,
              'declarationStatus': 'Calculated',
              'investorEntitlement': 75,
              'distributionOutstanding': 50,
              'confirmedDistributed': 25,
              'pendingConfirmation': 50,
              'disputed': 0,
              'declaration': <String, dynamic>{
                'id': 91,
                'declaredBasisAmount': 300,
                'declaredResultAmount': 300,
                'currency': 'EGP',
                'declarationDate': '2026-04-01T00:00:00Z',
                'evidenceAvailable': true,
                'evidenceFileName': 'quarter.pdf',
                'status': 'Calculated',
              },
              'distributionDeclarations': <Map<String, dynamic>>[
                <String, dynamic>{
                  'id': 92,
                  'declaredAmount': 25,
                  'currency': 'EGP',
                  'status': 'Confirmed',
                  'evidenceAvailable': false,
                },
              ],
            },
          ],
        },
      ],
    });

    final obligation = summary.obligations.single;
    expect(summary.participationId, 81);
    expect(obligation.status, 'Active');
    expect(obligation.profitSharePercentage, 25);
    expect(obligation.reportingPeriods.single.declaration?.id, 91);
    expect(obligation.reportingPeriods.single.distributionDeclarations.single.status, 'Confirmed');
  });

  test('sends a result declaration and optional evidence to the domain API', () async {
    final adapter = _ProfitSharingAdapter();
    final api = FopxApiClient(
      environment: const AppEnvironment(apiBaseUrl: 'https://founder.test/api/v1'),
      sessionStore: _EmptySessionStore(),
      httpClientAdapter: adapter,
    );
    final repository = ApiFounderProfitSharingRepository(api);

    await repository.declareResult(
      opportunityId: 7,
      obligationId: 12,
      periodId: 30,
      declaredBasisAmount: 300,
      declaredResultAmount: 300,
      currency: 'EGP',
      declarationDate: DateTime(2026, 4, 1),
      externalReference: 'statement-1',
      evidenceBytes: <int>[1, 2, 3],
      evidenceFileName: 'quarter.pdf',
      evidenceContentType: 'application/pdf',
    );

    final request = adapter.requests.single;
    expect(request.uri.path, '/api/v1/profit-sharing/opportunities/7/obligations/12/periods/30/declarations');
    expect(request.data, isA<FormData>());
    final form = request.data as FormData;
    final fields = Map<String, String>.fromEntries(form.fields);
    expect(fields, containsPair('DeclaredBasisAmount', '300.0'));
    expect(fields, containsPair('DeclaredResultAmount', '300.0'));
    expect(fields, containsPair('Currency', 'EGP'));
    expect(fields, containsPair('ExternalReference', 'statement-1'));
    expect(form.files.map((entry) => entry.key), contains('evidenceFile'));
    expect(request.headers['Idempotency-Key'], isNotEmpty);
  });
}

class _ProfitSharingAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      jsonEncode(<String, dynamic>{'success': true, 'data': <String, dynamic>{}}),
      201,
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
