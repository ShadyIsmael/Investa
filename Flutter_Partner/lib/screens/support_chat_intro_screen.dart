import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/color_extensions.dart';
import '../widgets/app_background.dart';
import '../controllers/chat_controller.dart';
import '../services/app_state.dart';
import '../widgets/vertical_options_message.dart';
import '../l10n/app_localizations.dart';

class SupportChatIntroScreen extends StatefulWidget {
  const SupportChatIntroScreen({Key? key}) : super(key: key);

  @override
  State<SupportChatIntroScreen> createState() => _SupportChatIntroScreenState();
}

class _SupportChatIntroScreenState extends State<SupportChatIntroScreen> {
  // Conversational flow state
  bool _isChipSelected = false;
  bool _showChips = false; // Initially false, shown by script

  // UI Controllers
  final ScrollController _scrollController = ScrollController();
  late ChatController _chatController;

  @override
  void initState() {
    super.initState();
    _chatController = Provider.of<ChatController>(context, listen: false);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startScript();
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    }
  }

  Future<void> _startScript() async {
    final loc = AppLocalizations.of(context);

    // Step 1: Greeting
    if (_chatController.messages.isEmpty) {
      _chatController.addSystemMessage(
        loc.t('assistant_greeting'),
        senderName: loc.t('investa_assistant'),
      );
      setState(() {});
      // Scroll to bottom after frame
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

      // Step 2: Delay and Chips
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;

      _chatController.addSystemMessage(
        loc.t('assistant_greeting'),
        senderName: loc.t('investa_assistant'),
      );

      setState(() {
        _showChips = true;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } else {
      // If messages exist (came back from back stack?), just ensure chips are shown if not selected
      if (!_isChipSelected) {
        setState(() {
          _showChips = true;
        });
      }
    }
  }

  final TextEditingController _inputController = TextEditingController();

  Future<String?> _getPhone() async {
    final phone =
        AppState.instance.profile?.phone1 ?? AppState.instance.profile?.phone2;
    return phone;
  }

  void _sendInputMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;
    final controller = Provider.of<ChatController>(context, listen: false);
    try {
      await controller.sendMessage(text);
      _inputController.clear();
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    } catch (e) {
      // ignore
    }
  }

  void _handleChipClick(String category) async {
    final loc = AppLocalizations.of(context);

    // Step 3 (The Selection)

    // Remove chips
    setState(() {
      _showChips = false;
    });

    // Get localized category label
    final categoryKey = 'category_${category.toLowerCase()}';
    final categoryLabel = loc.t(categoryKey);

    // Show User message
    _chatController.addLocalUserMessage(
        '${loc.t('user_echo_want_to_submit')} $categoryLabel');
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    setState(() {
      _isChipSelected = true;
    });

    // Immediate Assistant Reply
    _chatController.addSystemMessage(
      loc.t('assistant_connecting'),
      senderName: loc.t('investa_assistant'),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    // Trigger backend connection
    try {
      final phone = await _getPhone() ?? '';
      await _chatController.startNewConversation(metadata: {
        'initialMessage': 'User selected $category',
        'phone': phone,
        'type': category,
      });
    } catch (e) {
      if (mounted) {
        _chatController.addSystemMessage(
          loc.t('assistant_error'),
          senderName: loc.t('investa_assistant'),
        );
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, _) async {
        if (didPop) return;
        // Show exit confirmation dialog
        final shouldExit = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(loc.t('confirm_exit_title')),
            content: Text(loc.t('confirm_exit_message')),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text(loc.t('no')),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text(loc.t('yes')),
              ),
            ],
          ),
        );
        if ((shouldExit ?? false) && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          title:
              Text(_isChipSelected ? loc.t('live_support') : loc.t('support')),
          centerTitle: true,
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        body: AppBackground(
          child: SafeArea(
            bottom: false,
            child: Column(
              children: [
                Expanded(
                  child: Consumer<ChatController>(
                    builder: (context, controller, child) {
                      return ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.symmetric(
                            vertical: 20, horizontal: 16),
                        itemCount:
                            controller.messages.length + (_showChips ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == controller.messages.length) {
                            if (_showChips) {
                              return Padding(
                                padding: const EdgeInsets.only(
                                    top: 8.0, left: 8.0, bottom: 20.0),
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: VerticalOptionsMessage(
                                    options: const [
                                      'Complaint',
                                      'Inquiry',
                                      'Feedback',
                                      'Other'
                                    ],
                                    onOptionSelected: (opt) async {
                                      _handleChipClick(opt);
                                      setState(() {
                                        _isChipSelected = true;
                                      });
                                    },
                                  ),
                                ),
                              );
                            } else {
                              return const SizedBox.shrink();
                            }
                          }

                          if (index >= controller.messages.length) {
                            return const SizedBox.shrink();
                          }

                          final message = controller.messages[index];
                          final isMe = message.isMe;

                          const userBgColor = AppPalette.flame;
                          const userTextColor = Colors.white;

                          final assistantBgColor = isDark
                              ? Colors.white.withOpacityCompat(0.1)
                              : const Color(0xFFE0E0E0);
                          final assistantTextColor =
                              isDark ? Colors.white : Colors.black;

                          final borderRadius = isMe
                              ? const BorderRadius.only(
                                  topLeft: Radius.circular(16),
                                  topRight: Radius.circular(16),
                                  bottomLeft: Radius.circular(16),
                                  bottomRight: Radius.zero,
                                )
                              : const BorderRadius.only(
                                  topLeft: Radius.circular(16),
                                  topRight: Radius.circular(16),
                                  bottomLeft: Radius.zero,
                                  bottomRight: Radius.circular(16),
                                );

                          return Align(
                            alignment: isMe
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              constraints: BoxConstraints(
                                maxWidth:
                                    MediaQuery.of(context).size.width * 0.75,
                              ),
                              decoration: (isDark && !isMe)
                                  ? AppDecorations.premiumGlass(
                                      customBorderRadius: borderRadius)
                                  : BoxDecoration(
                                      color:
                                          isMe ? userBgColor : assistantBgColor,
                                      borderRadius: borderRadius,
                                    ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    message.text,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: isMe
                                          ? userTextColor
                                          : assistantTextColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
                // Input bar appears only after an option is selected
                if (_isChipSelected)
                  SafeArea(
                    top: false,
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? Colors.white.withOpacityCompat(0.1)
                                    : theme.colorScheme.surface,
                                borderRadius: BorderRadius.circular(24),
                                border: isDark
                                    ? Border.all(
                                        color:
                                            Colors.white.withOpacityCompat(0.1))
                                    : null,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _inputController,
                                      minLines: 1,
                                      maxLines: 5,
                                      decoration: const InputDecoration(
                                          border: InputBorder.none,
                                          hintText: 'Type a message...'),
                                      onSubmitted: (_) => _sendInputMessage(),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          FloatingActionButton(
                              heroTag: 'intro_send_fab',
                              mini: true,
                              backgroundColor: AppPalette.flame,
                              foregroundColor: Colors.white,
                              onPressed: _sendInputMessage,
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

  @override
  void dispose() {
    _scrollController.dispose();
    _inputController.dispose();
    super.dispose();
  }
}
