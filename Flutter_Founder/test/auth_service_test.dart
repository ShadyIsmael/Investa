import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:flutter_founder/services/auth_service.dart';
import 'package:flutter_founder/services/api_client.dart';

class FakeApiClient implements ApiClient {
  final Response _response;
  FakeApiClient(this._response);

  @override
  Future<Response> post(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) async {
    return _response;
  }

  @override
  Future<Response> get(String url,
      {Map<String, dynamic>? headers,
      Map<String, dynamic>? queryParameters}) async {
    throw UnimplementedError();
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
      requestOptions: RequestOptions(path: '/api/Auth/sign-up'),
      data: data,
      statusCode: statusCode,
    );

void main() {
  group('AuthService.signup', () {
    test('parses top-level token response', () async {
      final resp = makeResponse(200, {
        'token': 'abc123',
        'expiresAt': '2025-12-24T22:17:02.727Z',
        'phoneNumber': '0123456789',
        'refreshToken': 'ref-123',
        'message': 'Welcome',
      });

      final svc =
          AuthService(baseUrl: 'https://test', client: FakeApiClient(resp));
      final res = await svc.signup(
          phoneNumber: '012', password: 'p', firstName: 'F', lastName: 'L');

      expect(res.success, isTrue);
      expect(res.token, equals('abc123'));
      expect(res.message, equals('Welcome'));
    });

    test('parses nested data token response', () async {
      final resp = makeResponse(200, {
        'success': true,
        'data': {'token': 'nested-123', 'message': 'Hi'},
      });

      final svc =
          AuthService(baseUrl: 'https://test', client: FakeApiClient(resp));
      final res = await svc.signup(
          phoneNumber: '012', password: 'p', firstName: 'F', lastName: 'L');

      expect(res.success, isTrue);
      expect(res.token, equals('nested-123'));
      expect(res.message, equals('Hi'));
    });

    test('parses 400 problem details', () async {
      final resp = makeResponse(400, {
        'type': 'https://example.com/probs/invalid',
        'title': 'Invalid input',
        'status': 400,
        'detail': 'Phone number is invalid',
      });

      final svc =
          AuthService(baseUrl: 'https://test', client: FakeApiClient(resp));
      final res = await svc.signup(
          phoneNumber: 'bad', password: 'p', firstName: 'F', lastName: 'L');

      expect(res.success, isFalse);
      expect(res.message, contains('Invalid input'));
      expect(res.message, contains('Phone number is invalid'));
    });

    test('handles non-200 non-400 responses gracefully', () async {
      final resp = makeResponse(500, {'message': 'server exploded'});
      final svc =
          AuthService(baseUrl: 'https://test', client: FakeApiClient(resp));
      final res = await svc.signup(
          phoneNumber: '012', password: 'p', firstName: 'F', lastName: 'L');

      expect(res.success, isFalse);
      expect(res.message, contains('server exploded'));
    });
  });
}
