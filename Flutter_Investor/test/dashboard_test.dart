import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_investor/services/mock_data.dart';
import 'package:flutter_investor/services/app_state.dart';
import 'package:flutter_investor/services/profile_service.dart';

void main() {
  group('Dashboard data sources', () {
    test('uses profile.score and profile.credit when present', () async {
      final p = Profile(score: 999, credit: 123);
      // set profile without raw json to avoid writing shared prefs in test
      await AppState.instance.setProfile(p, null);

      final data = await fetchDashboardData();

      expect(data.credibilityScore, equals(999));
      expect(data.creditPoints, equals(123));

      await AppState.instance.clear();
    });

    test('falls back to coreMetrics when score/credit missing', () async {
      final cm = CoreMetrics(email: 'e', role: 'r', clientType: 'c', credibilityScore: 45.5, walletBalance: 77.0);
      final p = Profile(coreMetrics: cm);
      await AppState.instance.setProfile(p, null);

      final data = await fetchDashboardData();

      expect(data.credibilityScore, equals((45.5 * 10).round())); // same logic as dashboard
      expect(data.creditPoints, equals(77));

      await AppState.instance.clear();
    });

    test('defaults to 0 when no profile is available', () async {
      await AppState.instance.clear();

      final data = await fetchDashboardData();

      expect(data.credibilityScore, equals(0));
      expect(data.creditPoints, equals(0));
    });
  });
}
