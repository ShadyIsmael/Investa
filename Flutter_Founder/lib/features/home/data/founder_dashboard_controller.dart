import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'founder_dashboard.dart';

abstract interface class FounderDashboardRepository {
  Future<FounderDashboard> fetchDashboard();
}

class ApiFounderDashboardRepository implements FounderDashboardRepository {
  const ApiFounderDashboardRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<FounderDashboard> fetchDashboard() async {
    final response = await _api.get<dynamic>('/founder/dashboard');
    final root = response.data;
    if (root is! Map || root['data'] is! Map) {
      throw const ApiError(message: 'Founder dashboard data was not returned.');
    }
    return FounderDashboard.fromJson(
      Map<String, dynamic>.from(root['data'] as Map),
    );
  }
}

final founderDashboardRepositoryProvider = Provider<FounderDashboardRepository>(
  (ref) => ApiFounderDashboardRepository(ref.read(apiClientProvider)),
);

final founderDashboardProvider = FutureProvider.autoDispose<FounderDashboard>((
  ref,
) {
  return ref.read(founderDashboardRepositoryProvider).fetchDashboard();
});
