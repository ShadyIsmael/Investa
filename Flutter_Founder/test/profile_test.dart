import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';

import 'package:fopx_founder/features/profile/data/founder_profile.dart';
import 'package:fopx_founder/features/profile/data/profile_controller.dart';

void main() {
  test('parses profile scores and trust metrics without deriving values', () {
    final profile = FounderProfile.fromJson(<String, dynamic>{
      'profileCompletionPercentage': 72,
      'basicInfo': <String, dynamic>{
        'fullName': 'Founder One',
        'firstName': 'Founder',
        'lastName': 'One',
        'companyName': 'Northstar Foods',
        'score': 84.5,
      },
      'contactInfo': <String, dynamic>{
        'email': 'founder@example.test',
        'phone1': '+201001234567',
      },
      'coreMetrics': <String, dynamic>{
        'role': 'Founder',
        'clientType': 'Founder',
        'currentCredibilityScore': 91.25,
      },
    });

    final trust = FounderTrustScore.fromJson(<String, dynamic>{
      'trustLevel': 2,
      'trustLevelLabel': 'Interactive',
      'reputationScore': 61,
      'activityScore': 34,
      'profileCompletionPercentage': 72,
      'isPhoneVerified': true,
      'isEmailVerified': false,
      'nextLevelRequirements': <Map<String, dynamic>>[
        <String, dynamic>{
          'labelEn': 'Verify email',
          'labelAr': 'تحقق من البريد',
          'isMet': false,
        },
      ],
      'verifications': <Map<String, dynamic>>[
        <String, dynamic>{
          'verificationType': 'Identity',
          'status': 'Pending',
          'submittedAt': '2026-09-20T00:00:00Z',
        },
      ],
    });

    expect(profile.fullName, 'Founder One');
    expect(profile.firstName, 'Founder');
    expect(profile.lastName, 'One');
    expect(profile.mobile, '+201001234567');
    expect(profile.companyName, 'Northstar Foods');
    expect(profile.score, 84.5);
    expect(profile.credibilityScore, 91.25);
    expect(profile.profileCompletion, 72);
    expect(trust.trustLevelLabel, 'Interactive');
    expect(trust.reputationScore, 61);
    expect(trust.phoneVerified, isTrue);
    expect(trust.emailVerified, isFalse);
    expect(trust.nextLevelRequirements.single.labelAr, 'تحقق من البريد');
    expect(trust.verifications.single.status, 'Pending');
  });

  test(
    'updates basic profile only through the authenticated legacy API route',
    () async {
      final adapter = _ProfileAdapter();
      final api = FopxApiClient(
        environment: const AppEnvironment(
          apiBaseUrl: 'https://founder.test/api/v1',
        ),
        sessionStore: _EmptySessionStore(),
        httpClientAdapter: adapter,
      );

      await ApiFounderProfileRepository(api).updateBasicProfile(
        firstName: '  Founder ',
        lastName: 'One  ',
        mobile: '+201001234567',
      );

      expect(adapter.requests.single.uri.path, '/api/profile/me/basic');
      expect(adapter.requests.single.data, <String, String>{
        'firstName': 'Founder',
        'lastName': 'One',
        'mobile': '+201001234567',
      });
    },
  );

  test('requests password-change OTP with current password only', () async {
    final adapter = _ProfileAdapter();
    final api = FopxApiClient(
      environment: const AppEnvironment(
        apiBaseUrl: 'https://founder.test/api/v1',
      ),
      sessionStore: _EmptySessionStore(),
      httpClientAdapter: adapter,
    );

    await ApiFounderProfileRepository(api).sendPasswordChangeCode('old-secret');

    expect(
      adapter.requests.single.uri.path,
      '/api/v1/auth/change-password/send-otp',
    );
    expect(adapter.requests.single.data, <String, String>{
      'currentPassword': 'old-secret',
    });
  });

  test(
    'confirms password change using the server OTP and new password',
    () async {
      final adapter = _ProfileAdapter();
      final api = FopxApiClient(
        environment: const AppEnvironment(
          apiBaseUrl: 'https://founder.test/api/v1',
        ),
        sessionStore: _EmptySessionStore(),
        httpClientAdapter: adapter,
      );

      await ApiFounderProfileRepository(
        api,
      ).confirmPasswordChange(code: '123456', newPassword: 'new-secret');

      expect(
        adapter.requests.single.uri.path,
        '/api/v1/auth/change-password/confirm',
      );
      expect(adapter.requests.single.data, <String, String>{
        'token': '123456',
        'newPassword': 'new-secret',
      });
    },
  );
}

class _ProfileAdapter implements HttpClientAdapter {
  final requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      jsonEncode(<String, dynamic>{'message': 'Profile updated.'}),
      200,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

class _EmptySessionStore extends SessionStore {
  @override
  Future<SessionTokens?> read() async => null;

  @override
  Future<void> save(SessionTokens tokens) async {}

  @override
  Future<void> clear() async {}
}
