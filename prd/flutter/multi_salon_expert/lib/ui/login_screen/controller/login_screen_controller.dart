import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/model/get_profile_model.dart';
import 'package:salon_2/ui/login_screen/model/login_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class LoginScreenController extends GetxController {
  bool isLogin = false;
  bool isPasswordVisible = false;
  bool isCheck = false;
  bool isFirstTap = false;
  final TextEditingController emailController = TextEditingController();
  final TextEditingController pwController = TextEditingController();

  //----------- API Variables -----------//
  LoginModel? loginCategory;
  GetProfileModel? getExpertCategory;
  RxBool isLoading = false.obs;

  bool isEmailValid(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  onPasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
    update([Constant.idPasswordVisible]);
  }

  onContinueClick() async {
    log("Log In button tapped!");
    log("Is First Tap :: $isFirstTap");
    if (isFirstTap) {
      isFirstTap = false;
      log("Is First Tap :: $isFirstTap");
      log("Log In button tapped!");
      if (emailController.text.isEmpty || pwController.text.isEmpty) {
        Utils.showToast(Get.context!, "desEnterDetail".tr);
      } else {
        if (!isEmailValid(emailController.text)) {
          Utils.showToast(Get.context!, "desCheckEmail".tr);
        } else {
          if (isCheck) {
            await onLoginApiCall(
              email: emailController.text,
              password: pwController.text,
              fcmToken: fcmToken!,
            );

            if (loginCategory?.status == true) {
              isLogin = true;
              Constant.storage.write('isLogIn', isLogin);
              Constant.storage.write('expertId', loginCategory?.expert?.id);
              Constant.storage.write('emailId', emailController.text);
              Constant.storage.write('password', pwController.text);

              log("Is login check :: ${Constant.storage.read("isLogIn")}");
              log("Expert Id :: ${Constant.storage.read("expertId")}");
              log("Email Id :: ${Constant.storage.read("emailId")}");
              log("Password :: ${Constant.storage.read("password")}");

              await onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());

              if (getExpertCategory?.status == true) {
                currentEarning = getExpertCategory?.data?.currentEarning?.toStringAsFixed(2);

                Constant.storage.write('fName', loginCategory?.expert?.fname.toString());
                Constant.storage.write('lName', loginCategory?.expert?.lname.toString());
                Constant.storage.write('uniqueID', loginCategory?.expert?.uniqueId.toString());
                Constant.storage.write('hostImage', loginCategory?.expert?.image);
                Constant.storage.write('paymentType', loginCategory?.expert?.paymentType);
                Constant.storage.write("salonId", getExpertCategory?.data?.salonId?.id);

                Constant.storage.write("bankName", getExpertCategory?.data?.bankDetails?.bankName.toString());
                Constant.storage.write("accountNumber", getExpertCategory?.data?.bankDetails?.accountNumber.toString());
                Constant.storage.write("IFSCCode", getExpertCategory?.data?.bankDetails?.ifscCode.toString());
                Constant.storage.write("branchName", getExpertCategory?.data?.bankDetails?.branchName.toString());
                Constant.storage.write("upiId", getExpertCategory?.data?.upiId.toString());

                log("First Name :: ${Constant.storage.read("fName")}");
                log("Last Name :: ${Constant.storage.read("lName")}");
                log("Payment Type :: ${Constant.storage.read("paymentType")}");
                log("Host Image :: ${Constant.storage.read("hostImage")}");
                log("Bank Name :: ${Constant.storage.read<String>("bankName")}");
                log("Account Number :: ${Constant.storage.read<String>("accountNumber")}");
                log("IFSC Code :: ${Constant.storage.read<String>("IFSCCode")}");
                log("Branch Name :: ${Constant.storage.read<String>("branchName")}");
                log("UPI Id :: ${Constant.storage.read<String>("upiId")}");

                Get.offAndToNamed(AppRoutes.bottom);
              } else {
                Utils.showToast(Get.context!, "${getExpertCategory?.message}");
              }
            } else {
              Utils.showToast(Get.context!, "${loginCategory?.message}");
            }
          } else {
            Utils.showToast(Get.context!, "desAcceptTerms".tr);
          }
        }
      }
      log("Is First Tap :: $isFirstTap");

      Future.delayed(
        const Duration(seconds: 5),
        () {
          isFirstTap = true;

          log("Is First Tap :: $isFirstTap");
        },
      );
    }
  }

  onLoginApiCall({required String email, required String password, required String fcmToken}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"email": email, "password": password, "fcmToken": fcmToken});

      log("Login Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.loginExpert);
      log("Login Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Login Headers :: $headers");

      final response = await http.patch(url, headers: headers, body: body);

      log("Login Status Code :: ${response.statusCode}");
      log("Login Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        log("User Login SuccessFully..!");
        loginCategory = LoginModel.fromJson(jsonResponse);
      } else {
        final jsonResponse = jsonDecode(response.body);
        loginCategory = LoginModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Login Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetExpertApiCall({required String expertId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"expertId": expertId};
      log("Get Expert Params :: $queryParameters");
      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getExpert + queryString);
      log("Get Expert Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Expert Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Expert StatusCode :: ${response.statusCode}");
      log("Get Expert Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getExpertCategory = GetProfileModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Expert Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
