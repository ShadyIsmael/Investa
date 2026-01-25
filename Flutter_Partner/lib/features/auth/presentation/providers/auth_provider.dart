import 'package:flutter/foundation.dart';
import '../../../../core/services/logger_service.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/signup_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';

/// State for authentication
enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

/// Provider for authentication using ChangeNotifier.
///
/// This is the presentation layer that manages UI state.
/// It uses use cases to perform business operations.
class AuthProvider with ChangeNotifier {
  final LoginUseCase loginUseCase;
  final SignupUseCase signupUseCase;
  final LogoutUseCase logoutUseCase;
  final LoggerService logger;

  AuthState _state = AuthState.initial;
  User? _user;
  String? _errorMessage;

  AuthProvider({
    required this.loginUseCase,
    required this.signupUseCase,
    required this.logoutUseCase,
    required this.logger,
  });

  // Getters
  AuthState get state => _state;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated =>
      _state == AuthState.authenticated && _user != null;
  bool get isLoading => _state == AuthState.loading;

  /// Login with phone number and password
  Future<bool> login({
    required String phoneNumber,
    required String password,
  }) async {
    _setState(AuthState.loading);
    _errorMessage = null;

    logger.info('[Auth]', 'Attempting login for: $phoneNumber');

    final result = await loginUseCase(
      phoneNumber: phoneNumber,
      password: password,
    );

    return result.fold(
      (failure) {
        logger.error('[Auth]', 'Login failed: ${failure.message}');
        _errorMessage = failure.message;
        _setState(AuthState.error);
        return false;
      },
      (user) {
        logger.info('[Auth]', 'Login successful for: ${user.fullName}');
        _user = user;
        _setState(AuthState.authenticated);
        return true;
      },
    );
  }

  /// Sign up new user
  Future<bool> signup({
    required String phoneNumber,
    required String password,
    required String firstName,
    required String lastName,
    String? firebaseUid,
  }) async {
    _setState(AuthState.loading);
    _errorMessage = null;

    logger.info('[Auth]', 'Attempting signup for: $phoneNumber');

    final result = await signupUseCase(
      phoneNumber: phoneNumber,
      password: password,
      firstName: firstName,
      lastName: lastName,
      firebaseUid: firebaseUid,
    );

    return result.fold(
      (failure) {
        logger.error('[Auth]', 'Signup failed: ${failure.message}');
        _errorMessage = failure.message;
        _setState(AuthState.error);
        return false;
      },
      (user) {
        logger.info('[Auth]', 'Signup successful for: ${user.fullName}');
        _user = user;
        _setState(AuthState.authenticated);
        return true;
      },
    );
  }

  /// Logout current user
  Future<void> logout() async {
    logger.info('[Auth]', 'Logging out user');

    final result = await logoutUseCase();

    result.fold(
      (failure) {
        logger.error('[Auth]', 'Logout failed: ${failure.message}');
        // Still clear local state even if API call fails
        _user = null;
        _setState(AuthState.unauthenticated);
      },
      (_) {
        logger.info('[Auth]', 'Logout successful');
        _user = null;
        _setState(AuthState.unauthenticated);
      },
    );
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void _setState(AuthState newState) {
    _state = newState;
    notifyListeners();
  }
}
