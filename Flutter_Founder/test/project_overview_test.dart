import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';

import 'package:fopx_founder/features/projects/data/project_models.dart';
import 'package:fopx_founder/features/projects/data/project_management_controller.dart';
import 'package:fopx_founder/features/projects/data/project_overview_controller.dart';
import 'package:fopx_founder/features/projects/data/projects_controller.dart';
import 'package:fopx_founder/features/projects/presentation/project_overview_page.dart';
import 'package:fopx_founder/features/projects/presentation/projects_page.dart';

void main() {
  test('parses the authoritative Project detail contract', () {
    final project = FounderProjectDetails.fromJson(<String, dynamic>{
      'id': 12,
      'displayName': 'Atlas Labs',
      'legalName': 'Atlas Labs LLC',
      'summary': 'A real business context.',
      'description': 'A fuller business description.',
      'industry': 'Technology',
      'projectStage': 'MVP',
      'status': 'Active',
      'canEdit': true,
      'availableStatusTransitions': <String>['Paused', 'Completed'],
      'geography': 'Cairo',
      'foundedOn': '2022-05-01',
      'websiteUrl': 'https://atlas.example',
      'category': <String, dynamic>{'nameEn': 'Software', 'nameAr': 'برمجيات'},
      'opportunityCount': 2,
      'opportunities': <Map<String, dynamic>>[
        <String, dynamic>{
          'title': 'Seed round',
          'status': 'Funding',
          'fundingStatus': 'Open',
        },
        <String, dynamic>{
          'title': 'Closed round',
          'status': 'Completed',
          'fundingStatus': 'Closed',
        },
      ],
      'createdAt': '2026-01-01T00:00:00Z',
      'updatedAt': '2026-09-22T08:00:00Z',
    });

    expect(project.id, 12);
    expect(project.description, 'A fuller business description.');
    expect(project.categoryEn, 'Software');
    expect(project.foundedOn, DateTime(2022, 5, 1));
    expect(project.activeOpportunityCount, 1);
    expect(project.opportunities.first.title, 'Seed round');
    expect(project.canEdit, isTrue);
    expect(project.availableStatusTransitions, <String>['Paused', 'Completed']);
  });

  testWidgets(
    'loads a populated overview without exposing opportunity finance',
    (tester) async {
      await tester.pumpWidget(_Harness(repository: _FakeOverviewRepository()));
      await tester.pumpAndSettle();

      expect(find.text('Atlas Labs'), findsOneWidget);
      expect(find.text('MVP'), findsOneWidget);
      expect(find.text('Technology'), findsOneWidget);
      expect(find.text('Software'), findsOneWidget);
      expect(find.text('A fuller business description.'), findsOneWidget);
      expect(find.text('Seed round'), findsOneWidget);
      expect(find.text('Funding'), findsOneWidget);
      expect(find.text('Funding target'), findsNothing);
      expect(find.text('100000'), findsNothing);
    },
  );

  testWidgets('omits unavailable optional facts cleanly', (tester) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeOverviewRepository(
          project: _project(
            industry: null,
            categoryEn: null,
            categoryAr: null,
            geography: null,
            includeFounded: false,
            websiteUrl: null,
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Industry'), findsNothing);
    expect(find.text('Category'), findsNothing);
    expect(find.text('Founded'), findsNothing);
    expect(find.text('Location'), findsNothing);
    expect(find.text('Website'), findsNothing);
  });

  testWidgets('keeps long identity and description readable', (tester) async {
    final project = _project(
      displayName:
          'A very long founder project name for regional logistics expansion',
      description: List<String>.filled(
        12,
        'This is a long authoritative description that remains readable.',
      ).join(' '),
    );
    await tester.pumpWidget(
      _Harness(repository: _FakeOverviewRepository(project: project)),
    );
    await tester.pumpAndSettle();

    expect(find.text(project.displayName), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('renders the zero-opportunity state without a CTA', (
    tester,
  ) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeOverviewRepository(
          project: _project(opportunityCount: 0, opportunities: const []),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No opportunities yet'), findsOneWidget);
    expect(find.text('Create opportunity'), findsNothing);
  });

  testWidgets('shows only backend-provided project status actions', (
    tester,
  ) async {
    final management = _FakeProjectManagementRepository();
    await tester.pumpWidget(
      _Harness(
        repository: _FakeOverviewRepository(
          project: _project(
            availableStatusTransitions: const <String>['Paused'],
          ),
        ),
        managementRepository: management,
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Project status actions'));
    await tester.pumpAndSettle();
    expect(find.text('Paused'), findsOneWidget);
    expect(find.text('Completed'), findsNothing);

    await tester.tap(find.text('Paused'));
    await tester.pumpAndSettle();
    expect(management.transitions, hasLength(1));
    expect(management.transitions.single.targetStatus, 'Paused');
  });

  testWidgets('requires and submits a reason for the archive transition', (
    tester,
  ) async {
    final management = _FakeProjectManagementRepository();
    await tester.pumpWidget(
      _Harness(
        repository: _FakeOverviewRepository(
          project: _project(
            availableStatusTransitions: const <String>['Archived'],
          ),
        ),
        managementRepository: management,
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Project status actions'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Archive project'));
    await tester.pumpAndSettle();

    final archiveButton = find.widgetWithText(TextButton, 'Archive project');
    expect(find.text('Archive this project?'), findsOneWidget);
    expect(tester.widget<TextButton>(archiveButton).onPressed, isNull);
    expect(management.transitions, isEmpty);

    await tester.enterText(
      find.byType(TextField),
      'Project is no longer operating.',
    );
    await tester.pumpAndSettle();
    expect(tester.widget<TextButton>(archiveButton).onPressed, isNotNull);
    await tester.tap(archiveButton);
    await tester.pumpAndSettle();

    expect(management.transitions, hasLength(1));
    expect(management.transitions.single.targetStatus, 'Archived');
    expect(
      management.transitions.single.reason,
      'Project is no longer operating.',
    );
  });

  testWidgets('supports loading and retryable network error states', (
    tester,
  ) async {
    final pending = Completer<FounderProjectDetails>();
    final repository = _FakeOverviewRepository(pending: pending.future);
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pump();
    expect(find.byType(FopxLoadingState), findsWidgets);

    pending.completeError(
      const ApiError(message: 'Backend unavailable', statusCode: 503),
    );
    await tester.pumpAndSettle();
    expect(find.text('Backend unavailable'), findsOneWidget);
    expect(find.text('Try again'), findsOneWidget);
  });

  testWidgets('renders controlled 403 state without logout', (tester) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeOverviewRepository(
          error: const ApiError(
            message: 'Project Details require approved participation.',
            statusCode: 403,
            code: 'PROJECT_VIEW_FORBIDDEN',
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Project access is restricted'), findsOneWidget);
  });

  testWidgets('renders controlled 404 state', (tester) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeOverviewRepository(
          error: const ApiError(
            message: 'Project was not found.',
            statusCode: 404,
            code: 'PROJECT_NOT_FOUND',
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Project not found'), findsOneWidget);
  });

  testWidgets('supports Arabic RTL presentation', (tester) async {
    await tester.pumpWidget(
      _Harness(
        locale: const Locale('ar'),
        repository: _FakeOverviewRepository(
          project: _project(displayName: 'مشروعي'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('مشروعي'), findsOneWidget);
    expect(find.text('عن المشروع'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.byType(ProjectOverviewPage))),
      TextDirection.rtl,
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('opens the overview route from a Project entry', (tester) async {
    final router = GoRouter(
      initialLocation: '/projects',
      routes: <RouteBase>[
        GoRoute(
          path: '/projects',
          builder: (context, state) => const ProjectsPage(),
          routes: <RouteBase>[
            GoRoute(
              path: ':projectId',
              builder:
                  (context, state) => ProjectOverviewPage(
                    projectId: int.parse(state.pathParameters['projectId']!),
                  ),
            ),
          ],
        ),
      ],
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          projectsRepositoryProvider.overrideWithValue(
            _FakeProjectsRepository(),
          ),
          projectOverviewRepositoryProvider.overrideWithValue(
            _FakeOverviewRepository(),
          ),
        ],
        child: MaterialApp.router(
          routerConfig: router,
          theme: FopxTheme.founderLight(),
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            FopxLocalizationsDelegate(),
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
          builder: (context, child) => Scaffold(body: child),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Atlas Labs'));
    await tester.pumpAndSettle();
    expect(find.byType(ProjectOverviewPage), findsOneWidget);
    expect(find.text('A fuller business description.'), findsOneWidget);
  });
}

FounderProjectDetails _project({
  String displayName = 'Atlas Labs',
  String description = 'A fuller business description.',
  String? industry = 'Technology',
  String? categoryEn = 'Software',
  String? categoryAr = 'برمجيات',
  String? geography = 'Cairo',
  DateTime? foundedOn,
  bool includeFounded = true,
  String? websiteUrl = 'https://atlas.example',
  int opportunityCount = 2,
  List<FounderOpportunity> opportunities = const <FounderOpportunity>[
    FounderOpportunity(
      title: 'Seed round',
      status: 'Funding',
      fundingStatus: 'Open',
    ),
    FounderOpportunity(
      title: 'Closed round',
      status: 'Completed',
      fundingStatus: 'Closed',
    ),
  ],
  List<String> availableStatusTransitions = const <String>[],
}) => FounderProjectDetails(
  id: 1,
  displayName: displayName,
  legalName: 'Atlas Labs LLC',
  summary: 'A real business context.',
  description: description,
  industry: industry,
  categoryEn: categoryEn,
  categoryAr: categoryAr,
  stage: 'MVP',
  status: 'Active',
  geography: geography,
  foundedOn: includeFounded ? foundedOn ?? DateTime(2022, 5, 1) : null,
  websiteUrl: websiteUrl,
  logoUrl: null,
  opportunityCount: opportunityCount,
  opportunities: opportunities,
  createdAt: DateTime(2026, 1, 1),
  updatedAt: DateTime(2026, 9, 22),
  canEdit: true,
  availableStatusTransitions: availableStatusTransitions,
);

class _FakeProjectManagementRepository implements ProjectManagementRepository {
  final List<ProjectStatusTransitionRequest> transitions =
      <ProjectStatusTransitionRequest>[];

  @override
  Future<ProjectManagementLookups> fetchLookups() async =>
      const ProjectManagementLookups(
        categories: <ProjectChoice>[],
        stages: <ProjectChoice>[],
        riskLevels: <ProjectChoice>[],
      );

  @override
  Future<int> createProject(ProjectWriteRequest request) async => 1;

  @override
  Future<void> updateProject(
    int projectId,
    ProjectWriteRequest request,
  ) async {}

  @override
  Future<String> uploadProjectLogo({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
  }) async => 'https://example.test/project.png';

  @override
  Future<void> transitionProjectStatus(
    int projectId,
    ProjectStatusTransitionRequest request,
  ) async {
    transitions.add(request);
  }
}

class _FakeOverviewRepository implements ProjectOverviewRepository {
  _FakeOverviewRepository({this.project, this.error, this.pending});

  final FounderProjectDetails? project;
  final Object? error;
  final Future<FounderProjectDetails>? pending;

  @override
  Future<FounderProjectDetails> fetchProject(int projectId) async {
    if (pending != null) return pending!;
    if (error != null) throw error!;
    return project ?? _project();
  }

  @override
  Future<FounderOpportunityDetail> fetchOpportunity(int opportunityId) async =>
      FounderOpportunityDetail(
        id: opportunityId,
        projectId: 1,
        title: 'Seed round',
        status: 'Funding',
        fundingStatus: 'Open',
      );

  @override
  Future<FounderProjectRoom> fetchProjectRoom(int projectId) async =>
      FounderProjectRoom(
        projectId: projectId,
        displayName: 'Atlas Labs',
        summary: '',
        isFounder: true,
        updates: const <ProjectRoomEntry>[],
        milestones: const <ProjectRoomEntry>[],
        timeline: const <ProjectRoomEntry>[],
        documents: const <ProjectRoomDocument>[],
        opportunities: const <ProjectRoomOpportunity>[],
      );

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

class _FakeProjectsRepository implements ProjectsRepository {
  @override
  Future<List<FounderProject>> fetchProjects() async => <FounderProject>[
    FounderProject(
      id: 1,
      displayName: 'Atlas Labs',
      summary: 'A real business context.',
      industry: 'Technology',
      categoryEn: 'Software',
      categoryAr: 'برمجيات',
      stage: 'MVP',
      status: 'Active',
      opportunityCount: 2,
      opportunities: const <FounderOpportunity>[],
      updatedAt: DateTime(2026, 9, 22),
      logoUrl: null,
    ),
  ];
}

class _Harness extends StatelessWidget {
  const _Harness({
    required this.repository,
    this.managementRepository,
    this.locale = const Locale('en'),
  });

  final ProjectOverviewRepository repository;
  final ProjectManagementRepository? managementRepository;
  final Locale locale;

  @override
  Widget build(BuildContext context) {
    final direction =
        locale.languageCode == 'ar' ? TextDirection.rtl : TextDirection.ltr;
    return ProviderScope(
      overrides: <Override>[
        projectOverviewRepositoryProvider.overrideWithValue(repository),
        if (managementRepository != null)
          projectManagementRepositoryProvider.overrideWithValue(
            managementRepository!,
          ),
      ],
      child: MaterialApp(
        locale: locale,
        theme: FopxTheme.founderLight(),
        supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          FopxLocalizationsDelegate(),
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: Directionality(
          textDirection: direction,
          child: const Scaffold(body: ProjectOverviewPage(projectId: 1)),
        ),
      ),
    );
  }
}
