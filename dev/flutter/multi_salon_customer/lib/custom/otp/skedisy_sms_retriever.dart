import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:pinput/pinput.dart';
import 'package:smart_auth/smart_auth.dart';

/// Android SMS User Consent API — used by [SkedisyOtpInput] via Pinput.
class SkedisySmsRetriever implements SmsRetriever {
  SkedisySmsRetriever({SmartAuth? smartAuth})
      : _smartAuth = smartAuth ?? SmartAuth.instance;

  final SmartAuth _smartAuth;

  @override
  bool get listenForMultipleSms => true;

  @override
  Future<void> dispose() async {
    if (!Platform.isAndroid) {
      return;
    }
    await _smartAuth.removeUserConsentApiListener();
  }

  @override
  Future<String?> getSmsCode() async {
    if (kIsWeb || !Platform.isAndroid) {
      return null;
    }
    try {
      final res = await _smartAuth.getSmsWithUserConsentApi();
      if (res.hasData) {
        return res.data?.code;
      }
      return null;
    } catch (e) {
      debugPrint('[SkedisySmsRetriever] $e');
      return null;
    }
  }
}
