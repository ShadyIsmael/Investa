import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import '../services/phone_auth_service.dart';
import '../services/secure_storage.dart';
import 'main_wrapper.dart';
import '../widgets/app_background.dart';
import '../widgets/country_phone_field.dart';

class SignupScreen extends StatefulWidget {
  final VoidCallback? onSignedUp;
  final String? prefilledPhone;
  final bool phoneReadOnly;
  final String? testSmsCode;
  final Map<String, dynamic>? firebaseResponse;

  const SignupScreen({
    super.key,
    this.onSignedUp,
    this.prefilledPhone,
    this.phoneReadOnly = false,
    this.testSmsCode,
    this.firebaseResponse,
  });

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _obscurePass = true;
  bool _obscureConfirm = true;
  String? _serverError;
  String _selectedCountryCode = '+20';

  @override
  void initState() {
    super.initState();
    if (widget.prefilledPhone != null) {
      _phoneCtrl.text = widget.prefilledPhone!;
      // If prefilled phone starts with a + and a country code, try to set it
      final p = widget.prefilledPhone!;
      if (p.startsWith('+')) {
        // Try to match known country codes from the dropdown
        final validCodes = ['+1', '+20', '+44', '+91', '+61', '+234'];
        for (final code in validCodes) {
          if (p.startsWith(code)) {
            _selectedCountryCode = code;
            break;
          }
        }
      }
    }
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _doSignup() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    if (widget.firebaseResponse != null) {
      // Phone already verified, directly signup
      final authService = AuthService();
      final phoneAuthService = PhoneAuthService();
      final normalizedPhone = phoneAuthService.normalizePhoneNumber(
          _phoneCtrl.text.trim(),
          defaultCountryCode: _selectedCountryCode);
      if (normalizedPhone == null) {
        setState(() {
          _loading = false;
          _serverError = 'Invalid phone number format';
        });
        return;
      }
      final result = await authService.signup(
        phoneNumber: normalizedPhone,
        password: _passCtrl.text,
        firstName: _firstCtrl.text.trim(),
        lastName: _lastCtrl.text.trim(),
        firebaseUid: widget.firebaseResponse!['uid'],
        isNew: widget.firebaseResponse!['isNew'] as bool?,
      );

      if (!mounted) return;
      setState(() => _loading = false);

      if (result.success) {
        // Save phone to secure storage
        await SecureStorage().write('phone', normalizedPhone);

        // Set logged in state in SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('logged_in', true);

        if (!mounted) return;

        // Navigate directly to main screen
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => MainWrapper(
              themeMode: ThemeMode.system,
              onThemeChanged: (mode) {},
              onLogout: () {},
              currentLocale: null,
              onLocaleChanged: (locale) {},
            ),
          ),
          (route) => false,
        );
      } else {
        setState(() {
          _serverError = result.message ?? 'Signup failed';
        });
      }
      return;
    }

    // If we reach here, it means the phone wasn't verified first
    setState(() {
      _loading = false;
      _serverError =
          'Phone verification required. Please go back and verify your phone number.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final mq = MediaQuery.of(context);
    final isWide = mq.size.width > 800;

    final form = _buildSignupForm(context);

    final body = SafeArea(
      child: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: isWide ? 1000 : 720),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: isWide
                  ? Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const FlutterLogo(size: 88),
                                const SizedBox(height: 18),
                                Text('Create Account',
                                    style: theme.textTheme.headlineMedium
                                        ?.copyWith(
                                            color: isDarkMode
                                                ? Colors.white
                                                : theme.colorScheme.onSurface,
                                            fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Text(
                                    'Open an account and start investing today',
                                    style: theme.textTheme.bodyLarge?.copyWith(
                                        color: isDarkMode
                                            ? Colors.white70
                                            : theme.colorScheme.onSurface
                                                .withAlpha(
                                                    (0.7 * 255).round()))),
                              ],
                            ),
                          ),
                        ),
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: isDarkMode
                                ? BackdropFilter(
                                    filter:
                                        ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                                    child: Container(
                                      padding: const EdgeInsets.all(24),
                                      decoration: BoxDecoration(
                                          color: Colors.white
                                              .withOpacityCompat(0.06),
                                          borderRadius:
                                              BorderRadius.circular(16)),
                                      child: form,
                                    ),
                                  )
                                : Container(
                                    padding: const EdgeInsets.all(24),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.surface,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                          color: theme.colorScheme.outline
                                              .withAlpha((0.5 * 255).round())),
                                    ),
                                    child: form,
                                  ),
                          ),
                        ),
                      ],
                    )
                  : SingleChildScrollView(
                      child: Column(
                        children: [
                          const SizedBox(height: 18),
                          Container(
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              children: [
                                const FlutterLogo(size: 72),
                                const SizedBox(height: 8),
                                Text('Create Account',
                                    style: theme.textTheme.titleLarge?.copyWith(
                                        color: isDarkMode
                                            ? Colors.white
                                            : theme.colorScheme.onSurface,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 6),
                                Text(
                                    'Join the investor portal — secure and fast',
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                        color: isDarkMode
                                            ? Colors.white70
                                            : theme.colorScheme.onSurface
                                                .withAlpha(
                                                    (0.7 * 255).round()))),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          isDarkMode
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: BackdropFilter(
                                    filter:
                                        ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                                    child: Container(
                                      padding: const EdgeInsets.all(18),
                                      decoration: BoxDecoration(
                                          color:
                                              Colors.white.withOpacity(0.06)),
                                      child: form,
                                    ),
                                  ),
                                )
                              : Container(
                                  padding: const EdgeInsets.all(18),
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.surface,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color: theme.colorScheme.outline
                                            .withAlpha((0.5 * 255).round())),
                                  ),
                                  child: form,
                                ),
                        ],
                      ),
                    ),
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

  Widget _buildSignupForm(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Integrated country picker with phone input
          CountryPhoneField(
            controller: _phoneCtrl,
            initialCountryCode: _selectedCountryCode,
            readOnly: widget.phoneReadOnly || _loading,
            onCountryCodeChanged: (v) =>
                setState(() => _selectedCountryCode = v),
            labelText: 'Phone number',
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Enter phone number' : null,
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
                child: TextFormField(
                    controller: _firstCtrl,
                    decoration: const InputDecoration(labelText: 'First name'),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Enter first name'
                        : null)),
            const SizedBox(width: 12),
            Expanded(
                child: TextFormField(
                    controller: _lastCtrl,
                    decoration: const InputDecoration(labelText: 'Last name'),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Enter last name'
                        : null))
          ]),
          const SizedBox(height: 12),
          TextFormField(
              controller: _passCtrl,
              obscureText: _obscurePass,
              decoration: InputDecoration(
                  labelText: 'Password',
                  suffixIcon: IconButton(
                      icon: Icon(_obscurePass
                          ? Icons.visibility_off
                          : Icons.visibility),
                      onPressed: () =>
                          setState(() => _obscurePass = !_obscurePass))),
              validator: (v) => (v == null || v.length < 6)
                  ? 'Password too short (min 6 chars)'
                  : null),
          const SizedBox(height: 12),
          TextFormField(
              controller: _confirmCtrl,
              obscureText: _obscureConfirm,
              decoration: InputDecoration(
                  labelText: 'Confirm password',
                  suffixIcon: IconButton(
                      icon: Icon(_obscureConfirm
                          ? Icons.visibility_off
                          : Icons.visibility),
                      onPressed: () =>
                          setState(() => _obscureConfirm = !_obscureConfirm))),
              validator: (v) =>
                  v != _passCtrl.text ? 'Passwords do not match' : null),
          const SizedBox(height: 16),
          if (_serverError != null) ...[
            Text(_serverError!,
                style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 8)
          ],
          ElevatedButton(
              onPressed: _loading ? null : _doSignup,
              style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14)),
              child: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Create account')),
          const SizedBox(height: 8),
          TextButton(
              onPressed: _loading ? null : () => Navigator.of(context).pop(),
              child: const Text('Back to login')),
        ],
      ),
    );
  }
}
