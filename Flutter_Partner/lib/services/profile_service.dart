import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'api_client.dart';
import 'app_logger.dart';
import 'endpoint_resolver.dart';

class CoreMetrics {
  final String? email;
  final String? role;
  final String? clientType;
  final double? credibilityScore;
  final double? walletBalance;

  CoreMetrics({
    this.email,
    this.role,
    this.clientType,
    this.credibilityScore,
    this.walletBalance,
  });

  factory CoreMetrics.fromJson(Map<String, dynamic> json) {
    return CoreMetrics(
      email: json['email'] as String?,
      role: json['role'] as String?,
      clientType: json['clientType'] as String?,
      credibilityScore: (json['credibilityScore'] as num?)?.toDouble(),
      walletBalance: (json['walletBalance'] as num?)?.toDouble(),
    );
  }
}

class BasicInfo {
  final String? firstName;
  final String? lastName;
  final String? fullName;
  final String? gender;
  final String? nationality;
  final String? bio;
  final String? avatarUrl;
  final int? score;
  final int? credit;

  BasicInfo({
    this.firstName,
    this.lastName,
    this.fullName,
    this.gender,
    this.nationality,
    this.bio,
    this.avatarUrl,
    this.score,
    this.credit,
  });

  factory BasicInfo.fromJson(Map<String, dynamic> json) {
    return BasicInfo(
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      fullName: json['fullName'] as String?,
      gender: json['gender'] as String?,
      nationality: json['nationality'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      score: (json['score'] as num?)?.toInt(),
      credit: (json['credit'] as num?)?.toInt(),
    );
  }
}

class ContactInfo {
  final String? email;
  final String? phone1;
  final String? phone2;
  final String? workAddress;
  final String? address;
  final String? linkedInUrl;
  final String? facebookUrl;

  ContactInfo({
    this.email,
    this.phone1,
    this.phone2,
    this.workAddress,
    this.address,
    this.linkedInUrl,
    this.facebookUrl,
  });

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      email: json['email'] as String?,
      phone1: json['phone1'] as String?,
      phone2: json['phone2'] as String?,
      workAddress: json['workAddress'] as String?,
      address: json['address'] as String?,
      linkedInUrl: json['linkedInUrl'] as String?,
      facebookUrl: json['facebookUrl'] as String?,
    );
  }
}

class IdentityCompliance {
  final String? documentNumber;
  final DateTime? documentExpiryDate;
  final String? verificationStatus;
  final String? documentFrontImageUrl;
  final String? documentBackImageUrl;

  IdentityCompliance({
    this.documentNumber,
    this.documentExpiryDate,
    this.verificationStatus,
    this.documentFrontImageUrl,
    this.documentBackImageUrl,
  });

  factory IdentityCompliance.fromJson(Map<String, dynamic> json) {
    return IdentityCompliance(
      documentNumber: json['documentNumber'] as String?,
      documentExpiryDate: json['documentExpiryDate'] != null
          ? DateTime.parse(json['documentExpiryDate'] as String)
          : null,
      verificationStatus: json['verificationStatus'] as String?,
      documentFrontImageUrl: json['documentFrontImageUrl'] as String?,
      documentBackImageUrl: json['documentBackImageUrl'] as String?,
    );
  }
}

class AuditUsage {
  final String? lastLoginIP;
  final String? registrationIP;
  final String? deviceInfo;
  final DateTime? lastLoginDate;

  AuditUsage({
    this.lastLoginIP,
    this.registrationIP,
    this.deviceInfo,
    this.lastLoginDate,
  });

  factory AuditUsage.fromJson(Map<String, dynamic> json) {
    return AuditUsage(
      lastLoginIP: json['lastLoginIP'] as String?,
      registrationIP: json['registrationIP'] as String?,
      deviceInfo: json['deviceInfo'] as String?,
      lastLoginDate: json['lastLoginDate'] != null
          ? DateTime.parse(json['lastLoginDate'] as String)
          : null,
    );
  }
}

class Profile {
  final String? userId;
  final CoreMetrics? coreMetrics;
  final BasicInfo? basicInfo;
  final ContactInfo? contactInfo;
  final IdentityCompliance? identityCompliance;
  final AuditUsage? auditUsage;
  final int? score;
  final int? credit;
  final double? currentCredibilityScore;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Profile({
    this.userId,
    this.coreMetrics,
    this.basicInfo,
    this.contactInfo,
    this.identityCompliance,
    this.auditUsage,
    this.score,
    this.credit,
    this.currentCredibilityScore,
    this.createdAt,
    this.updatedAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    // Support responses that provide fields either nested (basicInfo/contactInfo/coreMetrics)
    // or flattened at the top level. Prefer nested objects when present, otherwise fall back.
    final coreMetricsJson = json['coreMetrics'] as Map<String, dynamic>?;
    final basicJson = json['basicInfo'] as Map<String, dynamic>?;
    final contactJson = json['contactInfo'] as Map<String, dynamic>?;

    // Build fallback maps from top-level fields if nested objects are missing
    final fallbackBasic = <String, dynamic>{
      if (json['firstName'] != null) 'firstName': json['firstName'],
      if (json['lastName'] != null) 'lastName': json['lastName'],
      if (json['fullName'] != null) 'fullName': json['fullName'],
      if (json['gender'] != null) 'gender': json['gender'],
      if (json['nationality'] != null) 'nationality': json['nationality'],
      if (json['bio'] != null) 'bio': json['bio'],
      if (json['avatarUrl'] != null) 'avatarUrl': json['avatarUrl'],
      if (json['score'] != null) 'score': json['score'],
      if (json['credit'] != null) 'credit': json['credit'],
    };

    final fallbackContact = <String, dynamic>{
      if (json['email'] != null) 'email': json['email'],
      if (json['phone1'] != null) 'phone1': json['phone1'],
      if (json['phone2'] != null) 'phone2': json['phone2'],
      if (json['workAddress'] != null) 'workAddress': json['workAddress'],
      if (json['address'] != null) 'address': json['address'],
      if (json['linkedInUrl'] != null) 'linkedInUrl': json['linkedInUrl'],
      if (json['facebookUrl'] != null) 'facebookUrl': json['facebookUrl'],
    };

    final coreFallback = <String, dynamic>{
      if (json['email'] != null) 'email': json['email'],
      if (json['role'] != null) 'role': json['role'],
      if (json['clientType'] != null) 'clientType': json['clientType'],
      if (json['credibilityScore'] != null)
        'credibilityScore': json['credibilityScore'],
      if (json['walletBalance'] != null) 'walletBalance': json['walletBalance'],
    };

    final parsedBasic = basicJson != null
        ? BasicInfo.fromJson(basicJson)
        : (fallbackBasic.isNotEmpty ? BasicInfo.fromJson(fallbackBasic) : null);

    return Profile(
      userId: json['userId'] as String?,
      coreMetrics: coreMetricsJson != null
          ? CoreMetrics.fromJson(coreMetricsJson)
          : (coreFallback.isNotEmpty
              ? CoreMetrics.fromJson(coreFallback)
              : null),
      basicInfo: parsedBasic,
      contactInfo: contactJson != null
          ? ContactInfo.fromJson(contactJson)
          : (fallbackContact.isNotEmpty
              ? ContactInfo.fromJson(fallbackContact)
              : null),
      identityCompliance: json['identityCompliance'] != null
          ? IdentityCompliance.fromJson(
              json['identityCompliance'] as Map<String, dynamic>)
          : null,
      auditUsage: json['auditUsage'] != null
          ? AuditUsage.fromJson(json['auditUsage'] as Map<String, dynamic>)
          : null,
      score: parsedBasic?.score ?? (json['score'] as num?)?.toInt(),
      credit: parsedBasic?.credit ?? (json['credit'] as num?)?.toInt(),
      currentCredibilityScore:
          (json['currentCredibilityScore'] as num?)?.toDouble(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  String get fullName =>
      basicInfo?.fullName ??
      '${basicInfo?.firstName ?? ''} ${basicInfo?.lastName ?? ''}'.trim();
  String? get avatarUrl => basicInfo?.avatarUrl;

  // Backwards-compatible accessors for legacy code that used `profile.phone1`/`phone2`.
  String? get phone1 => contactInfo?.phone1;
  String? get phone2 => contactInfo?.phone2;
}

class ProfileService {
  final String? _baseOverride;
  final ApiClient _client;

  ProfileService({String? baseUrl, ApiClient? client})
      : _baseOverride = baseUrl,
        _client = client ?? ApiClient();

  String get baseUrl =>
      _baseOverride ?? EndpointResolver.instance.selectedApiBaseUrl;

  /// Fetch the current user's profile using the stored auth token.
  Future<Profile?> fetchProfile() async {
    // Use the configured API host; HTTP is allowed for local dev.
    var profileBase = baseUrl;
    if (!profileBase.startsWith('http')) profileBase = 'http://$profileBase';
    final uri = Uri.parse('$profileBase/api/Profile/me');
    try {
      AppLogger.logInfo('ProfileService.fetchProfile', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo(
          'ProfileService.fetchProfile', 'Response status=$status');
      if (status >= 200 && status < 300) {
        try {
          // Log a short preview of the response for debugging (avoid huge dumps)
          final raw = resp.data is String
              ? resp.data as String
              : resp.data is Map
                  ? jsonEncode((resp.data as Map).keys.toList())
                  : resp.toString();
          AppLogger.logInfo('ProfileService.fetchProfile',
              'Response preview: ${raw.length > 400 ? "${raw.substring(0, 400)}..." : raw}');
          final body = resp.data is Map
              ? resp.data as Map<String, dynamic>
              : jsonDecode(resp.toString()) as Map<String, dynamic>;
          final profile = Profile.fromJson(body);
          AppLogger.logInfo('ProfileService.fetchProfile',
              'Parsed profile userId=${profile.userId ?? 'null'} fullName=${profile.fullName}');
          return profile;
        } catch (e, s) {
          AppLogger.logError(
              'ProfileService.fetchProfile', 'Failed to parse profile: $e', s);
          return null;
        }
      }
      AppLogger.logError(
          'ProfileService.fetchProfile', 'Server error: $status', null);
      return null;
    } on TimeoutException catch (_) {
      AppLogger.logError(
          'ProfileService.fetchProfile', 'Request timed out', null);
      return null;
    } on DioException catch (e) {
      AppLogger.logError('ProfileService.fetchProfile',
          'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('ProfileService.fetchProfile', 'Unexpected: $e', s);
      return null;
    }
  }

  /// Fetch raw profile JSON map (useful to persist or pass around).
  Future<Map<String, dynamic>?> fetchProfileRaw() async {
    var profileBase = baseUrl;
    if (!profileBase.startsWith('http')) profileBase = 'http://$profileBase';
    final uri = Uri.parse('$profileBase/api/Profile/me');
    try {
      AppLogger.logInfo(
          'ProfileService.fetchProfileRaw', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo(
          'ProfileService.fetchProfileRaw', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return body;
      }
      AppLogger.logError(
          'ProfileService.fetchProfileRaw', 'Server error: $status', null);
      return null;
    } on TimeoutException catch (_) {
      AppLogger.logError(
          'ProfileService.fetchProfileRaw', 'Request timed out', null);
      return null;
    } on DioException catch (e) {
      AppLogger.logError('ProfileService.fetchProfileRaw',
          'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('ProfileService.fetchProfileRaw', 'Unexpected: $e', s);
      return null;
    }
  }

  /// Start KYC verification process
  Future<Map<String, dynamic>?> startKyc() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/Profile/start-kyc');
    try {
      AppLogger.logInfo('ProfileService.startKyc', 'POST ${uri.toString()}');
      final resp = await _client.post(uri.toString(), headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      });
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo('ProfileService.startKyc', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return body;
      }
      AppLogger.logError(
          'ProfileService.startKyc', 'Server error: $status', null);
      return null;
    } on TimeoutException catch (_) {
      AppLogger.logError('ProfileService.startKyc', 'Request timed out', null);
      return null;
    } on DioException catch (e) {
      AppLogger.logError('ProfileService.startKyc',
          'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('ProfileService.startKyc', 'Unexpected: $e', s);
      return null;
    }
  }

  /// Get credit transaction history
  Future<List<Map<String, dynamic>>?> getCreditHistory() async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/Profile/me/credits');
    try {
      AppLogger.logInfo(
          'ProfileService.getCreditHistory', 'GET ${uri.toString()}');
      final resp = await _client
          .get(uri.toString(), headers: {'accept': 'application/json'});
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo(
          'ProfileService.getCreditHistory', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is List
            ? resp.data as List
            : jsonDecode(resp.toString()) as List;
        return body.map((e) => e as Map<String, dynamic>).toList();
      }
      AppLogger.logError(
          'ProfileService.getCreditHistory', 'Server error: $status', null);
      return null;
    } on TimeoutException catch (_) {
      AppLogger.logError(
          'ProfileService.getCreditHistory', 'Request timed out', null);
      return null;
    } on DioException catch (e) {
      AppLogger.logError('ProfileService.getCreditHistory',
          'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError(
          'ProfileService.getCreditHistory', 'Unexpected: $e', s);
      return null;
    }
  }

  /// Update user profile
  Future<Profile?> updateProfile(Map<String, dynamic> profileData) async {
    var apiBase = baseUrl;
    if (!apiBase.startsWith('http')) apiBase = 'http://$apiBase';
    final uri = Uri.parse('$apiBase/api/Profile/me');
    try {
      AppLogger.logInfo(
          'ProfileService.updateProfile', 'PUT ${uri.toString()}');
      final resp = await _client.put(uri.toString(),
          data: profileData,
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          });
      final status = resp.statusCode ?? 0;
      AppLogger.logInfo(
          'ProfileService.updateProfile', 'Response status=$status');
      if (status >= 200 && status < 300) {
        final body = resp.data is Map
            ? resp.data as Map<String, dynamic>
            : jsonDecode(resp.toString()) as Map<String, dynamic>;
        return Profile.fromJson(body);
      }
      AppLogger.logError(
          'ProfileService.updateProfile', 'Server error: $status', null);
      return null;
    } on TimeoutException catch (_) {
      AppLogger.logError(
          'ProfileService.updateProfile', 'Request timed out', null);
      return null;
    } on DioException catch (e) {
      AppLogger.logError('ProfileService.updateProfile',
          'Network error: ${e.message}', e.stackTrace);
      return null;
    } catch (e, s) {
      AppLogger.logError('ProfileService.updateProfile', 'Unexpected: $e', s);
      return null;
    }
  }
}
