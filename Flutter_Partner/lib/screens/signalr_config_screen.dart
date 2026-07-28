import 'package:flutter/material.dart';

class SignalRConfigScreen extends StatefulWidget {
  const SignalRConfigScreen({Key? key}) : super(key: key);

  @override
  _SignalRConfigScreenState createState() => _SignalRConfigScreenState();
}

class _SignalRConfigScreenState extends State<SignalRConfigScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SignalR settings')),
      body: const Center(
        child: Text('SignalR has been removed. Notifications now use HTTP APIs and push notifications.'),
      ),
    );
  }
}
