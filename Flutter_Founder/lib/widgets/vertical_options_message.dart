import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class VerticalOptionsMessage extends StatelessWidget {
  final List<String> options;
  final void Function(String) onOptionSelected;

  const VerticalOptionsMessage({
    super.key,
    required this.options,
    required this.onOptionSelected,
  });

  String _emojiFor(String option) {
    final map = {
      'Complaint': '🛠️',
      'Inquiry': '❓',
      'Feedback': '💬',
      'Other': '💳',
      // Add more mappings as needed
    };
    return map[option] ?? '💬';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final bubbleBg = isDark ? const Color(0xFF424242) : const Color(0xFFEFF1F3);
    final textColor = isDark ? Colors.white : Colors.black87;

    const borderRadius = BorderRadius.only(
      topLeft: Radius.circular(16),
      topRight: Radius.circular(16),
      bottomLeft: Radius.zero,
      bottomRight: Radius.circular(16),
    );

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      constraints:
          BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
      decoration: isDark
          ? AppDecorations.premiumGlass(customBorderRadius: borderRadius)
          : BoxDecoration(
              color: bubbleBg,
              borderRadius: borderRadius,
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'برجاء اختيار القسم المطلوب:',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          // Options list
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (context, index) {
              final option = options[index];
              return InkWell(
                onTap: () => onOptionSelected(option),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Text(_emojiFor(option),
                          style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(option,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: textColor,
                            )),
                      ),
                      const Icon(Icons.chevron_right,
                          size: 20, color: Colors.grey),
                    ],
                  ),
                ),
              );
            },
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemCount: options.length,
          ),
        ],
      ),
    );
  }
}
