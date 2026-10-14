import 'package:flutter_riverpod/flutter_riverpod.dart';

class AppEnvironment {
  const AppEnvironment({
    required this.apiBaseUrl,
    this.appName = 'FOPX Founder',
  });

  factory AppEnvironment.fromDefines() {
    return const AppEnvironment(
      apiBaseUrl: String.fromEnvironment(
        'FOPX_API_BASE_URL',
        defaultValue: 'https://api.fopx.one/api/v1',
      ),
    );
  }

  final String apiBaseUrl;
  final String appName;
}

final appEnvironmentProvider = Provider<AppEnvironment>(
  (_) => AppEnvironment.fromDefines(),
);
