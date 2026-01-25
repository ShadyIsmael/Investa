import 'package:dio/dio.dart';
import '../error/failures.dart';
import '../services/logger_service.dart';
import '../services/secure_storage_service.dart';
import 'network_config.dart';

/// Centralized network client using Dio for all HTTP requests.
///
/// Features:
/// - Automatic token injection
/// - Error handling and transformation to Failures
/// - Request/Response logging
/// - Retry logic for failed requests
class NetworkClient {
  final Dio dio;
  final NetworkConfig networkConfig;
  final SecureStorageService secureStorage;
  final LoggerService logger;

  NetworkClient({
    required this.dio,
    required this.networkConfig,
    required this.secureStorage,
    required this.logger,
  }) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    // Token injection interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await secureStorage.read('auth_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Set base URL dynamically
          if (!options.path.startsWith('http')) {
            options.baseUrl = networkConfig.baseUrl;
          }

          logger.debug('[API]', 'Request: ${options.method} ${options.uri}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          logger.debug('[API]',
              'Response: ${response.statusCode} ${response.requestOptions.uri}');
          return handler.next(response);
        },
        onError: (error, handler) async {
          logger.error('[API]', 'Error: ${error.message}', error.stackTrace);

          // Handle token refresh on 401
          if (error.response?.statusCode == 401) {
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the request
              final options = error.requestOptions;
              final token = await secureStorage.read('auth_token');
              options.headers['Authorization'] = 'Bearer $token';

              try {
                final response = await dio.fetch(options);
                return handler.resolve(response);
              } catch (e) {
                return handler.next(error);
              }
            }
          }

          return handler.next(error);
        },
      ),
    );
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await secureStorage.read('refresh_token');
      if (refreshToken == null || refreshToken.isEmpty) {
        return false;
      }

      final response = await dio.post(
        '${networkConfig.baseUrl}/api/v1/Auth/refresh-token',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final newToken = response.data['token'];
        final newRefreshToken = response.data['refreshToken'];

        if (newToken != null) {
          await secureStorage.write('auth_token', newToken);
        }
        if (newRefreshToken != null) {
          await secureStorage.write('refresh_token', newRefreshToken);
        }

        return true;
      }

      return false;
    } catch (e) {
      logger.error('[API]', 'Token refresh failed: $e');
      return false;
    }
  }

  /// Generic GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Generic POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Generic PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Generic DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Failure _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure(
            'Connection timeout. Please check your internet connection.');

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode ?? 0;
        final message = error.response?.data?['message'] ??
            error.response?.data?['error'] ??
            'Server error occurred';

        if (statusCode == 401) {
          return const AuthenticationFailure(
              'Authentication failed. Please login again.');
        } else if (statusCode >= 500) {
          return ServerFailure('Server error: $message');
        } else {
          return ServerFailure(message);
        }

      case DioExceptionType.cancel:
        return const NetworkFailure('Request cancelled');

      case DioExceptionType.connectionError:
        return const NetworkFailure(
            'No internet connection. Please check your network.');

      default:
        return NetworkFailure('Unexpected error occurred: ${error.message}');
    }
  }
}
