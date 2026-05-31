import '../../../../core/network/network_client.dart';
import '../models/user_dto.dart';

/// Remote data source for authentication.
///
/// This handles all API calls related to authentication.
abstract class AuthRemoteDataSource {
  Future<UserDto> login({
    required String phoneNumber,
    required String password,
  });

  Future<UserDto> signup({
    required String phoneNumber,
    required String password,
    required String firstName,
    required String lastName,
    String? firebaseUid,
  });

  Future<void> sendFcmToken(String token);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final NetworkClient networkClient;

  AuthRemoteDataSourceImpl({required this.networkClient});

  @override
  Future<UserDto> login({
    required String phoneNumber,
    required String password,
  }) async {
    final response = await networkClient.post(
      '/api/Auth/login',
      data: {
        'phoneNumber': phoneNumber,
        'password': password,
      },
    );

    final data = response.data as Map<String, dynamic>;

    // Handle different response formats
    if (data.containsKey('user')) {
      return UserDto.fromJson(data['user'] as Map<String, dynamic>);
    } else if (data.containsKey('data')) {
      final innerData = data['data'] as Map<String, dynamic>;
      return UserDto.fromJson(innerData);
    } else {
      return UserDto.fromJson(data);
    }
  }

  @override
  Future<UserDto> signup({
    required String phoneNumber,
    required String password,
    required String firstName,
    required String lastName,
    String? firebaseUid,
  }) async {
    final response = await networkClient.post(
      '/api/Auth/sign-up',
      data: {
        'phoneNumber': phoneNumber,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        if (firebaseUid != null) 'firebaseUid': firebaseUid,
      },
    );

    final data = response.data as Map<String, dynamic>;

    // Handle different response formats
    if (data.containsKey('user')) {
      return UserDto.fromJson(data['user'] as Map<String, dynamic>);
    } else if (data.containsKey('data')) {
      final innerData = data['data'] as Map<String, dynamic>;
      return UserDto.fromJson(innerData);
    } else {
      return UserDto.fromJson(data);
    }
  }

  @override
  Future<void> sendFcmToken(String token) async {
    await networkClient.post(
      '/api/users/fcm-token',
      data: {
        'fcmToken': token,
      },
    );
  }
}
