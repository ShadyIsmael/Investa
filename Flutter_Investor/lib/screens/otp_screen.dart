import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
// نستخدم 'as pg' لحل مشكلة تضارب الأسماء مع Firebase
import '../auth_flow/models/pigeon_user.g.dart' as pg;
import '../services/phone_auth_service.dart';
import 'signup_screen.dart';

class OTPScreen extends StatefulWidget {
  const OTPScreen({Key? key}) : super(key: key);

  @override
  _OTPScreenState createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  bool _processing = false;
  bool _otpSent = false;
  String? _verificationId;
  String _selectedCountryCode = '+20';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Phone Verification')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Enter your phone number to get started',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            if (!_otpSent) ...[
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: DropdownButton<String>(
                      value: _selectedCountryCode,
                      items: const [
                        DropdownMenuItem(value: '+1', child: Text('+1 (US)')),
                        DropdownMenuItem(value: '+20', child: Text('+20 (EG)')),
                        DropdownMenuItem(value: '+44', child: Text('+44 (UK)')),
                        DropdownMenuItem(value: '+91', child: Text('+91 (IN)')),
                        DropdownMenuItem(value: '+61', child: Text('+61 (AU)')),
                        DropdownMenuItem(
                            value: '+234', child: Text('+234 (NG)')),
                      ],
                      onChanged: (v) {
                        if (v == null) return;
                        setState(() {
                          _selectedCountryCode = v;
                        });
                      },
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      decoration: const InputDecoration(
                        labelText: 'Phone Number',
                        hintText: 'Enter your phone number',
                      ),
                      keyboardType: TextInputType.phone,
                      enabled: !_processing,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _processing ? null : _sendOtp,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _processing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 3))
                    : const Text('Send OTP'),
              ),
            ] else ...[
              Text(
                'OTP sent to $_selectedCountryCode${_phoneController.text}',
                style: const TextStyle(fontSize: 14, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _otpController,
                decoration: const InputDecoration(
                  labelText: 'OTP Code',
                  hintText: 'Enter 6-digit code',
                ),
                keyboardType: TextInputType.number,
                enabled: !_processing,
                maxLength: 6,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _processing ? null : _verifyOtp,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _processing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 3))
                    : const Text('Verify'),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _processing ? null : _resendOtp,
                child: const Text('Resend OTP'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _sendOtp() async {
    final phoneNumber = _phoneController.text.trim();
    if (phoneNumber.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a phone number')),
      );
      return;
    }

    setState(() => _processing = true);

    try {
      final phoneAuthService = PhoneAuthService();
      final normalizedPhone = phoneAuthService.normalizePhoneNumber(
        phoneNumber,
        defaultCountryCode: _selectedCountryCode,
      );

      if (normalizedPhone == null) {
        throw Exception('Invalid phone number format');
      }

      await phoneAuthService.verifyPhoneNumber(
        phoneNumber: normalizedPhone,
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Auto-verification completed
          await _handleVerificationSuccess(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          setState(() => _processing = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.message ?? 'Verification failed')),
          );
        },
        codeSent: (String verificationId, int? resendToken) {
          setState(() {
            _processing = false;
            _otpSent = true;
            _verificationId = verificationId;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('OTP sent successfully')),
          );
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
      );
    } catch (e) {
      setState(() => _processing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.isEmpty || otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 6-digit OTP')),
      );
      return;
    }

    if (_verificationId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Verification ID not found. Please try again.')),
      );
      return;
    }

    setState(() => _processing = true);

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: otp,
      );

      await _handleVerificationSuccess(credential);
    } on FirebaseAuthException catch (e) {
      setState(() => _processing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message ?? 'Verification failed')),
      );
    } catch (e) {
      setState(() => _processing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _handleVerificationSuccess(
      PhoneAuthCredential credential) async {
    try {
      final userCred =
          await FirebaseAuth.instance.signInWithCredential(credential);
      final firebaseUser = userCred.user;

      if (firebaseUser == null) throw Exception("Firebase user not found");

      // تحويل بيانات Firebase لبيانات Pigeon باستخدام الـ Alias (pg)
      final userInfo = pg.UserInfo(
        uid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        isAnonymous: firebaseUser.isAnonymous,
        isEmailVerified: firebaseUser.emailVerified,
      );

      final userDetails = pg.UserDetails(
        userInfo: userInfo,
        providerData: firebaseUser.providerData
            .map((p) => {p.providerId: p.uid as Object?})
            .cast<Map<String?, Object?>>()
            .toList(),
      );

      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Phone number verified successfully!'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );

      // Navigate to SignupScreen with verified phone number
      if (mounted) {
        await Future.delayed(const Duration(seconds: 1));
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => SignupScreen(
              prefilledPhone:
                  '$_selectedCountryCode${_phoneController.text.trim()}',
              phoneReadOnly: true,
              firebaseResponse: {
                'uid': firebaseUser.uid,
                'isNew': userCred.additionalUserInfo?.isNewUser ?? true,
              },
            ),
          ),
        );
      }
    } catch (e) {
      setState(() => _processing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _resendOtp() async {
    setState(() {
      _otpSent = false;
      _verificationId = null;
      _otpController.clear();
    });
    await _sendOtp();
  }
}
