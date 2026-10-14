import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';

import 'package:fopx_founder/features/projects/data/project_models.dart';
import 'package:fopx_founder/features/projects/data/projects_controller.dart';
import 'package:fopx_founder/features/projects/presentation/projects_page.dart';

void main() {
  test(
    'parses the authoritative project list and derives active opportunity context',
    () {
      final projects = FounderProject.listFromResponse(<String, dynamic>{
        'success': true,
        'data': <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 12,
            'displayName': 'Atlas Labs',
            'summary': 'A real business context.',
            'industry': 'Technology',
            'projectStage': 'Startup',
            'status': 'Paused',
            'opportunityCount': 3,
            'updatedAt': '2026-09-22T08:00:00Z',
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
          },
        ],
      });

      expect(projects, hasLength(1));
      expect(projects.single.id, 12);
      expect(projects.single.stage, 'Startup');
      expect(projects.single.status, 'Paused');
      expect(projects.single.totalOpportunityCount, 3);
      expect(projects.single.activeOpportunityCount, 1);
      expect(projects.single.isActive, isTrue);
    },
  );

  testWidgets('renders a loading structure while the list is pending', (
    tester,
  ) async {
    final completer = Completer<List<FounderProject>>();
    final repository = _FakeProjectsRepository(pending: completer.future);
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pump();

    expect(find.byType(FopxLoadingState), findsWidgets);
    completer.complete(const <FounderProject>[]);
    await tester.pumpAndSettle();
  });

  testWidgets('renders populated projects as editorial portfolio entries', (
    tester,
  ) async {
    final repository = _FakeProjectsRepository(
      projects: <FounderProject>[_project()],
    );
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pumpAndSettle();

    expect(find.text('Atlas Labs'), findsOneWidget);
    expect(find.text('1 active opportunity'), findsOneWidget);
    expect(find.text('Active'), findsOneWidget);
    expect(find.text('Startup'), findsOneWidget);
    expect(find.text('Technology'), findsOneWidget);
    expect(find.text('Software'), findsOneWidget);
    expect(find.text('01'), findsOneWidget);
    expect(find.text('Total projects'), findsNothing);
    expect(find.byType(LinearProgressIndicator), findsNothing);
  });

  testWidgets(
    'keeps long project names readable without artificial truncation',
    (tester) async {
      const name =
          'A very long founder project name for regional logistics expansion';
      final repository = _FakeProjectsRepository(
        projects: <FounderProject>[_project(displayName: name)],
      );
      await tester.pumpWidget(_Harness(repository: repository));
      await tester.pumpAndSettle();

      expect(find.text(name), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'renders the purposeful empty state with the supported create CTA',
    (tester) async {
      final repository = _FakeProjectsRepository(
        projects: const <FounderProject>[],
      );
      await tester.pumpWidget(_Harness(repository: repository));
      await tester.pumpAndSettle();

      expect(find.text('Start with your first project'), findsOneWidget);
      expect(find.text('Create project'), findsOneWidget);
    },
  );

  testWidgets('renders an error and retries the authoritative request', (
    tester,
  ) async {
    final repository = _FakeProjectsRepository(
      error: const ApiError(message: 'Backend unavailable', statusCode: 503),
      retryProjects: <FounderProject>[_project()],
    );
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pumpAndSettle();

    expect(find.text('Projects are unavailable right now'), findsOneWidget);
    await tester.tap(find.text('Try again'));
    await tester.pumpAndSettle();

    expect(find.text('Atlas Labs'), findsOneWidget);
    expect(repository.calls, 2);
  });

  testWidgets('supports Arabic RTL project presentation', (tester) async {
    final repository = _FakeProjectsRepository(
      projects: <FounderProject>[_project(displayName: 'مشروعي')],
    );
    await tester.pumpWidget(
      _Harness(repository: repository, locale: const Locale('ar')),
    );
    await tester.pumpAndSettle();

    expect(find.text('المشاريع'), findsOneWidget);
    expect(find.text('مشروعي'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.byType(ProjectsPage))),
      TextDirection.rtl,
    );
    expect(tester.takeException(), isNull);
  });
}

FounderProject _project({String displayName = 'Atlas Labs'}) => FounderProject(
  id: 1,
  displayName: displayName,
  summary: 'A business platform for growing teams.',
  industry: 'Technology',
  categoryEn: 'Software',
  categoryAr: 'برمجيات',
  stage: 'Startup',
  status: 'Active',
  opportunityCount: 2,
  opportunities: const <FounderOpportunity>[
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
  updatedAt: DateTime.utc(2026, 9, 22),
  logoUrl: null,
);

class _FakeProjectsRepository implements ProjectsRepository {
  _FakeProjectsRepository({
    this.projects,
    this.error,
    this.pending,
    this.retryProjects,
  });

  final List<FounderProject>? projects;
  final Object? error;
  final Future<List<FounderProject>>? pending;
  final List<FounderProject>? retryProjects;
  int calls = 0;

  @override
  Future<List<FounderProject>> fetchProjects() async {
    calls += 1;
    if (calls == 1 && pending != null) return pending!;
    if (calls == 1 && error != null) throw error!;
    return retryProjects ?? projects ?? const <FounderProject>[];
  }
}

class _Harness extends StatelessWidget {
  const _Harness({required this.repository, this.locale = const Locale('en')});

  final ProjectsRepository repository;
  final Locale locale;

  @override
  Widget build(BuildContext context) {
    final direction =
        locale.languageCode == 'ar' ? TextDirection.rtl : TextDirection.ltr;
    return ProviderScope(
      overrides: <Override>[
        projectsRepositoryProvider.overrideWithValue(repository),
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
          child: const Scaffold(body: ProjectsPage()),
        ),
      ),
    );
  }
}
