class FounderProfile {
  const FounderProfile({
    required this.fullName,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.mobile,
    required this.role,
    required this.clientType,
    required this.companyName,
    required this.bio,
    required this.avatarUrl,
    required this.city,
    required this.country,
    required this.score,
    required this.credibilityScore,
    required this.profileCompletion,
  });

  final String fullName;
  final String firstName;
  final String lastName;
  final String email;
  final String mobile;
  final String role;
  final String clientType;
  final String companyName;
  final String bio;
  final String avatarUrl;
  final String city;
  final String country;
  final double? score;
  final double? credibilityScore;
  final int profileCompletion;

  factory FounderProfile.fromJson(Map<String, dynamic> json) {
    final basic = _map(json['basicInfo']);
    final contact = _map(json['contactInfo']);
    final metrics = _map(json['coreMetrics']);
    return FounderProfile(
      fullName:
          _string(basic['fullName']).isNotEmpty
              ? _string(basic['fullName'])
              : <String>[
                _string(basic['firstName']),
                _string(basic['lastName']),
              ].where((value) => value.isNotEmpty).join(' '),
      firstName: _string(basic['firstName']),
      lastName: _string(basic['lastName']),
      email:
          _string(metrics['email']).isNotEmpty
              ? _string(metrics['email'])
              : _string(contact['email']),
      mobile:
          _string(contact['phone1']).isNotEmpty
              ? _string(contact['phone1'])
              : _string(contact['mobile']),
      role: _string(metrics['role']),
      clientType: _string(metrics['clientType']),
      companyName: _string(basic['companyName']),
      bio: _string(basic['bio']),
      avatarUrl: _string(basic['avatarUrl']),
      city: _string(contact['city']),
      country:
          _string(contact['country']).isNotEmpty
              ? _string(contact['country'])
              : _string(basic['country']),
      score: _number(basic['score']),
      credibilityScore:
          _number(metrics['currentCredibilityScore']) ??
          _number(metrics['credibilityScore']),
      profileCompletion: _int(json['profileCompletionPercentage']),
    );
  }
}

class FounderTrustScore {
  const FounderTrustScore({
    required this.trustLevel,
    required this.trustLevelLabel,
    required this.reputationScore,
    required this.activityScore,
    required this.profileCompletion,
    required this.phoneVerified,
    required this.emailVerified,
    required this.nextLevelRequirements,
    required this.verifications,
  });

  final int trustLevel;
  final String trustLevelLabel;
  final int reputationScore;
  final int activityScore;
  final int profileCompletion;
  final bool phoneVerified;
  final bool emailVerified;
  final List<FounderTrustRequirement> nextLevelRequirements;
  final List<FounderVerification> verifications;

  factory FounderTrustScore.fromJson(Map<String, dynamic> json) =>
      FounderTrustScore(
        trustLevel: _int(json['trustLevel']),
        trustLevelLabel: _string(json['trustLevelLabel']),
        reputationScore: _int(json['reputationScore']),
        activityScore: _int(json['activityScore']),
        profileCompletion: _int(json['profileCompletionPercentage']),
        phoneVerified: json['isPhoneVerified'] == true,
        emailVerified: json['isEmailVerified'] == true,
        nextLevelRequirements: _list(
          json['nextLevelRequirements'],
          FounderTrustRequirement.fromJson,
        ),
        verifications: _list(
          json['verifications'],
          FounderVerification.fromJson,
        ),
      );
}

class FounderTrustRequirement {
  const FounderTrustRequirement({
    required this.labelEn,
    required this.labelAr,
    required this.isMet,
  });

  final String labelEn;
  final String labelAr;
  final bool isMet;

  factory FounderTrustRequirement.fromJson(Map<String, dynamic> json) =>
      FounderTrustRequirement(
        labelEn: _string(json['labelEn']),
        labelAr: _string(json['labelAr']),
        isMet: json['isMet'] == true,
      );
}

class FounderVerification {
  const FounderVerification({
    required this.type,
    required this.status,
    required this.submittedAt,
  });

  final String type;
  final String status;
  final DateTime? submittedAt;

  factory FounderVerification.fromJson(Map<String, dynamic> json) =>
      FounderVerification(
        type: _string(json['verificationType']),
        status: _string(json['status']),
        submittedAt: DateTime.tryParse(_string(json['submittedAt'])),
      );
}

List<T> _list<T>(dynamic json, T Function(Map<String, dynamic>) parse) =>
    json is List
        ? json
            .whereType<Map>()
            .map((item) => parse(Map<String, dynamic>.from(item)))
            .toList(growable: false)
        : const <Never>[];

Map<String, dynamic> _map(dynamic value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

String _string(dynamic value) => value?.toString() ?? '';

int _int(dynamic value) =>
    value is num ? value.toInt() : int.tryParse(_string(value)) ?? 0;

double? _number(dynamic value) => value is num ? value.toDouble() : null;
