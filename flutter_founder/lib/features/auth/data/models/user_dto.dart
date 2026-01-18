import '../../domain/entities/user.dart';

/// Data Transfer Object for User.
///
/// This maps JSON from the API to our domain entity.
/// Keeps the domain layer clean from external dependencies.
class UserDto {
  final String id;
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String? email;
  final String? firebaseUid;
  final bool isVerified;
  final String? createdAt;

  UserDto({
    required this.id,
    required this.phoneNumber,
    required this.firstName,
    required this.lastName,
    this.email,
    this.firebaseUid,
    this.isVerified = false,
    this.createdAt,
  });

  /// Create from JSON (camelCase from backend)
  factory UserDto.fromJson(Map<String, dynamic> json) {
    return UserDto(
      id: json['id'] as String? ?? json['userId'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      email: json['email'] as String?,
      firebaseUid: json['firebaseUid'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      createdAt: json['createdAt'] as String?,
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
        'id': id,
        'phoneNumber': phoneNumber,
        'firstName': firstName,
        'lastName': lastName,
        if (email != null) 'email': email,
        if (firebaseUid != null) 'firebaseUid': firebaseUid,
        'isVerified': isVerified,
        if (createdAt != null) 'createdAt': createdAt,
      };

  /// Convert to domain entity
  User toEntity() {
    return User(
      id: id,
      phoneNumber: phoneNumber,
      firstName: firstName,
      lastName: lastName,
      email: email,
      firebaseUid: firebaseUid,
      isVerified: isVerified,
      createdAt: createdAt != null ? DateTime.tryParse(createdAt!) : null,
    );
  }

  /// Create from domain entity
  factory UserDto.fromEntity(User user) {
    return UserDto(
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      firebaseUid: user.firebaseUid,
      isVerified: user.isVerified,
      createdAt: user.createdAt?.toIso8601String(),
    );
  }
}
