import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class SignupUseCase {
  final AuthRepository repository;

  SignupUseCase(this.repository);

  Future<Either<Failure, User>> call({
    required String phoneNumber,
    required String password,
    required String firstName,
    required String lastName,
    String? firebaseUid,
  }) async {
    return await repository.signup(
      phoneNumber: phoneNumber,
      password: password,
      firstName: firstName,
      lastName: lastName,
      firebaseUid: firebaseUid,
    );
  }
}
