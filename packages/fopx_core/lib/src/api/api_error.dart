import 'package:dio/dio.dart';

class ApiFieldError {
  const ApiFieldError({required this.field, required this.message});

  final String field;
  final String message;
}

class ApiError implements Exception {
  const ApiError({
    required this.message,
    this.success,
    this.code,
    this.data,
    this.errors = const <ApiFieldError>[],
    this.statusCode,
  });

  factory ApiError.fromDioException(DioException exception) {
    return ApiError.fromPayload(
      exception.response?.data,
      statusCode: exception.response?.statusCode,
      fallbackMessage: _dioMessage(exception),
    );
  }

  factory ApiError.fromPayload(
    dynamic payload, {
    int? statusCode,
    String fallbackMessage = 'The request could not be completed.',
  }) {
    if (payload is! Map) {
      return ApiError(
        message: fallbackMessage,
        statusCode: statusCode,
      );
    }

    final body = Map<String, dynamic>.from(payload);
    final data = body['data'];
    final nested = data is Map ? Map<String, dynamic>.from(data) : null;
    final message = _string(body['message']) ??
        _string(nested?['message']) ??
        fallbackMessage;
    final code = _string(body['code']) ?? _string(nested?['code']);

    return ApiError(
      success: body['success'] is bool ? body['success'] as bool : null,
      code: code,
      message: message,
      data: data,
      errors: _fieldErrors(body['errors'] ?? nested?['errors']),
      statusCode: statusCode,
    );
  }

  final bool? success;
  final String? code;
  final String message;
  final dynamic data;
  final List<ApiFieldError> errors;
  final int? statusCode;

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;

  @override
  String toString() {
    final suffix = code == null ? '' : ' [$code]';
    return 'ApiError${statusCode == null ? '' : ' ${statusCode!}'}$suffix: $message';
  }

  static String? _string(dynamic value) => value is String && value.isNotEmpty ? value : null;

  static String _dioMessage(DioException exception) {
    if (exception.type == DioExceptionType.connectionTimeout ||
        exception.type == DioExceptionType.receiveTimeout ||
        exception.type == DioExceptionType.sendTimeout) {
      return 'The request timed out. Please try again.';
    }
    if (exception.type == DioExceptionType.cancel) {
      return 'The request was cancelled.';
    }
    return 'The request could not be completed. Please try again.';
  }

  static List<ApiFieldError> _fieldErrors(dynamic value) {
    if (value is Map) {
      return value.entries
          .expand((entry) {
            final raw = entry.value;
            if (raw is List) {
              return raw.map((item) => ApiFieldError(
                    field: entry.key.toString(),
                    message: item.toString(),
                  ));
            }
            return <ApiFieldError>[
              ApiFieldError(field: entry.key.toString(), message: raw.toString()),
            ];
          })
          .toList(growable: false);
    }
    if (value is List) {
      return value
          .whereType<Map>()
          .map((item) => ApiFieldError(
                field: item['field']?.toString() ?? item['key']?.toString() ?? '',
                message: item['message']?.toString() ?? item['error']?.toString() ?? '',
              ))
          .where((error) => error.message.isNotEmpty)
          .toList(growable: false);
    }
    return const <ApiFieldError>[];
  }
}
