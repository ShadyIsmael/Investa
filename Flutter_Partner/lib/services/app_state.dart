import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_partner/services/profile_service.dart';
import 'package:flutter_partner/models/trust_profile.dart';

/// Global app state singleton holding the current user's profile.
class AppState extends ChangeNotifier {
  AppState._internal();
  static final AppState instance = AppState._internal();

  Profile? _profile;
  Map<String, dynamic>? _profileJson;

  // ── Progressive Trust ─────────────────────────────────────────────────────
  TrustProfile? _trustProfile;
  TrustProfile? get trustProfile => _trustProfile;

  void setTrustProfile(TrustProfile? tp) {
    _trustProfile = tp;
    notifyListeners();
  }

  bool meetsLevel(TrustLevel level) =>
      _trustProfile?.meetsLevel(level) ?? false;
  // ──────────────────────────────────────────────────────────────────────────

  Profile? get profile => _profile;
  Map<String, dynamic>? get profileJson => _profileJson;

  Future<void> loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString('profile_json');
      if (raw != null && raw.isNotEmpty) {
        final map = jsonDecode(raw) as Map<String, dynamic>;
        // Only update and notify listeners when the stored profile actually changed
        final currentRaw =
            _profileJson != null ? jsonEncode(_profileJson) : null;
        if (currentRaw != raw) {
          _profileJson = map;
          _profile = Profile.fromJson(map);
          notifyListeners();
        }
      }
    } catch (_) {}
  }

  Future<void> setProfile(Profile p, Map<String, dynamic>? rawJson) async {
    _profile = p;
    _profileJson = rawJson;
    try {
      if (rawJson != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('profile_json', jsonEncode(rawJson));
      }
    } catch (_) {}
    notifyListeners();
  }

  Future<void> clear() async {
    _profile = null;
    _profileJson = null;
    _trustProfile = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('profile_json');
    } catch (_) {}
    notifyListeners();
  }
}
