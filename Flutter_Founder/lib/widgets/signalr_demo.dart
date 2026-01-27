import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../core/services/signalr_service.dart';
import '../core/services/logger_service.dart';
import '../core/services/secure_storage_service.dart';
import '../core/network/network_config.dart';
import '../services/auth_service.dart';
import '../models/chat_message_dto.dart';

class SignalrDemo extends StatefulWidget {
  const SignalrDemo({super.key});

  @override
  State<SignalrDemo> createState() => _SignalrDemoState();
}

class _SignalrDemoState extends State<SignalrDemo> {
  final _hubUrlController =
      TextEditingController(text: dotenv.env['SIGNALR_HUB_URL'] ?? '');
  final _convController = TextEditingController();
  final _messageController = TextEditingController();

  final _service = SignalRService(
      networkConfig: NetworkConfig(),
      secureStorage: SecureStorageService(),
      logger: LoggerService());

  @override
  void dispose() {
    _hubUrlController.dispose();
    _convController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _connect() async {
    try {
      await _service.connect();
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Connected to SignalR hub')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Failed to connect. Check hub configuration.')));
    }
  }

  Future<void> _disconnect() async {
    await _service.disconnect();
    setState(() {});
  }

  Future<void> _join() async {
    final id = _convController.text.trim();
    if (id.isNotEmpty) await _service.joinConversation(id);
  }

  Future<void> _send() async {
    final conv = _convController.text.trim();
    final msg = _messageController.text.trim();
    if (conv.isNotEmpty && msg.isNotEmpty) {
      await _service.sendMessage(conv, msg);
      _messageController.clear();
    }
  }

  Future<void> _loginSample() async {
    // Example login flow — replace with real credentials for testing
    final auth = AuthService();
    final res =
        await auth.login(phoneNumber: '+2000000000', password: 'yourPassword');
    if (res.success && res.token != null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Logged in')));
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(res.message ?? 'Login failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SignalR Demo')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            TextField(
                controller: _hubUrlController,
                decoration: const InputDecoration(labelText: 'Hub URL')),
            const SizedBox(height: 8),
            Row(children: [
              ElevatedButton(onPressed: _connect, child: const Text('Connect')),
              const SizedBox(width: 8),
              ElevatedButton(
                  onPressed: _disconnect, child: const Text('Disconnect')),
              const SizedBox(width: 8),
              ElevatedButton(
                  onPressed: _loginSample, child: const Text('Login sample')),
            ]),
            const Divider(),
            TextField(
                controller: _convController,
                decoration:
                    const InputDecoration(labelText: 'Conversation ID')),
            Row(children: [
              ElevatedButton(onPressed: _join, child: const Text('Join')),
            ]),
            const Divider(),
            Expanded(
              child: StreamBuilder<Map<String, dynamic>>(
                stream: _service.onNewMessage,
                builder: (context, snap) {
                  if (!snap.hasData) {
                    return const Center(child: Text('No messages'));
                  }
                  final dto = ChatMessageDto.fromJson(snap.data!);
                  return ListView(children: [
                    ListTile(
                        title: Text(dto.senderName),
                        subtitle: Text(dto.content))
                  ]);
                },
              ),
            ),
            Row(children: [
              Expanded(
                  child: TextField(
                      controller: _messageController,
                      decoration: const InputDecoration(labelText: 'Message'))),
              ElevatedButton(onPressed: _send, child: const Text('Send')),
            ])
          ],
        ),
      ),
    );
  }
}
