import 'package:flutter/material.dart';
import '../auth_flow/services/phone_auth_service.dart';
import 'otp_screen.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({Key? key}) : super(key: key);
  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _countryCtrl = TextEditingController(text: '+20');
  final _phoneCtrl = TextEditingController();
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _isProcessing = false;
  String? _error;

  @override
  void dispose() {
    _countryCtrl.dispose();
    _phoneCtrl.dispose();
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _onCreateAccount() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isProcessing = true;
      _error = null;
    });

    final phoneSvc = PhoneAuthService();
    final normalized = phoneSvc.normalizePhone(_phoneCtrl.text,
        defaultCountryCode: _countryCtrl.text);
    if (normalized == null) {
      setState(() {
        _isProcessing = false;
        _error = 'Invalid phone';
      });
      return;
    }

    await phoneSvc.verifyPhoneNumber(
      phoneNumber: normalized,
      verificationCompleted: (cred) async {
        // Auto-verification: navigate to OTP with auto credential
        if (!mounted) return;
        await Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => OTPScreen(
            verificationId: '',
            phoneNumber: normalized,
            firstName: _firstCtrl.text.trim(),
            lastName: _lastCtrl.text.trim(),
            password: _passCtrl.text,
            autoCredential: cred,
          ),
        ));
        if (mounted) setState(() => _isProcessing = false);
      },
      verificationFailed: (e) {
        if (mounted) {
          setState(() {
            _isProcessing = false;
            _error = e.message ?? 'Verification failed';
          });
        }
      },
      codeSent: (verificationId, _) async {
        if (!mounted) return;
        await Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => OTPScreen(
            verificationId: verificationId,
            phoneNumber: normalized,
            firstName: _firstCtrl.text.trim(),
            lastName: _lastCtrl.text.trim(),
            password: _passCtrl.text,
          ),
        ));
        if (mounted) setState(() => _isProcessing = false);
      },
      codeAutoRetrievalTimeout: (id) {
        if (mounted) {
          setState(() {
            _isProcessing = false;
            _error = 'Auto retrieval timeout';
          });
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign up')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Row(children: [
                SizedBox(
                    width: 90,
                    child: TextFormField(
                        controller: _countryCtrl,
                        decoration: const InputDecoration(labelText: 'Code'),
                        enabled: !_isProcessing)),
                const SizedBox(width: 12),
                Expanded(
                    child: TextFormField(
                        controller: _phoneCtrl,
                        decoration: const InputDecoration(labelText: 'Phone'),
                        keyboardType: TextInputType.phone,
                        enabled: !_isProcessing,
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Required' : null)),
              ]),
              TextFormField(
                  controller: _firstCtrl,
                  decoration: const InputDecoration(labelText: 'First name'),
                  enabled: !_isProcessing,
                  validator: (v) =>
                      (v == null || v.isEmpty) ? 'Required' : null),
              TextFormField(
                  controller: _lastCtrl,
                  decoration: const InputDecoration(labelText: 'Last name'),
                  enabled: !_isProcessing,
                  validator: (v) =>
                      (v == null || v.isEmpty) ? 'Required' : null),
              TextFormField(
                  controller: _passCtrl,
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                  enabled: !_isProcessing,
                  validator: (v) =>
                      (v != null && v.length >= 6) ? null : 'Min 6'),
              const SizedBox(height: 12),
              if (_error != null)
                Text(_error!, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 8),
              ElevatedButton(
                  onPressed: _isProcessing ? null : _onCreateAccount,
                  child: _isProcessing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Create Account')),
            ],
          ),
        ),
      ),
    );
  }
}
