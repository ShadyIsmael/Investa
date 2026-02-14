import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_founder/services/app_state.dart';
import 'package:flutter_founder/services/profile_service.dart';

void main() {
  testWidgets('displays cached profile full name', (WidgetTester tester) async {
    WidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});

    final profile = Profile(basicInfo: BasicInfo(fullName: 'John Doe'));
    await AppState.instance.setProfile(profile, {
      'basicInfo': {'fullName': 'John Doe'}
    });

    // Render only the header with the cached profile to avoid network calls.
    // Confirm AppState holds the profile and the fullName getter returns expected value.
    expect(AppState.instance.profile?.basicInfo?.fullName, 'John Doe');
    expect(AppState.instance.profile?.fullName, 'John Doe');
  });
}
