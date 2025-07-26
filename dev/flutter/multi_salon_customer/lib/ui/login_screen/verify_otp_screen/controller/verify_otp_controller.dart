import 'dart:convert';
import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/verify_otp_screen/model/verify_otp_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class VerifyOtpController extends GetxController {
  String? emailId;
  dynamic args = Get.arguments;
  TextEditingController otpEditingController = TextEditingController();

  //----------- API Variables -----------//
  VerifyOtpModel? verifyOtpCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() {
    getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        emailId = args[0];
      }
    }
  }

  onVerifyOtpApiCall({required String email, required String otp}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"email": email, "otp": otp});

      log("Verify OTP Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.verifyOtp);
      log("Verify OTP Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Verify OTP Status Code :: ${response.statusCode}");
      log("Verify OTP Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        verifyOtpCategory = VerifyOtpModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Verify OTP Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
