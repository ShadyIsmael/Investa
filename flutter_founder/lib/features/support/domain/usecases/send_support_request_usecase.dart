import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/support_repository.dart';

class SendSupportRequestUseCase {
  final SupportRepository repository;

  SendSupportRequestUseCase(this.repository);

  Future<Either<Failure, void>> call({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  }) async {
    // Validate inputs
    if (userMobile.isEmpty) {
      return const Left(ValidationFailure('Phone number is required'));
    }

    if (message.isEmpty) {
      return const Left(ValidationFailure('Message is required'));
    }

    if (!['Request', 'Inquiry', 'Complaint', 'LiveSupport'].contains(type)) {
      return const Left(ValidationFailure('Invalid support type'));
    }

    if (sessionId.isEmpty) {
      return const Left(ValidationFailure('Session ID is required'));
    }

    return await repository.sendSupportRequest(
      userMobile: userMobile,
      message: message,
      type: type,
      sessionId: sessionId,
    );
  }
}
