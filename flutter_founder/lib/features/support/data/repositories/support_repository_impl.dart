import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/support_message.dart';
import '../../domain/repositories/support_repository.dart';
import '../datasources/support_remote_datasource.dart';

class SupportRepositoryImpl implements SupportRepository {
  final SupportRemoteDataSource remoteDataSource;

  SupportRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  @override
  Future<Either<Failure, void>> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  }) async {
    try {
      await remoteDataSource.sendSupportRequest(
        userMobile: userMobile,
        message: message,
        type: type,
        sessionId: sessionId,
      );

      return const Right(null);
    } on SignalRFailure catch (failure) {
      return Left(failure);
    } catch (e, stackTrace) {
      return Left(
          SignalRFailure('Failed to send support request: $e', stackTrace));
    }
  }

  @override
  Stream<SupportMessage> listenToSupportMessages() {
    return remoteDataSource.listenToMessages();
  }

  @override
  Future<Either<Failure, void>> connectToHub() async {
    try {
      await remoteDataSource.connect();
      return const Right(null);
    } on SignalRFailure catch (failure) {
      return Left(failure);
    } catch (e, stackTrace) {
      return Left(SignalRFailure('Failed to connect to hub: $e', stackTrace));
    }
  }

  @override
  Future<void> disconnectFromHub() async {
    await remoteDataSource.disconnect();
  }

  @override
  bool isConnectedToHub() {
    return remoteDataSource.isConnected();
  }

  @override
  Future<Either<Failure, String>> initiateSupportSession({
    required String userMobile,
    required String type,
  }) async {
    try {
      final sessionId = await remoteDataSource.initiateSupportSession(
        userMobile: userMobile,
        type: type,
      );
      return Right(sessionId);
    } catch (e, stackTrace) {
      return Left(
          SignalRFailure('Failed to initiate support session: $e', stackTrace));
    }
  }
}
