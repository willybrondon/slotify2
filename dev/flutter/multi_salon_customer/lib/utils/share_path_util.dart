import 'dart:io';

/// Normalizes file paths received from iOS Share Extension / receive_sharing_intent.
String normalizeSharePath(String path) {
  var trimmed = path.trim();
  if (trimmed.isEmpty) return trimmed;
  if (trimmed.startsWith('file://')) {
    trimmed = Uri.parse(trimmed).toFilePath(windows: false);
  }
  if (trimmed.contains('%')) {
    trimmed = Uri.decodeFull(trimmed);
  }
  return trimmed;
}

/// Waits for a shared file to appear (App Group copy can lag slightly after app open).
Future<String?> waitForShareFile(
  String path, {
  int attempts = 12,
  Duration interval = const Duration(milliseconds: 250),
}) async {
  final normalized = normalizeSharePath(path);
  if (normalized.isEmpty) return null;

  for (var i = 0; i < attempts; i++) {
    if (await File(normalized).exists()) {
      return normalized;
    }
    if (i < attempts - 1) {
      await Future.delayed(interval);
    }
  }
  return null;
}
