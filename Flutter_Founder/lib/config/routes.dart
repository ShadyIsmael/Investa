import 'package:flutter/material.dart';

/// Centralized routing configuration.
class Routes {
  static const String splash = '/';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String home = '/home';
  static const String dashboard = '/dashboard';
  static const String profile = '/profile';
  static const String support = '/support';
  static const String supportRequest = '/support/request';
  static const String settings = '/settings';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(
          builder: (_) => const SplashScreen(),
        );

      case login:
        return MaterialPageRoute(
          builder: (_) => const LoginScreen(),
        );

      case signup:
        return MaterialPageRoute(
          builder: (_) => const SignupScreen(),
        );

      case home:
        return MaterialPageRoute(
          builder: (_) => const HomeScreen(),
        );

      case supportRequest:
        // Use the new clean architecture support screen
        return MaterialPageRoute(
          builder: (_) => const SupportRequestScreenClean(),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}

// Placeholder screens - these should be properly implemented
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Login Screen - TODO')),
    );
  }
}

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Signup Screen - TODO')),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Home Screen - TODO')),
    );
  }
}

class SupportRequestScreenClean extends StatelessWidget {
  const SupportRequestScreenClean({super.key});

  @override
  Widget build(BuildContext context) {
    // Import the actual support screen from features
    return const Scaffold(
      body: Center(
          child: Text('Support Request - Implement from features/support')),
    );
  }
}
