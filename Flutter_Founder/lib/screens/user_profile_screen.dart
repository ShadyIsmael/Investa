import 'package:flutter/material.dart';
import '../models/chat_user.dart';

class UserProfileScreen extends StatelessWidget {
  final ChatUser user;
  const UserProfileScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(user.name)),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 48,
              backgroundColor: theme.colorScheme.primary,
              child: Text(user.name.isNotEmpty ? user.name[0] : '?',
                  style: theme.textTheme.headlineMedium
                      ?.copyWith(color: Colors.white)),
            ),
            const SizedBox(height: 16),
            Text(user.name,
                style: theme.textTheme.headlineSmall
                    ?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('Last seen: ${user.lastSeen.toLocal()}',
                style: theme.textTheme.bodySmall),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.message),
              label: const Text('Send Message'),
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => throw UnimplementedError())),
            )
          ],
        ),
      ),
    );
  }
}
