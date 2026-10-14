import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';

import 'package:fopx_founder/features/projects/data/project_models.dart';
import 'package:fopx_founder/features/projects/data/opportunity_form_controller.dart';
import 'package:fopx_founder/features/projects/data/project_overview_controller.dart';
import 'package:fopx_founder/features/chat/data/chat_controller.dart';
import 'package:fopx_founder/features/chat/data/chat_models.dart';
import 'package:fopx_founder/features/projects/presentation/project_opportunity_pages.dart';
import 'package:fopx_founder/features/projects/presentation/project_overview_page.dart';
import 'package:fopx_founder/features/projects/presentation/project_room_page.dart';

void main() {
  test(
    'parses lightweight opportunities and detail fields from backend DTOs',
    () {
      final opportunity = FounderOpportunity.fromJson(<String, dynamic>{
        'id': 44,
        'sequenceNumber': 2,
        'title': 'Expansion Round',
        'status': 'Published',
        'fundingStatus': 'Open',
        'createdAt': '2026-09-20T10:00:00Z',
      });
      expect(opportunity.id, 44);
      expect(opportunity.sequenceNumber, 2);
      expect(opportunity.createdAt, isNotNull);

      final detail = FounderOpportunityDetail.fromJson(<String, dynamic>{
        'id': 44,
        'projectId': 9,
        'title': 'Expansion Round',
        'status': 'Published',
        'fundingStatus': 'Open',
        'shortDescription': 'Expand regional operations.',
        'fundingTarget': 500000,
        'fundingCurrency': 'EGP',
        'createdAt': '2026-09-20T10:00:00Z',
      });
      expect(detail.projectId, 9);
      expect(detail.fundingTarget, 500000);
      expect(detail.shortDescription, 'Expand regional operations.');
    },
  );

  testWidgets('founder sees direct offers and only backend-enabled actions', (
    tester,
  ) async {
    final repository = _FakeFounderChatRepository(
      offers: const <FounderNegotiationOffer>[
        FounderNegotiationOffer(
          id: 91,
          createdByName: 'Investor One',
          createdByRole: 'Investor',
          version: 1,
          status: 'Pending',
          currency: 'EGP',
          note: 'Funding for expansion',
          createdAt: null,
          legs: <FounderNegotiationOfferLeg>[
            FounderNegotiationOfferLeg(
              type: 'Loan',
              amount: 50000,
              returnRate: 9,
              termMonths: 18,
              repaymentModel: 'Quarterly',
            ),
            FounderNegotiationOfferLeg(
              type: 'Equity',
              amount: 25000,
              equityPercentage: 8,
            ),
          ],
          canAccept: true,
          canReject: false,
          canRespond: false,
          canWithdraw: false,
        ),
      ],
    );
    final repo = _Repo(
      project: _project(<FounderOpportunity>[
        _opp(
          id: 44,
          sequence: 1,
          title: 'Expansion Round',
          status: 'Published',
          createdAt: DateTime(2026, 9, 20),
        ),
      ], canEdit: true),
    );
    await tester.pumpWidget(
      _App(
        repo: repo,
        chatRepository: repository,
        initialLocation: '/projects/9/opportunities/44',
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Negotiation offers'), findsOneWidget);
    expect(find.text('Investor One'), findsOneWidget);
    expect(find.textContaining('Funding for expansion'), findsOneWidget);
    expect(find.text('Accept offer'), findsOneWidget);
    expect(find.text('Reject offer'), findsNothing);
    expect(
      find.textContaining('Total across offer legs: 75,000 EGP'),
      findsOneWidget,
    );
  });

  testWidgets('overview selects exactly the newest CreatedAt opportunity', (
    tester,
  ) async {
    final repo = _Repo(
      project: _project(<FounderOpportunity>[
        _opp(
          id: 5,
          sequence: 5,
          title: 'Sequence five but older',
          status: 'Funding',
          createdAt: DateTime(2026, 9, 10),
        ),
        _opp(
          id: 2,
          sequence: 2,
          title: 'Newest by creation',
          status: 'Published',
          createdAt: DateTime(2026, 9, 20),
        ),
      ]),
    );
    await tester.pumpWidget(_App(repo: repo, initialLocation: '/projects/9'));
    await tester.pumpAndSettle();
    expect(find.text('Newest by creation'), findsOneWidget);
    expect(find.text('Sequence five but older'), findsNothing);
    expect(
      find.text('Short description for Newest by creation.'),
      findsOneWidget,
    );
  });

  testWidgets('history separates current items from Completed and Archived', (
    tester,
  ) async {
    final repo = _Repo(
      project: _project(<FounderOpportunity>[
        _opp(
          id: 1,
          sequence: 1,
          title: 'Draft round',
          status: 'Draft',
          createdAt: DateTime(2026, 9, 20),
        ),
        _opp(
          id: 2,
          sequence: 2,
          title: 'Rejected round',
          status: 'Rejected',
          createdAt: DateTime(2026, 9, 19),
        ),
        _opp(
          id: 3,
          sequence: 3,
          title: 'Completed round',
          status: 'Completed',
          createdAt: DateTime(2026, 8, 10),
        ),
        _opp(
          id: 4,
          sequence: 4,
          title: 'Archived round',
          status: 'Archived',
          createdAt: DateTime(2026, 7, 2),
        ),
      ]),
    );
    await tester.pumpWidget(
      _App(repo: repo, initialLocation: '/projects/9/opportunities'),
    );
    await tester.pumpAndSettle();
    expect(find.text('CURRENT AND RECENT'), findsOneWidget);
    expect(find.text('PAST OPPORTUNITIES'), findsOneWidget);
    expect(find.text('Draft round'), findsOneWidget);
    expect(find.text('Rejected round'), findsOneWidget);
    expect(find.text('Completed round'), findsOneWidget);
    expect(find.text('Archived round'), findsOneWidget);
  });

  testWidgets('terminal-only project keeps all opportunities in Past', (
    tester,
  ) async {
    final repo = _Repo(
      project: _project(<FounderOpportunity>[
        _opp(
          id: 3,
          sequence: 1,
          title: 'Completed',
          status: 'Completed',
          createdAt: DateTime(2026, 8, 10),
        ),
        _opp(
          id: 4,
          sequence: 2,
          title: 'Archived',
          status: 'Archived',
          createdAt: DateTime(2026, 7, 2),
        ),
      ]),
    );
    await tester.pumpWidget(
      _App(repo: repo, initialLocation: '/projects/9/opportunities'),
    );
    await tester.pumpAndSettle();
    expect(find.text('CURRENT AND RECENT'), findsNothing);
    expect(find.text('PAST OPPORTUNITIES'), findsOneWidget);
  });

  testWidgets('zero opportunities has no historical section or create CTA', (
    tester,
  ) async {
    await tester.pumpWidget(
      _App(
        repo: _Repo(project: _project(const [])),
        initialLocation: '/projects/9/opportunities',
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('No opportunities yet'), findsOneWidget);
    expect(find.text('PAST OPPORTUNITIES'), findsNothing);
    expect(find.textContaining('Create'), findsNothing);
  });

  testWidgets('history row opens separately scoped Opportunity detail', (
    tester,
  ) async {
    final repo = _Repo(
      project: _project(<FounderOpportunity>[
        _opp(
          id: 41,
          sequence: 1,
          title: 'Archived expansion',
          status: 'Archived',
          createdAt: DateTime(2026, 8, 10),
        ),
      ]),
    );
    await tester.pumpWidget(
      _App(repo: repo, initialLocation: '/projects/9/opportunities'),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Archived expansion'));
    await tester.pumpAndSettle();
    expect(find.byType(ProjectOpportunityDetailPage), findsOneWidget);
    expect(find.text('Archived expansion'), findsOneWidget);
    expect(find.text('500,000 EGP'), findsOneWidget);
    expect(find.text('Equity'), findsNothing);
  });

  testWidgets('room entry uses Project scoped room and backend authorization', (
    tester,
  ) async {
    final repo = _Repo(project: _project(<FounderOpportunity>[]));
    await tester.pumpWidget(_App(repo: repo, initialLocation: '/projects/9'));
    await tester.pumpAndSettle();
    expect(find.text('Open Project Room'), findsOneWidget);
    await tester.tap(find.text('Open Project Room'));
    await tester.pumpAndSettle();
    expect(find.byType(ProjectRoomPage), findsOneWidget);
    expect(find.text('Project update'), findsOneWidget);
    expect(find.text('Atlas Project'), findsOneWidget);
  });

  testWidgets(
    'room 403 hides entry action and gives controlled access message',
    (tester) async {
      final repo = _Repo(
        project: _project(const []),
        roomError: const ApiError(message: 'Forbidden', statusCode: 403),
      );
      await tester.pumpWidget(_App(repo: repo, initialLocation: '/projects/9'));
      await tester.pumpAndSettle();
      expect(
        find.text('Project Room is unavailable for this account right now.'),
        findsOneWidget,
      );
      expect(find.text('Open Project Room'), findsNothing);
    },
  );

  testWidgets('supports Arabic RTL and long Opportunity titles', (
    tester,
  ) async {
    final longTitle = List<String>.filled(
      8,
      'Regional expansion opportunity',
    ).join(' ');
    await tester.pumpWidget(
      _App(
        repo: _Repo(
          project: _project(<FounderOpportunity>[
            _opp(
              id: 10,
              sequence: 2,
              title: longTitle,
              status: 'Published',
              createdAt: DateTime(2026, 9, 20),
            ),
          ]),
        ),
        initialLocation: '/projects/9/opportunities',
        locale: const Locale('ar'),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('الفرص'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.byType(ProjectOpportunitiesPage))),
      TextDirection.rtl,
    );
    expect(find.text(longTitle), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('archives only after explicit confirmation when server allows it', (
    tester,
  ) async {
    final repo = _Repo(
      project: _project(<FounderOpportunity>[
        _opp(
          id: 21,
          sequence: 1,
          title: 'Archive-ready opportunity',
          status: 'Funding',
          createdAt: DateTime(2026, 9, 20),
        ),
      ], canEdit: true),
      canArchive: true,
    );
    final lifecycleRepository = _LifecycleRepository(
      onArchive: () => repo.canArchive = false,
    );
    await tester.pumpWidget(
      _App(
        repo: repo,
        lifecycleRepository: lifecycleRepository,
        initialLocation: '/projects/9/opportunities/21',
      ),
    );
    await tester.pumpAndSettle();

    final archiveAction = find.widgetWithText(
      OutlinedButton,
      'Archive opportunity',
    );
    expect(archiveAction, findsOneWidget);
    await tester.ensureVisible(archiveAction);
    await tester.pumpAndSettle();
    await tester.tap(archiveAction);
    await tester.pumpAndSettle();
    expect(
      find.text(
        'Archiving cannot be undone. This opportunity will leave active work. Continue only if this is intended.',
      ),
      findsOneWidget,
    );
    expect(lifecycleRepository.archiveCalls, 0);

    await tester.tap(find.widgetWithText(FilledButton, 'Archive opportunity'));
    await tester.pumpAndSettle();
    expect(lifecycleRepository.archiveCalls, 1);
    expect(archiveAction, findsNothing);
    expect(find.text('Opportunity archived.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  for (final status in <int>[403, 404, 503]) {
    testWidgets('Opportunity detail handles HTTP $status', (tester) async {
      await tester.pumpWidget(
        _App(
          repo: _Repo(
            project: _project(const []),
            opportunityError: ApiError(message: 'Failure', statusCode: status),
          ),
          initialLocation: '/projects/9/opportunities/21',
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ProjectOpportunityDetailPage), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }
}

class _LifecycleRepository implements OpportunityFormRepository {
  _LifecycleRepository({required this.onArchive});

  final VoidCallback onArchive;
  int archiveCalls = 0;

  @override
  Future<void> archive(int opportunityId) async {
    archiveCalls++;
    onArchive();
  }

  @override
  Future<OpportunityFormChoices> fetchChoices() async =>
      const OpportunityFormChoices(
        stages: <OpportunityStageChoice>[],
        fundingGoals: <OpportunityGoalChoice>[],
        currencies: <OpportunityCurrencyChoice>[],
      );

  @override
  Future<int> create(Map<String, dynamic> request) async => 1;

  @override
  Future<void> update(int opportunityId, Map<String, dynamic> request) async {}

  @override
  Future<OpportunityPublishQuote> quotePublish() async =>
      const OpportunityPublishQuote(
        creditCost: 0,
        currentBalance: 0,
        hasSufficientCredit: true,
        chargingEnabled: false,
      );

  @override
  Future<void> submitForReview(int opportunityId) async {}

  @override
  Future<void> publish(int opportunityId) async {}

  @override
  Future<void> setCoverImage({
    required int projectId,
    required int opportunityId,
    required List<int> fileBytes,
    required String fileName,
  }) async {}
}

FounderOpportunity _opp({
  required int id,
  required int sequence,
  required String title,
  required String status,
  required DateTime createdAt,
}) => FounderOpportunity(
  id: id,
  projectId: 9,
  sequenceNumber: sequence,
  title: title,
  status: status,
  fundingStatus:
      status == 'Completed' || status == 'Archived' ? 'Closed' : 'Open',
  createdAt: createdAt,
  shortDescription: 'Short description for $title.',
);

FounderProjectDetails _project(
  List<FounderOpportunity> opportunities, {
  bool canEdit = false,
}) => FounderProjectDetails(
  id: 9,
  displayName: 'Atlas Project',
  legalName: null,
  summary: 'Project summary.',
  description: 'Project description.',
  industry: 'Health',
  categoryEn: 'Healthcare',
  categoryAr: 'الرعاية الصحية',
  stage: 'MVP',
  status: 'Active',
  geography: 'Cairo',
  foundedOn: null,
  websiteUrl: null,
  logoUrl: null,
  opportunityCount: opportunities.length,
  opportunities: opportunities,
  createdAt: DateTime(2026, 1, 1),
  updatedAt: DateTime(2026, 9, 22),
  canEdit: canEdit,
);

class _Repo implements ProjectOverviewRepository {
  _Repo({
    required this.project,
    this.opportunityError,
    this.roomError,
    this.canArchive = false,
  });
  final FounderProjectDetails project;
  final Object? opportunityError;
  final Object? roomError;
  bool canArchive;

  @override
  Future<FounderProjectDetails> fetchProject(int projectId) async => project;

  @override
  Future<FounderOpportunityDetail> fetchOpportunity(int opportunityId) async {
    if (opportunityError != null) throw opportunityError!;
    final opportunity = project.opportunities.firstWhere(
      (item) => item.id == opportunityId,
      orElse:
          () => _opp(
            id: opportunityId,
            sequence: 1,
            title: 'Archived expansion',
            status: 'Archived',
            createdAt: DateTime(2026, 8, 10),
          ),
    );
    return FounderOpportunityDetail(
      id: opportunityId,
      projectId:
          opportunity.projectId == 0 ? project.id : opportunity.projectId,
      title: opportunity.title,
      status: opportunity.status,
      fundingStatus: opportunity.fundingStatus,
      sequenceNumber: opportunity.sequenceNumber,
      createdAt: opportunity.createdAt,
      updatedAt: DateTime(2026, 9, 22),
      shortDescription: opportunity.shortDescription,
      fundingTarget: 500000,
      fundingCurrency: 'EGP',
      publicInvestmentTermsSummary: 'Terms approved for public display.',
      canFounderArchive: canArchive,
    );
  }

  @override
  Future<FounderProjectRoom> fetchProjectRoom(int projectId) async {
    if (roomError != null) throw roomError!;
    return FounderProjectRoom(
      projectId: projectId,
      displayName: project.displayName,
      summary: 'Room overview.',
      isFounder: true,
      updates: const <ProjectRoomEntry>[
        ProjectRoomEntry(
          title: 'Project update',
          description: 'Current operations update.',
          createdAt: null,
        ),
      ],
      milestones: const <ProjectRoomEntry>[],
      timeline: const <ProjectRoomEntry>[],
      documents: const <ProjectRoomDocument>[],
      opportunities: const <ProjectRoomOpportunity>[],
    );
  }

  @override
  Future<void> addProjectRoomEntry(
    int projectId,
    Map<String, dynamic> request,
  ) async {}

  @override
  Future<void> completeProjectRoomMilestone(int projectId, int entryId) async {}

  @override
  Future<void> addProjectRoomDocument({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
    required String categoryCode,
    required String documentType,
    required String visibility,
  }) async {}

  @override
  Future<List<int>> fetchProjectRoomDocumentBytes(
    int projectId,
    int documentId, {
    required bool preview,
  }) async => <int>[1];
}

class _FakeFounderChatRepository implements FounderChatRepository {
  _FakeFounderChatRepository({required this.offers});

  final List<FounderNegotiationOffer> offers;

  @override
  Future<List<FounderNegotiationOffer>> fetchDirectOffers(
    int opportunityId,
  ) async => offers;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _App extends StatelessWidget {
  const _App({
    required this.repo,
    required this.initialLocation,
    this.locale = const Locale('en'),
    this.lifecycleRepository,
    this.chatRepository,
  });
  final _Repo repo;
  final String initialLocation;
  final Locale locale;
  final OpportunityFormRepository? lifecycleRepository;
  final FounderChatRepository? chatRepository;

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: initialLocation,
      routes: <RouteBase>[
        GoRoute(
          path: '/projects/:projectId',
          builder:
              (context, state) => ProjectOverviewPage(
                projectId: int.parse(state.pathParameters['projectId']!),
              ),
          routes: <RouteBase>[
            GoRoute(
              path: 'opportunities',
              builder:
                  (context, state) => ProjectOpportunitiesPage(
                    projectId: int.parse(state.pathParameters['projectId']!),
                  ),
              routes: <RouteBase>[
                GoRoute(
                  path: ':opportunityId',
                  builder:
                      (context, state) => ProjectOpportunityDetailPage(
                        projectId: int.parse(
                          state.pathParameters['projectId']!,
                        ),
                        opportunityId: int.parse(
                          state.pathParameters['opportunityId']!,
                        ),
                      ),
                ),
              ],
            ),
            GoRoute(
              path: 'room',
              builder:
                  (context, state) => ProjectRoomPage(
                    projectId: int.parse(state.pathParameters['projectId']!),
                  ),
            ),
          ],
        ),
      ],
    );
    return ProviderScope(
      overrides: <Override>[
        projectOverviewRepositoryProvider.overrideWithValue(repo),
        if (lifecycleRepository != null)
          opportunityFormRepositoryProvider.overrideWithValue(
            lifecycleRepository!,
          ),
        if (chatRepository != null)
          founderChatRepositoryProvider.overrideWithValue(chatRepository!),
      ],
      child: MaterialApp.router(
        locale: locale,
        theme: FopxTheme.founderLight(),
        supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          FopxLocalizationsDelegate(),
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        routerConfig: router,
        builder: (context, child) => Scaffold(body: child),
      ),
    );
  }
}
