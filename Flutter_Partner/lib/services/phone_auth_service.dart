import 'package:firebase_auth/firebase_auth.dart';

class PhoneAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Normalize a user-entered phone number into a best-effort E.164 string.
  ///
  /// - `raw` is the user input (may contain spaces, dashes, leading zeros).
  /// - `defaultCountryCode` should be an E.164 country code like '+1' and is used
  ///   when the user provided a national number (no leading '+').
  /// Returns `null` when the input cannot be normalized.
  String? normalizePhoneNumber(String raw, {String defaultCountryCode = '+20'}) {
    if (raw.trim().isEmpty) return null;
    var s = raw.trim();
    // remove common separators
    s = s.replaceAll(RegExp(r'[\s\-\(\)]'), '');
    // convert international prefix 00 to +
    if (s.startsWith('00')) s = '+${s.substring(2)}';
    // If already in +E.164 form return
    if (s.startsWith('+')) {
      return s;
    }
    // If starts with leading 0 (national format), drop it
    if (s.startsWith('0')) s = s.substring(1);
    // Prepend default country code (ensure it starts with +)
    var cc = defaultCountryCode;
    if (!cc.startsWith('+')) cc = '+$cc';
    // Avoid duplicate +
    if (s.startsWith('+')) return s;
    return '$cc$s';
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(PhoneAuthCredential) verificationCompleted,
    required Function(FirebaseAuthException) verificationFailed,
    required Function(String, int?) codeSent,
    required Function(String) codeAutoRetrievalTimeout,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
    );
  }

  Future<UserCredential> signInWithCredential(
      PhoneAuthCredential credential) async {
    return await _auth.signInWithCredential(credential);
  }

  /// Sign in using a verification ID and an SMS code (useful for testing with
  /// a fixed code when SMS can't be delivered).
  Future<UserCredential> signInWithSmsCode(
      {required String verificationId, required String smsCode}) async {
    final credential = PhoneAuthProvider.credential(
        verificationId: verificationId, smsCode: smsCode);
    return await signInWithCredential(credential);
  }
}
