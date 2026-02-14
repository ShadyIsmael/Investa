import 'dart:async';
import 'package:flutter_partner/services/app_state.dart';
import 'package:flutter_partner/services/profile_service.dart';
import 'package:flutter_partner/services/auth_service.dart';
import 'package:flutter_partner/services/credits_service.dart';
import 'package:flutter_partner/services/dashboard_service.dart';
import 'package:flutter_partner/services/app_logger.dart';

class Category {
  final String name;
  final double percent;
  Category(this.name, this.percent);
}

class Activity {
  final String title;
  final String subtitle;
  final DateTime time;
  Activity(this.title, this.subtitle, this.time);
}

class DashboardData {
  final int credibilityScore;
  final int creditPoints;
  final double _walletBalance;
  final double totalIncome;
  final double totalOutcome;
  final List<Category> categories;
  final List<Activity> activities;
  final List<MonthlyCredit> creditHistory;
  final List<MonthlyMetric> scoreHistory;
  final List<CreditTransaction> transactions;
  final bool timeseriesFromServer;
  final bool timeseriesAttempted;
  final bool categoriesFromServer;

  double get walletBalance => _walletBalance;

  DashboardData(
      {required this.credibilityScore,
      required this.creditPoints,
      required double walletBalance,
      required this.totalIncome,
      required this.totalOutcome,
      required this.categories,
      required this.activities,
      required this.creditHistory,
      required this.scoreHistory,
      required this.transactions,
      this.timeseriesFromServer = false,
      this.timeseriesAttempted = false,
      this.categoriesFromServer = false})
      : _walletBalance = walletBalance;
}

Future<DashboardData> fetchDashboardData({String interval = 'month'}) async {
  // simulate network delay
  await Future.delayed(const Duration(milliseconds: 500));

  // determine range and buckets depending on interval
  final now = DateTime.now();
  DateTime fromDate;
  int buckets;
  // keyFor will be a mutable function used for normalization of server data
  String Function(DateTime) keyFor =
      (DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}';
  if (interval == 'day') {
    buckets = 30;
    fromDate = DateTime(now.year, now.month, now.day)
        .subtract(Duration(days: buckets - 1));
    keyFor = (DateTime d) =>
        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  } else if (interval == 'year') {
    buckets = 5;
    fromDate = DateTime(now.year - (buckets - 1), 1, 1);
    keyFor = (DateTime d) => '${d.year}';
  } else {
    // month
    buckets = 12;
    fromDate = DateTime(now.year, now.month - (buckets - 1), 1);
    keyFor = (DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}';
  }

  var categories = [
    Category('Equities', 45),
    Category('Bonds', 20),
    Category('Real Estate', 15),
    Category('Commodities', 10),
    Category('Cash', 10),
  ];

  final activities = [
    Activity('Bought 50 shares of XYZ', 'Equities',
        DateTime.now().subtract(const Duration(hours: 2))),
    Activity('Received coupon payment', 'Bonds',
        DateTime.now().subtract(const Duration(days: 2))),
    Activity('Sold 10% of Real Estate fund', 'Real Estate',
        DateTime.now().subtract(const Duration(days: 7))),
    Activity('Allocated to Commodities', 'Commodities',
        DateTime.now().subtract(const Duration(days: 12))),
  ];

  // Generate synthetic transactions and aggregate according to the selected interval
  final transactions = _generateMockTransactions(now);

  // Initial aggregation (fallback/mock) according to interval/buckets
  List<MonthlyCredit> creditHistory = _aggregateByInterval(transactions,
      interval: interval, buckets: buckets, fromDate: fromDate);

  var timeseriesFromServer = false;
  var timeseriesAttempted = false;
  var categoriesFromServer = false;
  List<MonthlyMetric> scoreHistory = [];
  try {
    await AppState.instance.loadFromStorage();

    final profile = AppState.instance.profile;
    // Prefer userId from auth token (JWT) when available; otherwise fall back to profile.userId
    String? tokenUserId = await AuthService().userIdFromToken();
    final availableUserId = tokenUserId ?? (profile?.userId);
    if (availableUserId != null && availableUserId.isNotEmpty) {
      final userId = availableUserId;
      AppLogger.logInfo('MockData',
          'Using userId=$userId for timeseries/transactions (token=${tokenUserId != null})');

      timeseriesAttempted = true;

      // Prefer the dashboard summary endpoint (uses auth token). It returns both credit and score transactions plus summary fields.
      final summary = await DashboardService().fetchSummary();
      if (summary != null) {
        timeseriesFromServer = true;

        // Build creditHistory from returned creditTransactions
        final List<CreditTransaction> remoteCreditTx =
            summary.creditTransactions
                .map((t) => CreditTransaction(
                      id: t.id,
                      userId: t.userId,
                      amount: t.amount.round(),
                      type: t.type,
                      referenceId: t.referenceId,
                      description: t.description,
                      createdAt: t.createdAt,
                    ))
                .toList();

        // Aggregate into the desired interval buckets
        creditHistory = _aggregateByInterval(remoteCreditTx,
            interval: interval, buckets: buckets, fromDate: fromDate);

        // Build score series from scoreTransactions
        final Map<String, MonthlyMetric> sByKey = {};
        for (final s in summary.scoreTransactions) {
          final dt = s.createdAt;
          final key = keyFor(dt);
          final repDate = interval == 'day'
              ? DateTime(dt.year, dt.month, dt.day)
              : (interval == 'year'
                  ? DateTime(dt.year, 1, 1)
                  : DateTime(dt.year, dt.month, 1));
          sByKey[key] = MonthlyMetric(date: repDate, value: s.score);
        }
        final List<MonthlyMetric> normalizedScore = [];
        for (var i = 0; i < buckets; i++) {
          DateTime dt;
          if (interval == 'day') {
            dt = DateTime(fromDate.year, fromDate.month, fromDate.day + i);
          } else if (interval == 'year')
            dt = DateTime(fromDate.year + i, 1, 1);
          else
            dt = DateTime(fromDate.year, fromDate.month + i, 1);
          final key = keyFor(dt);
          if (sByKey.containsKey(key)) {
            normalizedScore.add(sByKey[key]!);
          } else {
            normalizedScore.add(MonthlyMetric(date: dt, value: 0));
          }
        }
        scoreHistory = normalizedScore;

        // Replace transactions list with server-provided credit transactions
        if (remoteCreditTx.isNotEmpty) {
          transactions.clear();
          transactions.addAll(remoteCreditTx);
        }

        // Use summary numbers if present
        // credibility/credits will be updated later from profile/raw; here we can prefer summary values
        // (they will be used when available in the return payload)
      } else {
        // fallback: keep previous behavior and generate scoreHistory if missing (existing fallback remains)
        final base = (profile?.score ??
                (profile?.coreMetrics?.credibilityScore != null
                    ? (profile!.coreMetrics!.credibilityScore! * 10).round()
                    : 0))
            .toDouble();
        final List<MonthlyMetric> generated = [];
        for (var i = 0; i < buckets; i++) {
          final dt = interval == 'day'
              ? DateTime(fromDate.year, fromDate.month, fromDate.day + i)
              : (interval == 'year'
                  ? DateTime(fromDate.year + i, 1, 1)
                  : DateTime(fromDate.year, fromDate.month + i, 1));
          final v =
              (base + i * (base * 0.02)).toDouble(); // small incremental growth
          generated.add(MonthlyMetric(date: dt, value: v));
        }
        scoreHistory = generated;
      }

      // Attempt to fetch top-categories for the allocation pie chart (returns counts)
      try {
        final topCats = await DashboardService().fetchTopCategories(take: 5);
        AppLogger.logInfo(
            'MockData', 'TopCategories fetched: count=${topCats.length}');
        if (topCats.isNotEmpty) {
          final total = topCats.fold<int>(0, (s, e) => s + e.investmentCount);
          AppLogger.logInfo('MockData',
              'TopCategories dumped: ${topCats.map((t) => '${t.businessCategoryName}:${t.investmentCount}').join(', ')}');
          if (total > 0) {
            categoriesFromServer = true;
            categories = topCats
                .map((t) => Category(t.businessCategoryName,
                    (t.investmentCount / total) * 100.0))
                .toList();
          }
        }
      } catch (e, s) {
        AppLogger.logError('MockData', 'Failed to fetch top-categories: $e', s);
        // ignore — fall back to mock categories
      }
    }
  } catch (_) {
    // ignore and keep generated creditHistory/transactions
  }

  // Default to 0 when no profile data is available to avoid showing placeholder/dummy values
  int credibility = 0;
  int credits = 0;

  try {
    final profile = AppState.instance.profile;
    if (profile != null) {
      // Prefer nested basicInfo score/credit when present (Profile.score falls back to these)
      if (profile.score != null) {
        credibility = profile.score!;
      } else {
        final cm = profile.coreMetrics;
        if (cm?.credibilityScore != null) {
          credibility = (cm!.credibilityScore! * 10).round();
        }
      }

      if (profile.credit != null) {
        credits = profile.credit!;
      } else {
        credits = (profile.coreMetrics?.walletBalance ?? 0).round();
      }
    } else {
      // attempt to fetch profile from API and store it
      final rawProfile = await ProfileService().fetchProfileRaw();
      if (rawProfile != null) {
        final p = Profile.fromJson(rawProfile);
        await AppState.instance.setProfile(p, rawProfile);
        if (p.score != null) {
          credibility = p.score!;
        } else {
          final cm = p.coreMetrics;
          if (cm?.credibilityScore != null) {
            credibility = (cm!.credibilityScore! * 10).round();
          }
        }

        if (p.credit != null) {
          credits = p.credit!;
        } else {
          credits = (p.coreMetrics?.walletBalance ?? 0).round();
        }
      }
    }
  } catch (_) {}

  double income = 0.0;
  double outcome = 0.0;
  for (final t in transactions) {
    if (t.amount > 0) {
      income += t.amount.toDouble();
    } else {
      outcome += t.amount.abs().toDouble();
    }
  }

  return DashboardData(
    credibilityScore: credibility,
    creditPoints: credits,
    walletBalance: credits.toDouble(), // Using credits as wallet balance
    totalIncome: income,
    totalOutcome: outcome,
    categories: categories,
    activities: activities,
    creditHistory: creditHistory,
    scoreHistory: scoreHistory,
    transactions: transactions,
    timeseriesFromServer: timeseriesFromServer,
    timeseriesAttempted: timeseriesAttempted,
    categoriesFromServer: categoriesFromServer,
  );
}

List<CreditTransaction> _generateMockTransactions(DateTime now) {
  final rnd = DateTime.now().millisecondsSinceEpoch % 100; // deterministic-ish
  final List<CreditTransaction> list = [];
  var idCounter = 1000;
  for (var m = 0; m < 12; m++) {
    final monthDate = DateTime(now.year, now.month - (11 - m), 1);
    // create between 3..8 transactions per month
    final count = 3 + ((m + rnd) % 6);
    for (var i = 0; i < count; i++) {
      final day = 1 + (i * 3) % 28;
      final amount = 20 + ((m * 7 + i * 5) % 120).toDouble();
      list.add(CreditTransaction(
        id: idCounter++,
        userId: 'local',
        amount: amount.toInt(),
        type: 'Earn',
        referenceId: null,
        description: 'Mock earn',
        createdAt: DateTime(monthDate.year, monthDate.month, day),
      ));
    }
    // occasional debit to ensure filtering works
    if (m % 4 == 0) {
      list.add(CreditTransaction(
        id: idCounter++,
        userId: 'local',
        amount: -15,
        type: 'Spend',
        referenceId: null,
        description: 'Mock spend',
        createdAt: DateTime(monthDate.year, monthDate.month, 2),
      ));
    }
  }
  return list;
}

List<MonthlyCredit> _aggregateByInterval(List<CreditTransaction> transactions,
    {required String interval,
    required int buckets,
    required DateTime fromDate}) {
  final Map<String, double> sums = {};

  String keyOf(DateTime dt) {
    if (interval == 'day') {
      return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
    }
    if (interval == 'year') return '${dt.year}';
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}'; // month
  }

  for (final t in transactions) {
    if (t.amount <= 0) continue;
    final dt = t.createdAt;
    final key = keyOf(interval == 'day'
        ? DateTime(dt.year, dt.month, dt.day)
        : (interval == 'year'
            ? DateTime(dt.year, 1, 1)
            : DateTime(dt.year, dt.month, 1)));
    sums[key] = (sums[key] ?? 0) + t.amount;
  }

  final List<MonthlyCredit> result = [];
  for (var i = 0; i < buckets; i++) {
    DateTime dt;
    if (interval == 'day') {
      dt = DateTime(fromDate.year, fromDate.month, fromDate.day + i);
    } else if (interval == 'year')
      dt = DateTime(fromDate.year + i, 1, 1);
    else
      dt = DateTime(fromDate.year, fromDate.month + i, 1);
    final key = keyOf(dt);
    final total = sums[key] ?? 0.0;
    result.add(MonthlyCredit(month: dt, credits: total.round()));
  }
  return result;
}

class MonthlyCredit {
  final DateTime month;
  final int credits;
  MonthlyCredit({required this.month, required this.credits});
}

class MonthlyMetric {
  final DateTime date;
  final double value;
  MonthlyMetric({required this.date, required this.value});
}
