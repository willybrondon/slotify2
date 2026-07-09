/// Extracts OTP digits from SMS body, email text, or clipboard content.
class OtpCodeDetector {
  const OtpCodeDetector._();

  static String? extract(String? source, {required int length}) {
    if (source == null || source.trim().isEmpty) return null;

    final normalized = source.replaceAll(RegExp(r'[\u200B-\u200D\uFEFF]'), '');

    final exact = RegExp('\\b(\\d{$length})\\b');
    final exactMatch = exact.firstMatch(normalized);
    if (exactMatch != null) {
      return exactMatch.group(1);
    }

    // Apple Mail / iOS autofill format: @domain.com #123456
    final domainHash = RegExp(r'#\s*(\d{' + length.toString() + r'})');
    final domainMatch = domainHash.firstMatch(normalized);
    if (domainMatch != null) {
      return domainMatch.group(1);
    }

    // Fallback: longest digit run matching expected length
    for (final match in RegExp(r'\d+').allMatches(normalized)) {
      final digits = match.group(0);
      if (digits != null && digits.length == length) {
        return digits;
      }
    }

    return null;
  }
}
