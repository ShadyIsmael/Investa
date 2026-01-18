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
  void close() {}
}

Response makeResponse(int statusCode, dynamic data) => Response(
      requestOptions: RequestOptions(path: '/api/Auth/sign-up'),
      data: data,
      statusCode: statusCode,
    );

void main() {
  test('simulate signup with provided phone/password', () async {
    // Provided test credentials
    const phone = '01022322292';
    const password = 'P@ssw0rd';
    const otp = '123456';

    // Server response simulation: successful sign-up returning a token
    final resp = makeResponse(200, {
      'token': 'test-token-xyz',
      'message': 'Signup OK',
      'phoneNumber': phone,
    });

    final svc =
        AuthService(baseUrl: 'https://test', client: FakeApiClient(resp));
    final res = await svc.signup(
        phoneNumber: phone,
        password: password,
        firstName: 'Test',
        lastName: 'User');

    expect(res.success, isTrue);
    expect(res.token, equals('test-token-xyz'));
    expect(res.message, contains('Signup'));
  });
}
