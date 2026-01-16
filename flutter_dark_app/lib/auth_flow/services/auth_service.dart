import 'package:dio/dio.dart';
import '../services/app_logger.dart';
import '../../services/config.dart';

class SignupResult {
  final bool success;
  final String? token;
  final String? message;
  final int? statusCode;

  SignupResult(
      {required this.success, this.token, this.message, this.statusCode});
}

class AuthService {
  final Dio _dio;

  AuthService({Dio? dio, String? baseUrl})
      : assert((baseUrl ?? Env.apiBaseUrl).isNotEmpty,
            'API base URL is not configured'),
        _dio = dio ??
            Dio(BaseOptions(
              baseUrl: baseUrl ?? Env.apiBaseUrl,
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 10),
              headers: {'Content-Type': 'application/json'},
            ));

  Future<SignupResult> signup({
    required String phoneNumber,
    required String firstName,
    required String lastName,
    required String password,
    required String idToken,
    bool? isNew,
  }) async {
    try {
      // الـ Data بتبعتها Map مباشرة والـ Dio بيحولها JSON لوحده
      final data = {
        'phoneNumber': phoneNumber,
        'firstName': firstName,
        'lastName': lastName,
        'password': password,
        'idToken': idToken,
        if (isNew != null) 'isNew': isNew,
      };

      final resp = await _dio.post('/api/Auth/sign-up', data: data);

      final body = resp.data;
      // استخراج التوكن بمرونة أكتر سواء من الـ root أو من جوه object الـ data
      final token = body['token'] ?? body['data']?['token'];
      final message = body['message'] ?? body['data']?['message'];

      return SignupResult(
        success: true,
        token: token?.toString(),
        message: message?.toString() ?? 'Account created successfully',
      );
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final responseData = e.response?.data;

      // تسجيل الخطأ في الـ Logger بتاعنا للرجوع إليه
      AppLogger.logError(
          'AuthService.signup', e.message ?? 'Dio Error', e.stackTrace);

      if (status == 409) {
        return SignupResult(
            success: false,
            message: 'رقم الموبايل مسجل مسبقاً',
            statusCode: 409);
      }

      // لو الـ Backend باعت رسالة خطأ محددة (زي Password weak)
      final errorMessage = responseData is Map ? responseData['message'] : null;

      return SignupResult(
          success: false,
          message: errorMessage?.toString() ?? 'فشل الاتصال بالسيرفر ($status)',
          statusCode: status);
    } catch (e, st) {
      AppLogger.logError('AuthService.signup_unexpected', e.toString(), st);
      return SignupResult(success: false, message: 'حدث خطأ غير متوقع');
    }
  }
}
