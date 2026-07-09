// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:salon_2/custom/otp/skedisy_otp_input.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/login_screen/guest_login_screen/controller/guest_login_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class GuestLoginScreen extends GetView<GuestLoginController> {
  GuestLoginScreen({super.key});

  Widget _emailPhoneStep(BuildContext context, double statusBarHeight) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(56 + statusBarHeight),
        child: AppBar(
          backgroundColor: AppColors.primaryAppColor,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Get.back(),
          ),
          title: Text(
            'txtGuestBookingTitle'.tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplay,
              color: AppColors.whiteColor,
              fontSize: 18,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'txtGuestBookingSubtitle'.tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayRegular,
                color: AppColors.email,
                fontSize: 14,
              ),
            ).paddingOnly(top: 20, bottom: 16),
            Text(
              'txtEmail'.tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayRegular,
                color: AppColors.darkGrey3,
                fontSize: 14,
              ),
            ),
            TextField(
              controller: controller.emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                hintText: 'txtEnterEmail'.tr,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ).paddingOnly(top: 6, bottom: 16),
            Text(
              'txtEnterMobileNumber'.tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayRegular,
                color: AppColors.darkGrey3,
                fontSize: 14,
              ),
            ),
            IntlPhoneField(
              flagsButtonPadding: const EdgeInsets.all(8),
              dropdownIconPosition: IconPosition.trailing,
              controller: controller.mobileEditingController,
              initialCountryCode: countryCode ?? 'FR',
              showCountryFlag: false,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (phone) {
                controller.completePhoneNumber = phone.completeNumber;
              },
            ).paddingOnly(top: 6, bottom: 24),
            GetBuilder<GuestLoginController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return AppButton(
                  height: 52,
                  width: Get.width,
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  color: AppColors.whiteColor,
                  fontSize: 17,
                  buttonColor: AppColors.primaryAppColor,
                  buttonText: 'txtGuestSendCode'.tr,
                  onTap: () => logic.sendOtp(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _otpStep(BuildContext context, double statusBarHeight) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(56 + statusBarHeight),
        child: AppBar(
          backgroundColor: AppColors.primaryAppColor,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => controller.onChangeContact(),
          ),
          title: Text(
            'txtOTPVerification'.tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplay,
              color: AppColors.whiteColor,
              fontSize: 18,
            ),
          ),
        ),
      ),
      body: GetBuilder<GuestLoginController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'txtGuestOtpHint'.tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayRegular,
                      color: AppColors.email,
                      fontSize: 14,
                    ),
                  ).paddingOnly(top: 20, bottom: 8),
                  Text(
                    controller.emailController.text.trim(),
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplay,
                      color: AppColors.primaryAppColor,
                      fontSize: 15,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 24, bottom: 24),
                    child: SkedisyOtpInput(
                      controller: controller.otpEditingController,
                      length: 6,
                      enableSmsAutofill: false,
                    ),
                  ),
                  GetBuilder<GuestLoginController>(
                    id: GuestLoginController.idGuestTimer,
                    builder: (lg) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'txtOTPSent'.tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayRegular,
                              color: AppColors.email,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            ' ${lg.secondsRemaining ~/ 60}:${(lg.secondsRemaining % 60).toString().padLeft(2, '0')}',
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              color: AppColors.primaryAppColor,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: () => controller.onChangeContact(),
                        child: Text(
                          'txtChangePhoneNumber'.tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            color: AppColors.redText,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          if (controller.secondsRemaining <= 0) {
                            controller.otpEditingController.clear();
                            controller.sendOtp();
                          } else {
                            Utils.showToast(
                                context, 'txtGuestWaitResend'.tr);
                          }
                        },
                        child: Text(
                          'txtResendOTP'.tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            color: AppColors.primaryAppColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  AppButton(
                    height: 52,
                    width: Get.width,
                    fontFamily: AppFontFamily.sfProDisplay,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                    buttonColor: AppColors.primaryAppColor,
                    buttonText: 'txtVerify'.tr,
                    onTap: () => controller.verifyAndComplete(),
                  ).paddingOnly(top: 32, bottom: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final statusBarHeight = MediaQuery.of(context).padding.top;
    return GetBuilder<GuestLoginController>(
      id: GuestLoginController.idGuestVerification,
      builder: (logic) {
        return logic.verification
            ? _otpStep(context, statusBarHeight)
            : _emailPhoneStep(context, statusBarHeight);
      },
    );
  }
}
