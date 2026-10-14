import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';

import 'package:fopx_founder/features/chat/data/chat_controller.dart';
import 'package:fopx_founder/features/chat/data/chat_models.dart';
import 'package:fopx_founder/features/chat/presentation/chat_page.dart';

void main() {
  test('parses mixed offer legs and server-provided response capabilities', () {
    final offer = FounderNegotiationOffer.fromJson(<String, dynamic>{
      'id': 19,
      'createdByName': 'Investor One',
      'createdByRole': 'Investor',
      'version': 2,
      'replacesOfferId': 17,
      'status': 'Pending',
      'currency': 'EGP',
      'note': 'Updated terms',
      'canAccept': true,
      'canReject': true,
      'canRespond': true,
      'canWithdraw': false,
      'legs': <Map<String, dynamic>>[
        <String, dynamic>{
          'legType': 'Equity',
          'amount': 175000,
          'equityOwnershipModel': 'PercentageBased',
          'equityPercentage': 12.5,
          'sharesTerms': 'Ordinary shares',
          'effectiveOwnershipDate': '2026-09-01T00:00:00Z',
        },
        <String, dynamic>{
          'legType': 'Loan',
          'amount': 50000,
          'returnRate': 9.5,
          'termMonths': 18,
          'repaymentModel': 'Quarterly',
        },
        <String, dynamic>{
          'legType': 'ProfitSharing',
          'amount': 25000,
          'profitSharePercentage': 8,
          'termMonths': 12,
          'profitSharingPayoutFrequency': 'Monthly',
          'exitTerms': 'After the agreed term',
        },
        <String, dynamic>{
          'legType': 'Equity',
          'amount': 1,
          'equityOwnershipModel': 'ShareBased',
          'investorShareCount': 25,
          'totalIssuedShares': 200,
        },
      ],
    });

    expect(offer.id, 19);
    expect(offer.version, 2);
    expect(offer.replacesOfferId, 17);
    expect(offer.canAccept, isTrue);
    expect(offer.canRespond, isTrue);
    expect(offer.canWithdraw, isFalse);
    expect(offer.legs, hasLength(4));
    expect(offer.legs[0].type, 'Equity');
    expect(offer.legs[0].amount, 175000);
    expect(offer.legs[0].equityOwnershipModel, 'PercentageBased');
    expect(offer.legs[0].equityPercentage, 12.5);
    expect(offer.legs[0].sharesTerms, 'Ordinary shares');
    expect(offer.legs[0].effectiveOwnershipDate, isNotNull);
    expect(offer.legs[1].type, 'Loan');
    expect(offer.legs[1].amount, 50000);
    expect(offer.legs[1].returnRate, 9.5);
    expect(offer.legs[1].termMonths, 18);
    expect(offer.legs[1].repaymentModel, 'Quarterly');
    expect(offer.legs[2].type, 'ProfitSharing');
    expect(offer.legs[2].profitSharePercentage, 8);
    expect(offer.legs[2].termMonths, 12);
    expect(offer.legs[2].profitSharingPayoutFrequency, 'Monthly');
    expect(offer.legs[2].exitTerms, 'After the agreed term');
    expect(offer.legs[3].equityOwnershipModel, 'ShareBased');
    expect(offer.legs[3].investorShareCount, 25);
    expect(offer.legs[3].totalIssuedShares, 200);
  });

  test('parses conversation and unread state from the backend contract', () {
    final conversation = FounderConversation.fromJson(<String, dynamic>{
      'id': 'd3949910-5625-45e3-9380-80c1a369d971',
      'opportunityId': 24,
      'conversationStatus': 'Active',
      'statusText': 'In progress',
      'counterpartyName': 'Investor One',
      'counterpartyRole': 'Investor',
      'unreadCount': 2,
      'createdAt': '2026-09-20T10:00:00Z',
      'opportunity': <String, dynamic>{'title': 'Growth round'},
    });

    expect(conversation.opportunityId, 24);
    expect(conversation.opportunityTitle, 'Growth round');
    expect(conversation.counterpartyName, 'Investor One');
    expect(conversation.unreadCount, 2);
    expect(conversation.status, 'In progress');
    expect(conversation.updatedAt, isNotNull);
  });

  test(
    'parses incoming conversation request capabilities from the backend',
    () {
      final request = FounderConversationRequest.fromJson(<String, dynamic>{
        'id': 'd3949910-5625-45e3-9380-80c1a369d971',
        'opportunityId': 24,
        'direction': 'Incoming',
        'counterpartyName': 'Investor One',
        'statusText': 'Waiting for founder response',
        'canAccept': true,
        'canReject': true,
        'canWithdraw': false,
        'message': 'I would like to discuss the opportunity.',
        'opportunity': <String, dynamic>{'title': 'Growth round'},
      });

      expect(request.direction, 'Incoming');
      expect(request.opportunityTitle, 'Growth round');
      expect(request.canAccept, isTrue);
      expect(request.canReject, isTrue);
      expect(request.canWithdraw, isFalse);
      expect(request.message, contains('discuss'));
    },
  );

  testWidgets('renders backend-authorized incoming request actions', (
    tester,
  ) async {
    final repository = _FakeChatRepository(
      requests: <FounderConversationRequest>[
        const FounderConversationRequest(
          id: 'request-1',
          opportunityId: 24,
          opportunityTitle: 'Growth round',
          counterpartyName: 'Investor One',
          message: 'I would like to connect.',
          status: 'Waiting for founder response',
          direction: 'Incoming',
          canAccept: true,
          canReject: true,
          canWithdraw: false,
        ),
      ],
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          founderChatRepositoryProvider.overrideWithValue(repository),
        ],
        child: MaterialApp(
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            FopxLocalizationsDelegate(),
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
          home: const Scaffold(body: ChatPage()),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Conversation requests'), findsOneWidget);
    expect(find.text('Growth round'), findsNWidgets(2));
    expect(find.text('Accept'), findsOneWidget);
    expect(find.text('Reject'), findsOneWidget);
  });

  testWidgets('renders and withdraws an outgoing pending request', (
    tester,
  ) async {
    final repository = _FakeChatRepository(
      requests: const <FounderConversationRequest>[
        FounderConversationRequest(
          id: 'request-outgoing',
          opportunityId: 24,
          opportunityTitle: 'Growth round',
          counterpartyName: 'Investor One',
          message: null,
          status: 'Waiting for response',
          direction: 'Outgoing',
          canAccept: false,
          canReject: false,
          canWithdraw: true,
        ),
      ],
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          founderChatRepositoryProvider.overrideWithValue(repository),
        ],
        child: MaterialApp(
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            FopxLocalizationsDelegate(),
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
          home: const Scaffold(body: ChatPage()),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Conversation requests'), findsOneWidget);
    await tester.tap(find.text('Withdraw request'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Withdraw request'));
    await tester.pumpAndSettle();

    expect(repository.withdrawRequestCalls, 1);
    expect(repository.rejectRequestCalls, 0);
  });

  testWidgets('renders real conversation data supplied by its repository', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          founderChatRepositoryProvider.overrideWithValue(
            _FakeChatRepository(),
          ),
        ],
        child: MaterialApp(
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            FopxLocalizationsDelegate(),
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
          home: const Scaffold(body: ChatPage()),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Growth round'), findsOneWidget);
    expect(find.textContaining('Investor One'), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
    expect(find.text('No conversations yet'), findsNothing);
  });

  testWidgets('offer composer confirms the quoted cost before sending', (
    tester,
  ) async {
    final repository = _FakeChatRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          founderChatRepositoryProvider.overrideWithValue(repository),
        ],
        child: MaterialApp(
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            FopxLocalizationsDelegate(),
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
          home: Scaffold(
            body: ConversationPage(
              conversation: _FakeChatRepository.conversation,
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Make an offer'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Investment amount'),
      '10000',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Ownership percentage'),
      '8',
    );
    await tester.tap(find.text('Review and send'));
    await tester.pumpAndSettle();

    expect(repository.sentOffer, isNull);
    expect(find.textContaining('costs 5 credits'), findsOneWidget);
    await tester.tap(find.text('Review and send').last);
    await tester.pumpAndSettle();

    expect(repository.sentOffer, isNotNull);
    expect(repository.sentOffer!['currency'], 'EGP');
    expect(repository.sentOffer!['legs'], isA<List<dynamic>>());
  });

  testWidgets('shows readiness from live conversation details', (tester) async {
    final repository = _FakeChatRepository(
      detail: const FounderConversation(
        id: 'd3949910-5625-45e3-9380-80c1a369d971',
        opportunityId: 24,
        opportunityTitle: 'Growth round',
        counterpartyName: 'Investor One',
        counterpartyRole: 'Investor',
        status: 'In progress',
        unreadCount: 0,
        updatedAt: null,
        founderReady: true,
        investorReady: false,
        currentUserReady: false,
        canContinue: false,
      ),
    );
    await tester.pumpWidget(_conversationApp(repository));
    await tester.pumpAndSettle();

    expect(repository.markMessagesReadCalls, 1);
    expect(
      find.text('Founder ready: Yes · Investor ready: No'),
      findsOneWidget,
    );
    expect(find.text('Ready to proceed'), findsOneWidget);
    await tester.tap(find.text('Ready to proceed'));
    await tester.pumpAndSettle();
    expect(repository.markReadyCalls, 1);
  });

  testWidgets('closed conversation is read-only', (tester) async {
    final repository = _FakeChatRepository(
      detail: FounderConversation(
        id: _FakeChatRepository.conversation.id,
        opportunityId: 24,
        opportunityTitle: 'Growth round',
        counterpartyName: 'Investor One',
        counterpartyRole: 'Investor',
        status: 'Closed',
        unreadCount: 0,
        updatedAt: null,
        closedAt: DateTime.utc(2026, 9, 20),
      ),
    );
    await tester.pumpWidget(_conversationApp(repository));
    await tester.pumpAndSettle();

    expect(find.text('This conversation is closed.'), findsOneWidget);
    expect(find.text('Make an offer'), findsNothing);
    expect(find.byType(TextField), findsNothing);
  });

  testWidgets('counter form carries forward the selected immutable version', (
    tester,
  ) async {
    final repository = _FakeChatRepository(
      offers: const <FounderNegotiationOffer>[
        FounderNegotiationOffer(
          id: 41,
          createdByName: 'Investor One',
          createdByRole: 'Investor',
          version: 3,
          replacesOfferId: 35,
          status: 'Pending',
          currency: 'EGP',
          note: 'Quarterly repayment',
          createdAt: null,
          legs: <FounderNegotiationOfferLeg>[
            FounderNegotiationOfferLeg(
              type: 'Loan',
              amount: 175000,
              returnRate: 9.5,
              termMonths: 18,
              repaymentModel: 'Quarterly',
            ),
          ],
          canAccept: false,
          canReject: false,
          canRespond: true,
          canWithdraw: false,
        ),
      ],
    );
    await tester.pumpWidget(_conversationApp(repository));
    await tester.pumpAndSettle();

    expect(find.textContaining('175,000'), findsNWidgets(2));
    await tester.ensureVisible(find.text('Counteroffer'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Counteroffer'));
    await tester.pumpAndSettle();
    await tester.drag(find.byType(ListView).last, const Offset(0, -700));
    await tester.pumpAndSettle();
    final fields = tester.widgetList<TextFormField>(find.byType(TextFormField));
    expect(fields.any((field) => field.controller?.text == '175000.0'), isTrue);
    expect(fields.any((field) => field.controller?.text == '9.5'), isTrue);
    expect(fields.any((field) => field.controller?.text == '18'), isTrue);
    expect(
      fields.any((field) => field.controller?.text == 'Quarterly repayment'),
      isTrue,
    );
  });
}

Widget _conversationApp(_FakeChatRepository repository) => ProviderScope(
  overrides: <Override>[
    founderChatRepositoryProvider.overrideWithValue(repository),
  ],
  child: MaterialApp(
    localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
      FopxLocalizationsDelegate(),
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
    home: Scaffold(
      body: ConversationPage(conversation: _FakeChatRepository.conversation),
    ),
  ),
);

class _FakeChatRepository implements FounderChatRepository {
  _FakeChatRepository({
    this.requests = const <FounderConversationRequest>[],
    this.offers = const <FounderNegotiationOffer>[],
    this.detail,
  });

  final List<FounderConversationRequest> requests;
  final List<FounderNegotiationOffer> offers;
  final FounderConversation? detail;
  int markReadyCalls = 0;
  int markMessagesReadCalls = 0;
  int withdrawRequestCalls = 0;
  int rejectRequestCalls = 0;
  static const conversation = FounderConversation(
    id: 'd3949910-5625-45e3-9380-80c1a369d971',
    opportunityId: 24,
    opportunityTitle: 'Growth round',
    counterpartyName: 'Investor One',
    counterpartyRole: 'Investor',
    status: 'In progress',
    unreadCount: 0,
    updatedAt: null,
  );

  Map<String, dynamic>? sentOffer;

  @override
  Future<List<FounderConversationRequest>> fetchConversationRequests() async =>
      requests;

  @override
  Future<void> acceptConversationRequest(String requestId) async {}

  @override
  Future<void> rejectConversationRequest(String requestId) async {
    rejectRequestCalls++;
  }

  @override
  Future<void> withdrawConversationRequest(String requestId) async {
    withdrawRequestCalls++;
  }

  @override
  Future<List<FounderConversation>> fetchConversations() async =>
      const <FounderConversation>[
        FounderConversation(
          id: 'd3949910-5625-45e3-9380-80c1a369d971',
          opportunityId: 24,
          opportunityTitle: 'Growth round',
          counterpartyName: 'Investor One',
          counterpartyRole: 'Investor',
          status: 'In progress',
          unreadCount: 2,
          updatedAt: null,
        ),
      ];

  @override
  Future<FounderConversation> fetchConversation(String conversationId) async =>
      detail ?? conversation;

  @override
  Future<void> markReadyToProceed(String conversationId) async {
    markReadyCalls++;
  }

  @override
  Future<void> closeConversation(String conversationId, String? reason) async {}

  @override
  Future<List<FounderChatMessage>> fetchMessages(String conversationId) async =>
      const <FounderChatMessage>[];

  @override
  Future<void> markMessagesRead(String conversationId) async {
    markMessagesReadCalls++;
  }

  @override
  Future<List<FounderNegotiationOffer>> fetchOffers(
    String conversationId,
  ) async => offers;

  @override
  Future<void> sendMessage(String conversationId, String message) async {}

  @override
  Future<void> acceptOffer(String conversationId, int offerId) async {}

  @override
  Future<void> rejectOffer(String conversationId, int offerId) async {}

  @override
  Future<List<FounderOfferCurrency>> fetchOfferCurrencies() async =>
      const <FounderOfferCurrency>[
        FounderOfferCurrency(
          code: 'USD',
          nameEn: 'US Dollar',
          nameAr: 'دولار أمريكي',
        ),
        FounderOfferCurrency(
          code: 'EGP',
          nameEn: 'Egyptian Pound',
          nameAr: 'جنيه مصري',
        ),
      ];

  @override
  Future<FounderOfferQuote> quoteFirstOffer() async => const FounderOfferQuote(
    creditCost: 5,
    currentBalance: 20,
    hasSufficientCredit: true,
    chargingEnabled: true,
  );

  @override
  Future<FounderOfferQuote> quoteOfferReplacement() async =>
      const FounderOfferQuote(
        creditCost: 2,
        currentBalance: 20,
        hasSufficientCredit: true,
        chargingEnabled: true,
      );

  @override
  Future<void> sendOffer(
    String conversationId,
    Map<String, dynamic> offer,
  ) async {
    sentOffer = offer;
  }

  @override
  Future<void> replaceOffer(
    String conversationId,
    int offerId,
    Map<String, dynamic> offer,
  ) async {
    sentOffer = offer;
  }

  @override
  Future<void> withdrawOffer(String conversationId, int offerId) async {}

  @override
  Future<List<FounderNegotiationOffer>> fetchDirectOffers(
    int opportunityId,
  ) async => const <FounderNegotiationOffer>[];

  @override
  Future<void> acceptDirectOffer(int opportunityId, int offerId) async {}

  @override
  Future<void> rejectDirectOffer(int opportunityId, int offerId) async {}
}
