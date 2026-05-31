import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import '../services/phone_auth_service.dart';

class OTPScreen extends StatefulWidget {
  final String verificationId;
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String password;
  final PhoneAuthCredential? autoCredential;

  const OTPScreen(
      {super.key,
      required this.verificationId,
      required this.phoneNumber,
      required this.firstName,
      required this.lastName,
      required this.password,
      this.autoCredential});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final _otpCtrl = TextEditingController();
  bool _isProcessing = false;
  String? _error;

  @override
  void dispose() {
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    setState(() {
      _isProcessing = true;
      _error = null;
    });
    try {
      UserCredential cred;
      if (widget.autoCredential != null) {
        cred = await FirebaseAuth.instance
            .signInWithCredential(widget.autoCredential!);
      } else {
        cred = await PhoneAuthService().signInWithSmsCode(
            verificationId: widget.verificationId,
            smsCode: _otpCtrl.text.trim());
      }

      final user = cred.user;
      if (user == null) throw Exception('No user from Firebase');
      final idToken = await user.getIdToken();

      final result = await AuthService().signup(
        phoneNumber: widget.phoneNumber,
        firstName: widget.firstName,
        lastName: widget.lastName,
        password: widget.password,
        firebaseUid: user.uid,
        isNew: cred.additionalUserInfo?.isNewUser,
      );

      if (!result.success) {
        setState(() {
          _isProcessing = false;
          _error = result.message ?? 'Signup failed';
        });
        return;
      }

      if (mounted) Navigator.of(context).pop(true);
    } on FirebaseAuthException catch (e) {
      setState(() {
        _isProcessing = false;
        _error = e.message ?? 'Invalid OTP';
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter OTP')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
                controller: _otpCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'OTP'),
                enabled: !_isProcessing),
            const SizedBox(height: 12),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(
                onPressed: _isProcessing ? null : _verify,
                child: _isProcessing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Verify')),
          ],
        ),
      ),
    );
  }
}
