import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/fopx_api_client.dart';
import '../api/api_error.dart';
import '../config/app_environment.dart';
import '../storage/session_store.dart';

final apiClientProvider = Provider<FopxApiClient>((ref) {
  return FopxApiClient(
    environment: ref.watch(appEnvironmentProvider),
    sessionStore: ref.watch(sessionStoreProvider),
    onSessionExpired:
        () => ref.read(sessionControllerProvider.notifier).logout(),
  );
});

class SessionState {
  const SessionState.unauthenticated() : tokens = null;
  const SessionState.authenticated(this.tokens);

  final SessionTokens? tokens;
  bool get isAuthenticated => tokens != null;
}

class SessionController extends AsyncNotifier<SessionState> {
  late final FopxApiClient _api;
  late final SessionStore _store;

  @override
  Future<SessionState> build() async {
    _api = ref.read(apiClientProvider);
    _store = ref.read(sessionStoreProvider);
    final tokens = await _store.read();
    return tokens == null
        ? const SessionState.unauthenticated()
        : SessionState.authenticated(tokens);
  }

  Future<void> login({
    required String phoneNumber,
    required String password,
  }) async {
    state = const AsyncLoading();
    try {
      final response = await _api.post<dynamic>(
        '/auth/login',
        data: loginPayload(phoneNumber: phoneNumber, password: password),
      );
      final tokens = _tokensFromPayload(response.data);
      if (tokens == null) {
        throw const ApiError(
          message: 'The server did not return a valid session.',
        );
      }
      await _store.save(tokens);
      state = AsyncData(SessionState.authenticated(tokens));
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _store.clear();
    state = const AsyncData(SessionState.unauthenticated());
  }

  static Map<String, String> loginPayload({
    required String phoneNumber,
    required String password,
  }) => <String, String>{
    // The backend LoginDto accepts the canonical phone identity here.
    'phoneNumber': phoneNumber.trim(),
    'password': password,
  };

  static SessionTokens? _tokensFromPayload(dynamic payload) {
    final root = payload is Map ? Map<String, dynamic>.from(payload) : null;
    final data = root?['data'];
    final body = data is Map ? Map<String, dynamic>.from(data) : root;
    final access = body?['accessToken'] ?? body?['access_token'] ?? body?['token'];
    final refresh = body?['refreshToken'] ?? body?['refresh_token'];
    if (access is! String ||
        access.isEmpty ||
        refresh is! String ||
        refresh.isEmpty)
      return null;
    return SessionTokens(accessToken: access, refreshToken: refresh);
  }
}

final sessionControllerProvider =
    AsyncNotifierProvider<SessionController, SessionState>(
      SessionController.new,
    );
