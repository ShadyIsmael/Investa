import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'project_models.dart';

abstract interface class ProjectsRepository {
  Future<List<FounderProject>> fetchProjects();
}

class ApiProjectsRepository implements ProjectsRepository {
  const ApiProjectsRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<List<FounderProject>> fetchProjects() async {
    final response = await _api.get<dynamic>('/projects');
    return FounderProject.listFromResponse(response.data);
  }
}

final projectsRepositoryProvider = Provider<ProjectsRepository>(
  (ref) => ApiProjectsRepository(ref.read(apiClientProvider)),
);

class ProjectsController extends AsyncNotifier<List<FounderProject>> {
  @override
  Future<List<FounderProject>> build() =>
      ref.read(projectsRepositoryProvider).fetchProjects();

  Future<void> refresh() async {
    try {
      state = AsyncData(
        await ref.read(projectsRepositoryProvider).fetchProjects(),
      );
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
    }
  }
}

final projectsControllerProvider =
    AsyncNotifierProvider<ProjectsController, List<FounderProject>>(
      ProjectsController.new,
    );
