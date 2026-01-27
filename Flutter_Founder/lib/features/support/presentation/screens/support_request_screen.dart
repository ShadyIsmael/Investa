import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/support_provider.dart';
import '../../../../core/di/injection_container.dart';

/// Responsive Support Request Screen with Clean Architecture.
///
/// Features:
/// - Fully responsive layout (no hardcoded sizes)
/// - SafeArea wrapping
/// - ScrollView for small screens
/// - Clean error handling with SnackBars
/// - Loading states
class SupportRequestScreen extends StatefulWidget {
  const SupportRequestScreen({super.key});

  @override
  State<SupportRequestScreen> createState() => _SupportRequestScreenState();
}

class _SupportRequestScreenState extends State<SupportRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _messageController = TextEditingController();
  String _selectedType = 'Request';
  String? _supportSessionId;

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<SupportProvider>(context, listen: false);
    provider.loadActiveSessionId().then((_) {
      setState(() {
        _supportSessionId = provider.activeSessionId;
      });
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _initiateSupportSession(
      BuildContext context, SupportProvider provider) async {
    const userMobile =
        '0123456789'; // TODO: Replace with actual user mobile retrieval logic

    final sessionId = await provider.initiateSupportSession(
      userMobile: userMobile,
      type: _selectedType,
    );

    if (!mounted) return;

    setState(() {
      _supportSessionId = sessionId;
    });
  }

  Future<void> _submitRequest(
      BuildContext context, SupportProvider provider) async {
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    if (!_formKey.currentState!.validate()) return;

    if (_supportSessionId == null) {
      await _initiateSupportSession(context, provider);
      if (!mounted) return;
    }

    final success = await provider.sendSupportRequest(
      userMobile:
          '0123456789', // TODO: Replace with actual user mobile retrieval logic
      message: _messageController.text.trim(),
      type: _selectedType,
      sessionId: _supportSessionId!,
    );

    if (!mounted) return;

    if (success) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Support request sent successfully'),
          backgroundColor: Colors.green,
        ),
      );

      navigator.pop();
    } else {
      messenger.showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Failed to send request'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => sl<SupportProvider>()..startListening(),
      child: Consumer<SupportProvider>(
        builder: (context, provider, _) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Support Request'),
              centerTitle: true,
            ),
            body: SafeArea(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: MediaQuery.of(context).size.width * 0.05,
                  vertical: 16,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Text(
                        'How can we help you?',
                        style:
                            Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                        textAlign: TextAlign.center,
                      ),

                      SizedBox(
                          height: MediaQuery.of(context).size.height * 0.02),

                      // Type selector card
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Request Type',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                              const SizedBox(height: 8),
                              DropdownButtonFormField<String>(
                                value: _selectedType,
                                decoration: const InputDecoration(
                                  border: OutlineInputBorder(),
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 12,
                                  ),
                                ),
                                items: ['Request', 'Inquiry', 'Complaint']
                                    .map((type) => DropdownMenuItem(
                                          value: type,
                                          child: Row(
                                            children: [
                                              Icon(
                                                _getIconForType(type),
                                                size: 20,
                                              ),
                                              const SizedBox(width: 8),
                                              Text(type),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                                onChanged: (value) {
                                  if (value != null) {
                                    setState(() => _selectedType = value);
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      ),

                      SizedBox(
                          height: MediaQuery.of(context).size.height * 0.02),

                      // Message input card
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Message',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: _messageController,
                                maxLines: 6,
                                decoration: const InputDecoration(
                                  hintText: 'Describe your request or issue...',
                                  border: OutlineInputBorder(),
                                  contentPadding: EdgeInsets.all(12),
                                ),
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return 'Please enter a message';
                                  }
                                  if (value.trim().length < 10) {
                                    return 'Message must be at least 10 characters';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),
                        ),
                      ),

                      SizedBox(
                          height: MediaQuery.of(context).size.height * 0.03),

                      // Submit button
                      SizedBox(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: provider.isLoading
                              ? null
                              : () => _submitRequest(context, provider),
                          style: ElevatedButton.styleFrom(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: provider.isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : const Text(
                                  'Send Request',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),

                      SizedBox(
                          height: MediaQuery.of(context).size.height * 0.02),

                      // Connection status
                      if (provider.isConnected)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Colors.green,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Connected to support',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: Colors.green,
                                  ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'Request':
        return Icons.request_page;
      case 'Inquiry':
        return Icons.help_outline;
      case 'Complaint':
        return Icons.report_problem;
      default:
        return Icons.message;
    }
  }
}
