import 'package:salon_2/main.dart';

class FcmTokenUtil {
  FcmTokenUtil._();

  static const Set<String> _invalidTokens = {
    '',
    'web',
    'no_permission',
    'error',
    'null',
    'undefined',
    'none',
  };

  static String sanitize(String? token) {
    final value = token?.trim() ?? '';
    if (_invalidTokens.contains(value.toLowerCase())) return '';
    if (value.length < 20) return '';
    return value;
  }

  static String get current => sanitize(fcmToken);
}
