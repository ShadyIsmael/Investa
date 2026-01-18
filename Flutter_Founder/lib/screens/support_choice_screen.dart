import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import 'package:provider/provider.dart';
import '../controllers/chat_controller.dart';
import 'support_chat_intro_screen.dart';
import 'support_request_screen.dart';

class SupportChoiceScreen extends StatelessWidget {
  const SupportChoiceScreen({Key? key}) : super(key: key);

  Future<void> _openChat(BuildContext context) async {
    // Reset session before starting new chat flow
    try {
      await Provider.of<ChatController>(context, listen: false).resetSession();
    } catch (e) {
      // ignore
    }

    if (context.mounted) {
      Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const SupportChatIntroScreen()));
    }
  }

  void _openRequest(BuildContext context) {
    Navigator.push(context,
        MaterialPageRoute(builder: (_) => const SupportRequestScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Customer Support'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: AppBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20.0),
            children: [
              // Intro Card in Glass style
              Container(
                decoration: isDark
                    ? AppDecorations.premiumGlass(radius: 20)
                    : BoxDecoration(
                        color: theme.cardColor,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacityCompat(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppPalette.flame.withOpacityCompat(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.support_agent_rounded,
                        color: AppPalette.flame,
                        size: 32,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'How can we help you?',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Choose chat or send a request',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurface
                                  .withOpacityCompat(0.7),
                            ),
                          ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Option: Chat
              _SupportOptionTile(
                icon: Icons.chat_bubble_outline_rounded,
                iconColor: AppPalette.aqua,
                title: 'Chat with us',
                subtitle: 'Start a live chat with our support team',
                onTap: () => _openChat(context),
              ),
              const SizedBox(height: 16),

              // Option: Ticket
              _SupportOptionTile(
                icon: Icons.assignment_outlined,
                iconColor: AppPalette.purpleAccent,
                title: 'Send request / problem',
                subtitle: 'Submit a ticket or report an issue',
                onTap: () => _openRequest(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SupportOptionTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SupportOptionTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: isDark
          ? AppDecorations.premiumGlass(radius: 16)
          : BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(16),
              border:
                  Border.all(color: theme.dividerColor.withOpacityCompat(0.5)),
            ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: iconColor.withOpacityCompat(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: iconColor, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withOpacityCompat(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 16,
                  color: theme.colorScheme.onSurface.withOpacityCompat(0.4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
