import 'package:equatable/equatable.dart';

/// Domain entity representing an authenticated user.
///
/// This is a pure business model with no dependencies on external libraries.
/// It contains only the data and business logic related to a user.
class User extends Equatable {
  final String id;
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String? email;
  final String? firebaseUid;
  final bool isVerified;
  final DateTime? createdAt;

  const User({
    required this.id,
    required this.phoneNumber,
    required this.firstName,
    required this.lastName,
    this.email,
    this.firebaseUid,
    this.isVerified = false,
    this.createdAt,
  });

  String get fullName => '$firstName $lastName';

  @override
  List<Object?> get props => [
        id,
        phoneNumber,
        firstName,
        lastName,
        email,
        firebaseUid,
        isVerified,
        createdAt,
      ];

  User copyWith({
    String? id,
    String? phoneNumber,
    String? firstName,
    String? lastName,
    String? email,
    String? firebaseUid,
    bool? isVerified,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      firebaseUid: firebaseUid ?? this.firebaseUid,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
