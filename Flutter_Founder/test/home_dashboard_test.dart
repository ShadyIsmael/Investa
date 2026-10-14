import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fopx_core/fopx_core.dart';
import 'package:fopx_ui/fopx_ui.dart';
import 'package:go_router/go_router.dart';

import 'package:fopx_founder/features/home/data/founder_dashboard.dart';
import 'package:fopx_founder/features/home/data/founder_dashboard_controller.dart';
import 'package:fopx_founder/features/home/presentation/home_page.dart';

void main() {
  test(
    'parses dashboard money availability and approximation authoritatively',
    () {
      final dashboard = FounderDashboard.fromJson(_payload(pendingActions: 2));

      expect(dashboard.displayCurrency, 'USD');
      expect(dashboard.metrics.totalProjects, 2);
      expect(dashboard.metrics.activeOpportunities, 3);
      expect(dashboard.metrics.pendingActions, 2);
      expect(dashboard.metrics.totalCommitted.value, 1250.5);
      expect(dashboard.metrics.totalCommitted.approximate, isTrue);
      expect(dashboard.metrics.disputedAmount.available, isFalse);
      expect(dashboard.projects.single.id, 44);
      expect(dashboard.projects.single.opportunityCount, 2);
    },
  );

  testWidgets('shows authoritative portfolio, capital, and project links', (
    tester,
  ) async {
    await tester.pumpWidget(_Harness(repository: _FakeDashboardRepository()));
    await tester.pumpAndSettle();

    expect(find.text('Portfolio'), findsOneWidget);
    expect(find.text('Capital position'), findsOneWidget);
    expect(find.text('Northstar Foods'), findsOneWidget);
    expect(find.text('Committed'), findsOneWidget);
    expect(find.text('Declared by you'), findsOneWidget);
    expect(find.textContaining('1,250.50'), findsOneWidget);
    expect(find.textContaining('≈'), findsOneWidget);
    expect(find.text('Unavailable'), findsOneWidget);
    expect(find.text('Needs attention'), findsNothing);
    expect(find.text('Recent activity'), findsNothing);

    await tester.drag(find.byType(CustomScrollView), const Offset(0, -360));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Northstar Foods'));
    await tester.pumpAndSettle();
    expect(find.text('project-overview-route-44'), findsOneWidget);
  });

  testWidgets('shows a calm empty portfolio without invented entries', (
    tester,
  ) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeDashboardRepository(
          dashboard: FounderDashboard.fromJson(_payload(projects: const [])),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Your portfolio is ready to begin'), findsOneWidget);
    expect(find.text('Northstar Foods'), findsNothing);
    expect(find.text('Create project'), findsNothing);
  });

  testWidgets('shows only backend-provided pending action count', (
    tester,
  ) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeDashboardRepository(
          dashboard: FounderDashboard.fromJson(_payload(pendingActions: 3)),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Needs attention'), findsOneWidget);
    expect(find.text('Pending actions: 3'), findsOneWidget);
  });

  testWidgets('renders controlled 403 without logging out', (tester) async {
    await tester.pumpWidget(
      _Harness(
        repository: _FakeDashboardRepository(
          error: const ApiError(
            message: 'Founder access required.',
            statusCode: 403,
            code: 'FOUNDER_ACCESS_REQUIRED',
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Founder overview access is restricted'), findsOneWidget);
    expect(find.text('Founder access required.'), findsNothing);
    expect(find.text('Sign in'), findsNothing);
  });

  testWidgets(
    'shows network retry and keeps the page localized in Arabic RTL',
    (tester) async {
      await tester.pumpWidget(
        _Harness(
          repository: _FakeDashboardRepository(
            error: const ApiError(message: 'offline'),
          ),
          locale: const Locale('ar'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('نظرتك العامة غير متاحة حالياً'), findsOneWidget);
      expect(find.text('حاول مرة أخرى'), findsOneWidget);
      expect(
        Directionality.of(tester.element(find.byType(HomePage))),
        TextDirection.rtl,
      );
    },
  );

  testWidgets('shows scoped loading skeleton while dashboard is pending', (
    tester,
  ) async {
    final pending = Completer<FounderDashboard>();
    await tester.pumpWidget(
      _Harness(repository: _FakeDashboardRepository(pending: pending.future)),
    );
    await tester.pump();
    expect(find.byType(FopxLoadingState), findsWidgets);
    pending.complete(FounderDashboard.fromJson(_payload()));
  });
}

Map<String, dynamic> _payload({
  List<dynamic>? projects,
  int pendingActions = 0,
}) => <String, dynamic>{
  'displayCurrency': 'USD',
  'metrics': <String, dynamic>{
    'totalProjects': 2,
    'activeOpportunities': 3,
    'pendingActions': pendingActions,
    'totalCommitted': _money(1250.5, approximate: true),
    'declaredReceivedAmount': _money(500),
    'awaitingConfirmationAmount': _money(250),
    'disputedAmount': <String, dynamic>{'value': null, 'available': false},
    'confirmedReceivedAmount': _money(250),
    'outstandingAmount': _money(1000),
  },
  'projects':
      projects ??
      <dynamic>[
        <String, dynamic>{
          'id': 44,
          'displayName': 'Northstar Foods',
          'opportunityCount': 2,
        },
      ],
};

Map<String, dynamic> _money(double value, {bool approximate = false}) =>
    <String, dynamic>{
      'value': value,
      'available': true,
      'approximate': approximate,
    };

class _FakeDashboardRepository implements FounderDashboardRepository {
  _FakeDashboardRepository({this.dashboard, this.error, this.pending});

  final FounderDashboard? dashboard;
  final Object? error;
  final Future<FounderDashboard>? pending;

  @override
  Future<FounderDashboard> fetchDashboard() async {
    if (pending != null) return pending!;
    if (error != null) throw error!;
    return dashboard ?? FounderDashboard.fromJson(_payload());
  }
}

class _Harness extends StatelessWidget {
  const _Harness({required this.repository, this.locale = const Locale('en')});

  final FounderDashboardRepository repository;
  final Locale locale;

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: '/home',
      routes: <RouteBase>[
        GoRoute(path: '/home', builder: (_, _) => const HomePage()),
        GoRoute(
          path: '/projects/:id',
          builder:
              (_, state) =>
                  Text('project-overview-route-${state.pathParameters['id']}'),
        ),
      ],
    );
    return ProviderScope(
      overrides: <Override>[
        founderDashboardRepositoryProvider.overrideWithValue(repository),
      ],
      child: MaterialApp.router(
        routerConfig: router,
        builder: (_, child) => Scaffold(body: child),
        locale: locale,
        theme: FopxTheme.founderLight(),
        supportedLocales: const <Locale>[Locale('en'), Locale('ar')],
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          FopxLocalizationsDelegate(),
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
      ),
    );
  }
}
