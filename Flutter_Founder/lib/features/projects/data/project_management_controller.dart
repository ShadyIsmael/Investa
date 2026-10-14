import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

class ProjectChoice {
  const ProjectChoice({
    required this.code,
    required this.nameEn,
    required this.nameAr,
    this.id,
  });

  final int? id;
  final String code;
  final String nameEn;
  final String nameAr;

  factory ProjectChoice.fromJson(Map<String, dynamic> json) => ProjectChoice(
    id: json['id'] is num ? (json['id'] as num).toInt() : null,
    code: json['code']?.toString() ?? '',
    nameEn: json['nameEn']?.toString() ?? json['code']?.toString() ?? '',
    nameAr: json['nameAr']?.toString() ?? json['nameEn']?.toString() ?? '',
  );

  String labelFor(String languageCode) =>
      languageCode == 'ar' && nameAr.isNotEmpty ? nameAr : nameEn;
}

class ProjectManagementLookups {
  const ProjectManagementLookups({
    required this.categories,
    required this.stages,
    required this.riskLevels,
  });

  final List<ProjectChoice> categories;
  final List<ProjectChoice> stages;
  final List<ProjectChoice> riskLevels;
}

class ProjectWriteRequest {
  const ProjectWriteRequest({
    required this.displayName,
    required this.summary,
    required this.description,
    required this.projectStage,
    this.legalName,
    this.categoryId,
    this.industry,
    this.geography,
    this.foundedOn,
    this.websiteUrl,
    this.logoUrl,
    this.teamDescription,
    this.businessModel,
    this.riskLevel,
    this.riskDisclosure,
    this.defaultCurrency,
  });

  final String displayName;
  final String? legalName;
  final String summary;
  final String description;
  final int? categoryId;
  final String? industry;
  final String projectStage;
  final String? geography;
  final String? foundedOn;
  final String? websiteUrl;
  final String? logoUrl;
  final String? teamDescription;
  final String? businessModel;
  final String? riskLevel;
  final String? riskDisclosure;
  final String? defaultCurrency;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'displayName': displayName,
    'legalName': legalName,
    'summary': summary,
    'description': description,
    'categoryId': categoryId,
    'industry': industry,
    'projectStage': projectStage,
    'geography': geography,
    'foundedOn': foundedOn,
    'websiteUrl': websiteUrl,
    'logoUrl': logoUrl,
    'teamDescription': teamDescription,
    'businessModel': businessModel,
    'riskLevel': riskLevel,
    'riskDisclosure': riskDisclosure,
    'defaultCurrency': defaultCurrency,
  };
}

class ProjectStatusTransitionRequest {
  const ProjectStatusTransitionRequest({
    required this.targetStatus,
    this.reason,
  });

  final String targetStatus;
  final String? reason;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'targetStatus': targetStatus,
    'reason': reason,
  };
}

abstract interface class ProjectManagementRepository {
  Future<ProjectManagementLookups> fetchLookups();
  Future<int> createProject(ProjectWriteRequest request);
  Future<void> updateProject(int projectId, ProjectWriteRequest request);
  Future<String> uploadProjectLogo({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
  });
  Future<void> transitionProjectStatus(
    int projectId,
    ProjectStatusTransitionRequest request,
  );
}

class ApiProjectManagementRepository implements ProjectManagementRepository {
  const ApiProjectManagementRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<ProjectManagementLookups> fetchLookups() async {
    final results = await Future.wait<dynamic>(<Future<dynamic>>[
      _api.get<dynamic>(
        '/categories',
        queryParameters: {'includeInactive': false},
      ),
      _api.get<dynamic>('/project-stages'),
      _api.get<dynamic>('/risk-levels'),
    ]);
    return ProjectManagementLookups(
      categories: _choiceList(results[0].data),
      stages: _choiceList(results[1].data),
      riskLevels: _choiceList(results[2].data),
    );
  }

  @override
  Future<int> createProject(ProjectWriteRequest request) async {
    final response = await _api.post<dynamic>(
      '/projects',
      data: request.toJson(),
    );
    final data = _responseData(response.data);
    final id = data['id'];
    if (id is! num || id <= 0) {
      throw const ApiError(
        message: 'The created project identifier was not returned.',
      );
    }
    return id.toInt();
  }

  @override
  Future<void> updateProject(int projectId, ProjectWriteRequest request) async {
    await _api.put<dynamic>('/projects/$projectId', data: request.toJson());
  }

  @override
  Future<String> uploadProjectLogo({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
  }) async {
    final uploaded = await FopxGovernedFileUploader(_api).upload(
      bytes: fileBytes,
      fileName: fileName,
      categoryCode: 'PROJECTIMAGE',
      projectId: projectId,
      entityType: 'Project',
      entityId: projectId.toString(),
    );
    final url = uploaded.url?.trim();
    if (url == null || url.isEmpty) {
      throw const ApiError(
        message: 'The uploaded project image URL was not returned.',
      );
    }
    return url;
  }

  @override
  Future<void> transitionProjectStatus(
    int projectId,
    ProjectStatusTransitionRequest request,
  ) async {
    await _api.post<dynamic>(
      '/projects/$projectId/status',
      data: request.toJson(),
    );
  }

  Map<String, dynamic> _responseData(dynamic payload) {
    if (payload is! Map || payload['data'] is! Map) {
      throw const ApiError(message: 'Project data was not returned.');
    }
    return Map<String, dynamic>.from(payload['data'] as Map);
  }

  List<ProjectChoice> _choiceList(dynamic payload) {
    if (payload is! Map || payload['data'] is! List) {
      throw const ApiError(message: 'Project form choices were not returned.');
    }
    return (payload['data'] as List)
        .whereType<Map>()
        .map((item) => ProjectChoice.fromJson(Map<String, dynamic>.from(item)))
        .where((choice) => choice.code.isNotEmpty)
        .toList(growable: false);
  }
}

final projectManagementRepositoryProvider =
    Provider<ProjectManagementRepository>(
      (ref) => ApiProjectManagementRepository(ref.read(apiClientProvider)),
    );

final projectManagementLookupsProvider =
    FutureProvider.autoDispose<ProjectManagementLookups>(
      (ref) => ref.read(projectManagementRepositoryProvider).fetchLookups(),
    );
