import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:salon_2/utils/share_path_util.dart';

void main() {
  group('normalizeSharePath', () {
    test('strips file:// prefix', () {
      expect(
        normalizeSharePath('file:///private/var/mobile/Share-abc.png'),
        '/private/var/mobile/Share-abc.png',
      );
    });

    test('decodes percent-encoded paths from iOS share extension', () {
      expect(
        normalizeSharePath(
          '/private/var/mobile/Containers/Shared/AppGroup/Share%2Dabc.png',
        ),
        '/private/var/mobile/Containers/Shared/AppGroup/Share-abc.png',
      );
    });

    test('keeps plain absolute paths unchanged', () {
      const path =
          '/private/var/mobile/Containers/Shared/AppGroup/Share-uuid.png';
      expect(normalizeSharePath(path), path);
    });
  });

  group('waitForShareFile', () {
    test('returns path when file exists immediately', () async {
      final dir = await Directory.systemTemp.createTemp('share_test_');
      final file = File('${dir.path}/screenshot.png');
      await file.writeAsBytes([0x89, 0x50, 0x4E, 0x47]);

      final result = await waitForShareFile(
        file.path,
        attempts: 3,
        interval: const Duration(milliseconds: 50),
      );

      expect(result, file.path);
      await dir.delete(recursive: true);
    });

    test('waits until file appears', () async {
      final dir = await Directory.systemTemp.createTemp('share_test_');
      final file = File('${dir.path}/delayed.png');

      final future = waitForShareFile(
        file.path,
        attempts: 10,
        interval: const Duration(milliseconds: 100),
      );

      await Future.delayed(const Duration(milliseconds: 250));
      await file.writeAsBytes([0xFF, 0xD8, 0xFF]);

      expect(await future, file.path);
      await dir.delete(recursive: true);
    });

    test('returns null when file never appears', () async {
      final result = await waitForShareFile(
        '/tmp/nonexistent-share-${DateTime.now().microsecondsSinceEpoch}.png',
        attempts: 2,
        interval: const Duration(milliseconds: 10),
      );
      expect(result, isNull);
    });
  });
}
