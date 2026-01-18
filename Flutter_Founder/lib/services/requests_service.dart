import 'dart:async';

class RequestItem {
  final String id;
  final String founderName;
  final String? avatarUrl;
  final String businessName;
  final double amount;
  RequestStatus status;
  final DateTime createdAt;
  final bool isIncome;
  final int credibilityScore;

  RequestItem({
    required this.id,
    required this.founderName,
    this.avatarUrl,
    required this.businessName,
    required this.amount,
    this.status = RequestStatus.pending,
    DateTime? createdAt,
    required this.isIncome,
    this.credibilityScore = 50,
  }) : createdAt = createdAt ?? DateTime.now();
}

enum RequestStatus { pending, accepted, declined, canceled }

class RequestsService {
  // In-memory mock lists.
  final List<RequestItem> _income = [
    RequestItem(
        id: 'inc-1',
        founderName: 'Ali Hassan',
        avatarUrl: null,
        businessName: 'GreenTech Co',
        amount: 1200.0,
        isIncome: true,
        credibilityScore: 88),
    RequestItem(
        id: 'inc-2',
        founderName: 'Sara Omar',
        avatarUrl: null,
        businessName: 'BlueFoods',
        amount: 450.0,
        isIncome: true,
        credibilityScore: 72),
  ];

  final List<RequestItem> _outcome = [
    RequestItem(
        id: 'out-1',
        founderName: 'My Request',
        avatarUrl: null,
        businessName: 'Your Venture',
        amount: 300.0,
        isIncome: false,
        credibilityScore: 55),
  ];

  Future<List<RequestItem>> fetchIncomeRequests() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List<RequestItem>.from(_income);
  }

  Future<List<RequestItem>> fetchOutcomeRequests() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List<RequestItem>.from(_outcome);
  }

  Future<void> acceptRequest(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final it = _income.firstWhere((e) => e.id == id,
        orElse: () => throw StateError('Not found'));
    it.status = RequestStatus.accepted;
  }

  Future<void> declineRequest(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final it = _income.firstWhere((e) => e.id == id,
        orElse: () => throw StateError('Not found'));
    it.status = RequestStatus.declined;
  }

  Future<void> cancelRequest(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final it = _outcome.firstWhere((e) => e.id == id,
        orElse: () => throw StateError('Not found'));
    it.status = RequestStatus.canceled;
  }
}
