import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionTokens {
  const SessionTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;
}

class SessionStore {
  SessionStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const _accessTokenKey = 'fopx.access_token';
  static const _refreshTokenKey = 'fopx.refresh_token';

  final FlutterSecureStorage _storage;

  Future<SessionTokens?> read() async {
    final accessToken = await _storage.read(key: _accessTokenKey);
    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (accessToken == null || accessToken.isEmpty || refreshToken == null || refreshToken.isEmpty) {
      return null;
    }
    return SessionTokens(accessToken: accessToken, refreshToken: refreshToken);
  }

  Future<void> save(SessionTokens tokens) async {
    await _storage.write(key: _accessTokenKey, value: tokens.accessToken);
    await _storage.write(key: _refreshTokenKey, value: tokens.refreshToken);
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }
}

final sessionStoreProvider = Provider<SessionStore>((_) => SessionStore());
