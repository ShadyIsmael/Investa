import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/support_repository.dart';

class InitiateSupportSessionUseCase {
  final SupportRepository repository;

  InitiateSupportSessionUseCase(this.repository);

  Future<Either<Failure, String>> call({
    required String userMobile,
    required String type,
  }) async {
    if (userMobile.isEmpty) {
      return const Left(ValidationFailure('Phone number is required'));
    }

    if (!['Request', 'Inquiry', 'Complaint', 'LiveSupport'].contains(type)) {
      return const Left(ValidationFailure('Invalid support type'));
    }

    return await repository.initiateSupportSession(
      userMobile: userMobile,
      type: type,
    );
  }
}
