import 'dart:convert';
import 'package:dio/dio.dart';
import 'secure_storage.dart';
import 'api_client.dart';
import 'app_logger.dart';
import 'endpoint_resolver.dart';

class SignupResult {
  final bool success;
  final String? token;
  final String? message;

  SignupResult({required this.success, this.token, this.message});
}

class AuthService {
  final String? _baseOverride;
  final ApiClient _client;

  AuthService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;

  /// Calls the sign-up endpoint and stores token securely on success.
  Future<SignupResult> signup(
      {required String phoneNumber,
      required String password,
      required String firstName,
      required String lastName,
      String? firebaseUid,
      bool? isNew}) async {
    final uri = Uri.parse('$baseUrl/api/Auth/sign-up');
    final body = {
      'phoneNumber': phoneNumber,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      if (firebaseUid != null) 'firebaseUid': firebaseUid,
      if (isNew != null) 'isNew': isNew,
    };

    try {
      AppLogger.logInfo('AuthService.signup',
          'POST ${uri.toString()} payload=${jsonEncode(body)}');
      final resp = await _client.post(uri.toString(), data: body);
      final status = resp.statusCode ?? 0;

      // Success responses (200..299)
      if (status >= 200 && status < 300) {
        final jsonBody = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;

        // Server may return token at top-level as in the provided sample
        String? token;
        String? message;
        if (jsonBody.containsKey('token')) {
          token = jsonBody['token'] as String?;
          message = jsonBody['message'] as String?;
        } else {
          // Fallback to older nested shape: { success, data: { token, ... }, message }
          final success = jsonBody['success'] == true;
          final data = jsonBody['data'] as Map<String, dynamic>?;
          token = data != null ? (data['token'] as String?) : null;
          message = data != null
              ? (data['message'] as String?)
              : (jsonBody['message'] as String?);
          if (!success && token == null) {
            return SignupResult(
                success: false, message: message ?? 'Sign-up failed');
          }
        }

        if (token != null) {
          await SecureStorage().write('auth_token', token);
          AppLogger.logInfo(
              'AuthService.signup', 'Stored auth token (len=${token.length})');
          // store refresh token if provided
          final refresh = jsonBody['refreshToken'] as String? ??
              (jsonBody['data'] is Map
                  ? (jsonBody['data']['refreshToken'] as String?)
                  : null);
          if (refresh != null && refresh.isNotEmpty) {
            await SecureStorage().write('refresh_token', refresh);
            AppLogger.logInfo('AuthService.signup',
                'Stored refresh token (len=${refresh.length})');
          }
          return SignupResult(success: true, token: token, message: message);
        }

        return SignupResult(
            success: false,
            message: message ?? 'Sign-up succeeded but no token was returned');
      }

      // Handle client errors (400) with Problem Details shape
      if (status == 400) {
        try {
          final jsonBody = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
          final title = jsonBody['title'] as String?;
          final detail = jsonBody['detail'] as String?;
          final type = jsonBody['type'] as String?;
          final message = [
            if (title != null) title,
            if (detail != null) detail,
            if (type != null) '(type=$type)'
          ].where((s) => s.isNotEmpty).join(' - ');
          return SignupResult(
              success: false,
              message: message.isNotEmpty ? message : 'Bad request');
        } catch (_) {
          return SignupResult(success: false, message: 'Bad request (400)');
        }
      }

      String? msg;
      try {
        final jsonBody = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        msg = jsonBody['message'] as String?;
      } catch (_) {}
      return SignupResult(
          success: false, message: msg ?? 'Server error: $status');
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      String? body;
      try {
        if (e.response?.data != null) {
          body = e.response!.data is String
              ? e.response!.data as String
              : e.response!.data.toString();
        }
      } catch (_) {}
      final message = ['Network error'];
      if (status != null) message.add('status=$status');
      if (body != null && body.isNotEmpty) message.add('body=$body');
      message.add('error=${e.message}');
      AppLogger.logError(
          'AuthService.signup', message.join(' | '), e.stackTrace);
      return SignupResult(success: false, message: message.join(' | '));
    } catch (e) {
      return SignupResult(success: false, message: 'Unexpected error: $e');
    }
  }

  /// Attempt to extract a user identifier from the stored auth token (JWT).
  /// Returns the claim value as a string when present, or null otherwise.
  Future<String?> userIdFromToken() async {
    try {
      final token = await SecureStorage().read('auth_token');
      if (token == null || token.isEmpty) return null;
      final parts = token.split('.');
      if (parts.length < 2) return null;
      var payload = parts[1];
      // Base64url padding
      payload = base64Url.normalize(payload);
      final decoded = utf8.decode(base64Url.decode(payload));
      final map = jsonDecode(decoded) as Map<String, dynamic>;
      // Common claim names
      const keys = ['sub', 'userId', 'user_id', 'uid', 'id', 'nameid'];
      for (final k in keys) {
        if (map.containsKey(k) && map[k] != null) {
          return map[k].toString();
        }
      }
      // If none found, try top-level 'claims' collection
      if (map.containsKey('claims') && map['claims'] is Map) {
        final cm = map['claims'] as Map<String, dynamic>;
        for (final k in keys) {
          if (cm.containsKey(k) && cm[k] != null) return cm[k].toString();
        }
      }
      return null;
    } catch (e) {
      AppLogger.logInfo(
          'AuthService.userIdFromToken', 'Failed to decode token: $e');
      return null;
    }
  }
}

class AuthResult {
  final bool success;
  final String? token;
  final String? message;

  AuthResult({required this.success, this.token, this.message});
}

extension AuthServiceLogin on AuthService {
  Future<AuthResult> login(
      {required String phoneNumber, required String password}) async {
    // Use the configured baseUrl (do not force https) so local/dev servers work
    final uri = Uri.parse('$baseUrl/api/v1/Auth/login');
    final payload = {'phoneNumber': phoneNumber, 'password': password};
    try {
      AppLogger.logInfo('AuthService.login',
          'POST ${uri.toString()} payload=${jsonEncode(payload)}');
      final resp = await _client.post(uri.toString(),
          data: payload, headers: {'content-type': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('AuthService.login', 'Response status=$status');
      if (status >= 200 && status < 300) {
        Map<String, dynamic> jsonBody = {};
        try {
          jsonBody = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
        } catch (_) {
          // leave jsonBody empty
        }

        // Support multiple response shapes: top-level token, or { success, data: { token, ... } }
        String? token;
        String? refresh;
        String? message;
        bool success = false;

        if (jsonBody.containsKey('token')) {
          token = jsonBody['token'] as String?;
          message = jsonBody['message'] as String?;
          success = token != null;
        }

        final data = (jsonBody['data'] is Map)
            ? (jsonBody['data'] as Map<String, dynamic>)
            : null;
        if (data != null) {
          token ??= data['token'] as String?;
          refresh = data['refreshToken'] as String? ??
              data['refresh_token'] as String?;
          message ??= data['message'] as String?;
          success = success || (jsonBody['success'] == true) || (token != null);
        } else {
          // fallback: if response has a message field and no token, use it
          message ??= jsonBody['message'] as String?;
          success = success || (jsonBody['success'] == true);
        }

        // persist tokens if present
        if (token != null && token.isNotEmpty) {
          await SecureStorage().write('auth_token', token);
          AppLogger.logInfo(
              'AuthService.login', 'Stored auth token (len=${token.length})');
        }
        if (refresh != null && refresh.isNotEmpty) {
          await SecureStorage().write('refresh_token', refresh);
          AppLogger.logInfo('AuthService.login',
              'Stored refresh token (len=${refresh.length})');
        }

        return AuthResult(success: success, token: token, message: message);
      }
      String? msg;
      try {
        final jsonBody = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        msg = jsonBody['message'] as String?;
      } catch (_) {}
      return AuthResult(
          success: false, message: msg ?? 'Server error: $status');
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      String? body;
      try {
        if (e.response?.data != null) {
          body = e.response!.data is String
              ? e.response!.data as String
              : e.response!.data.toString();
        }
      } catch (_) {}
      final message = ['Network error'];
      if (status != null) message.add('status=$status');
      if (body != null && body.isNotEmpty) message.add('body=$body');
      message.add('error=${e.message}');
      AppLogger.logError(
          'AuthService.login', message.join(' | '), e.stackTrace);
      return AuthResult(success: false, message: message.join(' | '));
    } catch (e) {
      return AuthResult(success: false, message: 'Unexpected error: $e');
    }
  }
}
