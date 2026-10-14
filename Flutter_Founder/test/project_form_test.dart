import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';

import 'package:fopx_founder/features/projects/data/project_management_controller.dart';
import 'package:fopx_founder/features/projects/data/project_models.dart';
import 'package:fopx_founder/features/projects/data/project_overview_controller.dart';
import 'package:fopx_founder/features/projects/presentation/project_form_page.dart';

void main() {
  test(
    'sends Project management requests using the live API contract',
    () async {
      final adapter = _ProjectManagementAdapter();
      final api = FopxApiClient(
        environment: const AppEnvironment(
          apiBaseUrl: 'https://founder.test/api/v1',
        ),
        sessionStore: _EmptySessionStore(),
        httpClientAdapter: adapter,
      );
      final repository = ApiProjectManagementRepository(api);
      final request = ProjectWriteRequest(
        displayName: 'A genuine founder project',
        summary: 'A sufficiently descriptive business summary.',
        description: 'A sufficiently descriptive business description.',
        projectStage: 'MVP',
        foundedOn: '2026-05-07',
        defaultCurrency: 'EGP',
      );

      final lookups = await repository.fetchLookups();
      final projectId = await repository.createProject(request);
      await repository.updateProject(projectId, request);
      final logoUrl = await repository.uploadProjectLogo(
        projectId: projectId,
        fileBytes: _onePixelPng,
        fileName: 'founder-logo.png',
      );
      await repository.transitionProjectStatus(
        projectId,
        const ProjectStatusTransitionRequest(
          targetStatus: 'Active',
          reason: 'Project is ready to operate.',
        ),
      );

      expect(lookups.categories.single.id, 5);
      expect(lookups.stages.single.code, 'MVP');
      expect(lookups.riskLevels.single.code, 'Medium');
      expect(projectId, 73);
      expect(logoUrl, 'https://files.example/project.png');

      final projectPost = adapter.requests.singleWhere(
        (options) =>
            options.uri.path == '/api/v1/projects' && options.method == 'POST',
      );
      expect(projectPost.data, isA<Map>());
      expect(projectPost.data, containsPair('projectStage', 'MVP'));
      expect(projectPost.data, containsPair('foundedOn', '2026-05-07'));
      expect(projectPost.data, containsPair('defaultCurrency', 'EGP'));
      expect(
        adapter.requests.map(
          (options) => '${options.method} ${options.uri.path}',
        ),
        containsAll(<String>[
          'GET /api/v1/categories',
          'GET /api/v1/project-stages',
          'GET /api/v1/risk-levels',
          'PUT /api/v1/projects/73',
          'POST /api/v1/projects/73/status',
        ]),
      );

      final upload = adapter.requests.singleWhere(
        (options) => options.uri.path == '/api/v1/files/upload',
      );
      expect(upload.data, isA<FormData>());
      final formData = upload.data as FormData;
      final uploadFields = Map<String, String>.fromEntries(formData.fields);
      expect(uploadFields, containsPair('categoryCode', 'PROJECTIMAGE'));
      expect(uploadFields, containsPair('projectId', '73'));
      expect(uploadFields, containsPair('entityType', 'Project'));
      expect(uploadFields, containsPair('entityId', '73'));
      expect(formData.files.map((entry) => entry.key), contains('file'));
    },
  );

  test(
    'serializes project requests using the backend DateOnly and field names',
    () {
      final request = ProjectWriteRequest(
        displayName: 'A real founder project',
        summary: 'A sufficiently descriptive business summary.',
        description: 'A sufficiently descriptive business description.',
        projectStage: 'MVP',
        categoryId: 7,
        foundedOn: '2026-05-07',
        logoUrl: 'https://example.test/logo.png',
        defaultCurrency: 'EGP',
      );

      expect(request.toJson(), containsPair('projectStage', 'MVP'));
      expect(request.toJson(), containsPair('foundedOn', '2026-05-07'));
      expect(request.toJson(), containsPair('categoryId', 7));
      expect(
        request.toJson(),
        containsPair('logoUrl', 'https://example.test/logo.png'),
      );
      expect(request.toJson(), containsPair('defaultCurrency', 'EGP'));
    },
  );

  testWidgets(
    'loads real lookup-shaped choices and blocks invalid create locally',
    (tester) async {
      final repository = _FakeProjectManagementRepository();
      await tester.pumpWidget(_Harness(repository: repository));
      await tester.pumpAndSettle();

      expect(find.text('Create project'), findsWidgets);
      expect(find.text('Idea'), findsOneWidget);
      expect(find.text('Not specified'), findsWidgets);

      final saveButton = find.byType(FopxButton);
      await tester.ensureVisible(saveButton);
      await tester.pumpAndSettle();
      await tester.tap(saveButton);
      await tester.pumpAndSettle();

      expect(find.text('This field is required.'), findsWidgets);
      expect(repository.createCalls, 0);
    },
  );

  testWidgets('rejects unsupported website URL schemes before creating', (
    tester,
  ) async {
    final repository = _FakeProjectManagementRepository();
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pumpAndSettle();
    await _fillRequiredProjectFields(tester);
    await tester.enterText(
      _formFieldForLabel('Website'),
      'ftp://founder.example',
    );
    tester.binding.focusManager.primaryFocus?.unfocus();
    await tester.pumpAndSettle();

    await _saveProject(tester);

    expect(
      find.text('Enter a valid URL starting with http:// or https://.'),
      findsOneWidget,
    );
    expect(repository.createCalls, 0);
  });

  testWidgets('supports Arabic RTL and the Founder dark theme', (tester) async {
    final repository = _FakeProjectManagementRepository();
    await tester.pumpWidget(
      _Harness(
        repository: repository,
        locale: const Locale('ar'),
        theme: FopxTheme.founderDark(),
      ),
    );
    await tester.pumpAndSettle();

    final page = tester.element(find.byType(ProjectFormPage));
    expect(find.text('إنشاء مشروع'), findsWidgets);
    expect(find.text('اسم المشروع'), findsOneWidget);
    expect(Directionality.of(page), TextDirection.rtl);
    expect(Theme.of(page).brightness, Brightness.dark);
  });

  testWidgets('retries project-form lookup loading after a temporary error', (
    tester,
  ) async {
    final repository = _FakeProjectManagementRepository(
      lookupFailuresRemaining: 1,
    );
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pumpAndSettle();

    expect(
      find.text('Project overview is unavailable right now'),
      findsOneWidget,
    );
    expect(find.text('Try again'), findsOneWidget);
    expect(repository.lookupCalls, 1);

    await tester.tap(find.text('Try again'));
    await tester.pumpAndSettle();

    expect(find.text('Create project'), findsWidgets);
    expect(find.text('Idea'), findsOneWidget);
    expect(repository.lookupCalls, 2);
  });

  testWidgets('maps backend field validation to the matching form field', (
    tester,
  ) async {
    final repository = _FakeProjectManagementRepository(
      createError: const ApiError(
        message: 'Project validation failed.',
        statusCode: 400,
        errors: <ApiFieldError>[
          ApiFieldError(
            field: 'DisplayName',
            message: 'A project with this name already exists.',
          ),
        ],
      ),
    );
    await tester.pumpWidget(_Harness(repository: repository));
    await tester.pumpAndSettle();

    await tester.enterText(
      _formFieldForLabel('Project name'),
      'Northstar Foods',
    );
    await tester.enterText(
      _formFieldForLabel('Summary'),
      'A sufficiently detailed business summary.',
    );
    await tester.enterText(
      _formFieldForLabel('Description'),
      'A sufficiently detailed business description.',
    );
    tester.binding.focusManager.primaryFocus?.unfocus();
    await tester.pumpAndSettle();

    final saveButton = find.byType(FopxButton);
    await tester.ensureVisible(saveButton);
    await tester.pumpAndSettle();
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(repository.createCalls, 1);
    await tester.ensureVisible(_formFieldForLabel('Project name'));
    await tester.pumpAndSettle();
    expect(
      find.text('A project with this name already exists.'),
      findsOneWidget,
    );
    await tester.ensureVisible(saveButton);
    await tester.pumpAndSettle();
    expect(find.textContaining('Project validation failed.'), findsOneWidget);
  });

  testWidgets('edit form preserves DateOnly and optional project fields', (
    tester,
  ) async {
    final repository = _FakeProjectManagementRepository();
    await tester.pumpWidget(
      _EditHarness(repository: repository, project: _existingProject()),
    );
    await tester.pumpAndSettle();

    expect(
      _fieldWithText(tester, 'Northstar Foods').controller!.text,
      'Northstar Foods',
    );
    expect(
      _fieldWithText(tester, 'Northstar Foods LLC').controller!.text,
      'Northstar Foods LLC',
    );
    expect(_fieldWithText(tester, '2020-04-17').controller!.text, '2020-04-17');
    expect(
      _fieldWithText(
        tester,
        'https://example.test/northstar.png',
      ).controller!.text,
      'https://example.test/northstar.png',
    );

    final saveButton = find.byType(FopxButton);
    await tester.ensureVisible(saveButton);
    await tester.pumpAndSettle();
    await tester.tap(saveButton);
    await tester.pumpAndSettle();

    expect(repository.updatedProjectId, 44);
    expect(repository.updateRequest?.foundedOn, '2020-04-17');
    expect(repository.updateRequest?.legalName, 'Northstar Foods LLC');
    expect(repository.updateRequest?.defaultCurrency, 'EGP');
    expect(
      repository.updateRequest?.logoUrl,
      'https://example.test/northstar.png',
    );
  });

  testWidgets(
    'uploads a selected logo through governed Project image storage',
    (tester) async {
      _installLogoFilePicker();

      final repository = _FakeProjectManagementRepository();
      await tester.pumpWidget(_CreateHarness(repository: repository));
      await tester.pumpAndSettle();
      await tester.enterText(
        _formFieldForLabel('Project name'),
        'Founder sample project',
      );
      await tester.enterText(
        _formFieldForLabel('Summary'),
        'A sufficiently detailed project summary.',
      );
      await tester.enterText(
        _formFieldForLabel('Description'),
        'A sufficiently detailed project description.',
      );
      tester.binding.focusManager.primaryFocus?.unfocus();
      await tester.pumpAndSettle();

      final chooseLogo = find.text('Choose a project logo image');
      await tester.ensureVisible(chooseLogo);
      await tester.pumpAndSettle();
      await tester.tap(chooseLogo);
      await tester.pumpAndSettle();
      expect(find.text('founder-logo.png'), findsOneWidget);

      final saveButton = find.byType(FopxButton);
      await tester.ensureVisible(saveButton);
      await tester.pumpAndSettle();
      await tester.tap(saveButton);
      await tester.pumpAndSettle();

      expect(repository.createdProjectId, 1);
      expect(repository.uploadedProjectId, 1);
      expect(repository.uploadedFileName, 'founder-logo.png');
      expect(repository.uploadedBytes, _onePixelPng);
      expect(repository.updatedProjectId, 1);
      expect(
        repository.updateRequest?.logoUrl,
        'https://files.example/project.png',
      );
      expect(find.text('saved-1'), findsOneWidget);
    },
  );

  testWidgets(
    'logo retry updates the saved project instead of creating twice',
    (tester) async {
      _installLogoFilePicker();

      final repository = _FakeProjectManagementRepository(
        logoUploadFailuresRemaining: 1,
      );
      await tester.pumpWidget(_CreateHarness(repository: repository));
      await tester.pumpAndSettle();
      await _fillRequiredProjectFields(tester);
      await _chooseProjectLogo(tester);
      await _saveProject(tester);

      expect(repository.createCalls, 1);
      expect(find.textContaining('Project details were saved'), findsOneWidget);
      expect(find.text('Save changes'), findsOneWidget);

      await _saveProject(tester);
      expect(repository.createCalls, 1);
      expect(repository.uploadCalls, 2);
      expect(find.text('saved-1'), findsOneWidget);
    },
  );

  testWidgets('logo retry reuses uploaded media when saving its URL fails', (
    tester,
  ) async {
    _installLogoFilePicker();

    final repository = _FakeProjectManagementRepository(
      logoUrlUpdateFailuresRemaining: 1,
    );
    await tester.pumpWidget(_CreateHarness(repository: repository));
    await tester.pumpAndSettle();
    await _fillRequiredProjectFields(tester);
    await _chooseProjectLogo(tester);
    await _saveProject(tester);

    expect(repository.createCalls, 1);
    expect(repository.uploadCalls, 1);
    expect(find.textContaining('Project details were saved'), findsOneWidget);

    await _saveProject(tester);

    expect(repository.createCalls, 1);
    expect(repository.uploadCalls, 1);
    expect(repository.updateCalls, 3);
    expect(
      repository.updateRequest?.logoUrl,
      'https://files.example/project.png',
    );
    expect(find.text('saved-1'), findsOneWidget);
  });
}

Future<void> _fillRequiredProjectFields(WidgetTester tester) async {
  await tester.enterText(
    _formFieldForLabel('Project name'),
    'Founder sample project',
  );
  await tester.enterText(
    _formFieldForLabel('Summary'),
    'A sufficiently detailed project summary.',
  );
  await tester.enterText(
    _formFieldForLabel('Description'),
    'A sufficiently detailed project description.',
  );
  tester.binding.focusManager.primaryFocus?.unfocus();
  await tester.pumpAndSettle();
}

Future<void> _chooseProjectLogo(WidgetTester tester) async {
  final chooseLogo = find.text('Choose a project logo image');
  await tester.ensureVisible(chooseLogo);
  await tester.pumpAndSettle();
  await tester.tap(chooseLogo);
  await tester.pumpAndSettle();
}

Future<void> _saveProject(WidgetTester tester) async {
  final saveButton = find.byType(FopxButton);
  await tester.ensureVisible(saveButton);
  await tester.pumpAndSettle();
  await tester.tap(saveButton);
  await tester.pumpAndSettle();
}

const _onePixelPng = <int>[
  137,
  80,
  78,
  71,
  13,
  10,
  26,
  10,
  0,
  0,
  0,
  13,
  73,
  72,
  68,
  82,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  1,
  8,
  6,
  0,
  0,
  0,
  31,
  21,
  196,
  137,
  0,
  0,
  0,
  13,
  73,
  68,
  65,
  84,
  8,
  215,
  99,
  248,
  207,
  192,
  240,
  31,
  0,
  5,
  0,
  1,
  255,
  137,
  153,
  61,
  29,
  0,
  0,
  0,
  0,
  73,
  69,
  78,
  68,
  174,
  66,
  96,
  130,
];

class _EmptySessionStore extends SessionStore {
  @override
  Future<SessionTokens?> read() async => null;

  @override
  Future<void> save(SessionTokens tokens) async {}

  @override
  Future<void> clear() async {}
}

class _ProjectManagementAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    final path = options.uri.path;
    final payload = switch (path) {
      '/api/v1/categories' => <String, dynamic>{
        'success': true,
        'data': <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 5,
            'code': 'food',
            'nameEn': 'Food',
            'nameAr': 'أغذية',
          },
        ],
      },
      '/api/v1/project-stages' => <String, dynamic>{
        'success': true,
        'data': <Map<String, dynamic>>[
          <String, dynamic>{
            'code': 'MVP',
            'nameEn': 'MVP',
            'nameAr': 'منتج أولي',
          },
        ],
      },
      '/api/v1/risk-levels' => <String, dynamic>{
        'success': true,
        'data': <Map<String, dynamic>>[
          <String, dynamic>{
            'code': 'Medium',
            'nameEn': 'Medium',
            'nameAr': 'متوسط',
          },
        ],
      },
      '/api/v1/projects' when options.method == 'POST' => <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{'id': 73},
      },
      '/api/v1/files/upload' => <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{
          'fileKey': 'PROJECTIMAGE/project.png',
          'category': 'PROJECTIMAGE',
          'url': 'https://files.example/project.png',
        },
      },
      _ => <String, dynamic>{'success': true, 'data': <String, dynamic>{}},
    };
    final statusCode =
        path == '/api/v1/projects' && options.method == 'POST' ? 201 : 200;
    return ResponseBody.fromString(
      jsonEncode(payload),
      statusCode,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

TextFormField _fieldWithText(WidgetTester tester, String text) => tester
    .widgetList<TextFormField>(find.byType(TextFormField))
    .firstWhere((field) => field.controller?.text == text);

Finder _formFieldForLabel(String label) =>
    find.ancestor(of: find.text(label), matching: find.byType(TextFormField));

FounderProjectDetails _existingProject() => FounderProjectDetails(
  id: 44,
  displayName: 'Northstar Foods',
  legalName: 'Northstar Foods LLC',
  summary: 'A sufficiently detailed summary of this project.',
  description: 'A sufficiently detailed description of this real project.',
  industry: 'Food manufacturing',
  categoryEn: 'Food',
  categoryAr: 'أغذية',
  categoryId: 5,
  stage: 'MVP',
  status: 'Active',
  geography: 'Cairo',
  foundedOn: DateTime(2020, 4, 17),
  websiteUrl: 'https://northstar.example',
  logoUrl: 'https://example.test/northstar.png',
  teamDescription: 'Experienced founding team.',
  businessModel: 'B2B distribution.',
  riskLevel: 'Medium',
  riskDisclosure: 'Seasonal supply risk.',
  defaultCurrency: 'EGP',
  opportunityCount: 1,
  opportunities: const <FounderOpportunity>[],
  createdAt: DateTime(2020),
  updatedAt: DateTime(2026),
  canEdit: true,
);

class _FakeProjectManagementRepository implements ProjectManagementRepository {
  _FakeProjectManagementRepository({
    this.createError,
    this.logoUploadFailuresRemaining = 0,
    this.logoUrlUpdateFailuresRemaining = 0,
    this.lookupFailuresRemaining = 0,
  });

  final ApiError? createError;
  int logoUploadFailuresRemaining;
  int logoUrlUpdateFailuresRemaining;
  int lookupFailuresRemaining;
  int lookupCalls = 0;
  int createCalls = 0;
  int updateCalls = 0;
  int uploadCalls = 0;
  int? createdProjectId;
  int? updatedProjectId;
  int? uploadedProjectId;
  String? uploadedFileName;
  List<int>? uploadedBytes;
  ProjectWriteRequest? updateRequest;

  @override
  Future<ProjectManagementLookups> fetchLookups() async {
    lookupCalls += 1;
    if (lookupFailuresRemaining > 0) {
      lookupFailuresRemaining -= 1;
      throw const ApiError(
        message: 'Project lookups are temporarily unavailable.',
        statusCode: 503,
      );
    }
    return const ProjectManagementLookups(
      categories: <ProjectChoice>[
        ProjectChoice(id: 5, code: 'food', nameEn: 'Food', nameAr: 'أغذية'),
      ],
      stages: <ProjectChoice>[
        ProjectChoice(code: 'Idea', nameEn: 'Idea', nameAr: 'فكرة'),
        ProjectChoice(code: 'MVP', nameEn: 'MVP', nameAr: 'منتج أولي'),
      ],
      riskLevels: <ProjectChoice>[
        ProjectChoice(code: 'Medium', nameEn: 'Medium', nameAr: 'متوسط'),
      ],
    );
  }

  @override
  Future<int> createProject(ProjectWriteRequest request) async {
    createCalls += 1;
    if (createError != null) throw createError!;
    return createdProjectId = 1;
  }

  @override
  Future<void> updateProject(int projectId, ProjectWriteRequest request) async {
    updateCalls += 1;
    updatedProjectId = projectId;
    updateRequest = request;
    if (request.logoUrl == 'https://files.example/project.png' &&
        logoUrlUpdateFailuresRemaining > 0) {
      logoUrlUpdateFailuresRemaining -= 1;
      throw const ApiError(message: 'temporary logo URL save failure');
    }
  }

  @override
  Future<String> uploadProjectLogo({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
  }) async {
    uploadCalls += 1;
    if (logoUploadFailuresRemaining > 0) {
      logoUploadFailuresRemaining -= 1;
      throw const ApiError(message: 'temporary upload failure');
    }
    uploadedProjectId = projectId;
    uploadedBytes = fileBytes;
    uploadedFileName = fileName;
    return 'https://files.example/project.png';
  }

  @override
  Future<void> transitionProjectStatus(
    int projectId,
    ProjectStatusTransitionRequest request,
  ) async {}
}

class _EditHarness extends StatelessWidget {
  const _EditHarness({required this.repository, required this.project});

  final ProjectManagementRepository repository;
  final FounderProjectDetails project;

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: '/edit',
      routes: <RouteBase>[
        GoRoute(
          path: '/edit',
          builder: (_, _) => const ProjectFormPage(projectId: 44),
        ),
        GoRoute(
          path: '/projects/:id',
          builder: (_, state) => Text('saved-${state.pathParameters['id']}'),
        ),
      ],
    );
    return ProviderScope(
      overrides: <Override>[
        projectManagementRepositoryProvider.overrideWithValue(repository),
        projectOverviewProvider.overrideWith((ref, projectId) async => project),
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

void _installLogoFilePicker() {
  FilePicker.platform = _LogoFilePicker();
}

class _LogoFilePicker extends FilePicker {
  @override
  Future<FilePickerResult?> pickFiles({
    String? dialogTitle,
    String? initialDirectory,
    FileType type = FileType.any,
    List<String>? allowedExtensions,
    Function(FilePickerStatus)? onFileLoading,
    bool allowCompression = true,
    int compressionQuality = 30,
    bool allowMultiple = false,
    bool withData = false,
    bool withReadStream = false,
    bool lockParentWindow = false,
    bool readSequential = false,
  }) async => FilePickerResult(<PlatformFile>[
    PlatformFile(
      name: 'founder-logo.png',
      size: _onePixelPng.length,
      bytes: Uint8List.fromList(_onePixelPng),
    ),
  ]);
}

class _Harness extends StatelessWidget {
  const _Harness({required this.repository, this.locale, this.theme});

  final ProjectManagementRepository repository;
  final Locale? locale;
  final ThemeData? theme;

  @override
  Widget build(BuildContext context) => ProviderScope(
    overrides: <Override>[
      projectManagementRepositoryProvider.overrideWithValue(repository),
    ],
    child: MaterialApp(
      locale: locale,
      theme: theme ?? FopxTheme.founderLight(),
      supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
      localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
        FopxLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const Scaffold(body: ProjectFormPage()),
    ),
  );
}

class _CreateHarness extends StatelessWidget {
  const _CreateHarness({required this.repository});

  final ProjectManagementRepository repository;

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: '/create',
      routes: <RouteBase>[
        GoRoute(path: '/create', builder: (_, _) => const ProjectFormPage()),
        GoRoute(
          path: '/projects/:id',
          builder: (_, state) => Text('saved-${state.pathParameters['id']}'),
        ),
      ],
    );
    return ProviderScope(
      overrides: <Override>[
        projectManagementRepositoryProvider.overrideWithValue(repository),
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
