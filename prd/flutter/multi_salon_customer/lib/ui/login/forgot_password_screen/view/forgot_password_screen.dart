// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login/forgot_password_screen/controller/forgot_password_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class ForgotPasswordScreen extends StatelessWidget {
  ForgotPasswordScreen({super.key});

  ForgotPasswordController forgotPasswordController = Get.put(ForgotPasswordController());

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
      bottomNavigationBar: AppButton(
        height: 55,
        width: Get.width,
        buttonColor: AppColors.primaryAppColor,
        buttonText: "txtContinue".tr,
        fontFamily: FontFamily.sfProDisplay,
        color: AppColors.whiteColor,
        fontSize: 19,
        onTap: () async {
          await forgotPasswordController.onCreateOtpApiCall(email: forgotPasswordController.emailEditingController.text);

          if (forgotPasswordController.otpCreateCategory?.status == true) {
            Utils.showToast(Get.context!, "txtCheckMail".tr);
            Get.toNamed(AppRoutes.verifyOtp, arguments: [forgotPasswordController.emailEditingController.text]);
          } else {
            Utils.showToast(Get.context!, forgotPasswordController.otpCreateCategory?.message ?? "");
          }
        },
      ).paddingOnly(left: 13, right: 13, bottom: 15),
      body: GetBuilder<ForgotPasswordController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Image.asset(AppAsset.icForgotPassword, height: 300, width: 300).paddingOnly(top: 20),
                  Text(
                    "txtForgotPassword".tr,
                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 19, color: AppColors.primaryTextColor),
                  ).paddingOnly(bottom: 5),
                  Text(
                    "desForgotPassword".tr,
                    style: TextStyle(
                      fontFamily: FontFamily.sfProDisplayRegular,
                      fontSize: 16,
                      color: AppColors.grey,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  GetBuilder<ForgotPasswordController>(
                    builder: (logic) {
                      return TextFormFieldCustom(
                        title: "txtEmail".tr,
                        hintTextColor: AppColors.subTitle,
                        hintTextSize: 16,
                        hintTextStyle: FontFamily.sfProDisplayRegular,
                        borderWidth: 1,
                        borderColor: AppColors.grey.withOpacity(0.1),
                        method: TextFieldCustom(
                          height: 50,
                          width: Get.width,
                          hintText: "txtEnterEmail".tr,
                          obscureText: false,
                          textInputType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          controller: logic.emailEditingController,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'desEnterEmail'.tr;
                            } else if (!logic.isEmailValid(value)) {
                              return 'desEnterValidEmail'.tr;
                            }
                            return null;
                          },
                        ),
                      ).paddingOnly(left: 13, right: 13, top: 18);
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
