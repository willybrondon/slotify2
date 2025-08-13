import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:get/get.dart';
import 'package:salon_2/ui/splash_screen/model/setting_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class SplashScreenController extends GetxController {
  //----------- API Variables -----------//
  SettingModel? settingCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    await onSettingApiCall();
    super.onInit();
  }

  //------------ API Services ------------//

  onSettingApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.setting);

      log("Setting Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Setting Headers :: $headers");

      // Create HTTP client with SSL certificate handling
      final client = http.Client();

      try {
        // Add timeout to prevent hanging
        final response = await client.get(url, headers: headers).timeout(
          const Duration(seconds: 15),
          onTimeout: () {
            log("Setting API timeout");
            throw Exception('Request timeout');
          },
        );

        log("Setting StatusCode :: ${response.statusCode}");
        log("Setting Body :: ${response.body}");

        if (response.statusCode == 200) {
          final jsonResponse = jsonDecode(response.body);
          settingCategory = SettingModel.fromJson(jsonResponse);
          log("Setting API success: ${settingCategory?.status}");
        } else {
          log("Setting API failed with status: ${response.statusCode}");
          settingCategory = null;
        }
      } finally {
        client.close();
      }
    } on SocketException catch (e) {
      log("SocketException in Setting API: $e");
      settingCategory = null;
    } on HandshakeException catch (e) {
      log("HandshakeException in Setting API: $e");
      // Try alternative approach for SSL issues
      await _tryAlternativeApiCall();
    } on AppException catch (exception) {
      log("AppException in Setting API: ${exception.message}");
      settingCategory = null;
    } catch (e) {
      log("Error call Setting Api :: $e");
      settingCategory = null;
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  // Alternative API call method for SSL issues
  Future<void> _tryAlternativeApiCall() async {
    try {
      log("Trying alternative API call approach...");

      // Create a more permissive HTTP client
      final client = HttpClient();
      client.badCertificateCallback =
          (X509Certificate cert, String host, int port) {
        log("Accepting certificate for $host:$port");
        return true; // Accept all certificates
      };

      final request = await client
          .getUrl(Uri.parse(ApiConstant.BASE_URL + ApiConstant.setting));
      request.headers.set('key', ApiConstant.SECRET_KEY);
      request.headers.set('Content-Type', 'application/json');

      final response = await request.close();
      final responseBody = await response.transform(utf8.decoder).join();

      log("Alternative API StatusCode :: ${response.statusCode}");
      log("Alternative API Body :: $responseBody");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(responseBody);
        settingCategory = SettingModel.fromJson(jsonResponse);
        log("Alternative Setting API success: ${settingCategory?.status}");
      } else {
        log("Alternative Setting API failed with status: ${response.statusCode}");
        settingCategory = null;
      }

      client.close();
    } catch (e) {
      log("Alternative API call also failed: $e");
      // Try HTTP as last resort (not recommended for production)
      await _tryHttpFallback();
    }
  }

  // HTTP fallback method (last resort)
  Future<void> _tryHttpFallback() async {
    try {
      log("Trying HTTP fallback...");

      // Try HTTP instead of HTTPS
      final httpUrl = ApiConstant.BASE_URL.replaceFirst('https://', 'http://') +
          ApiConstant.setting;
      final url = Uri.parse(httpUrl);

      log("HTTP Fallback Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final client = http.Client();
      try {
        final response = await client.get(url, headers: headers).timeout(
              const Duration(seconds: 10),
            );

        log("HTTP Fallback StatusCode :: ${response.statusCode}");
        log("HTTP Fallback Body :: ${response.body}");

        if (response.statusCode == 200) {
          final jsonResponse = jsonDecode(response.body);
          settingCategory = SettingModel.fromJson(jsonResponse);
          log("HTTP Fallback success: ${settingCategory?.status}");
        } else {
          log("HTTP Fallback failed with status: ${response.statusCode}");
          settingCategory = null;
        }
      } finally {
        client.close();
      }
    } catch (e) {
      log("HTTP fallback also failed: $e");
      settingCategory = null;
    }
  }
}
