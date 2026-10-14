import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';

import 'package:fopx_founder/features/projects/data/project_models.dart';
import 'package:fopx_founder/features/projects/data/project_overview_controller.dart';
import 'package:fopx_founder/features/projects/presentation/project_room_page.dart';

void main() {
  testWidgets('founder can add a visible Project Room update', (tester) async {
    final repository = _RoomRepository(isFounder: true);
    await _pumpRoom(tester, repository);

    await tester.tap(find.text('Add update'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Title'),
      'Hiring',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Description (optional)'),
      'The engineering team is growing.',
    );
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(repository.addedEntry?['entryType'], 'Update');
    expect(repository.addedEntry?['title'], 'Hiring');
    expect(repository.addedEntry?['isInvestorVisible'], isTrue);
  });

  testWidgets('founder completes a milestone only after confirmation', (
    tester,
  ) async {
    final repository = _RoomRepository(
      isFounder: true,
      milestones: const <ProjectRoomEntry>[
        ProjectRoomEntry(
          id: 42,
          entryType: 'Milestone',
          title: 'Launch pilot',
          description: null,
          createdAt: null,
        ),
      ],
    );
    await _pumpRoom(tester, repository);

    await tester.tap(find.text('Mark complete'));
    await tester.pumpAndSettle();
    expect(repository.completedMilestone, isNull);
    await tester.tap(find.text('Mark complete').last);
    await tester.pumpAndSettle();

    expect(repository.completedMilestone, 42);
  });

  testWidgets('investor view does not expose founder room mutations', (
    tester,
  ) async {
    await _pumpRoom(tester, _RoomRepository(isFounder: false));

    expect(find.text('Add update'), findsNothing);
    expect(find.text('Add milestone'), findsNothing);
    expect(find.text('Mark complete'), findsNothing);
  });

  testWidgets(
    'Project Room timeline renders server event data, not local state',
    (tester) async {
      await _pumpRoom(
        tester,
        _RoomRepository(
          isFounder: true,
          timeline: const <ProjectRoomEntry>[
            ProjectRoomEntry(
              id: -1,
              entryType: 'Activity',
              eventType: 'OpportunityCreated',
              title: 'OpportunityCreated',
              description: null,
              createdAt: null,
            ),
          ],
        ),
      );

      expect(find.text('Opportunity created'), findsOneWidget);
      expect(find.text('OpportunityCreated'), findsNothing);
    },
  );

  testWidgets('founder can preview a governed text document from the API', (
    tester,
  ) async {
    final repository = _RoomRepository(
      isFounder: true,
      documents: const <ProjectRoomDocument>[
        ProjectRoomDocument(
          id: 19,
          fileName: 'summary.txt',
          documentType: 'Project summary',
          category: 'GENERAL',
          mimeType: 'text/plain',
          fileSize: 4,
          visibility: 'ProjectMembers',
          canDownload: true,
          createdAt: null,
        ),
      ],
    );
    await _pumpRoom(tester, repository);

    await tester.tap(find.byTooltip('Preview'));
    await tester.pumpAndSettle();

    expect(repository.previewedDocument, 19);
    expect(find.text('Safe'), findsOneWidget);
  });
}

Future<void> _pumpRoom(
  WidgetTester tester,
  ProjectOverviewRepository repository,
) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: <Override>[
        projectOverviewRepositoryProvider.overrideWithValue(repository),
      ],
      child: MaterialApp(
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          FopxLocalizationsDelegate(),
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
        home: const Scaffold(body: ProjectRoomPage(projectId: 1)),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

class _RoomRepository implements ProjectOverviewRepository {
  _RoomRepository({
    required this.isFounder,
    this.milestones = const <ProjectRoomEntry>[],
    this.timeline = const <ProjectRoomEntry>[],
    this.documents = const <ProjectRoomDocument>[],
  });

  final bool isFounder;
  final List<ProjectRoomEntry> milestones;
  final List<ProjectRoomEntry> timeline;
  final List<ProjectRoomDocument> documents;
  Map<String, dynamic>? addedEntry;
  int? completedMilestone;
  int? previewedDocument;

  @override
  Future<FounderProjectDetails> fetchProject(int projectId) async =>
      throw UnimplementedError();

  @override
  Future<FounderOpportunityDetail> fetchOpportunity(int opportunityId) async =>
      throw UnimplementedError();

  @override
  Future<FounderProjectRoom> fetchProjectRoom(int projectId) async =>
      FounderProjectRoom(
        projectId: projectId,
        displayName: 'Test Project',
        summary: '',
        isFounder: isFounder,
        updates: const <ProjectRoomEntry>[],
        milestones: milestones,
        timeline: timeline.isEmpty ? milestones : timeline,
        documents: documents,
        opportunities: const <ProjectRoomOpportunity>[],
      );

  @override
  Future<void> addProjectRoomEntry(
    int projectId,
    Map<String, dynamic> request,
  ) async {
    addedEntry = request;
  }

  @override
  Future<void> completeProjectRoomMilestone(int projectId, int entryId) async {
    completedMilestone = entryId;
  }

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
  }) async {
    if (preview) previewedDocument = documentId;
    return <int>[83, 97, 102, 101];
  }
}
