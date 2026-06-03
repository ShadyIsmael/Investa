/// Progressive Trust System - Flutter Partner Models

enum TrustLevel { visitor, registered, interactive, trustedActive }

extension TrustLevelValue on TrustLevel {
  int get value {
    switch (this) {
      case TrustLevel.visitor:
        return 0;
      case TrustLevel.registered:
        return 1;
      case TrustLevel.interactive:
        return 2;
      case TrustLevel.trustedActive:
        return 3;
    }
  }

  static TrustLevel fromInt(int v) {
    switch (v) {
      case 1:
        return TrustLevel.registered;
      case 2:
        return TrustLevel.interactive;
      case 3:
        return TrustLevel.trustedActive;
      default:
        return TrustLevel.visitor;
    }
  }

  String get labelEn {
    switch (this) {
      case TrustLevel.visitor:
        return 'Visitor';
      case TrustLevel.registered:
        return 'Registered';
      case TrustLevel.interactive:
        return 'Interactive';
      case TrustLevel.trustedActive:
        return 'Trusted Active';
    }
  }

  String get labelAr {
    switch (this) {
      case TrustLevel.visitor:
        return 'زائر';
      case TrustLevel.registered:
        return 'مسجل';
      case TrustLevel.interactive:
        return 'تفاعلي';
      case TrustLevel.trustedActive:
        return 'نشط وموثوق';
    }
  }
}

enum VerificationType { email, phone, linkedIn, address, legalAgreement }

extension VerificationTypeValue on VerificationType {
  int get value {
    switch (this) {
      case VerificationType.email:
        return 0;
      case VerificationType.phone:
        return 1;
      case VerificationType.linkedIn:
        return 2;
      case VerificationType.address:
        return 3;
      case VerificationType.legalAgreement:
        return 4;
    }
  }
}

enum VerificationStatus { none, pending, verified }

class TrustPermissions {
  final bool canBrowseOpportunities;
  final bool canViewOpportunityDetails;
  final bool canSaveOpportunities;
  final bool canFollowUsers;
  final bool canComment;
  final bool canRequestJoinOpportunity;
  final bool canParticipateInDiscussions;
  final bool canPublishOpportunity;
  final bool canJoinVerifiedDeals;
  final bool canDirectMessage;
  final bool canAccessAnalytics;

  const TrustPermissions({
    this.canBrowseOpportunities = false,
    this.canViewOpportunityDetails = false,
    this.canSaveOpportunities = false,
    this.canFollowUsers = false,
    this.canComment = false,
    this.canRequestJoinOpportunity = false,
    this.canParticipateInDiscussions = false,
    this.canPublishOpportunity = false,
    this.canJoinVerifiedDeals = false,
    this.canDirectMessage = false,
    this.canAccessAnalytics = false,
  });

  factory TrustPermissions.fromJson(Map<String, dynamic> json) =>
      TrustPermissions(
        canBrowseOpportunities:
            json['canBrowseOpportunities'] as bool? ?? false,
        canViewOpportunityDetails:
            json['canViewOpportunityDetails'] as bool? ?? false,
        canSaveOpportunities: json['canSaveOpportunities'] as bool? ?? false,
        canFollowUsers: json['canFollowUsers'] as bool? ?? false,
        canComment: json['canComment'] as bool? ?? false,
        canRequestJoinOpportunity:
            json['canRequestJoinOpportunity'] as bool? ?? false,
        canParticipateInDiscussions:
            json['canParticipateInDiscussions'] as bool? ?? false,
        canPublishOpportunity: json['canPublishOpportunity'] as bool? ?? false,
        canJoinVerifiedDeals: json['canJoinVerifiedDeals'] as bool? ?? false,
        canDirectMessage: json['canDirectMessage'] as bool? ?? false,
        canAccessAnalytics: json['canAccessAnalytics'] as bool? ?? false,
      );

  static const visitor = TrustPermissions(canBrowseOpportunities: true);
}

class TrustRequirement {
  final String key;
  final String labelEn;
  final String labelAr;
  final bool isMet;

  const TrustRequirement({
    required this.key,
    required this.labelEn,
    required this.labelAr,
    required this.isMet,
  });

  factory TrustRequirement.fromJson(Map<String, dynamic> json) => TrustRequirement(
    key:     json['key'] as String,
    labelEn: json['labelEn'] as String,
    labelAr: json['labelAr'] as String,
    isMet:   json['isMet'] as bool? ?? false,
  );
}

class UserVerificationModel {
  final int id;
  final String userId;
  final VerificationType verificationType;
  final VerificationStatus status;
  final String? documentUrl;
  final DateTime submittedAt;
  final DateTime? verifiedAt;

  const UserVerificationModel({
    required this.id,
    required this.userId,
    required this.verificationType,
    required this.status,
    this.documentUrl,
    required this.submittedAt,
    this.verifiedAt,
  });

  factory UserVerificationModel.fromJson(Map<String, dynamic> json) =>
      UserVerificationModel(
        id:               json['id'] as int,
        userId:           json['userId'] as String,
        verificationType: VerificationType.values[json['verificationType'] as int? ?? 0],
        status:           VerificationStatus.values[json['status']          as int? ?? 0],
        documentUrl:      json['documentUrl'] as String?,
        submittedAt:      DateTime.parse(json['submittedAt'] as String),
        verifiedAt:       json['verifiedAt'] != null ? DateTime.parse(json['verifiedAt'] as String) : null,
      );
}

class TrustProfile {
  final String userId;
  final TrustLevel trustLevel;
  final int reputationScore;
  final int profileCompletionPercentage;
  final bool isPhoneVerified;
  final bool isEmailVerified;
  final List<TrustRequirement> nextLevelRequirements;
  final TrustPermissions permissions;
  final List<UserVerificationModel> verifications;

  const TrustProfile({
    required this.userId,
    required this.trustLevel,
    required this.reputationScore,
    required this.profileCompletionPercentage,
    required this.isPhoneVerified,
    required this.isEmailVerified,
    required this.nextLevelRequirements,
    required this.permissions,
    required this.verifications,
  });

  factory TrustProfile.fromJson(Map<String, dynamic> json) => TrustProfile(
    userId:                     json['userId'] as String,
    trustLevel:                 TrustLevelValue.fromInt(json['trustLevel'] as int? ?? 0),
    reputationScore:            json['reputationScore'] as int? ?? 0,
    profileCompletionPercentage: json['profileCompletionPercentage'] as int? ?? 0,
    isPhoneVerified:            json['isPhoneVerified']    as bool? ?? false,
    isEmailVerified:            json['isEmailVerified']    as bool? ?? false,
    nextLevelRequirements: (json['nextLevelRequirements'] as List<dynamic>?)
        ?.map((e) => TrustRequirement.fromJson(e as Map<String, dynamic>))
        .toList() ?? [],
    permissions: json['permissions'] != null
        ? TrustPermissions.fromJson(json['permissions'] as Map<String, dynamic>)
        : TrustPermissions.visitor,
    verifications: (json['verifications'] as List<dynamic>?)
        ?.map((e) =>
            UserVerificationModel.fromJson(e as Map<String, dynamic>))
        .toList() ?? [],
  );

  /// Quick permission check.
  bool meetsLevel(TrustLevel minLevel) => trustLevel.value >= minLevel.value;
}
