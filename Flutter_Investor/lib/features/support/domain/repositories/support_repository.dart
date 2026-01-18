import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/support_message.dart';

/// Abstract repository interface for support feature.
abstract class SupportRepository {
  /// Send a support request via SignalR
  Future<Either<Failure, void>> sendSupportRequest({
    required String userMobile,
    required String message,
    required String type,
    required String sessionId,
  });

  /// Listen to incoming support messages
  Stream<SupportMessage> listenToSupportMessages();

  /// Connect to SignalR hub
  Future<Either<Failure, void>> connectToHub();

  /// Disconnect from SignalR hub
  Future<void> disconnectFromHub();

  /// Check if connected to hub
  bool isConnectedToHub();

  /// Initiate a support session
  Future<Either<Failure, String>> initiateSupportSession({
    required String userMobile,
    required String type,
  });
}
