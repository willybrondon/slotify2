// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pinput/pinput.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/login_screen/sign_up_otp_verify_screen/controller/sign_up_otp_verify_controller.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/controller/sign_up_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class SignUpVerifyOtpScreen extends StatelessWidget {
  SignUpVerifyOtpScreen({super.key});

  final defaultPinTheme = PinTheme(
    width: 56,
    height: 56,
    textStyle: TextStyle(
      fontSize: 20,
      color: AppColors.primaryAppColor,
      fontWeight: FontWeight.w600,
    ),
    decoration: BoxDecoration(
      border: Border.all(color: AppColors.grey),
      borderRadius: BorderRadius.circular(10),
    ),
  );

  SignUpOtpVerifyController signUpOtpVerifyController = Get.find<SignUpOtpVerifyController>();

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(100 + statusBarHeight),
        child: Container(
          padding: EdgeInsets.only(top: statusBarHeight),
          height: 100 + statusBarHeight,
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.primaryAppColor,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                height: 64,
                width: 64,
                decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.whiteColor),
                clipBehavior: Clip.hardEdge,
                child: Image.network("${ApiConstant.BASE_URL}storage/male.png", fit: BoxFit.cover),
              ).paddingOnly(
                left: 15,
                right: 12,
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "txtHelloUser".tr,
                    style: TextStyle(fontFamily: AppFontFamily.sfProDisplay, fontSize: 18, color: AppColors.whiteColor),
                  ),
                  Text(
                    "txtCreateAccount".tr,
                    style: TextStyle(fontFamily: AppFontFamily.sfProDisplayRegular, fontSize: 13, color: AppColors.whiteColor),
                  ),
                ],
              ),
            ],
          ).paddingOnly(bottom: 13),
        ),
      ),
      body: GetBuilder<SignUpOtpVerifyController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Center(
                    child: Text(
                      "txtOTPVerification".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        color: AppColors.primaryTextColor,
                        fontSize: 20,
                      ),
                    ),
                  ).paddingOnly(top: 20),
                  GetBuilder<SignUpOtpVerifyController>(
                    builder: (logic) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text("${"txtCodeSend".tr} ",
                              style:
                                  TextStyle(fontFamily: AppFontFamily.sfProDisplayRegular, color: AppColors.email, fontSize: 15)),
                          Text(logic.emailId.toString(),
                              style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplay, color: AppColors.primaryAppColor, fontSize: 15),
                              textAlign: TextAlign.center),
                        ],
                      );
                    },
                  ),
                  Image.asset(AppAsset.icVerifyOtp, height: 250, width: 250).paddingOnly(top: 20),
                  GetBuilder<SignUpOtpVerifyController>(
                    builder: (logic) {
                      return Pinput(
                        length: 4,
                        defaultPinTheme: defaultPinTheme,
                        controller: logic.otpEditingController,
                        pinAnimationType: PinAnimationType.fade,
                        onCompleted: (value) async {},
                      ).paddingOnly(top: 20, bottom: 20);
                    },
                  ),
                  GetBuilder<SignUpController>(
                    id: Constant.idProgressView,
                    builder: (logic) {
                      return InkWell(
                        onTap: () async {
                          signUpOtpVerifyController.otpEditingController.clear();

                          await logic.onSignUpOtpLoginApiCall(email: signUpOtpVerifyController.emailId.toString());

                          if (logic.signUpOtpLoginCategory?.status == true) {
                            Utils.showToast(Get.context!, "txtCheckMail".tr);
                          } else {
                            Utils.showToast(Get.context!, logic.signUpOtpLoginCategory?.message ?? "");
                          }
                        },
                        child: RichText(
                          text: TextSpan(
                            text: '${"txtNotVerificationCode".tr} ',
                            style: TextStyle(color: AppColors.email, fontSize: 14, fontFamily: AppFontFamily.sfProDisplayMedium),
                            children: [
                              TextSpan(
                                text: 'txtResendOTP'.tr,
                                style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    decoration: TextDecoration.underline,
                                    decorationColor: AppColors.primaryAppColor,
                                    fontSize: 12.5,
                                    color: AppColors.primaryAppColor),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  GetBuilder<SignUpOtpVerifyController>(
                    id: Constant.idProgressView,
                    builder: (logic) {
                      return AppButton(
                        height: 55,
                        width: Get.width,
                        buttonColor: AppColors.primaryAppColor,
                        buttonText: "txtContinue".tr,
                        fontFamily: AppFontFamily.sfProDisplay,
                        color: AppColors.whiteColor,
                        fontSize: 19,
                        onTap: () {
                          logic.onClickContinue();
                        },
                      ).paddingOnly(left: 15, right: 15, top: 55);
                    },
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
