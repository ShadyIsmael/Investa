import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:flutter_partner/services/api_client.dart';
import 'package:flutter_partner/services/profile_service.dart';
import 'package:flutter_partner/services/app_state.dart';

class FakeApiClient implements ApiClient {
  final Response _response;
  FakeApiClient(this._response);

  @override
  Future<Response> post(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) {
    throw UnimplementedError();
  }

  @override
  Future<Response> get(String url,
      {Map<String, dynamic>? headers,
      Map<String, dynamic>? queryParameters}) async {
    return _response;
  }

  @override
  Future<Response> put(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) async {
    throw UnimplementedError();
  }

  @override
  void close() {}
}

class FakeApiClientDelayed implements ApiClient {
  final Response _response;
  final Duration delay;
  FakeApiClientDelayed(this._response,
      {this.delay = const Duration(seconds: 10)});

  @override
  Future<Response> post(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) {
    throw UnimplementedError();
  }

  @override
  Future<Response> get(String url,
      {Map<String, dynamic>? headers,
      Map<String, dynamic>? queryParameters}) async {
    return await Future.delayed(delay, () => _response);
  }

  @override
  Future<Response> put(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) async {
    throw UnimplementedError();
  }

  @override
  void close() {}
}

class FakeApiClientTimeout implements ApiClient {
  @override
  Future<Response> post(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) {
    throw UnimplementedError();
  }

  @override
  Future<Response> get(String url,
      {Map<String, dynamic>? headers,
      Map<String, dynamic>? queryParameters}) async {
    throw TimeoutException('simulated timeout');
  }

  @override
  Future<Response> put(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) async {
    throw UnimplementedError();
  }

  @override
  void close() {}
}

Response makeResponse(int statusCode, dynamic data) => Response(
      requestOptions: RequestOptions(path: '/api/Profile/me'),
      data: data,
      statusCode: statusCode,
    );

void main() {
  group('ProfileService.fetchProfile', () {
    setUp(() async {
      await AppState.instance.clear();
    });

    tearDown(() async {
      await AppState.instance.clear();
    });

    test('parses full profile response', () async {
      final resp = makeResponse(200, {
        'userId': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        'coreMetrics': {
          'email': 'user@example.com',
          'role': 'User',
          'clientType': 'Individual',
          'credibilityScore': 85.5,
          'walletBalance': 100.0,
        },
        'basicInfo': {
          'firstName': 'John',
          'lastName': 'Doe',
          'fullName': 'John Doe',
          'gender': 'Male',
          'nationality': 'US',
          'bio': 'A sample user',
          'avatarUrl': 'https://example.com/avatar.jpg',
        },
        'contactInfo': {
          'email': 'contact@example.com',
          'phone1': '+1234567890',
          'phone2': '+0987654321',
          'workAddress': '123 Work St',
          'address': '456 Home St',
          'linkedInUrl': 'https://linkedin.com/in/johndoe',
          'facebookUrl': 'https://facebook.com/johndoe',
        },
        'identityCompliance': {
          'documentNumber': 'DOC123',
          'documentExpiryDate': '2025-12-24T23:37:06.356Z',
          'verificationStatus': 'Verified',
          'documentFrontImageUrl': 'https://example.com/front.jpg',
          'documentBackImageUrl': 'https://example.com/back.jpg',
        },
        'auditUsage': {
          'lastLoginIP': '192.168.1.1',
          'registrationIP': '192.168.1.1',
          'deviceInfo': 'Chrome on Windows',
          'lastLoginDate': '2025-12-24T23:37:06.356Z',
        },
        'createdAt': '2025-12-24T23:37:06.356Z',
        'updatedAt': '2025-12-24T23:37:06.356Z',
      });

      final svc =
          ProfileService(client: FakeApiClient(resp), baseUrl: 'https://test');
      final profile = await svc.fetchProfile();

      expect(profile, isNotNull);
      expect(profile!.userId, equals('3fa85f64-5717-4562-b3fc-2c963f66afa6'));
      expect(profile.coreMetrics!.email, equals('user@example.com'));
      expect(profile.basicInfo!.firstName, equals('John'));
      expect(profile.basicInfo!.lastName, equals('Doe'));
      expect(profile.basicInfo!.avatarUrl,
          equals('https://example.com/avatar.jpg'));
      expect(profile.contactInfo!.phone1, equals('+1234567890'));
      expect(
          profile.identityCompliance!.verificationStatus, equals('Verified'));
      expect(profile.auditUsage!.lastLoginIP, equals('192.168.1.1'));
      expect(profile.createdAt, isNotNull);
      expect(profile.updatedAt, isNotNull);
    });

    test('parses profile with score/credit in basicInfo', () async {
      final resp = makeResponse(200, {
        'userId': '168b6970-299d-47d9-9128-d6b61b508eea',
        'coreMetrics': {
          'email': '01022322292@phone.investa.local',
          'role': 'Investor',
          'clientType': 'Investor',
          'credibilityScore': 3500,
          'walletBalance': 0,
        },
        'basicInfo': {
          'firstName': 'Shady',
          'lastName': 'Ismael',
          'fullName': 'Shady Ismael',
          'gender': null,
          'nationality': null,
          'bio': null,
          'avatarUrl': null,
          'score': 0,
          'credit': 70,
        },
        'contactInfo': {
          'email': null,
          'phone1': '01022322292',
          'phone2': null,
          'workAddress': null,
          'address': null,
          'linkedInUrl': null,
          'facebookUrl': null,
        },
        'identityCompliance': {
          'documentNumber': null,
          'documentExpiryDate': null,
          'verificationStatus': 'None',
          'documentFrontImageUrl': null,
          'documentBackImageUrl': null,
        },
        'auditUsage': {
          'lastLoginIP': '::1',
          'registrationIP': null,
          'deviceInfo':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
          'lastLoginDate': '2025-12-28T11:43:07.8341923Z',
        },
        'createdAt': '2025-12-25T14:17:29.084518',
        'updatedAt': '2025-12-28T11:43:07.834342Z',
      });

      final svc =
          ProfileService(client: FakeApiClient(resp), baseUrl: 'https://test');
      final profile = await svc.fetchProfile();

      expect(profile, isNotNull);
      expect(profile!.userId, equals('168b6970-299d-47d9-9128-d6b61b508eea'));
      expect(profile.basicInfo!.firstName, equals('Shady'));
      expect(profile.basicInfo!.lastName, equals('Ismael'));
      expect(profile.basicInfo!.score, equals(0));
      expect(profile.basicInfo!.credit, equals(70));
      expect(profile.contactInfo!.phone1, equals('01022322292'));
      expect(profile.auditUsage!.deviceInfo, contains('Mozilla/5.0'));
      expect(profile.auditUsage!.lastLoginDate,
          equals(DateTime.parse('2025-12-28T11:43:07.8341923Z')));
      expect(profile.coreMetrics!.email,
          equals('01022322292@phone.investa.local'));
      expect(profile.score, equals(0));
      expect(profile.credit, equals(70));
    });

    test('fetchProfileRaw times out returns null', () async {
      final svc = ProfileService(
          client: FakeApiClientTimeout(), baseUrl: 'https://test');
      final raw = await svc.fetchProfileRaw();
      expect(raw, isNull);
    });

    test('fetchProfile times out returns null', () async {
      final svc = ProfileService(
          client: FakeApiClientTimeout(), baseUrl: 'https://test');
      final profile = await svc.fetchProfile();
      expect(profile, isNull);
    });

    test('returns null on server error', () async {
      final resp = makeResponse(500, {'error': 'Internal server error'});
      final svc =
          ProfileService(client: FakeApiClient(resp), baseUrl: 'https://test');
      final profile = await svc.fetchProfile();

      expect(profile, isNull);
    });
  });
}
