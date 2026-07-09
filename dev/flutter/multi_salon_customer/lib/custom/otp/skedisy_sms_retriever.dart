import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:pinput/pinput.dart';
import 'package:smart_auth/smart_auth.dart';

/// Android SMS User Consent API — used by [SkedisyOtpInput] via Pinput.
class SkedisySmsRetriever implements SmsRetriever {
  SkedisySmsRetriever({SmartAuth? smartAuth}) : _smartAuth = smartAuth ?? SmartAuth();

  final SmartAuth _smartAuth;

  @override
  bool get listenForMultipleSms => true;

  @override
  Future<void> dispose() {
    if (!Platform.isAndroid) {
      return Future.value();
    }
    return _smartAuth.removeSmsListener();
  }

  @override
  Future<String?> getSmsCode() async {
    if (kIsWeb || !Platform.isAndroid) {
      return null;
    }
    try {
      final res = await _smartAuth.getSmsCode(useUserConsentApi: true);
      if (res.codeFound && res.code != null) {
        return res.code;
      }
      return null;
    } catch (e) {
      debugPrint('[SkedisySmsRetriever] $e');
      return null;
    }
  }
}
