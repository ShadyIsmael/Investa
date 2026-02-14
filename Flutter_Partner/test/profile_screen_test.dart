import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_partner/services/app_state.dart';
import 'package:flutter_partner/services/profile_service.dart';

void main() {
  testWidgets('displays cached profile full name', (WidgetTester tester) async {
    WidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});

    final profile = Profile(basicInfo: BasicInfo(fullName: 'Jane Smith'));
    await AppState.instance.setProfile(profile, {
      'basicInfo': {'fullName': 'Jane Smith'}
    });

    // Confirm AppState holds the profile and the fullName getter returns expected value.
    expect(AppState.instance.profile?.basicInfo?.fullName, 'Jane Smith');
    expect(AppState.instance.profile?.fullName, 'Jane Smith');
  });
}
