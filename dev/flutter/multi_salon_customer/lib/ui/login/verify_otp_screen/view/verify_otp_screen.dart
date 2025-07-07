// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pinput/pinput.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login/forgot_password_screen/controller/forgot_password_controller.dart';
import 'package:salon_2/ui/login/verify_otp_screen/controller/verify_otp_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class VerifyOtpScreen extends StatelessWidget {
  VerifyOtpScreen({super.key});

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

  VerifyOtpController verifyOtpController = Get.find<VerifyOtpController>();

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
                    "txtWelcomeBack".tr,
                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 18, color: AppColors.whiteColor),
                  ),
                  Text(
                    "txtLongTime".tr,
                    style: TextStyle(fontFamily: FontFamily.sfProDisplayRegular, fontSize: 13, color: AppColors.whiteColor),
                  ),
                ],
              ),
            ],
          ).paddingOnly(bottom: 13),
        ),
      ),
      body: GetBuilder<VerifyOtpController>(
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
                        fontFamily: FontFamily.sfProDisplayBold,
                        color: AppColors.primaryTextColor,
                        fontSize: 20,
                      ),
                    ),
                  ).paddingOnly(top: 20),
                  GetBuilder<VerifyOtpController>(
                    builder: (logic) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text("${"txtCodeSend".tr} ",
                              style: TextStyle(fontFamily: FontFamily.sfProDisplayRegular, color: AppColors.email, fontSize: 15)),
                          Text(logic.emailId.toString(),
                              style:
                                  TextStyle(fontFamily: FontFamily.sfProDisplay, color: AppColors.primaryAppColor, fontSize: 15),
                              textAlign: TextAlign.center),
                        ],
                      );
                    },
                  ),
                  Image.asset(AppAsset.icVerifyOtp, height: 250, width: 250).paddingOnly(top: 20),
                  GetBuilder<VerifyOtpController>(
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
                  GetBuilder<ForgotPasswordController>(
                    builder: (logic) {
                      return InkWell(
                        onTap: () async {
                          await logic.onCreateOtpApiCall(email: verifyOtpController.emailId.toString());

                          if (logic.otpCreateCategory?.status == true) {
                            Utils.showToast(Get.context!, "txtCheckMail".tr);
                          } else {
                            Utils.showToast(Get.context!, logic.otpCreateCategory?.message ?? "");
                          }
                        },
                        child: RichText(
                          text: TextSpan(
                            text: '${"txtNotVerificationCode".tr} ',
                            style: TextStyle(color: AppColors.email, fontSize: 14, fontFamily: FontFamily.sfProDisplayMedium),
                            children: [
                              TextSpan(
                                text: 'txtResendOTP'.tr,
                                style: TextStyle(
                                    fontFamily: FontFamily.sfProDisplay,
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
                  GetBuilder<VerifyOtpController>(
                    builder: (logic) {
                      return AppButton(
                        height: 55,
                        width: Get.width,
                        buttonColor: AppColors.primaryAppColor,
                        buttonText: "txtContinue".tr,
                        fontFamily: FontFamily.sfProDisplay,
                        color: AppColors.whiteColor,
                        fontSize: 19,
                        onTap: () async {
                          if (logic.otpEditingController.text.isNotEmpty) {
                            await logic.onVerifyOtpApiCall(email: logic.emailId.toString(), otp: logic.otpEditingController.text);

                            if (logic.verifyOtpCategory?.status == true) {
                              Get.toNamed(AppRoutes.resetPassword, arguments: [logic.emailId]);
                            } else {
                              Utils.showToast(Get.context!, logic.verifyOtpCategory?.message ?? "");
                            }
                          } else {
                            Utils.showToast(Get.context!, "Please Enter Otp");
                          }
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
