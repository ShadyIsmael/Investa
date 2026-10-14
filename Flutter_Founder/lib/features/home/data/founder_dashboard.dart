class FounderDashboardMoney {
  const FounderDashboardMoney({
    required this.value,
    required this.available,
    required this.approximate,
  });

  final double? value;
  final bool available;
  final bool approximate;

  factory FounderDashboardMoney.fromJson(Map<String, dynamic> json) =>
      FounderDashboardMoney(
        value: (json['value'] as num?)?.toDouble(),
        available: json['available'] == true,
        approximate: json['approximate'] == true,
      );
}

class FounderDashboardMetrics {
  const FounderDashboardMetrics({
    required this.totalProjects,
    required this.activeOpportunities,
    required this.pendingActions,
    required this.totalCommitted,
    required this.declaredReceivedAmount,
    required this.awaitingConfirmationAmount,
    required this.disputedAmount,
    required this.confirmedReceivedAmount,
    required this.outstandingAmount,
  });

  final int totalProjects;
  final int activeOpportunities;
  final int pendingActions;
  final FounderDashboardMoney totalCommitted;
  final FounderDashboardMoney declaredReceivedAmount;
  final FounderDashboardMoney awaitingConfirmationAmount;
  final FounderDashboardMoney disputedAmount;
  final FounderDashboardMoney confirmedReceivedAmount;
  final FounderDashboardMoney outstandingAmount;

  factory FounderDashboardMetrics.fromJson(Map<String, dynamic> json) =>
      FounderDashboardMetrics(
        totalProjects: _int(json['totalProjects']),
        activeOpportunities: _int(json['activeOpportunities']),
        pendingActions: _int(json['pendingActions']),
        totalCommitted: _money(json['totalCommitted']),
        declaredReceivedAmount: _money(json['declaredReceivedAmount']),
        awaitingConfirmationAmount: _money(json['awaitingConfirmationAmount']),
        disputedAmount: _money(json['disputedAmount']),
        confirmedReceivedAmount: _money(json['confirmedReceivedAmount']),
        outstandingAmount: _money(json['outstandingAmount']),
      );
}

class FounderDashboardProject {
  const FounderDashboardProject({
    required this.id,
    required this.displayName,
    required this.opportunityCount,
  });

  final int id;
  final String displayName;
  final int opportunityCount;

  factory FounderDashboardProject.fromJson(Map<String, dynamic> json) =>
      FounderDashboardProject(
        id: _int(json['id']),
        displayName: json['displayName'] as String? ?? '',
        opportunityCount: _int(json['opportunityCount']),
      );
}

class FounderDashboard {
  const FounderDashboard({
    required this.displayCurrency,
    required this.metrics,
    required this.projects,
  });

  final String displayCurrency;
  final FounderDashboardMetrics metrics;
  final List<FounderDashboardProject> projects;

  factory FounderDashboard.fromJson(Map<String, dynamic> json) {
    final rawProjects = json['projects'];
    return FounderDashboard(
      displayCurrency: json['displayCurrency'] as String? ?? '',
      metrics: FounderDashboardMetrics.fromJson(
        _map(json['metrics'], 'metrics'),
      ),
      projects:
          rawProjects is List
              ? rawProjects
                  .whereType<Map>()
                  .map(
                    (item) => FounderDashboardProject.fromJson(
                      Map<String, dynamic>.from(item),
                    ),
                  )
                  .toList(growable: false)
              : const <FounderDashboardProject>[],
    );
  }
}

FounderDashboardMoney _money(dynamic value) =>
    FounderDashboardMoney.fromJson(_map(value, 'money metric'));

Map<String, dynamic> _map(dynamic value, String field) {
  if (value is! Map) {
    throw FormatException('Dashboard $field was missing or invalid.');
  }
  return Map<String, dynamic>.from(value);
}

int _int(dynamic value) => value is num ? value.toInt() : 0;
