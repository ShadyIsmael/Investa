import 'package:flutter/material.dart';
import '../services/app_logger.dart';
import '../widgets/app_background.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';

class SupportRequestScreen extends StatefulWidget {
  const SupportRequestScreen({super.key});

  @override
  State<SupportRequestScreen> createState() => _SupportRequestScreenState();
}

class _SupportRequestScreenState extends State<SupportRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  String _type = 'Request';
  final _messageController = TextEditingController();
  final _contactController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _messageController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _contactController.dispose();
    super.dispose();
  }

  Future<void> _confirmAndSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
              title: const Text('Confirm submission'),
              content: const Text('Send this support request?'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: const Text('Cancel')),
                ElevatedButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('Send')),
              ],
            ));
    if (ok != true) return;
    await _submit();
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    final payload = {
      'type': _type,
      'message': _messageController.text.trim(),
      'contact': _contactController.text.trim(),
      'time': DateTime.now().toIso8601String(),
    };

    // For now just log the request and show confirmation. Replace with API call if available.
    AppLogger.logInfo('SupportRequest', 'Submitting: $payload');

    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Request submitted')));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Contact Support'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: AppBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppPalette.flame.withOpacityCompat(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.support_agent_rounded,
                          size: 32, color: AppPalette.flame),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'How can we help you?',
                            style: theme.textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Provide as much detail as you can so we can help faster.',
                            style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurface
                                    .withOpacityCompat(0.7)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Form Container
                Container(
                  decoration: isDark
                      ? AppDecorations.premiumGlass(radius: 20)
                      : BoxDecoration(
                          color: theme.cardColor,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: AppShadows.soft,
                        ),
                  padding: const EdgeInsets.all(20.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        DropdownButtonFormField<String>(
                          value: _type,
                          dropdownColor: isDark ? AppPalette.midnightAlt : null,
                          items: ['Request', 'Inquiry', 'Complaint']
                              .map((e) => DropdownMenuItem(
                                  value: e,
                                  child: Text(e,
                                      style: const TextStyle(fontSize: 14))))
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _type = v ?? 'Request'),
                          decoration: InputDecoration(
                            labelText: 'Category',
                            helperText: 'Select the type of support',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                    color: theme.colorScheme.outline
                                        .withOpacityCompat(0.3))),
                          ),
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: _contactController,
                          decoration: InputDecoration(
                            labelText: 'Contact (email or phone)',
                            hintText: 'Optional',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                    color: theme.colorScheme.outline
                                        .withOpacityCompat(0.3))),
                          ),
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: _messageController,
                          minLines: 6,
                          maxLines: 12,
                          maxLength: 2000,
                          decoration: InputDecoration(
                            labelText: 'Describe your request',
                            alignLabelWithHint: true,
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                    color: theme.colorScheme.outline
                                        .withOpacityCompat(0.3))),
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty)
                              ? 'Please enter a message'
                              : null,
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: _isSubmitting
                                    ? null
                                    : () => Navigator.of(context).pop(),
                                style: OutlinedButton.styleFrom(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 16),
                                  side: BorderSide(
                                      color: theme.colorScheme.outline
                                          .withOpacityCompat(0.5)),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Cancel'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: (_isSubmitting ||
                                        _messageController.text.trim().isEmpty)
                                    ? null
                                    : _confirmAndSubmit,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppPalette.flame,
                                  foregroundColor: Colors.white,
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                                child: _isSubmitting
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white))
                                    : const Text('Submit'),
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
