import 'dart:async';

import 'package:dio/dio.dart';

import '../config/app_environment.dart';
import '../storage/session_store.dart';
import 'api_error.dart';

class FopxApiClient {
  FopxApiClient({
    required AppEnvironment environment,
    required SessionStore sessionStore,
    FutureOr<void> Function()? onSessionExpired,
    HttpClientAdapter? httpClientAdapter,
  }) : _sessionStore = sessionStore,
       _onSessionExpired = onSessionExpired,
       _dio = Dio(
         BaseOptions(
           baseUrl: environment.apiBaseUrl,
           connectTimeout: const Duration(seconds: 20),
           receiveTimeout: const Duration(seconds: 30),
           sendTimeout: const Duration(seconds: 30),
           contentType: Headers.jsonContentType,
           responseType: ResponseType.json,
         ),
       ) {
    if (httpClientAdapter != null) {
      _dio.httpClientAdapter = httpClientAdapter;
    }
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (options.extra['skipAuth'] != true) {
            final tokens = await _sessionStore.read();
            if (tokens != null) {
              options.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
            }
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final isRetryable =
              error.response?.statusCode == 401 &&
              error.requestOptions.extra['skipRefresh'] != true;
          if (!isRetryable) {
            handler.next(error);
            return;
          }

          final refreshed = await _refreshOnce();
          if (!refreshed) {
            await _notifySessionExpired();
            handler.next(error);
            return;
          }

          final tokens = await _sessionStore.read();
          if (tokens == null) {
            handler.next(error);
            return;
          }

          final options = error.requestOptions;
          options.extra['skipRefresh'] = true;
          options.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
          try {
            handler.resolve(await _dio.fetch<dynamic>(options));
          } on DioException catch (retryError) {
            handler.next(retryError);
          }
        },
      ),
    );
  }

  final Dio _dio;
  final SessionStore _sessionStore;
  final FutureOr<void> Function()? _onSessionExpired;
  Future<bool>? _refreshFuture;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    Options? options,
  }) => _execute(
    () => _dio.get<T>(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      options: options,
    ),
  );

  /// Fetches authenticated text content without JSON decoding.
  Future<Response<String>> getText(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
  }) => _execute(
    () => _dio.get<String>(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      options: Options(responseType: ResponseType.plain, headers: headers),
    ),
  );

  Future<Response<List<int>>> getBytes(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) => _execute(
    () => _dio.get<List<int>>(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      options: Options(responseType: ResponseType.bytes),
    ),
  );

  /// Calls a legacy API route at the same host root as the versioned API.
  /// Regular [get] requests remain scoped to the configured `/api/v1` base.
  Future<Response<T>> getAtOriginPath<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) {
    final origin = Uri.parse(_dio.options.baseUrl).origin;
    final url = Uri.parse(origin).replace(path: path).toString();
    return _execute(
      () => _dio.get<T>(
        url,
        queryParameters: queryParameters,
        cancelToken: cancelToken,
      ),
    );
  }

  /// Calls a legacy API route at the same host root as the versioned API.
  Future<Response<T>> postAtOriginPath<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
    Options? options,
  }) {
    final origin = Uri.parse(_dio.options.baseUrl).origin;
    final url = Uri.parse(origin).replace(path: path).toString();
    return _execute(
      () => _dio.post<T>(
        url,
        data: data,
        cancelToken: cancelToken,
        options: options,
      ),
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    Options? options,
  }) => _execute(
    () => _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      options: options,
    ),
  );

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    Options? options,
  }) => _execute(
    () => _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      options: options,
    ),
  );

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
    Options? options,
  }) => _execute(
    () => _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
      options: options,
    ),
  );

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) => _execute(
    () => _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    ),
  );

  Future<Response<T>> _execute<T>(
    Future<Response<T>> Function() request,
  ) async {
    try {
      return await request();
    } on DioException catch (exception) {
      throw ApiError.fromDioException(exception);
    }
  }

  Future<bool> _refreshOnce() {
    final existing = _refreshFuture;
    if (existing != null) return existing;
    final future = _refreshSession();
    _refreshFuture = future;
    future.whenComplete(() => _refreshFuture = null);
    return future;
  }

  Future<bool> _refreshSession() async {
    final current = await _sessionStore.read();
    if (current == null) return false;
    try {
      final response = await _dio.post<dynamic>(
        '/auth/refresh',
        data: <String, dynamic>{'refreshToken': current.refreshToken},
        options: Options(
          extra: <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
        ),
      );
      final tokens = _tokensFromPayload(
        response.data,
        fallbackRefreshToken: current.refreshToken,
      );
      if (tokens == null) {
        await _sessionStore.clear();
        return false;
      }
      await _sessionStore.save(tokens);
      return true;
    } catch (_) {
      await _sessionStore.clear();
      return false;
    }
  }

  Future<void> _notifySessionExpired() async {
    try {
      await _onSessionExpired?.call();
    } catch (_) {
      // Preserve the original API error even if session-state cleanup fails.
    }
  }

  static SessionTokens? _tokensFromPayload(
    dynamic payload, {
    String? fallbackRefreshToken,
  }) {
    final root = payload is Map ? Map<String, dynamic>.from(payload) : null;
    final data = root?['data'];
    final body = data is Map ? Map<String, dynamic>.from(data) : root;
    final access =
        body?['accessToken'] ?? body?['access_token'] ?? body?['token'];
    final refresh =
        body?['refreshToken'] ?? body?['refresh_token'] ?? fallbackRefreshToken;
    if (access is! String ||
        access.isEmpty ||
        refresh is! String ||
        refresh.isEmpty)
      return null;
    return SessionTokens(accessToken: access, refreshToken: refresh);
  }
}
