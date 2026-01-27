import 'package:flutter/material.dart';
import '../services/secure_storage.dart';
import '../core/network/network_config.dart';
import '../core/services/signalr_service.dart';
import '../core/services/logger_service.dart';
import '../core/services/secure_storage_service.dart';

class SignalRConfigScreen extends StatefulWidget {
  const SignalRConfigScreen({super.key});

  @override
  _SignalRConfigScreenState createState() => _SignalRConfigScreenState();
}

class _SignalRConfigScreenState extends State<SignalRConfigScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final v = await SecureStorage().read('SIGNALR_HUB_URL');
    if (v != null) _controller.text = v;
  }

  Future<void> _save() async {
    final v = _controller.text.trim();
    if (v.isEmpty) return;
    setState(() => _saving = true);

    // Persist for legacy and future runs
    await SecureStorage().write('SIGNALR_HUB_URL', v);

    // Update NetworkConfig and verify handshake against backend
    final networkConfig = NetworkConfig();
    networkConfig.setCustomSignalRUrl(v);

    final service = SignalRService(
      networkConfig: networkConfig,
      secureStorage: SecureStorageService(),
      logger: LoggerService(),
    );

    bool ok = false;
    try {
      await service.connect();
      ok = await service.verifyHandshake();
    } catch (e) {
      ok = false;
    }

    setState(() => _saving = false);

    if (!ok) {
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Verification failed'),
          content: const Text(
              'Unable to verify the SignalR hub. Please check the URL and ensure the backend is reachable and configured with /chathub.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('OK')),
          ],
        ),
      );
      return;
    }

    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SignalR settings')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            const SizedBox(height: 8),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                labelText: 'SignalR hub URL',
                hintText: 'ws://10.x.x.x:5000//hubs/chat',
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const CircularProgressIndicator()
                    : const Text('Save'))
          ],
        ),
      ),
    );
  }
}
