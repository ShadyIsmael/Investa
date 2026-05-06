import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import '../services/secure_storage.dart';
import '../services/app_logger.dart';
import '../services/messages.dart';
import 'package:flutter_signin_button/flutter_signin_button.dart';
import 'otp_screen.dart';
import 'forgot_password_screen.dart';
import '../widgets/country_phone_field.dart';
import '../services/app_state.dart';
import '../services/profile_service.dart';
import '../widgets/app_background.dart';

class AuthScreen extends StatefulWidget {
  final VoidCallback onLogin;

  const AuthScreen({Key? key, required this.onLogin}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _phoneFocus = FocusNode();
  final _passFocus = FocusNode();
  String _selectedCountryCode = '+20';
  bool _remember = true;
  bool _loading = false;
  bool _obscurePass = true;
  // serverError kept for possible future error handling
  // ignore: unused_field
  String? _serverError;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    _phoneFocus.dispose();
    _passFocus.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadRememberedPhone();
  }

  Future<void> _loadRememberedPhone() async {
    try {
      final phone = await SecureStorage().read('phone');
      if (phone != null && phone.isNotEmpty) {
        _phoneCtrl.text = phone;
      }
    } catch (_) {}
  }

  Future<void> _doLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final phone = '$_selectedCountryCode${_phoneCtrl.text.trim()}';
    // Capture ScaffoldMessenger before any async gaps to avoid using BuildContext
    // across awaits (fixes use_build_context_synchronously lints).
    final messenger = ScaffoldMessenger.of(context);

    setState(() {
      _loading = true;
      _serverError = null;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    final auth = AuthService();
    final result =
        await auth.login(phoneNumber: phone, password: _passCtrl.text);
    setState(() => _loading = false);
    try {
      if (result.success && result.token != null) {
        if (_remember) await SecureStorage().write('phone', phone);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('logged_in', true);
        try {
          final profileRaw = await ProfileService().fetchProfileRaw();
          if (profileRaw != null) {
            final profile = Profile.fromJson(profileRaw);
            await AppState.instance.setProfile(profile, profileRaw);
          }
        } catch (e) {
          // ignore
        }

        // --- التعديل الوحيد هنا لإصلاح الـ Error ---
        widget.onLogin();
        // ------------------------------------------
      } else {
        final friendly = _friendlyError(result.message);
        setState(() => _serverError = friendly);
        messenger.showSnackBar(SnackBar(content: Text(friendly)));
        final lower = (result.message ?? '').toLowerCase();
        if (lower.contains('401') ||
            lower.contains('invalid') ||
            lower.contains('credentials') ||
            lower.contains('incorrect')) {
          // Avoid using BuildContext after await by requesting focus directly on
          // the FocusNode.
          _passFocus.requestFocus();
        }
      }
    } catch (e, st) {
      setState(() => _serverError = 'Unexpected error');
      AppLogger.logError('AuthScreen._doLogin', e.toString(), st);
      rethrow;
    }
  }

  String _friendlyError(String? raw) {
    if (raw == null || raw.isEmpty) return AppMessages.loginFailed();
    final l = raw.toLowerCase();
    if (l.contains('401') ||
        l.contains('invalid') ||
        l.contains('credentials') ||
        l.contains('incorrect')) {
      return AppMessages.invalidCredentials;
    }
    if (l.contains('network error') ||
        l.contains('socketexception') ||
        l.contains('timed out') ||
        l.contains('timeout')) {
      return AppMessages.networkError;
    }
    if (l.contains('500') ||
        l.contains('server error') ||
        l.contains('internal')) {
      return AppMessages.serverError;
    }
    return AppMessages.loginFailed(raw);
  }

  void _showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _socialSignIn(String provider) async {
    _showMessage('$provider sign-in not configured in this demo.');
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 700));
    await SecureStorage().write('auth_token', 'social-demo-token');
    setState(() => _loading = false);
    widget.onLogin();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final body = Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const FlutterLogo(size: 72),
                const SizedBox(height: 24),
                Text('Welcome Back',
                    style: theme.textTheme.headlineMedium
                        ?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Sign in to continue',
                    style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7))),
                const SizedBox(height: 24),
                // Country selector integrated into the phone input
                const SizedBox(height: 2),
                // Import provides `CountryPhoneField`
                CountryPhoneField(
                  controller: _phoneCtrl,
                  initialCountryCode: _selectedCountryCode,
                  focusNode: _phoneFocus,
                  textInputAction: TextInputAction.next,
                  onFieldSubmitted: (_) =>
                      FocusScope.of(context).requestFocus(_passFocus),
                  onCountryCodeChanged: (v) => setState(() => _selectedCountryCode = v),
                  labelText: 'Phone number',
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? AppMessages.enterPhone
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passCtrl,
                  focusNode: _passFocus,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _doLogin(),
                  obscureText: _obscurePass,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                        icon: Icon(_obscurePass
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () =>
                            setState(() => _obscurePass = !_obscurePass)),
                  ),
                  validator: (v) => (v == null || v.length < 4)
                      ? 'Password must be at least 4 characters'
                      : null,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Checkbox(
                        value: _remember,
                        onChanged: (v) =>
                            setState(() => _remember = v ?? true)),
                    const Text('Remember me'),
                    const Spacer(),
                    TextButton(
                        onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute(
                                builder: (_) => const ForgotPasswordScreen())),
                        child: const Text('Forgot password?')),
                  ],
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _loading ? null : _doLogin,
                  style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16)),
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 3))
                      : const Text('Sign In'),
                ),
                const SizedBox(height: 24),
                const Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text('OR')),
                    Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 24),
                SignInButton(Buttons.Google,
                    onPressed: () => _socialSignIn('Google'),
                    text: 'Sign in with Google'),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account?"),
                    TextButton(
                        onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute(
                                builder: (_) => const OTPScreen())),
                        child: const Text('Sign up')),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return Scaffold(
      backgroundColor:
          isDarkMode ? Colors.transparent : theme.scaffoldBackgroundColor,
      body: isDarkMode ? AppBackground(child: body) : body,
    );
  }
}
