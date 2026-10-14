import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';

import 'package:fopx_founder/features/projects/data/opportunity_form_controller.dart';
import 'package:fopx_founder/features/projects/data/project_models.dart';
import 'package:fopx_founder/features/projects/data/project_overview_controller.dart';
import 'package:fopx_founder/features/projects/presentation/opportunity_form_page.dart';

void main() {
  test('separates review submission from paid publication endpoints', () async {
    final adapter = _OpportunityLifecycleAdapter();
    final api = FopxApiClient(
      environment: const AppEnvironment(
        apiBaseUrl: 'https://founder.test/api/v1',
      ),
      sessionStore: _EmptyOpportunitySessionStore(),
      httpClientAdapter: adapter,
    );
    final repository = ApiOpportunityFormRepository(api);

    await repository.submitForReview(91);
    await repository.publish(91);
    await repository.archive(91);

    expect(adapter.requests.map((request) => request.uri.path), <String>[
      '/api/v1/opportunities/91/submit-review',
      '/api/v1/opportunities/91/publish',
      '/api/v1/opportunities/91/archive',
    ]);
  });

  test(
    'maps live project-stage metadata without losing custom-stage rules',
    () {
      final stage = OpportunityStageChoice.fromJson(<String, dynamic>{
        'code': 'Other',
        'value': 6,
        'nameEn': 'Other',
        'nameAr': 'أخرى',
        'allowsCustomName': true,
      });

      expect(stage.value, 6);
      expect(stage.label('ar'), 'أخرى');
      expect(stage.allowsCustomName, isTrue);
    },
  );

  test('maps funding currencies from the currency master response', () {
    final currency = OpportunityCurrencyChoice.fromJson(<String, dynamic>{
      'isoCode': 'EGP',
      'englishName': 'Egyptian Pound',
      'arabicName': 'جنيه مصري',
    });

    expect(currency.code, 'EGP');
    expect(currency.label('en'), 'Egyptian Pound');
    expect(currency.label('ar'), 'جنيه مصري');
  });

  test('preserves opportunity project stage from the owner API', () {
    final opportunity = FounderOpportunity.fromJson(<String, dynamic>{
      'id': 18,
      'projectId': 4,
      'title': 'Expansion round',
      'projectStage': 2,
      'status': 'Draft',
      'fundingStatus': 'NotScheduled',
    });

    expect(opportunity.projectStage, 'MVP');
  });

  test('preserves editable opportunity fields and backend edit lock', () {
    final opportunity = FounderOpportunityDetail.fromJson(<String, dynamic>{
      'id': 18,
      'projectId': 4,
      'title': 'Expansion round',
      'projectStage': 'Other',
      'projectStageCustomName': 'Regional rollout',
      'status': 'Draft',
      'fundingStatus': 'NotScheduled',
      'fundingGoal': <String, dynamic>{'id': 6},
      'fundingCurrency': 'EGP',
      'fundingTarget': 250000,
      'coverImageUrl': 'https://files.example.test/cover.png',
      'tags': <dynamic>[
        <String, dynamic>{'id': 9},
      ],
      'isLockedForEditing': true,
      'canFounderEdit': false,
      'canFounderSubmitForReview': false,
      'canFounderPublish': false,
      'canFounderArchive': false,
    });

    expect(opportunity.projectStageCustomName, 'Regional rollout');
    expect(opportunity.projectStage, 'Other');
    expect(opportunity.fundingGoalId, 6);
    expect(opportunity.fundingCurrency, 'EGP');
    expect(opportunity.coverImageUrl, 'https://files.example.test/cover.png');
    expect(opportunity.tagIds, <int>[9]);
    expect(opportunity.isLockedForEditing, isTrue);
    expect(opportunity.canFounderEdit, isFalse);
    expect(opportunity.canFounderSubmitForReview, isFalse);
    expect(opportunity.canFounderPublish, isFalse);
    expect(opportunity.canFounderArchive, isFalse);
  });

  test(
    'uses server lifecycle capabilities instead of inferring from status',
    () {
      final opportunity = FounderOpportunityDetail.fromJson(<String, dynamic>{
        'id': 18,
        'projectId': 4,
        'title': 'Approved opportunity',
        'status': 'Approved',
        'fundingStatus': 'NotScheduled',
        'canFounderEdit': false,
        'canFounderSubmitForReview': false,
        'canFounderPublish': true,
        'canFounderArchive': true,
      });

      expect(opportunity.canFounderEdit, isFalse);
      expect(opportunity.canFounderSubmitForReview, isFalse);
      expect(opportunity.canFounderPublish, isTrue);
      expect(opportunity.canFounderArchive, isTrue);
    },
  );

  test('parses publish price quote before a paid publish action', () {
    final quote = OpportunityPublishQuote.fromJson(<String, dynamic>{
      'creditCost': 12,
      'currentBalance': 50,
      'hasSufficientCredit': true,
      'chargingEnabled': true,
    });

    expect(quote.creditCost, 12);
    expect(quote.currentBalance, 50);
    expect(quote.hasSufficientCredit, isTrue);
    expect(quote.chargingEnabled, isTrue);
  });

  testWidgets('creates a project-scoped draft with no investment model', (
    tester,
  ) async {
    final repository = _FakeOpportunityFormRepository();
    await tester.pumpWidget(_OpportunityFormHarness(repository: repository));
    await tester.pumpAndSettle();

    await _enterField(tester, 'Opportunity title', 'Regional expansion');
    await _enterField(
      tester,
      'Short description (20–300 characters)',
      'A founder opportunity for a carefully planned regional expansion.',
    );
    await _enterField(
      tester,
      'Use of funds (30–2,000 characters)',
      'Product development and market expansion across two new regions.',
    );
    await _enterField(tester, 'Funding target', '75000');

    final saveButton = find.widgetWithText(FilledButton, 'Save');
    await tester.ensureVisible(saveButton);
    await tester.pumpAndSettle();
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(repository.createRequest, isNotNull);
    expect(repository.createRequest, containsPair('projectId', 44));
    expect(
      repository.createRequest,
      containsPair('title', 'Regional expansion'),
    );
    expect(repository.createRequest, containsPair('projectStage', 'MVP'));
    expect(repository.createRequest, containsPair('fundingTarget', 75000.0));
    expect(repository.createRequest, containsPair('fundingCurrency', 'EGP'));
    expect(repository.createRequest!.containsKey('investmentModel'), isFalse);
    expect(repository.createRequest!.containsKey('coverImageUrl'), isFalse);
    expect(find.text('saved-91'), findsOneWidget);
  });

  testWidgets('updates the selected editable Opportunity without creating', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    final repository = _FakeOpportunityFormRepository();
    await tester.pumpWidget(
      _OpportunityFormHarness(
        repository: repository,
        opportunityId: 91,
        opportunity: _existingOpportunity,
      ),
    );
    await tester.pumpAndSettle();
    final stageField = tester
        .widget<DropdownButtonFormField<OpportunityStageChoice>>(
          find.byType(DropdownButtonFormField<OpportunityStageChoice>),
        );
    expect(stageField.initialValue?.code, 'MVP');

    final titleField = find.byType(TextFormField).first;
    await tester.ensureVisible(titleField);
    await tester.pumpAndSettle();
    await tester.enterText(titleField, 'Updated regional expansion');

    final saveButton = find.widgetWithText(FilledButton, 'Save');
    await tester.ensureVisible(saveButton);
    await tester.pumpAndSettle();
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(repository.createRequest, isNull);
    expect(repository.updatedOpportunityId, 91);
    expect(repository.updateRequest!.containsKey('projectId'), isFalse);
    expect(
      repository.updateRequest,
      containsPair('title', 'Updated regional expansion'),
    );
    expect(repository.updateRequest, containsPair('fundingGoalId', 6));
    expect(repository.updateRequest!.containsKey('investmentModel'), isFalse);
    expect(repository.updateRequest!.containsKey('coverImageUrl'), isFalse);
    expect(find.text('saved-91'), findsOneWidget);
  });
}

class _EmptyOpportunitySessionStore extends SessionStore {
  @override
  Future<SessionTokens?> read() async => null;

  @override
  Future<void> save(SessionTokens tokens) async {}

  @override
  Future<void> clear() async {}
}

class _OpportunityLifecycleAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      jsonEncode(<String, dynamic>{
        'success': true,
        'data': <String, dynamic>{},
      }),
      200,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

Future<void> _enterField(
  WidgetTester tester,
  String label,
  String value,
) async {
  final field = find.ancestor(
    of: find.text(label),
    matching: find.byType(TextFormField),
  );
  await tester.ensureVisible(field);
  await tester.pumpAndSettle();
  await tester.enterText(field, value);
}

class _FakeOpportunityFormRepository implements OpportunityFormRepository {
  Map<String, dynamic>? createRequest;
  Map<String, dynamic>? updateRequest;
  int? updatedOpportunityId;

  @override
  Future<OpportunityFormChoices> fetchChoices() async =>
      const OpportunityFormChoices(
        stages: <OpportunityStageChoice>[
          OpportunityStageChoice(
            code: 'MVP',
            value: 2,
            nameEn: 'MVP',
            nameAr: 'منتج أولي',
            allowsCustomName: false,
          ),
        ],
        fundingGoals: <OpportunityGoalChoice>[],
        currencies: <OpportunityCurrencyChoice>[
          OpportunityCurrencyChoice(
            code: 'EGP',
            nameEn: 'Egyptian Pound',
            nameAr: 'جنيه مصري',
          ),
        ],
      );

  @override
  Future<int> create(Map<String, dynamic> request) async {
    createRequest = Map<String, dynamic>.from(request);
    return 91;
  }

  @override
  Future<void> update(int opportunityId, Map<String, dynamic> request) async {
    updatedOpportunityId = opportunityId;
    updateRequest = Map<String, dynamic>.from(request);
  }

  @override
  Future<OpportunityPublishQuote> quotePublish() async =>
      const OpportunityPublishQuote(
        creditCost: 0,
        currentBalance: 0,
        hasSufficientCredit: true,
        chargingEnabled: false,
      );

  @override
  Future<void> publish(int opportunityId) async {}

  @override
  Future<void> submitForReview(int opportunityId) async {}

  @override
  Future<void> archive(int opportunityId) async {}

  @override
  Future<void> setCoverImage({
    required int projectId,
    required int opportunityId,
    required List<int> fileBytes,
    required String fileName,
  }) async {}
}

class _OpportunityFormHarness extends StatelessWidget {
  const _OpportunityFormHarness({
    required this.repository,
    this.opportunityId,
    this.opportunity,
  });

  final OpportunityFormRepository repository;
  final int? opportunityId;
  final FounderOpportunityDetail? opportunity;

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation:
          opportunityId == null
              ? '/projects/44/opportunities/new'
              : '/projects/44/opportunities/$opportunityId/edit',
      routes: <RouteBase>[
        GoRoute(
          path: '/projects/:projectId/opportunities/new',
          builder:
              (_, state) => OpportunityFormPage(
                projectId: int.parse(state.pathParameters['projectId']!),
              ),
        ),
        GoRoute(
          path: '/projects/:projectId/opportunities/:opportunityId/edit',
          builder:
              (_, state) => OpportunityFormPage(
                projectId: int.parse(state.pathParameters['projectId']!),
                opportunityId: int.parse(
                  state.pathParameters['opportunityId']!,
                ),
              ),
        ),
        GoRoute(
          path: '/projects/:projectId/opportunities/:opportunityId',
          builder:
              (_, state) =>
                  Text('saved-${state.pathParameters['opportunityId']}'),
        ),
      ],
    );
    return ProviderScope(
      overrides: <Override>[
        opportunityFormRepositoryProvider.overrideWithValue(repository),
        opportunityFormChoicesProvider.overrideWith(
          (ref) => repository.fetchChoices(),
        ),
        projectOverviewProvider.overrideWith(
          (ref, projectId) async => _project,
        ),
        projectOpportunityProvider.overrideWith(
          (ref, id) async => opportunity ?? _existingOpportunity,
        ),
      ],
      child: MaterialApp.router(
        builder: (_, child) => Scaffold(body: child),
        theme: FopxTheme.founderLight(),
        supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          FopxLocalizationsDelegate(),
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        routerConfig: router,
      ),
    );
  }
}

const _project = FounderProjectDetails(
  id: 44,
  displayName: 'Northstar Foods',
  legalName: null,
  summary: 'A founder-owned food manufacturing project.',
  description: 'A founder-owned food manufacturing project in Cairo.',
  industry: 'Food manufacturing',
  categoryEn: 'Food',
  categoryAr: 'أغذية',
  stage: 'MVP',
  status: 'Active',
  geography: 'Cairo',
  foundedOn: null,
  websiteUrl: null,
  logoUrl: null,
  defaultCurrency: 'EGP',
  opportunityCount: 0,
  opportunities: <FounderOpportunity>[],
  createdAt: null,
  updatedAt: null,
  canEdit: true,
);

const _existingOpportunity = FounderOpportunityDetail(
  id: 91,
  projectId: 44,
  title: 'Regional expansion draft',
  status: 'Draft',
  fundingStatus: 'NotScheduled',
  projectStage: 'MVP',
  shortDescription: 'A draft opportunity ready for founder updates.',
  useOfFunds: 'Product development and expansion across target regions.',
  fundingTarget: 50000,
  fundingCurrency: 'EGP',
  fundingGoalId: 6,
  isLockedForEditing: false,
  canFounderEdit: true,
);
