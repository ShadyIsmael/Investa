import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/support_message.dart';

abstract class SupportRepository {
  Future<Either<Failure, void>> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  });

  Stream<SupportMessage> listenToSupportMessages();

  Future<Either<Failure, String>> initiateSupportSession({
    required String userMobile,
    required String type,
  });
}
