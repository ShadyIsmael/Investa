import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';

class SelectionChipsBubble extends StatelessWidget {
  final List<String> options;
  final void Function(String) onChipSelected;

  const SelectionChipsBubble({
    super.key,
    required this.options,
    required this.onChipSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.colorScheme.primary;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: theme.brightness == Brightness.dark
            ? Colors.white.withOpacityCompat(0.05)
            : Colors.grey[100],
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(
          color: primaryColor.withOpacityCompat(0.2),
          width: 1.5,
        ),
      ),
      child: Wrap(
        spacing: 10.0,
        runSpacing: 10.0,
        children: options.map((option) {
          return InkWell(
            onTap: () => onChipSelected(option),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
              decoration: BoxDecoration(
                color: primaryColor.withOpacityCompat(0.1),
                borderRadius: BorderRadius.circular(20.0),
                border: Border.all(
                  color: primaryColor.withOpacityCompat(0.5),
                  width: 1.5,
                ),
              ),
              child: Text(
                option,
                style: TextStyle(
                  color: primaryColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
