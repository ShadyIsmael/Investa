import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'project_models.dart';

abstract interface class ProjectOverviewRepository {
  Future<FounderProjectDetails> fetchProject(int projectId);
  Future<FounderOpportunityDetail> fetchOpportunity(int opportunityId);
  Future<FounderProjectRoom> fetchProjectRoom(int projectId);
  Future<void> addProjectRoomEntry(int projectId, Map<String, dynamic> request);
  Future<void> completeProjectRoomMilestone(int projectId, int entryId);
  Future<void> addProjectRoomDocument({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
    required String categoryCode,
    required String documentType,
    required String visibility,
  });
  Future<List<int>> fetchProjectRoomDocumentBytes(
    int projectId,
    int documentId, {
    required bool preview,
  });
}

class ApiProjectOverviewRepository implements ProjectOverviewRepository {
  const ApiProjectOverviewRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<FounderProjectDetails> fetchProject(int projectId) async {
    final response = await _api.get<dynamic>('/projects/$projectId');
    final root =
        response.data is Map
            ? Map<String, dynamic>.from(response.data as Map)
            : const <String, dynamic>{};
    final data = root['data'];
    if (data is! Map) {
      throw const ApiError(message: 'Project data was not returned.');
    }
    return FounderProjectDetails.fromJson(Map<String, dynamic>.from(data));
  }

  @override
  Future<FounderOpportunityDetail> fetchOpportunity(int opportunityId) async {
    final response = await _api.get<dynamic>('/opportunities/$opportunityId');
    final data = _data(response.data);
    return FounderOpportunityDetail.fromJson(data);
  }

  @override
  Future<FounderProjectRoom> fetchProjectRoom(int projectId) async {
    final response = await _api.get<dynamic>('/projects/$projectId/room');
    final data = _data(response.data);
    return FounderProjectRoom.fromJson(data);
  }

  @override
  Future<void> addProjectRoomEntry(
    int projectId,
    Map<String, dynamic> request,
  ) async {
    await _api.post<dynamic>(
      '/projects/$projectId/room/entries',
      data: request,
    );
  }

  @override
  Future<void> completeProjectRoomMilestone(int projectId, int entryId) async {
    await _api.post<dynamic>(
      '/projects/$projectId/room/milestones/$entryId/complete',
    );
  }

  @override
  Future<void> addProjectRoomDocument({
    required int projectId,
    required List<int> fileBytes,
    required String fileName,
    required String categoryCode,
    required String documentType,
    required String visibility,
  }) async {
    final uploaded = await FopxGovernedFileUploader(_api).upload(
      bytes: fileBytes,
      fileName: fileName,
      categoryCode: categoryCode,
      projectId: projectId,
      entityType: 'ProjectRoom',
      entityId: projectId.toString(),
    );
    await _api.post<dynamic>(
      '/projects/$projectId/room/documents',
      data: <String, dynamic>{
        'fileKey': uploaded.fileKey,
        'categoryCode': categoryCode,
        'documentType': documentType,
        'visibility': visibility,
      },
    );
  }

  @override
  Future<List<int>> fetchProjectRoomDocumentBytes(
    int projectId,
    int documentId, {
    required bool preview,
  }) async {
    final action = preview ? 'preview' : 'download';
    final response = await _api.getBytes(
      '/projects/$projectId/room/documents/$documentId/$action',
    );
    final bytes = response.data;
    if (bytes == null || bytes.isEmpty) {
      throw const ApiError(message: 'The Project Room document is empty.');
    }
    return bytes;
  }

  Map<String, dynamic> _data(dynamic payload) {
    final root =
        payload is Map
            ? Map<String, dynamic>.from(payload)
            : const <String, dynamic>{};
    final data = root['data'];
    if (data is! Map) {
      throw const ApiError(message: 'The requested data was not returned.');
    }
    return Map<String, dynamic>.from(data);
  }
}

final projectOverviewRepositoryProvider = Provider<ProjectOverviewRepository>(
  (ref) => ApiProjectOverviewRepository(ref.read(apiClientProvider)),
);

final projectOverviewProvider = FutureProvider.autoDispose
    .family<FounderProjectDetails, int>((ref, projectId) {
      return ref
          .read(projectOverviewRepositoryProvider)
          .fetchProject(projectId);
    });

final projectOpportunityProvider = FutureProvider.autoDispose
    .family<FounderOpportunityDetail, int>((ref, opportunityId) {
      return ref
          .read(projectOverviewRepositoryProvider)
          .fetchOpportunity(opportunityId);
    });

final projectRoomProvider = FutureProvider.autoDispose
    .family<FounderProjectRoom, int>((ref, projectId) {
      return ref
          .read(projectOverviewRepositoryProvider)
          .fetchProjectRoom(projectId);
    });
