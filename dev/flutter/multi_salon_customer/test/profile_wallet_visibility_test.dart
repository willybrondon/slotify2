import 'package:flutter_test/flutter_test.dart';

/// Mirrors profile wallet visibility when [SplashController] may be disposed
/// after login navigation (Get.offAllNamed).
bool profileWalletMenuVisible({
  required bool splashControllerRegistered,
  required bool? splashIsWalletPay,
  required bool globalIsWalletPay,
}) {
  if (splashControllerRegistered) {
    return splashIsWalletPay == true;
  }
  return globalIsWalletPay == true;
}

void main() {
  group('Profile wallet menu visibility', () {
    test('hidden when no SplashController and wallet disabled globally', () {
      expect(
        profileWalletMenuVisible(
          splashControllerRegistered: false,
          splashIsWalletPay: null,
          globalIsWalletPay: false,
        ),
        isFalse,
      );
    });

    test('visible from global flag when SplashController is missing', () {
      expect(
        profileWalletMenuVisible(
          splashControllerRegistered: false,
          splashIsWalletPay: null,
          globalIsWalletPay: true,
        ),
        isTrue,
      );
    });

    test('uses SplashController setting when registered', () {
      expect(
        profileWalletMenuVisible(
          splashControllerRegistered: true,
          splashIsWalletPay: true,
          globalIsWalletPay: false,
        ),
        isTrue,
      );

      expect(
        profileWalletMenuVisible(
          splashControllerRegistered: true,
          splashIsWalletPay: false,
          globalIsWalletPay: true,
        ),
        isFalse,
      );
    });
  });
}
