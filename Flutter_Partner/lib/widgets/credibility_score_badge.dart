import 'package:flutter/material.dart';

/// Badge to display credibility score
class CredibilityScoreBadge extends StatelessWidget {
  final double score;
  final double size;

  const CredibilityScoreBadge({
    Key? key,
    required this.score,
    this.size = 80,
  }) : super(key: key);

  Color _getScoreColor() {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.lightGreen;
    if (score >= 40) return Colors.orange;
    if (score >= 20) return Colors.deepOrange;
    return Colors.red;
  }

  IconData _getScoreIcon() {
    if (score >= 80) return Icons.verified;
    if (score >= 60) return Icons.check_circle;
    if (score >= 40) return Icons.warning;
    return Icons.error;
  }

  @override
  Widget build(BuildContext context) {
    final color = _getScoreColor();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withAlpha((0.1 * 255).round()),
        shape: BoxShape.circle,
        border: Border.all(
          color: color,
          width: 3,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            _getScoreIcon(),
            color: color,
            size: size * 0.3,
          ),
          SizedBox(height: size * 0.05),
          Text(
            score.toStringAsFixed(0),
            style: TextStyle(
              fontSize: size * 0.25,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
