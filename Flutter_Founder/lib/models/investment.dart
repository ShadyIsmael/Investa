/// Investment model for Founder investments
class Investment {
  final String id;
  final String title;
  final String type; // 'founding' or 'equity'
  final double targetAmount;
  final double currentAmount;
  final String description;
  final Map<String, dynamic> rawData;

  Investment({
    required this.id,
    required this.title,
    required this.type,
    required this.targetAmount,
    required this.currentAmount,
    required this.description,
    this.rawData = const {},
  });

  double get progress => currentAmount / targetAmount;

  double get progressPercent => (progress * 100);
}
