import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fopx_core/fopx_core.dart';

import 'founder_profile.dart';

abstract interface class FounderProfileRepository {
  Future<FounderProfile> fetchProfile();
  Future<FounderTrustScore> fetchTrustScore();
  Future<void> updateBasicProfile({
    required String firstName,
    required String lastName,
    required String mobile,
  });
  Future<void> sendPasswordChangeCode(String currentPassword);
  Future<void> confirmPasswordChange({
    required String code,
    required String newPassword,
  });
}

class ApiFounderProfileRepository implements FounderProfileRepository {
  const ApiFounderProfileRepository(this._api);

  final FopxApiClient _api;

  @override
  Future<FounderProfile> fetchProfile() async {
    final response = await _api.getAtOriginPath<dynamic>(
      '/api/profile/me/myprofile',
    );
    final data = _data(response.data);
    if (data is! Map) {
      throw const ApiError(message: 'Profile data was not returned.');
    }
    return FounderProfile.fromJson(Map<String, dynamic>.from(data));
  }

  @override
  Future<FounderTrustScore> fetchTrustScore() async {
    final response = await _api.get<dynamic>('/trust/me');
    final data = _data(response.data);
    if (data is! Map) {
      throw const ApiError(message: 'Trust score data was not returned.');
    }
    return FounderTrustScore.fromJson(Map<String, dynamic>.from(data));
  }

  @override
  Future<void> updateBasicProfile({
    required String firstName,
    required String lastName,
    required String mobile,
  }) async {
    await _api.postAtOriginPath<dynamic>(
      '/api/profile/me/basic',
      data: <String, String>{
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'mobile': mobile.trim(),
      },
    );
  }

  @override
  Future<void> sendPasswordChangeCode(String currentPassword) async {
    await _api.post<dynamic>(
      '/auth/change-password/send-otp',
      data: <String, String>{'currentPassword': currentPassword},
    );
  }

  @override
  Future<void> confirmPasswordChange({
    required String code,
    required String newPassword,
  }) async {
    await _api.post<dynamic>(
      '/auth/change-password/confirm',
      data: <String, String>{'token': code, 'newPassword': newPassword},
    );
  }

  dynamic _data(dynamic value) =>
      value is Map && value.containsKey('data') ? value['data'] : value;
}

final founderProfileRepositoryProvider = Provider<FounderProfileRepository>(
  (ref) => ApiFounderProfileRepository(ref.read(apiClientProvider)),
);

final founderProfileProvider = FutureProvider.autoDispose<FounderProfile>(
  (ref) => ref.read(founderProfileRepositoryProvider).fetchProfile(),
);

final founderTrustScoreProvider = FutureProvider.autoDispose<FounderTrustScore>(
  (ref) => ref.read(founderProfileRepositoryProvider).fetchTrustScore(),
);
