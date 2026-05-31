import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/network_client.dart';
import '../network/network_config.dart';
import '../services/logger_service.dart';
import '../services/secure_storage_service.dart';
import '../services/firebase_messaging_service.dart';
import '../services/support_chat_http_service.dart';
import '../services/fcm_service.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/signup_usecase.dart';
import '../../features/auth/domain/usecases/logout_usecase.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/support/data/datasources/support_remote_datasource.dart';
import '../../features/support/data/repositories/support_repository_impl.dart';
import '../../features/support/domain/repositories/support_repository.dart';
import '../../features/support/domain/usecases/send_support_request_usecase.dart';
import '../../features/support/domain/usecases/listen_to_support_messages_usecase.dart';
import '../../features/support/domain/usecases/initiate_support_session_usecase.dart';
import '../../features/support/presentation/providers/support_provider.dart';

final sl = GetIt.instance;

/// Initializes all dependencies for the application.
/// Call this once at app startup in main.dart.
Future<void> initializeDependencies() async {
  // ============ CORE ============

  // Logger Service (Singleton)
  sl.registerLazySingleton<LoggerService>(() => LoggerService());

  // Secure Storage Service
  sl.registerLazySingleton<SecureStorageService>(() => SecureStorageService());

  // Shared Preferences
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => sharedPreferences);

  // Network Config
  sl.registerLazySingleton<NetworkConfig>(() => NetworkConfig());

  // Dio Instance
  sl.registerLazySingleton<Dio>(() {
    final dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => sl<LoggerService>().info('[DIO]', obj.toString()),
    ));

    return dio;
  });

  // Network Client
  sl.registerLazySingleton<NetworkClient>(() => NetworkClient(
        dio: sl(),
        networkConfig: sl(),
        secureStorage: sl(),
        logger: sl(),
      ));

  // Support HTTP Service
  sl.registerLazySingleton<SupportChatHttpService>(
    () => SupportChatHttpService(
      logger: sl(),
      secureStorage: sl(),
      networkConfig: sl(),
    ),
  );

  // FCM service (foreground/background messaging)
  sl.registerLazySingleton<FCMService>(
    () => FCMService(
      logger: sl(),
      secureStorage: sl(),
      networkConfig: sl(),
    ),
  );

  // Firebase Messaging Service (legacy wrapper if used elsewhere)
  sl.registerLazySingleton<FirebaseMessagingService>(
    () => FirebaseMessagingService(logger: sl()),
  );

  // ============ FEATURES - AUTH ============

  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(networkClient: sl()),
  );

  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      secureStorage: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => SignupUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));

  // Providers (Factories - new instance per request)
  sl.registerFactory(() => AuthProvider(
        loginUseCase: sl(),
        signupUseCase: sl(),
        logoutUseCase: sl(),
        logger: sl(),
      ));

  // ============ FEATURES - SUPPORT ============

  // Data sources
  sl.registerLazySingleton<SupportRemoteDataSource>(
    () => SupportRemoteDataSourceImpl(
      httpService: sl(),
      fcmService: sl(),
      logger: sl(),
    ),
  );

  // Repositories
  sl.registerLazySingleton<SupportRepository>(
    () => SupportRepositoryImpl(
      remoteDataSource: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => SendSupportRequestUseCase(sl()));
  sl.registerLazySingleton(() => ListenToSupportMessagesUseCase(sl()));
  sl.registerLazySingleton(() => InitiateSupportSessionUseCase(sl()));

  // Providers
  sl.registerFactory(() => SupportProvider(
        sendSupportRequestUseCase: sl(),
        listenToSupportMessagesUseCase: sl(),
        initiateSupportSessionUseCase: sl(),
        logger: sl(),
      ));

  sl<LoggerService>().info('[DI]', 'All dependencies initialized successfully');
}
