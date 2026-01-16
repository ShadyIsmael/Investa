import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/services/secure_storage_service.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

/// Implementation of AuthRepository.
///
/// This is the data layer implementation that coordinates between
/// remote data sources, local storage, and the domain layer.
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SecureStorageService secureStorage;

  User? _currentUser;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.secureStorage,
  });

  @override
  Future<Either<Failure, User>> login({
    required String phoneNumber,
    required String password,
  }) async {
    try {
      final userDto = await remoteDataSource.login(
        phoneNumber: phoneNumber,
        password: password,
      );

      _currentUser = userDto.toEntity();

      // Store phone number for future use
      await secureStorage.write('user_phone', phoneNumber);

      return Right(_currentUser!);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e, stackTrace) {
      return Left(UnexpectedFailure('Login failed: $e', stackTrace));
    }
  }

  @override
  Future<Either<Failure, User>> signup({
    required String phoneNumber,
    required String password,
    required String firstName,
    required String lastName,
    String? firebaseUid,
  }) async {
    try {
      final userDto = await remoteDataSource.signup(
        phoneNumber: phoneNumber,
        password: password,
        firstName: firstName,
        lastName: lastName,
        firebaseUid: firebaseUid,
      );

      _currentUser = userDto.toEntity();

      // Store phone number for future use
      await secureStorage.write('user_phone', phoneNumber);

      return Right(_currentUser!);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e, stackTrace) {
      return Left(UnexpectedFailure('Signup failed: $e', stackTrace));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      // Clear all auth data
      await secureStorage.delete('auth_token');
      await secureStorage.delete('refresh_token');
      await secureStorage.delete('user_phone');

      _currentUser = null;

      return const Right(null);
    } catch (e, stackTrace) {
      return Left(UnexpectedFailure('Logout failed: $e', stackTrace));
    }
  }

  @override
  Future<Either<Failure, User?>> getCurrentUser() async {
    try {
      return Right(_currentUser);
    } catch (e, stackTrace) {
      return Left(
          UnexpectedFailure('Failed to get current user: $e', stackTrace));
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    final token = await secureStorage.read('auth_token');
    return token != null && token.isNotEmpty;
  }

  @override
  Future<Either<Failure, void>> sendFcmToken(String token) async {
    try {
      await remoteDataSource.sendFcmToken(token);
      return const Right(null);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e, stackTrace) {
      return Left(
          UnexpectedFailure('Failed to send FCM token: $e', stackTrace));
    }
  }
}
