import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';

void main() {
  test('failed refresh clears tokens and returns session to login state', () async {
    final store = _MemorySessionStore(
      const SessionTokens(accessToken: 'expired-access', refreshToken: 'expired-refresh'),
    );
    late ProviderContainer container;
    final api = FopxApiClient(
      environment: const AppEnvironment(
        apiBaseUrl: 'https://founder.test/api/v1',
      ),
      sessionStore: store,
      httpClientAdapter: _StatusAdapter(401),
      onSessionExpired: () => container.read(sessionControllerProvider.notifier).logout(),
    );
    container = ProviderContainer(
      overrides: <Override>[
        sessionStoreProvider.overrideWithValue(store),
        apiClientProvider.overrideWithValue(api),
      ],
    );
    addTearDown(container.dispose);

    await container.read(sessionControllerProvider.future);
    await expectLater(api.get<dynamic>('/projects'), throwsA(isA<ApiError>()));

    expect(store.tokens, isNull);
    expect(
      container.read(sessionControllerProvider).valueOrNull?.isAuthenticated,
      isFalse,
    );
  });

  test('403 keeps the authenticated session and does not request logout', () async {
    const tokens = SessionTokens(
      accessToken: 'valid-access',
      refreshToken: 'valid-refresh',
    );
    final store = _MemorySessionStore(tokens);
    var expiredCalls = 0;
    late ProviderContainer container;
    final api = FopxApiClient(
      environment: const AppEnvironment(
        apiBaseUrl: 'https://founder.test/api/v1',
      ),
      sessionStore: store,
      httpClientAdapter: _StatusAdapter(403),
      onSessionExpired: () => expiredCalls++,
    );
    container = ProviderContainer(
      overrides: <Override>[
        sessionStoreProvider.overrideWithValue(store),
        apiClientProvider.overrideWithValue(api),
      ],
    );
    addTearDown(container.dispose);

    await container.read(sessionControllerProvider.future);
    await expectLater(api.get<dynamic>('/projects'), throwsA(isA<ApiError>()));

    expect(store.tokens, same(tokens));
    expect(
      container.read(sessionControllerProvider).valueOrNull?.isAuthenticated,
      isTrue,
    );
    expect(expiredCalls, 0);
  });
}

class _MemorySessionStore extends SessionStore {
  _MemorySessionStore(this.tokens);

  SessionTokens? tokens;

  @override
  Future<SessionTokens?> read() async => tokens;

  @override
  Future<void> save(SessionTokens value) async => tokens = value;

  @override
  Future<void> clear() async => tokens = null;
}

class _StatusAdapter implements HttpClientAdapter {
  _StatusAdapter(this.statusCode);

  final int statusCode;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async => ResponseBody.fromString(
    statusCode == 401 ? '{"message":"Unauthorized"}' : '{"message":"Forbidden"}',
    statusCode,
    headers: <String, List<String>>{
      Headers.contentTypeHeader: <String>[Headers.jsonContentType],
    },
  );

  @override
  void close({bool force = false}) {}
}
