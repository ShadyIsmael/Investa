import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';
import '../models/chat_user.dart';
import '../core/services/signalr_service.dart';
import '../core/services/logger_service.dart';
import '../core/services/secure_storage_service.dart';
import '../core/network/network_config.dart';
import 'package:provider/provider.dart';
import '../controllers/chat_controller.dart';

class ChatBoxScreen extends StatefulWidget {
  final ChatUser user;
  final bool autoJoin;

  const ChatBoxScreen({Key? key, required this.user, this.autoJoin = true})
      : super(key: key);

  @override
  _ChatBoxScreenState createState() => _ChatBoxScreenState();
}

class _ChatBoxScreenState extends State<ChatBoxScreen> {
  // Current user id (kept for telemetry/analytics) -- intentionally unused for now
  // ignore: unused_field
  final String? _meId = FirebaseAuth.instance.currentUser?.uid;
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final _service = SignalRService(
      networkConfig: NetworkConfig(),
      secureStorage: SecureStorageService(),
      logger: LoggerService());

  @override
  void initState() {
    super.initState();
    // Ensure we are connected and joined (in case navigation didn't join beforehand)
    () async {
      if (!_service.isConnected) {
        await _service.connect();
      }
      if (widget.autoJoin) {
        await _service.joinConversation(widget.user.id.toString());
      }
    }();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    // leave conversation on dispose
    _service.leaveConversation(widget.user.id);
    super.dispose();
  }

  void _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    final controller = Provider.of<ChatController>(context, listen: false);
    try {
      await controller.sendMessage(text);
      _controller.clear();
      _scrollToBottom();
    } catch (e) {
      // optionally show error
    }
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  String _formatTime(DateTime t) {
    final h = t.hour.toString().padLeft(2, '0');
    final m = t.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  String _relativeTime(DateTime t) {
    final now = DateTime.now();
    final diff = now.difference(t);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    // WillPopScope is deprecated but PopScope's API differs between Flutter versions.
    // Keep using WillPopScope until PopScope API is stable across supported SDKs.
    // ignore: deprecated_member_use
    return WillPopScope(
      onWillPop: () async {
        final controller = Provider.of<ChatController>(context, listen: false);
        // Ask for confirmation
        final shouldClose = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('End conversation?'),
            content: const Text(
                'Are you sure you want to leave and end this conversation?'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: const Text('Cancel')),
              TextButton(
                  onPressed: () => Navigator.of(ctx).pop(true),
                  child: const Text('End')),
            ],
          ),
        );

        if (shouldClose == true) {
          // Close on server and cleanup local state
          await controller.closeConversation();
          return true; // allow pop
        }
        return false; // prevent pop
      },
      child: Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Row(
            children: [
              CircleAvatar(
                  child: Text(
                      widget.user.name.isNotEmpty ? widget.user.name[0] : '?')),
              const SizedBox(width: 12),
              Expanded(
                child: Consumer<ChatController>(
                  builder: (context, controller, _) {
                    final isWaiting = controller.state == ChatState.waiting;
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(widget.user.name,
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            if (isWaiting) ...[
                              SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(
                                        theme.colorScheme.onPrimary),
                                  )),
                              const SizedBox(width: 8),
                              Text('Waiting for Agent...',
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: theme.colorScheme.onSurface
                                          .withOpacityCompat(0.7))),
                            ] else ...[
                              Text(
                                widget.user.online
                                    ? 'Online'
                                    : 'Last seen ${_relativeTime(widget.user.lastSeen)}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: theme.colorScheme.onSurface
                                      .withOpacityCompat(0.7),
                                ),
                              ),
                            ]
                          ],
                        )
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
          actions: [
            IconButton(onPressed: () {}, icon: const Icon(Icons.call)),
            IconButton(onPressed: () {}, icon: const Icon(Icons.videocam)),
          ],
        ),
        body: AppBackground(
          child: SafeArea(
            bottom: false,
            child: Column(
              children: [
                Expanded(
                  child: Consumer<ChatController>(
                      builder: (context, controller, _) {
                    final messages = controller.messages;
                    if (messages.isEmpty) {
                      return const Center(child: Text('No messages yet'));
                    }
                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 16),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final msg = messages[index];
                        final isMe = msg.isMe;
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(
                            mainAxisAlignment: isMe
                                ? MainAxisAlignment.end
                                : MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              if (!isMe) ...[
                                CircleAvatar(
                                    radius: 16,
                                    child: Text(widget.user.name.isNotEmpty
                                        ? widget.user.name[0]
                                        : '?')),
                                const SizedBox(width: 8),
                              ],
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: isMe
                                      ? CrossAxisAlignment.end
                                      : CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: isMe
                                            ? AppPalette.flame
                                            : (isDarkMode
                                                ? Colors.white
                                                    .withOpacityCompat(0.1)
                                                : theme.colorScheme
                                                    .secondaryContainer),
                                        borderRadius: BorderRadius.only(
                                          topLeft: const Radius.circular(14),
                                          topRight: const Radius.circular(14),
                                          bottomLeft:
                                              Radius.circular(isMe ? 14 : 2),
                                          bottomRight:
                                              Radius.circular(isMe ? 2 : 14),
                                        ),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: isMe
                                            ? CrossAxisAlignment.end
                                            : CrossAxisAlignment.start,
                                        children: [
                                          Text(msg.text,
                                              style: TextStyle(
                                                  color: isMe
                                                      ? Colors.white
                                                      : theme.colorScheme
                                                          .onSurface)),
                                          const SizedBox(height: 6),
                                          Text(_formatTime(msg.time),
                                              style: TextStyle(
                                                  fontSize: 10,
                                                  color: (isMe
                                                          ? Colors.white
                                                          : theme.colorScheme
                                                              .onSurface)
                                                      .withOpacityCompat(0.7))),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  }),
                ),
                SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: isDarkMode
                                  ? Colors.white.withOpacityCompat(0.1)
                                  : theme.colorScheme.secondaryContainer
                                      .withOpacityCompat(0.5),
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _controller,
                                    minLines: 1,
                                    maxLines: 5,
                                    decoration: const InputDecoration(
                                        border: InputBorder.none,
                                        hintText: 'Type a message'),
                                    onSubmitted: (_) => _sendMessage(),
                                  ),
                                ),
                                IconButton(
                                    icon: const Icon(Icons.attach_file),
                                    onPressed: () {}),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Consumer<ChatController>(
                            builder: (context, controller, _) {
                          if (!controller.hasPending) {
                            return const SizedBox.shrink();
                          }
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (controller.isFlushingPending)
                                  SizedBox(
                                      width: 36,
                                      height: 36,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation(
                                              theme.colorScheme.primary)))
                                else
                                  Chip(
                                      label: Text(
                                          'Queued ${controller.pendingCount}'),
                                      backgroundColor:
                                          theme.colorScheme.secondaryContainer),
                              ],
                            ),
                          );
                        }),
                        FloatingActionButton(
                            heroTag: 'chat_send_fab',
                            mini: true,
                            backgroundColor: AppPalette.flame,
                            foregroundColor: Colors.white,
                            onPressed: _sendMessage,
                            child: const Icon(Icons.send)),
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
