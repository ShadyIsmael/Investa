import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

class AppLogger {
  AppLogger._();

  static const _consoleTag = 'APPLOG';
  static File? _logFile;

  /// Initialize the logger - must be called before using file logging
  static Future<void> init() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      _logFile = File('${dir.path}/app_logs.txt');
      if (!await _logFile!.exists()) {
        await _logFile!.create(recursive: true);
      }
      // Optional: truncate if huge
      final length = await _logFile!.length();
      if (length > 1024 * 1024) {
        final content = await _logFile!.readAsString();
        final keep = content.substring(content.length - 512 * 1024);
        await _logFile!.writeAsString(keep);
      }
    } catch (e) {
      if (kDebugMode) debugPrint('AppLogger init failed: $e');
    }
  }

  static Future<void> _appendLine(String line) async {
    final ts = DateTime.now().toIso8601String();
    final tagged = '[$_consoleTag] [$ts] $line';

    try {
      stdout.writeln(tagged);
    } catch (_) {
      if (kDebugMode) {
        debugPrint(tagged);
      } else {
        print(tagged);
      }
    }

    if (_logFile == null) return;
    try {
      await _logFile!
          .writeAsString('$tagged\n', mode: FileMode.append, flush: true);
    } catch (e) {
      if (kDebugMode) debugPrint('Failed writing log: $e');
    }
  }

  static void logInfo(String tag, String message) {
    _appendLine('INFO: $tag: $message');
  }

  static void logError(String tag, String message, [StackTrace? stack]) {
    _appendLine('ERROR: $tag: $message');
    if (stack != null) _appendLine(stack.toString());
  }

  /// Read the tail of the log file useful for quick debugging
  static Future<String> readLog({int maxChars = 20000}) async {
    try {
      if (_logFile == null) return '';
      final content = await _logFile!.readAsString();
      if (content.length <= maxChars) return content;
      return content.substring(content.length - maxChars);
    } catch (e) {
      if (kDebugMode) debugPrint('Failed to read log: $e');
      return '';
    }
  }
}
