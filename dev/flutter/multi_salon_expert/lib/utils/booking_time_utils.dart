import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/ui/booking_screen/model/status_wise_booking_model.dart';

String expertBookingTimeLabel(Data booking) {
  var duration = booking.duration;
  if ((duration ?? 0) <= 0) {
    final services = booking.service ?? [];
    final sum = services.fold<int>(0, (total, s) => total + (s.duration ?? 0));
    if (sum > 0) duration = sum;
  }
  return formatBookingTimeRange(
    timeSlots: booking.time,
    startTime: booking.startTime,
    durationMinutes: duration,
  );
}

/// Formats a booking slot as "10:00 AM – 12:00 PM" (locale-aware).
String formatBookingTimeRange({
  List<String>? timeSlots,
  String? startTime,
  int? durationMinutes,
  int defaultSlotMinutes = 15,
}) {
  final startLabel = (startTime?.trim().isNotEmpty == true)
      ? startTime!.trim()
      : (timeSlots != null && timeSlots.isNotEmpty ? timeSlots.first : '');

  if (startLabel.isEmpty) return '';

  final start = _parseClock(startLabel);
  if (start == null) return startLabel;

  var minutes = durationMinutes ?? 0;
  if (minutes <= 0 && timeSlots != null && timeSlots.isNotEmpty) {
    minutes = timeSlots.length * defaultSlotMinutes;
  }
  if (minutes <= 0) {
    minutes = defaultSlotMinutes;
  }

  final end = DateTime(2000, 1, 1, start.hour, start.minute)
      .add(Duration(minutes: minutes));

  final locale = Get.locale?.toString() ?? 'fr_FR';
  final formatter = DateFormat.jm(locale);

  final startFmt = formatter.format(
    DateTime(2000, 1, 1, start.hour, start.minute),
  );
  final endFmt = formatter.format(end);

  if (startFmt == endFmt) return startFmt;
  return '$startFmt – $endFmt';
}

/// Parses API ISO datetime or "hh:mm A" clock strings.
String formatScheduleEventTime(dynamic value) {
  if (value == null) return '';
  final raw = value.toString().trim();
  if (raw.isEmpty) return '';

  try {
    final parsed = DateTime.parse(raw);
    final local = raw.endsWith('Z')
        ? DateTime(
            parsed.toUtc().year,
            parsed.toUtc().month,
            parsed.toUtc().day,
            parsed.toUtc().hour,
            parsed.toUtc().minute,
          )
        : parsed.toLocal();
    final locale = Get.locale?.toString() ?? 'fr_FR';
    return DateFormat.jm(locale).format(local);
  } catch (_) {
    final clock = _parseClock(raw);
    if (clock == null) return raw;
    final locale = Get.locale?.toString() ?? 'fr_FR';
    return DateFormat.jm(locale).format(
      DateTime(2000, 1, 1, clock.hour, clock.minute),
    );
  }
}

DateTime? _parseClock(String raw) {
  final trimmed = raw.trim();
  const patterns = ['hh:mm a', 'h:mm a', 'HH:mm', 'H:mm'];
  for (final pattern in patterns) {
    try {
      final parsed = DateFormat(pattern).parse(trimmed);
      return DateTime(2000, 1, 1, parsed.hour, parsed.minute);
    } catch (_) {}
  }
  return null;
}
