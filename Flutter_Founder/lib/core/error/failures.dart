import 'package:equatable/equatable.dart';

/// Base class for all failures in the application.
///
/// This follows functional programming principles where errors are treated
/// as data rather than exceptions. All failures extend this base class.
abstract class Failure extends Equatable {
  final String message;
  final StackTrace? stackTrace;

  const Failure(this.message, [this.stackTrace]);

  @override
  List<Object?> get props => [message, stackTrace];

  @override
  String toString() => message;
}

/// Network-related failures (no connection, timeout, etc.)
class NetworkFailure extends Failure {
  const NetworkFailure(super.message, [super.stackTrace]);
}

/// Server-related failures (5xx errors, malformed responses, etc.)
class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure(super.message, [this.statusCode, super.stackTrace]);

  @override
  List<Object?> get props => [message, statusCode, stackTrace];
}

/// Authentication/Authorization failures
class AuthenticationFailure extends Failure {
  const AuthenticationFailure(super.message, [super.stackTrace]);
}

/// Validation failures (invalid input, business rules violated, etc.)
class ValidationFailure extends Failure {
  final Map<String, String>? fieldErrors;

  const ValidationFailure(super.message, [this.fieldErrors, super.stackTrace]);

  @override
  List<Object?> get props => [message, fieldErrors, stackTrace];
}

/// Cache-related failures
class CacheFailure extends Failure {
  const CacheFailure(super.message, [super.stackTrace]);
}

/// SignalR-related failures
class SignalRFailure extends Failure {
  const SignalRFailure(super.message, [super.stackTrace]);
}

/// Firebase-related failures
class FirebaseFailure extends Failure {
  const FirebaseFailure(super.message, [super.stackTrace]);
}

/// Generic unexpected failure
class UnexpectedFailure extends Failure {
  const UnexpectedFailure(super.message, [super.stackTrace]);
}
