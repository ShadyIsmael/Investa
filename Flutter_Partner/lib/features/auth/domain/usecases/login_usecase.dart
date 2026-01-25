import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Use case for user login.
///
/// Each use case represents a single business operation.
/// This follows the Single Responsibility Principle.
class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<Either<Failure, User>> call({
    required String phoneNumber,
    required String password,
  }) async {
    return await repository.login(
      phoneNumber: phoneNumber,
      password: password,
    );
  }
}
