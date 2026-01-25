/// Model for credit transaction history
class CreditTransaction {
  final String id;
  final String userId;
  final double amount;
  final String? justificationEn;
  final String? justificationAr;
  final String? adminId;
  final DateTime createdAt;

  CreditTransaction({
    required this.id,
    required this.userId,
    required this.amount,
    this.justificationEn,
    this.justificationAr,
    this.adminId,
    required this.createdAt,
  });

  factory CreditTransaction.fromJson(Map<String, dynamic> json) {
    return CreditTransaction(
      id: json['id'] as String,
      userId: json['userId'] as String,
      amount: (json['amount'] as num).toDouble(),
      justificationEn: json['justificationEn'] as String?,
      justificationAr: json['justificationAr'] as String?,
      adminId: json['adminId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'amount': amount,
      if (justificationEn != null) 'justificationEn': justificationEn,
      if (justificationAr != null) 'justificationAr': justificationAr,
      if (adminId != null) 'adminId': adminId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String getJustification(String locale) {
    if (locale == 'ar' && justificationAr != null) {
      return justificationAr!;
    }
    return justificationEn ?? justificationAr ?? 'No description';
  }
}
