import 'dart:convert';
import 'dart:developer';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/fcm_token_util.dart';

class FcmSyncService {
  FcmSyncService._();

  static Future<String> refreshToken() async {
    try {
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus != AuthorizationStatus.authorized &&
          settings.authorizationStatus != AuthorizationStatus.provisional) {
        log('[FCM] permission denied');
        return '';
      }

      final token = await FirebaseMessaging.instance.getToken();
      final safe = FcmTokenUtil.sanitize(token);
      fcmToken = safe;
      log('[FCM] refreshed token length=${safe.length}');
      return safe;
    } catch (e) {
      log('[FCM] refresh failed: $e');
      return '';
    }
  }

  static Future<void> syncExpertTokenIfLoggedIn() async {
    final isLoggedIn = Constant.storage.read<bool>('isLogIn') == true;
    final expertId = Constant.storage.read<String>('expertId')?.toString();
    if (!isLoggedIn || expertId == null || expertId.isEmpty) return;

    final token = FcmTokenUtil.current.isNotEmpty ? FcmTokenUtil.current : await refreshToken();
    if (token.isEmpty) return;

    try {
      final url = Uri.parse('${ApiConstant.BASE_URL}user/expert/fcmToken');
      final response = await http.patch(
        url,
        headers: {
          'key': ApiConstant.SECRET_KEY,
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'expertId': expertId,
          'fcmToken': token,
        }),
      );
      log('[FCM] expert sync status=${response.statusCode} body=${response.body}');
    } catch (e) {
      log('[FCM] expert sync error: $e');
    }
  }

  static void listenTokenRefresh() {
    FirebaseMessaging.instance.onTokenRefresh.listen((token) async {
      fcmToken = FcmTokenUtil.sanitize(token);
      await syncExpertTokenIfLoggedIn();
    });
  }
}
