import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart' as logger_pkg;

/// Centralized logging service for the Investa app.
///
/// Features:
/// - Tagged logging with prefixes like [SignalR], [API], [Firebase]
/// - Different log levels (debug, info, warning, error)
/// - Pretty printing in debug mode
/// - File logging in release mode (optional)
class LoggerService {
  late final logger_pkg.Logger _logger;

  LoggerService() {
    _logger = logger_pkg.Logger(
      printer: logger_pkg.PrettyPrinter(
        methodCount: 2,
        errorMethodCount: 8,
        lineLength: 120,
        colors: true,
        printEmojis: true,
        printTime: true,
      ),
      level: kDebugMode ? logger_pkg.Level.debug : logger_pkg.Level.info,
    );
  }

  /// Log debug message
  void debug(String tag, dynamic message) {
    if (kDebugMode) {
      _logger.d('$tag $message');
    }
  }

  /// Log info message
  void info(String tag, dynamic message) {
    _logger.i('$tag $message');
  }

  /// Log warning message
  void warning(String tag, dynamic message) {
    _logger.w('$tag $message');
  }

  /// Log error message with optional stack trace
  void error(String tag, dynamic message, [StackTrace? stackTrace]) {
    _logger.e('$tag $message', error: message, stackTrace: stackTrace);
  }

  /// Log critical error that should never happen
  void fatal(String tag, dynamic message, [StackTrace? stackTrace]) {
    _logger.f('$tag $message', error: message, stackTrace: stackTrace);
  }

  /// Close the logger (cleanup)
  void close() {
    _logger.close();
  }
}
