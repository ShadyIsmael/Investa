import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/chat_controller.dart';
import '../services/local_notifier.dart';
import 'chat_box_screen.dart';
import '../models/chat_user.dart';

class ChatWaitingScreen extends StatefulWidget {
  final Map<String, dynamic>? metadata;
  final LocalNotifier? notifier;

  const ChatWaitingScreen({Key? key, this.metadata, this.notifier})
      : super(key: key);

  @override
  _ChatWaitingScreenState createState() => _ChatWaitingScreenState();
}

class _ChatWaitingScreenState extends State<ChatWaitingScreen> {
  late ChatController _controller;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _controller = Provider.of<ChatController>(context, listen: false);
      _controller.init();
      _controller.addListener(_onStateChanged);
      _start();
    });
  }

  void _onStateChanged() {
    if (_controller.state == ChatState.active && mounted) {
      // navigate to chat box
      final user = ChatUser(
        id: _controller.conversationId ?? '',
        name: _controller.adminName ?? 'Support',
        avatarUrl: '',
        lastMessage: '',
        lastSeen: DateTime.now(),
        online: true,
      );
      Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => ChatBoxScreen(user: user)));
    }
  }

  Future<void> _start() async {
    if (_started) return;
    _started = true;

    // Capture context and navigator before the async gap to avoid using
    // BuildContext across awaits.
    final localContext = context;
    final localNavigator = Navigator.of(context);

    try {
      await _controller.startNewConversation(metadata: widget.metadata);
    } catch (e) {
      if (!mounted) return;
      await showDialog<void>(
        context: localContext,
        builder: (ctx) => AlertDialog(
          title: const Text('Could not start chat'),
          content: Text('Failed to start a chat session: $e'),
          actions: [
            TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('OK'))
          ],
        ),
      );
      localNavigator.pop();
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onStateChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: const Text(
              'Thanks for reaching out! We’re experiencing high demand. An agent will join the chat as soon as possible..')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            const Text('Searching for an available agent...'),
            const SizedBox(height: 12),
            TextButton.icon(
                onPressed: () async {
                  await _controller.cancel();
                  if (!mounted) return;
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.cancel),
                label: const Text('Cancel'))
          ],
        ),
      ),
    );
  }
}
