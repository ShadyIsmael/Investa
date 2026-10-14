import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_founder/features/deals/data/funding_controller.dart';
import 'package:fopx_founder/features/deals/data/funding_declarations.dart';
import 'package:fopx_founder/features/deals/presentation/founder_deal_detail_page.dart';

void main() {
  test(
    'parses backend funding status, evidence, and offer-leg allocations',
    () {
      final declaration = FounderFundingDeclaration.fromJson(<String, dynamic>{
        'id': 31,
        'participationId': 18,
        'opportunityId': 3,
        'amount': 5000,
        'currencyCode': 'USD',
        'receivedDate': '2026-09-22T00:00:00Z',
        'paymentMethod': 'BankTransfer',
        'status': 'PendingConfirmation',
        'declaredAt': '2026-09-23T09:30:00Z',
        'externalReference': 'TRX-901',
        'proofAvailable': true,
        'proofFileName': 'receipt.pdf',
        'legAllocations': <Map<String, dynamic>>[
          <String, dynamic>{
            'offerLegNumber': 2,
            'legType': 'Loan',
            'allocatedAmount': 5000,
            'currencyCode': 'USD',
          },
        ],
      });

      expect(declaration.id, 31);
      expect(declaration.status, 'PendingConfirmation');
      expect(declaration.proofAvailable, isTrue);
      expect(declaration.proofFileName, 'receipt.pdf');
      expect(declaration.allocations.single.legNumber, 2);
      expect(declaration.allocations.single.legType, 'Loan');
      expect(declaration.allocations.single.amount, 5000);
    },
  );

  test('parses only backend-persisted loan schedule and lifecycle state', () {
    final leg = FounderFundingLeg.fromJson(<String, dynamic>{
      'offerLegId': 91,
      'legNumber': 1,
      'legType': 'Loan',
      'amount': 10000,
      'declaredAmount': 1000,
      'currency': 'USD',
      'loanObligationId': 301,
      'loanObligationStatus': 'Active',
      'isPersistedSchedule': true,
      'cashFlows': <Map<String, dynamic>>[
        <String, dynamic>{
          'installmentNumber': 1,
          'dueDate': '2026-10-01T00:00:00Z',
          'expectedPrincipal': 500,
          'expectedInterest': 50,
          'expectedTotal': 550,
          'remainingAmount': 550,
          'status': 'Upcoming',
        },
      ],
      'repayment': <String, dynamic>{
        'loanObligationId': 301,
        'principalOutstanding': 9000,
        'interestOutstanding': 900,
        'totalOutstanding': 9900,
        'confirmedRepaidAmount': 1100,
        'pendingConfirmationAmount': 300,
        'disputedAmount': 0,
        'overdueAmount': 0,
        'loanLifecycleStatus': 'Active',
        'records': <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 4,
            'amount': 300,
            'currency': 'USD',
            'externalPaymentDate': '2026-09-23T00:00:00Z',
            'status': 'PendingConfirmation',
            'targetInstallmentNumbers': <int>[1],
          },
        ],
      },
    });

    expect(leg.loanObligationId, 301);
    expect(leg.isPersistedSchedule, isTrue);
    expect(leg.cashFlows.single.expectedTotal, 550);
    expect(leg.repayment!.totalOutstanding, 9900);
    expect(leg.repayment!.records.single.targetInstallmentNumbers, <int>[1]);
  });

  testWidgets(
    'Founder can declare received funding against a real participation',
    (tester) async {
      final repository = _FakeFundingRepository();
      await tester.pumpWidget(
        ProviderScope(
          overrides: <Override>[
            founderFundingRepositoryProvider.overrideWithValue(repository),
          ],
          child: MaterialApp(
            localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
              FopxLocalizationsDelegate(),
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
            home: const Scaffold(
              body: FounderDealDetailPage(
                opportunityId: 3,
                participationId: 18,
                title: 'Expansion round',
                investorName: 'Investor One',
                committedAmount: 12000,
                currency: 'USD',
                contractId: 77,
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Committed'), findsOneWidget);
      expect(find.textContaining('outside FOPX'), findsOneWidget);
      await tester.tap(find.text('Declare funds received'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Amount received (USD)'),
        '2500',
      );
      await tester.tap(find.text('Submit declaration'));
      await tester.pumpAndSettle();

      expect(repository.lastOpportunityId, 3);
      expect(repository.lastParticipationId, 18);
      expect(repository.lastAmount, 2500);
      expect(repository.lastCurrency, 'USD');
      expect(repository.lastPaymentMethod, 'BankTransfer');
    },
  );

  testWidgets('mixed offer declaration reconciles each accepted leg', (
    tester,
  ) async {
    final repository = _FakeFundingRepository(mixed: true);
    await tester.pumpWidget(_fundingApp(repository));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Declare funds received'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Amount received (USD)'),
      '2500',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Offer leg 1 · Loan amount'),
      '1000',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Offer leg 2 · Equity amount'),
      '1500',
    );
    await tester.tap(find.text('Submit declaration'));
    await tester.pumpAndSettle();

    expect(repository.lastAllocations, hasLength(2));
    expect(
      repository.lastAllocations.map((item) => item.amount).toList(),
      <double>[1000, 1500],
    );
  });

  testWidgets('Founder declares repayment only from the active loan record', (
    tester,
  ) async {
    final repository = _FakeFundingRepository(includeLoanLifecycle: true);
    await tester.pumpWidget(_fundingApp(repository));
    await tester.pumpAndSettle();
    await tester.drag(find.byType(ListView).last, const Offset(0, -700));
    await tester.pumpAndSettle();
    expect(find.text('Persisted repayment schedule'), findsOneWidget);
    expect(find.text('Record a repayment'), findsOneWidget);
    await tester.ensureVisible(find.text('Record a repayment'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Record a repayment'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Amount paid (USD)'),
      '125',
    );
    await tester.tap(find.byType(CheckboxListTile).first);
    await tester.tap(find.text('Submit declaration'));
    await tester.pumpAndSettle();

    expect(repository.lastLoanObligationId, 301);
    expect(repository.lastLoanRepaymentAmount, 125);
    expect(repository.lastInstallmentIds, <int>[1]);
  });
}

class _FakeFundingRepository implements FounderFundingRepository {
  _FakeFundingRepository({
    this.mixed = false,
    this.includeLoanLifecycle = false,
  });

  final bool mixed;
  final bool includeLoanLifecycle;
  int? lastOpportunityId;
  int? lastParticipationId;
  double? lastAmount;
  String? lastCurrency;
  String? lastPaymentMethod;
  List<({int offerLegId, double amount})> lastAllocations = const [];
  int? lastLoanObligationId;
  double? lastLoanRepaymentAmount;
  List<int> lastInstallmentIds = const <int>[];

  @override
  Future<List<FounderFundingDeclaration>> fetch(
    int opportunityId,
    int participationId,
  ) async => const <FounderFundingDeclaration>[];

  @override
  Future<FounderFundingDeclaration> declare({
    required int opportunityId,
    required int participationId,
    required double amount,
    required String currency,
    required DateTime receivedDate,
    required String paymentMethod,
    String? externalReference,
    String? notes,
    List<int>? proofBytes,
    String? proofFileName,
    String? proofContentType,
    List<({int offerLegId, double amount})> allocations = const [],
  }) async {
    lastOpportunityId = opportunityId;
    lastParticipationId = participationId;
    lastAmount = amount;
    lastCurrency = currency;
    lastPaymentMethod = paymentMethod;
    lastAllocations = allocations;
    return FounderFundingDeclaration(
      id: 99,
      amount: amount,
      currency: currency,
      receivedDate: receivedDate,
      paymentMethod: paymentMethod,
      status: 'PendingConfirmation',
      declaredAt: DateTime.now(),
    );
  }

  @override
  Future<List<int>> downloadProof(int declarationId) async => <int>[1, 2, 3];

  @override
  Future<List<FounderFundingLeg>> fetchAcceptedLegs(
    int opportunityId,
    int participationId,
  ) async =>
      includeLoanLifecycle
          ? <FounderFundingLeg>[
            FounderFundingLeg(
              id: 501,
              number: 1,
              type: 'Loan',
              committed: 12000,
              declared: 0,
              currency: 'USD',
              loanObligationId: 301,
              loanObligationStatus: 'Active',
              isPersistedSchedule: true,
              repayment: const FounderLoanSummary(
                loanObligationId: 301,
                principalOutstanding: 9000,
                interestOutstanding: 900,
                totalOutstanding: 9900,
                confirmedRepaidAmount: 1100,
                pendingConfirmationAmount: 0,
                disputedAmount: 0,
                overdueAmount: 0,
                lifecycleStatus: 'Active',
              ),
              cashFlows: const <FounderLoanInstallment>[
                FounderLoanInstallment(
                  number: 1,
                  dueDate: null,
                  expectedPrincipal: 500,
                  expectedInterest: 50,
                  expectedTotal: 550,
                  remainingAmount: 550,
                  status: 'Upcoming',
                ),
              ],
            ),
          ]
          : mixed
          ? const <FounderFundingLeg>[
            FounderFundingLeg(
              id: 501,
              number: 1,
              type: 'Loan',
              committed: 12000,
              declared: 0,
              currency: 'USD',
            ),
            FounderFundingLeg(
              id: 502,
              number: 2,
              type: 'Equity',
              committed: 8000,
              declared: 0,
              currency: 'USD',
            ),
          ]
          : const <FounderFundingLeg>[
            FounderFundingLeg(
              id: 501,
              number: 1,
              type: 'Loan',
              committed: 12000,
              declared: 0,
              currency: 'USD',
            ),
          ];

  @override
  Future<FounderLoanRepayment> declareLoanRepayment({
    required int opportunityId,
    required int loanObligationId,
    required double amount,
    required String currency,
    required DateTime externalPaymentDate,
    String? externalReference,
    List<int>? proofBytes,
    String? proofFileName,
    String? proofContentType,
    List<int> installmentIds = const [],
  }) async {
    lastLoanObligationId = loanObligationId;
    lastLoanRepaymentAmount = amount;
    lastInstallmentIds = installmentIds;
    return FounderLoanRepayment(
      id: 72,
      amount: amount,
      currency: currency,
      externalPaymentDate: externalPaymentDate,
      status: 'PendingConfirmation',
      declaredAt: DateTime.now(),
      externalReference: externalReference,
    );
  }

  @override
  Future<List<int>> downloadLoanRepaymentProof(int declarationId) async =>
      <int>[1, 2, 3];
}

Widget _fundingApp(_FakeFundingRepository repository) => ProviderScope(
  overrides: <Override>[
    founderFundingRepositoryProvider.overrideWithValue(repository),
  ],
  child: MaterialApp(
    localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
      FopxLocalizationsDelegate(),
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
    home: const Scaffold(
      body: FounderDealDetailPage(
        opportunityId: 3,
        participationId: 18,
        title: 'Expansion round',
        investorName: 'Investor One',
        committedAmount: 12000,
        currency: 'USD',
        contractId: 77,
      ),
    ),
  ),
);
