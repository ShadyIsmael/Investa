import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';

/// Abstract repository interface for authentication.
///
/// This defines the contract that must be implemented by the data layer.
/// The domain layer depends on this abstraction, not on concrete implementations.
abstract class AuthRepository {
  /// Login with phone number and password
  Future<Either<Failure, User>> login({
    required String phoneNumber,
    required String password,
  });

  /// Sign up new user
  Future<Either<Failure, User>> signup({
    required String phoneNumber,
    required String password,
    required String firstName,
    required String lastName,
    String? firebaseUid,
  });

  /// Logout current user
  Future<Either<Failure, void>> logout();

  /// Get current authenticated user
  Future<Either<Failure, User?>> getCurrentUser();

  /// Check if user is authenticated
  Future<bool> isAuthenticated();

  /// Send FCM token to backend
  Future<Either<Failure, void>> sendFcmToken(String token);
}
