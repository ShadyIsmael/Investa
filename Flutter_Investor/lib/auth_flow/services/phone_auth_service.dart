import 'package:firebase_auth/firebase_auth.dart';

class PhoneAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  String? normalizePhone(String raw, {String defaultCountryCode = '+20'}) {
    var s = raw.trim();
    if (s.isEmpty) return null;
    s = s.replaceAll(RegExp(r'[\s\-\(\)]'), '');
    if (s.startsWith('00')) s = '+${s.substring(2)}';
    if (s.startsWith('+')) return s;
    if (s.startsWith('0')) s = s.substring(1);
    if (!defaultCountryCode.startsWith('+')) {
      defaultCountryCode = '+$defaultCountryCode';
    }
    return '$defaultCountryCode$s';
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) verificationCompleted,
    required void Function(FirebaseAuthException) verificationFailed,
    required void Function(String verificationId, int? resendToken) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
    );
  }

  Future<UserCredential> signInWithCode(
      {required String verificationId, required String smsCode}) async {
    final cred = PhoneAuthProvider.credential(
        verificationId: verificationId, smsCode: smsCode);
    return await _auth.signInWithCredential(cred);
  }
}
