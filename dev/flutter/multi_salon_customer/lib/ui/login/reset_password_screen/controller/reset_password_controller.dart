import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/login/reset_password_screen/model/reset_password_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class ResetPasswordController extends GetxController {
  bool isPasswordObscure = false;
  bool isConfirmPasswordObscure = false;
  String? emailId;
  dynamic args = Get.arguments;
  TextEditingController passwordController = TextEditingController();
  TextEditingController confirmPasswordController = TextEditingController();

  //----------- API Variables -----------//
  ResetPasswordModel? resetPasswordCategory;
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

  onClickPasswordObscure() {
    isPasswordObscure = !isPasswordObscure;
    update();
  }

  onClickConfirmPasswordObscure() {
    isConfirmPasswordObscure = !isConfirmPasswordObscure;
    update();
  }

  onResetPasswordApiCall(
      {required String email, required String newPassword, required String confirmPassword}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body =
          json.encode({"email": email, "newPassword": newPassword, "confirmPassword": confirmPassword});

      log("Reset Password Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.resetPassword);

      log("Reset Password Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.patch(url, headers: headers, body: body);

      log("Reset Password Status Code :: ${response.statusCode}");
      log("Reset Password Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        resetPasswordCategory = ResetPasswordModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Reset Password Api :: $e");
      Utils.showToast(Get.context!, resetPasswordCategory?.message ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
