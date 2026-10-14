import 'package:intl/intl.dart';

class FopxFormatters {
  const FopxFormatters._();

  static String date(DateTime value, {String locale = 'en'}) {
    return DateFormat.yMMMd(locale).format(value.toLocal());
  }

  static String time(DateTime value, {String locale = 'en'}) {
    return DateFormat.jm(locale).format(value.toLocal());
  }

  static String number(num value, {String locale = 'en'}) {
    return NumberFormat.decimalPattern(locale).format(value);
  }

  static String currency(num value, String currencyCode, {String locale = 'en'}) {
    return formatCurrency(value, currencyCode: currencyCode, locale: locale);
  }

  /// Formats a financial amount only when an explicit currency is supplied.
  ///
  /// A null amount remains an unavailable value; it is never converted to
  /// zero and no default currency is inferred.
  static String formatCurrency(
    num? value, {
    required String currencyCode,
    String locale = 'en',
    bool approximate = false,
    String unavailableLabel = 'Unavailable',
  }) {
    if (value == null) return unavailableLabel;
    final formatter = NumberFormat.currency(name: currencyCode, symbol: currencyCode, locale: locale);
    final formatted = formatter.format(value);
    return approximate ? '~$formatted' : formatted;
  }
}
