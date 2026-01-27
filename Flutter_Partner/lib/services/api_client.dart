import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_partner/services/app_logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'secure_storage.dart';
import 'endpoint_resolver.dart';

/// Dio-based API client that injects the auth token via interceptor.
class ApiClient {
  final Dio _dio;

  ApiClient({BaseOptions? options})
      : _dio = Dio(options ??
            BaseOptions(
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 30),
                sendTimeout: const Duration(seconds: 15))) {
    // Log configured timeouts for debugging
    try {
      final bo = _dio.options;
      AppLogger.logInfo('ApiClient',
          'Dio configured timeouts: connect=${bo.connectTimeout}, receive=${bo.receiveTimeout}, send=${bo.sendTimeout}');
    } catch (_) {}

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (opts, handler) async {
        try {
          // Respect any Authorization header already present on the request
          final existing = opts.headers['Authorization'];
          if (existing != null) {
            AppLogger.logInfo('ApiClient',
                'Outgoing request has existing Authorization header');
            return handler.next(opts);
          }

          var token = await SecureStorage().read('auth_token');
          if (token == null || token.isEmpty) {
            try {
              final prefs = await SharedPreferences.getInstance();
              token = prefs.getString('auth_token');
            } catch (_) {
              // ignore shared prefs errors
            }
          }

          if (token != null && token.isNotEmpty) {
            opts.headers['Authorization'] = 'Bearer $token';
            final authVal = opts.headers['Authorization']?.toString();
            // Mask token for logs: show first/last 4 chars and length
            try {
              final t = token;
              final masked = t.length > 8
                  ? '${t.substring(0, 4)}...${t.substring(t.length - 4)}'
                  : '***';
              AppLogger.logInfo('ApiClient',
                  'Authorization header set (len=${authVal?.length ?? 0}, token=$masked)');
            } catch (_) {
              AppLogger.logInfo('ApiClient',
                  'Authorization header set (len=${authVal?.length ?? 0})');
            }
          } else {
            AppLogger.logInfo(
                'ApiClient', 'No auth token available for outgoing request');
          }
        } catch (e) {
          // don't block requests if token read fails
          AppLogger.logInfo('ApiClient', 'Token read failure: $e');
        }
        // Log request URL and headers for debugging (headers masked above)
        try {
          AppLogger.logInfo('ApiClient',
              'Outgoing request ${opts.method} ${opts.uri.toString()} headers=${opts.headers.keys.toList()}');
        } catch (_) {}
        return handler.next(opts);
      },
      onError: (e, handler) async {
        try {
          final status = e.response?.statusCode ?? 0;
          // Attempt token refresh on 401 and retry once
          if (status == 401) {
            AppLogger.logInfo(
                'ApiClient', 'Received 401; attempting token refresh');
            var refresh = await SecureStorage().read('refresh_token');
            if (refresh != null && refresh.isNotEmpty) {
              // Use configured base URL for refresh (do not force https)
              final base = EndpointResolver.instance.selectedApiBaseUrl;
              final refreshUrl = '$base/api/v1/Auth/refresh';
              try {
                final plain = Dio(BaseOptions(
                    connectTimeout: const Duration(seconds: 15),
                    receiveTimeout: const Duration(seconds: 30),
                    sendTimeout: const Duration(seconds: 15)));
                final refreshResp = await plain.post(refreshUrl,
                    data: {'refreshToken': refresh},
                    options:
                        Options(headers: {'content-type': 'application/json'}));
                final rs = refreshResp.statusCode ?? 0;
                if (rs >= 200 && rs < 300) {
                  String? newToken;
                  try {
                    final body = refreshResp.data is Map
                        ? refreshResp.data as Map<String, dynamic>
                        : jsonDecode(refreshResp.toString())
                            as Map<String, dynamic>;
                    newToken = body['token'] as String? ??
                        (body['data'] is Map
                            ? (body['data']['token'] as String?)
                            : null);
                  } catch (_) {}
                  if (newToken != null && newToken.isNotEmpty) {
                    await SecureStorage().write('auth_token', newToken);
                    // Retry original request with new token (only once)
                    final opts = e.requestOptions;
                    opts.headers['Authorization'] = 'Bearer $newToken';
                    if (opts.extra['retry'] == true) return handler.next(e);
                    opts.extra['retry'] = true;
                    final retryResp = await _dio.fetch(opts);
                    return handler.resolve(retryResp);
                  }
                }
              } catch (re) {
                AppLogger.logError(
                    'ApiClient', 'Refresh request failed: $re', null);
              }
            } else {
              AppLogger.logInfo('ApiClient', 'No refresh token available');
            }
          }

          // Failover logic: if we hit a connection timeout, attempt other
          // API candidates and retry the failed request against them. We
          // only attempt this once per request (mark via opts.extra['failover']).
          final opts = e.requestOptions;
          final isTimeout = e.type == DioExceptionType.connectionTimeout ||
              (e.error != null && e.error is SocketException);

          if (isTimeout) {
            try {
              if (opts.extra['failover'] == true) {
                // Already attempted failover once; don't loop
                return handler.next(e);
              }

              final resolver = EndpointResolver.instance;
              final candidates = resolver.apiBaseUrls;
              if (candidates.length <= 1) return handler.next(e);

              // Figure out current index (default to resolver.selectedIndex)
              var cur = resolver.selectedIndex;

              for (var i = 0; i < candidates.length; i++) {
                final tryIdx = (cur + 1 + i) % candidates.length;
                if (tryIdx == cur) continue; // skip same

                final newBase = candidates[tryIdx];
                try {
                  final origUri = opts.uri;
                  final newBaseUri = Uri.parse(newBase);
                  final replaced = origUri.replace(
                      scheme: newBaseUri.scheme,
                      host: newBaseUri.host,
                      port: newBaseUri.hasPort ? newBaseUri.port : null);
                  final newOpts = opts.copyWith(path: replaced.toString());
                  newOpts.extra['failover'] = true;

                  AppLogger.logInfo('ApiClient',
                      'Failover: retrying request against $newBase (index=$tryIdx)');

                  final retryResp = await _dio.fetch(newOpts);

                  // If we reach here, the candidate worked. Persist selection.
                  await resolver.setSelectedIndex(tryIdx);

                  AppLogger.logInfo('ApiClient',
                      'Failover succeeded; selected API index=$tryIdx');

                  return handler.resolve(retryResp);
                } catch (re) {
                  // Try next candidate
                  AppLogger.logInfo('ApiClient',
                      'Failover attempt against $newBase failed: $re');
                  continue;
                }
              }
            } catch (fe) {
              AppLogger.logError(
                  'ApiClient', 'Failover handler failed: $fe', null);
            }
          }
        } catch (logErr) {
          AppLogger.logError(
              'ApiClient', 'onError handler failed: $logErr', null);
        }
        return handler.next(e);
      },
      onResponse: (resp, handler) {
        try {
          final status = resp.statusCode ?? 0;
          if (status == 307 || status == 308) {
            final location = resp.headers.value('location') ??
                resp.headers.map['location']?.first;
            final www = resp.headers.value('www-authenticate') ??
                resp.headers.map['www-authenticate']?.first;
            AppLogger.logInfo('ApiClient',
                'Redirect $status -> $location; WWW-Authenticate: ${www ?? 'none'}');
          }
        } catch (e) {
          // ignore logging errors
        }
        return handler.next(resp);
      },
    ));

    // In debug mode allow connecting to development servers with self-signed
    // certificates (e.g. https://192.168.x.x). This is intentional for local
    // development only. It logs the allowance so you can audit behavior.
    if (kDebugMode) {
      try {
        final adapter = _dio.httpClientAdapter;
        if (adapter is IOHttpClientAdapter) {
          adapter.onHttpClientCreate = (client) {
            client.badCertificateCallback =
                (X509Certificate cert, String host, int port) {
              try {
                AppLogger.logInfo('ApiClient',
                    'Allowing bad certificate for $host:$port in debug mode');
              } catch (_) {}
              return true;
            };
            return client;
          };
        }
      } catch (e) {
        AppLogger.logError(
            'ApiClient', 'Failed to configure insecure TLS handling: $e', null);
      }
    }
  }

  Future<Response> post(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) {
    return _dio.post(url, data: data, options: Options(headers: headers));
  }

  Future<Response> get(String url,
      {Map<String, dynamic>? headers, Map<String, dynamic>? queryParameters}) {
    return _dio.get(url,
        queryParameters: queryParameters, options: Options(headers: headers));
  }

  Future<Response> put(String url,
      {Map<String, dynamic>? data, Map<String, dynamic>? headers}) {
    return _dio.put(url, data: data, options: Options(headers: headers));
  }

  void close() => _dio.close();
}
