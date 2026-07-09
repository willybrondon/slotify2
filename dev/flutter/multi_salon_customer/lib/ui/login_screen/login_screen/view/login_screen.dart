// ignore_for_file: must_be_immutable

import 'dart:developer' as dev;

import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:salon_2/custom/otp/skedisy_otp_input.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/utils/utils.dart';

class LoginScreen extends StatelessWidget {
  LoginScreen({super.key});

  final LoginScreenController loginScreenController =
      Get.put(LoginScreenController());
  ProfileScreenController profileScreenController =
      Get.put(ProfileScreenController());

  InputDecoration _phoneFieldDecoration() {
    return InputDecoration(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      fillColor: AppColors.brandGrayLight,
      filled: true,
      hintStyle: TextStyle(
        color: AppColors.brandGrayMuted,
        fontSize: 14,
        fontFamily: AppFontFamily.sfProDisplayRegular,
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: AppColors.brandTerracotta, width: 1.5),
        borderRadius: BorderRadius.circular(12),
      ),
      border: const OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: AppColors.lineColor),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  loginScreen(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.brandWhite,
      resizeToAvoidBottomInset: true,
      body: GetBuilder<LoginScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    if (Navigator.of(context).canPop())
                      Align(
                        alignment: Alignment.centerLeft,
                        child: IconButton(
                          onPressed: () => Get.back(),
                          icon: Icon(
                            Icons.arrow_back_ios_new_rounded,
                            size: 20,
                            color: AppColors.brandBlack,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: AppColors.brandGrayLight,
                            padding: const EdgeInsets.all(10),
                          ),
                        ),
                      ),
                    const SizedBox(height: 20),
                    Center(
                      child: Image.asset(
                        AppAsset.icLogo,
                        height: 88,
                        width: 88,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      "txtMobileNumberVerification".tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 28,
                        color: AppColors.brandBlack,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "desUnderRequirement".tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayRegular,
                        fontSize: 15,
                        color: AppColors.brandGrayMuted,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      "txtEnterMobileNumber".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 14,
                        color: AppColors.brandBlack,
                      ),
                    ),
                    const SizedBox(height: 8),
                    IntlPhoneField(
                      flagsButtonPadding: const EdgeInsets.all(8),
                      dropdownIconPosition: IconPosition.trailing,
                      controller: loginScreenController.mobileEditingController,
                      obscureText: false,
                      style: TextStyle(
                        color: AppColors.brandBlack,
                        fontSize: 15,
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                      ),
                      cursorColor: AppColors.brandTerracotta,
                      dropdownTextStyle: TextStyle(
                        color: AppColors.brandBlack,
                        fontSize: 15,
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                      ),
                      keyboardType: TextInputType.number,
                      showCountryFlag: false,
                      decoration: _phoneFieldDecoration(),
                      initialCountryCode: countryCode ?? "IN",
                      onCountryChanged: (value) {
                        dev.log("message :: ${value.code}");
                        countryCode = value.code;
                        getDialCode();
                      },
                      onChanged: (phone) {
                        dev.log("Phone :: ${phone.completeNumber}");
                      },
                    ),
                    const SizedBox(height: 8),
                    GetBuilder<LoginScreenController>(
                      id: Constant.idCheckMobile,
                      builder: (checkLogic) {
                        return SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: () {
                              checkLogic.onCheckMobile();
                              checkLogic.timer?.isActive != true
                                  ? checkLogic.secondsRemaining == 0
                                      ? checkLogic.resetTimer()
                                      : checkLogic.startTimer()
                                  : null;
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.brandBlack,
                              foregroundColor: AppColors.brandWhite,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              "txtVerification".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  otpScreen() {
    return Scaffold(
      backgroundColor: AppColors.brandWhite,
      resizeToAvoidBottomInset: true,
      body: GetBuilder<LoginScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        onPressed: () {
                          logic.onChangeNumber();
                          logic.otpEditingController.clear();
                        },
                        icon: Icon(
                          Icons.arrow_back_ios_new_rounded,
                          size: 20,
                          color: AppColors.brandBlack,
                        ),
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.brandGrayLight,
                          padding: const EdgeInsets.all(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Center(
                      child: Image.asset(
                        AppAsset.icLogo,
                        height: 72,
                        width: 72,
                      ),
                    ),
                    const SizedBox(height: 28),
                    Text(
                      "txtOTPVerification".tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 28,
                        color: AppColors.brandBlack,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 8),
                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        text: "${"txtVerificationCode".tr}\n",
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayRegular,
                          color: AppColors.brandGrayMuted,
                          fontSize: 15,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(
                            text: "$dialCode ${Constant.storage.read<String>('mobileNumber')}",
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayBold,
                              color: AppColors.brandBlack,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    GetBuilder<LoginScreenController>(
                      id: Constant.idTimer,
                      builder: (timerLogic) {
                        return Text(
                          "${"txtOTPSent".tr} ${timerLogic.secondsRemaining ~/ 60}:${(timerLogic.secondsRemaining % 60).toString().padLeft(2, '0')}",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayRegular,
                            color: AppColors.brandGrayMuted,
                            fontSize: 14,
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 28),
                    Text(
                      "txtOTPVerification".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 14,
                        color: AppColors.brandBlack,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SkedisyOtpInput(
                      controller: loginScreenController.otpEditingController,
                      length: 6,
                      enableSmsAutofill: true,
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        GetBuilder<LoginScreenController>(
                          id: Constant.idChangeNumber,
                          builder: (changeLogic) {
                            return GestureDetector(
                              onTap: () {
                                changeLogic.onChangeNumber();
                                changeLogic.otpEditingController.clear();
                              },
                              child: Text(
                                "txtChangePhoneNumber".tr,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  decoration: TextDecoration.underline,
                                  decorationColor: AppColors.brandTerracotta,
                                  color: AppColors.brandTerracotta,
                                  fontSize: 13,
                                ),
                              ),
                            );
                          },
                        ),
                        GestureDetector(
                          onTap: () {
                            logic.otpEditingController.clear();
                            logic.verifyPhone();
                          },
                          child: Text(
                            "txtResendOTP".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              decoration: TextDecoration.underline,
                              decorationColor: AppColors.brandBlack,
                              fontSize: 13,
                              color: AppColors.brandBlack,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () async {
                          await logic.verifyOTP(
                              mobileNumber:
                                  Constant.storage.read('mobileNumber'));

                          await logic.onLoginApiCall(
                              loginType: "3",
                              mobile: Constant.storage.read('mobileNumber'),
                              fcmToken: fcmToken!);
                          dev.log(
                              "isLogin :: ${logic.loginCategory?.user?.isUpdate}");

                          if (logic.loginCategory!.status == true) {
                            Utils.showToast(
                                Get.context!, "desUserLoginSuccess".tr);
                            Constant.storage.write('isLogIn', true);
                            Constant.storage.write('isMobile', true);
                            Constant.storage
                                .write('userId', logic.loginCategory?.user?.id);
                            Constant.storage.write('mobileNumber',
                                logic.loginCategory?.user?.mobile.toString());
                            Constant.storage.write(
                                'isUpdate', logic.loginCategory?.user?.isUpdate);

                            dev.log(
                                "is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");
                            dev.log(
                                "is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");
                            dev.log(
                                "is isMobile Controller :: ${Constant.storage.read<bool>('isMobile')}");

                            await profileScreenController.onGetUserApiCall(
                                loginType: 3);
                            if (profileScreenController.getUserCategory?.status ==
                                true) {
                              Constant.storage.write(
                                  'userId',
                                  profileScreenController
                                      .getUserCategory?.user?.id);
                              Constant.storage.write(
                                  'userImage',
                                  profileScreenController
                                      .getUserCategory?.user?.image);
                              Constant.storage.write(
                                  'fName',
                                  profileScreenController
                                      .getUserCategory?.user?.fname);
                              Constant.storage.write(
                                  'lName',
                                  profileScreenController
                                      .getUserCategory?.user?.lname);

                              logic.isLogIn = true;

                              if (logic.isDataSelected == true) {
                                Get.back();
                                Constant.storage.write('isUpdate', true);
                              } else {
                                Get.offAllNamed(AppRoutes.bottom);
                                Constant.storage.write('isUpdate', true);
                              }
                              logic.update([Constant.idBookingAndLogin]);
                            } else {
                              Utils.showToast(
                                  Get.context!,
                                  profileScreenController
                                          .getUserCategory?.message ??
                                      "");
                            }
                            if (logic.loginCategory?.user?.isUpdate == false) {
                              dev.log(
                                  "profileScreenController.getUserCategory?.user?.fname::${profileScreenController.getUserCategory?.user?.fname}");
                              dev.log(
                                  "profileScreenController.getUserCategory?.user?.lname::${profileScreenController.getUserCategory?.user?.lname}");
                              dev.log(
                                  "profileScreenController.getUserCategory?.user?.email::${profileScreenController.getUserCategory?.user?.email}");
                              dev.log(
                                  "profileScreenController.getUserCategory?.user?.mobile::${profileScreenController.getUserCategory?.user?.mobile}");
                              dev.log(
                                  "profileScreenController.getUserCategory?.user?.bio::${profileScreenController.getUserCategory?.user?.bio}");
                              dev.log(
                                  "profileScreenController.getUserCategory?.user?.loginType::${profileScreenController.getUserCategory?.user?.loginType}");
                              dev.log(
                                  "logic.isDataSelected::${logic.isDataSelected}");

                              Get.toNamed(AppRoutes.editProfile, arguments: [
                                profileScreenController
                                    .getUserCategory?.user?.fname,
                                profileScreenController
                                    .getUserCategory?.user?.lname,
                                profileScreenController
                                    .getUserCategory?.user?.email,
                                profileScreenController
                                    .getUserCategory?.user?.mobile,
                                0,
                                profileScreenController
                                    .getUserCategory?.user?.bio,
                                profileScreenController
                                    .getUserCategory?.user?.loginType,
                                logic.isDataSelected
                              ]);
                              await Get.put<EditProfileScreenController>(
                                      EditProfileScreenController())
                                  .getDataFromArgs();
                              await Get.put<EditProfileScreenController>(
                                      EditProfileScreenController())
                                  .getArgumentsData();
                            } else {
                              if (logic.isDataSelected == true) {
                                Constant.storage.write('isUpdate', true);
                                Get.back();
                              } else {
                                Get.offAllNamed(AppRoutes.bottom);
                              }
                            }
                          } else {
                            Utils.showToast(
                                Get.context!, logic.loginCategory?.message ?? "");
                          }
                          dev.log("Log in Successfully");
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.brandBlack,
                          foregroundColor: AppColors.brandWhite,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          "txtVerify".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayBold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<LoginScreenController>(
        id: Constant.idVerification,
        builder: (logic) {
          return logic.verification != true ? loginScreen(context) : otpScreen();
        });
  }
}
