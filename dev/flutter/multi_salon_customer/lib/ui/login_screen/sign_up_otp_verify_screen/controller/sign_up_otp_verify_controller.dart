import 'dart:convert';
import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_up_otp_verify_screen/model/sign_up_otp_verify_model.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/controller/sign_up_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SignUpOtpVerifyController extends GetxController {
  String? emailId;
  bool? isDataSelected;
  dynamic args = Get.arguments;
  TextEditingController otpEditingController = TextEditingController();
  final SignUpController signUpController = Get.find<SignUpController>();
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController = Get.put(ProfileScreenController());
  final EditProfileScreenController editProfileScreenController = Get.put(EditProfileScreenController());

  //----------- API Variables -----------//
  SignUpOtpVerifyModel? signUpOtpVerifyCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() {
    getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null) {
        emailId = args[0];
        isDataSelected = args[1];
      }
    } else {
      isDataSelected = false;
    }
  }

  onClickContinue() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      if (otpEditingController.text.isNotEmpty) {
        await onSignUpOtpVerifyApiCall(
          email: emailId.toString(),
          otp: otpEditingController.text,
        );

        if (signUpOtpVerifyCategory?.status == true) {
          isLoading(true);
          update([Constant.idProgressView]);
          await loginScreenController.onLoginApiCall(
            loginType: "1",
            mobile: "",
            fcmToken: fcmToken!,
            password: signUpController.confirmPasswordController.text.trim(),
            email: signUpController.emailController.text.trim(),
            age: signUpController.ageController.text.trim(),
          );
          log("isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");

          if (loginScreenController.loginCategory?.status == true) {
            isLoading(true);
            update([Constant.idProgressView]);
            Utils.showToast(Get.context!, "User Login SuccessFully..!");
            Constant.storage.write('isLogIn', true);
            Constant.storage.write('userId', loginScreenController.loginCategory?.user?.id);
            log("is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");

            await editProfileScreenController.onUpdateUserApiCall(
                fName: signUpController.fNameController.text.trim(),
                lName: signUpController.lNameController.text.trim(),
                email: "",
                mobile: "",
                age: "",
                bio: "",
                selectImageFile: "",
                gender: signUpController.checkedValue == 0
                    ? "Male"
                    : signUpController.checkedValue == 1
                        ? "Female"
                        : signUpController.checkedValue == 2
                            ? "Other"
                            : " ");

            if (editProfileScreenController.updateUserCategory != null &&
                editProfileScreenController.updateUserCategory?.status == true) {
              Constant.storage.write('isUpdate', true);
              loginScreenController.isUpdate = Constant.storage.read<bool>('isUpdate')!;
              log("is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");

              await profileScreenController.onGetUserApiCall(loginType: 1);
              if (profileScreenController.getUserCategory?.status == true) {
                isLoading(true);
                update([Constant.idProgressView]);

                Future.delayed(const Duration(milliseconds: 100), () async {
                  await Get.put<EditProfileScreenController>(EditProfileScreenController()).getDataFromArgs();
                  await Get.put<EditProfileScreenController>(EditProfileScreenController()).getArgumentsData();
                });

                Constant.storage.write('userId', profileScreenController.getUserCategory?.user?.id);
                Constant.storage.write('userImage', profileScreenController.getUserCategory?.user?.image);
                Constant.storage.write('fName', profileScreenController.getUserCategory?.user?.fname);
                Constant.storage.write('lName', profileScreenController.getUserCategory?.user?.lname);

                if (isDataSelected == true) {
                  Constant.storage.write('isUpdate', true);
                  Get.back();
                  Get.back();
                  Get.back();
                } else {
                  Get.offAllNamed(AppRoutes.bottom);
                  Constant.storage.write('isUpdate', true);
                }

                editProfileScreenController.signOnTap();
                update([Constant.idBookingAndLogin]);
              } else {
                isLoading(false);
                update([Constant.idProgressView]);
                Utils.showToast(Get.context!, profileScreenController.getUserCategory?.message.toString() ?? "");
              }
            } else {
              isLoading(false);
              update([Constant.idProgressView]);
              Utils.showToast(Get.context!, editProfileScreenController.updateUserCategory?.message.toString() ?? "");
            }
          } else {
            isLoading(false);
            update([Constant.idProgressView]);
            Utils.showToast(Get.context!, loginScreenController.loginCategory?.message ?? "");
          }
        } else {
          Utils.showToast(Get.context!, signUpOtpVerifyCategory?.message ?? "");
        }
      } else {
        Utils.showToast(Get.context!, "Please Enter Otp");
      }
    } catch (e) {
      log("Error On Click Continue in Sign Up :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onSignUpOtpVerifyApiCall({required String email, required String otp}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"email": email, "otp": otp};

      log("Sign Up Otp Verify  Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.signUpOtpVerify + queryString);
      log("Sign Up Otp Verify  Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers);

      log("Sign Up Otp Verify  Status Code :: ${response.statusCode}");
      log("Sign Up Otp Verify  Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        signUpOtpVerifyCategory = SignUpOtpVerifyModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Sign Up Otp Verify  Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
