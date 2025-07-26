import 'dart:convert';
import 'dart:developer';

import 'package:http/http.dart' as http;
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/forgot_password_screen/model/otp_create_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class ForgotPasswordController extends GetxController {
  final formKey = GlobalKey<FormState>();
  TextEditingController emailEditingController = TextEditingController();
  // final FirebaseAuth _auth = FirebaseAuth.instance;

  //----------- API Variables -----------//
  OtpCreateModel? otpCreateCategory;
  RxBool isLoading = false.obs;

  bool isEmailValid(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  // onForgotPassword() async {
  //   var auth = await _auth.sendPasswordResetEmail(email: emailEditingController.text);
  //
  // Future<AuthStatus> resetPassword({required String email}) async {
  //   await _auth
  //       .sendPasswordResetEmail(email: email)
  //       .then((value) => _status = AuthStatus.successful)
  //       .catchError((e) => _status = AuthExceptionHandler.handleAuthException(e));
  //   return _status;
  // }
  // }

  onCreateOtpApiCall({required String email}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      // final queryParameters = {"email": email};
      //
      // log("Create Otp Params :: $queryParameters");
      //
      // String queryString = Uri(queryParameters: queryParameters).query;

      final body = json.encode({"email": email});

      log("Create OTP Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.createOtp);
      log("Create OTP Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers,body: body);

      log("Create OTP Status Code :: ${response.statusCode}");
      log("Create OTP Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        otpCreateCategory = OtpCreateModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Create OTP Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
