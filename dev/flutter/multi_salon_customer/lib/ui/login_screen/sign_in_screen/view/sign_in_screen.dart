// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class SignInScreen extends StatelessWidget {
  SignInScreen({super.key});

  SignInController signInController = Get.put(SignInController());

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    return PopScope(
      canPop: true,
      onPopInvoked: (bool didPop) {
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
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
                ).paddingOnly(left: 15, right: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "txtWelcomeBack".tr,
                      style: TextStyle(fontFamily: AppFontFamily.sfProDisplay, fontSize: 18, color: AppColors.whiteColor),
                    ),
                    Text(
                      "txtLongTime".tr,
                      style: TextStyle(fontFamily: AppFontFamily.sfProDisplayRegular, fontSize: 13, color: AppColors.whiteColor),
                    ),
                  ],
                ),
              ],
            ).paddingOnly(bottom: 13),
          ),
        ),
        body: GetBuilder<SignInController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return ProgressDialog(
              inAsyncCall: logic.isLoading.value,
              child: SingleChildScrollView(
                child: Form(
                  key: signInController.formKey,
                  child: Column(
                    children: [
                      Text(
                        "txtEnterUsername".tr,
                        style: TextStyle(
                            color: AppColors.primaryTextColor, fontSize: 21, fontFamily: AppFontFamily.sfProDisplayBold),
                      ).paddingOnly(top: 20),
                      Text(
                        "txtFillDetails".tr,
                        style: TextStyle(color: AppColors.email, fontSize: 13.5, fontFamily: AppFontFamily.sfProDisplayRegular),
                      ).paddingOnly(bottom: 17),
                      GetBuilder<SignInController>(
                        builder: (logic) {
                          return TextFormFieldCustom(
                            title: "txtEmail".tr,
                            hintTextColor: AppColors.subTitle,
                            hintTextSize: 16,
                            hintTextStyle: AppFontFamily.sfProDisplayRegular,
                            borderWidth: 1,
                            borderColor: AppColors.grey.withOpacity(0.1),
                            method: TextFieldCustom(
                              height: 50,
                              width: Get.width,
                              hintText: "txtEnterEmail".tr,
                              obscureText: false,
                              textInputType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              controller: logic.emailController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'desEnterEmail'.tr;
                                } else if (!logic.isEmailValid(value)) {
                                  return 'desEnterValidEmail'.tr;
                                }
                                return null;
                              },
                            ),
                          ).paddingOnly(left: 16, right: 16, top: 18);
                        },
                      ),
                      GetBuilder<SignInController>(
                        builder: (logic) {
                          return TextFormFieldCustom(
                            title: "txtPassword".tr,
                            hintTextColor: AppColors.subTitle,
                            hintTextSize: 16,
                            hintTextStyle: AppFontFamily.sfProDisplayRegular,
                            borderWidth: 1,
                            borderColor: AppColors.grey.withOpacity(0.1),
                            method: TextFieldCustom(
                              height: 50,
                              width: Get.width,
                              suffixIcon: logic.isObscure
                                  ? InkWell(
                                      onTap: () {
                                        logic.onClickObscure();
                                      },
                                      child: Image.asset(
                                        AppAsset.icInvisible,
                                        cacheHeight: 22,
                                      ),
                                    )
                                  : InkWell(
                                      onTap: () {
                                        logic.onClickObscure();
                                      },
                                      child: Image.asset(AppAsset.icVisible, cacheHeight: 22)),
                              hintText: "txtEnterPassword".tr,
                              obscureText: logic.isObscure,
                              maxLine: 1,
                              textInputType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              controller: logic.passwordController,
                              validator: (value) {
                                if (value!.isEmpty) {
                                  return 'txtPleaseEnterPassword'.tr;
                                } else if (value.length < 6) {
                                  return 'txtPasswordCharacters'.tr;
                                }
                                return null;
                              },
                            ),
                          ).paddingOnly(left: 16, right: 16, top: 15, bottom: 20);
                        },
                      ),
                      Row(
                        children: [
                          GetBuilder<SignInController>(
                            id: Constant.idRemember,
                            builder: (logic) {
                              return InkWell(
                                overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                onTap: () {
                                  logic.onRememberClick();
                                },
                                child: Container(
                                  height: 20,
                                  width: 20,
                                  margin: const EdgeInsets.only(right: 10),
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: logic.isRemember == true ? AppColors.primaryAppColor : AppColors.transparent,
                                      border: Border.all(
                                          color: logic.isRemember == true ? AppColors.transparent : AppColors.primaryAppColor,
                                          width: 1)),
                                  child: logic.isRemember == true
                                      ? Image.asset(
                                          AppAsset.icCheck,
                                          color: AppColors.whiteColor,
                                        )
                                      : const SizedBox(),
                                ),
                              );
                            },
                          ),
                          GetBuilder<SignInController>(
                            id: Constant.idRemember,
                            builder: (logic) {
                              return InkWell(
                                overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                onTap: () {
                                  logic.onRememberClick();
                                },
                                child: Text(
                                  "txtRememberMe".tr,
                                  style: TextStyle(
                                      color: AppColors.primaryTextColor,
                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                      fontSize: 15),
                                ),
                              );
                            },
                          ),
                          const Spacer(),
                          InkWell(
                            onTap: () {
                              Get.toNamed(AppRoutes.forgotPassword);
                            },
                            child: Text(
                              "txtForgetPassword".tr,
                              style: TextStyle(
                                color: AppColors.email,
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                fontSize: 13.5,
                                decoration: TextDecoration.underline,
                                decorationColor: AppColors.email,
                              ),
                            ),
                          )
                        ],
                      ).paddingOnly(left: 16, right: 16, bottom: 18),
                      GetBuilder<SignInController>(
                        id: Constant.idProgressView,
                        builder: (logic) {
                          return AppButton(
                            onTap: () {
                              FocusScopeNode currentFocus = FocusScope.of(context);
                              if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                                currentFocus.focusedChild?.unfocus();
                              }
                              logic.onClickSignIn();
                            },
                            height: 55,
                            width: Get.width,
                            buttonColor: AppColors.primaryAppColor,
                            buttonText: "txtSignIn".tr,
                            fontFamily: AppFontFamily.sfProDisplay,
                            color: AppColors.whiteColor,
                            fontSize: 20,
                          ).paddingOnly(bottom: 20, left: 13, right: 13, top: 13);
                        },
                      ),
                      InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          Get.toNamed(AppRoutes.signUp, arguments: [logic.isDataSelected]);
                          logic.emailController.clear();
                          logic.passwordController.clear();
                        },
                        child: RichText(
                          text: TextSpan(
                            text: '${"txtNotMember".tr} ',
                            style: TextStyle(color: AppColors.email, fontSize: 14, fontFamily: AppFontFamily.sfProDisplayMedium),
                            children: <TextSpan>[
                              TextSpan(
                                  text: ' ${"txtSignUp".tr}',
                                  style: TextStyle(
                                      fontSize: 16, fontFamily: AppFontFamily.sfProDisplay, color: AppColors.categoryService)),
                            ],
                          ),
                        ).paddingOnly(top: 5, bottom: 20),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            height: 1,
                            width: Get.width * 0.4,
                            color: AppColors.greyColor.withOpacity(0.35),
                          ),
                          Text(
                            "txtOR".tr,
                            style: TextStyle(
                              color: AppColors.categoryService,
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              fontSize: 15.5,
                            ),
                          ),
                          Container(
                            height: 1,
                            width: Get.width * 0.4,
                            color: AppColors.greyColor.withOpacity(0.35),
                          ),
                        ],
                      ).paddingOnly(left: 16, right: 16, bottom: 17),
                      InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          Get.toNamed(AppRoutes.salonRegistration);
                        },
                        child: RichText(
                          text: TextSpan(
                            text: "txtJustStartedYour".tr,
                            style: TextStyle(
                              color: AppColors.email,
                              fontSize: 14,
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                            ),
                            children: <TextSpan>[
                              TextSpan(
                                text: 'txtSalonJourney'.tr,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  color: AppColors.email,
                                ),
                              ),
                              TextSpan(
                                text: "txtCreateAnAccount".tr,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: AppFontFamily.sfProDisplay,
                                  color: AppColors.categoryService,
                                ),
                              ),
                            ],
                          ),
                        ).paddingOnly(bottom: 10),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GetBuilder<SignInController>(
                            id: Constant.idProgressView,
                            builder: (logic) {
                              return InkWell(
                                overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                onTap: () async {
                                  await logic.signInWithGoogle();
                                },
                                child: Container(
                                  height: 60,
                                  width: Get.width * 0.43,
                                  padding: const EdgeInsets.only(left: 10, right: 10),
                                  decoration: BoxDecoration(
                                    color: AppColors.whiteColor,
                                    borderRadius: BorderRadius.circular(60),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.blackColor.withOpacity(0.03),
                                        offset: const Offset(
                                          0.0,
                                          1.0,
                                        ),
                                        blurRadius: 3.0,
                                        spreadRadius: 2.0,
                                      ),
                                      const BoxShadow(
                                        color: Colors.black12,
                                        offset: Offset(0.0, 0.0),
                                        blurRadius: 0.0,
                                        spreadRadius: 0.0,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Container(
                                        height: 47,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: AppColors.bottom,
                                        ),
                                        padding: const EdgeInsets.all(10),
                                        child: Image.asset(AppAsset.icGoogle),
                                      ),
                                      Text(
                                        "Google",
                                        style: TextStyle(
                                          color: AppColors.primaryTextColor,
                                          fontFamily: AppFontFamily.sfProDisplay,
                                          fontSize: 15,
                                        ),
                                      ).paddingOnly(left: 20),
                                    ],
                                  ),
                                ),
                              ).paddingOnly(bottom: 20, top: 10);
                            },
                          ),
                          InkWell(
                            overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                            onTap: () async {
                              Get.toNamed(AppRoutes.login, arguments: [logic.isDataSelected]);
                              await Get.find<LoginScreenController>().getDataFromArgs();
                            },
                            child: Container(
                              height: 60,
                              width: Get.width * 0.43,
                              padding: const EdgeInsets.only(left: 10, right: 10),
                              decoration: BoxDecoration(
                                color: AppColors.whiteColor,
                                borderRadius: BorderRadius.circular(60),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.blackColor.withOpacity(0.03),
                                    offset: const Offset(
                                      0.0,
                                      1.0,
                                    ),
                                    blurRadius: 3.0,
                                    spreadRadius: 2.0,
                                  ),
                                  const BoxShadow(
                                    color: Colors.black12,
                                    offset: Offset(0.0, 0.0),
                                    blurRadius: 0.0,
                                    spreadRadius: 0.0,
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Container(
                                    height: 47,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.bottom,
                                    ),
                                    padding: const EdgeInsets.all(10),
                                    child: Image.asset(AppAsset.icMobile),
                                  ),
                                  Text(
                                    "Mobile",
                                    style: TextStyle(
                                      color: AppColors.primaryTextColor,
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 15,
                                    ),
                                  ).paddingOnly(left: 20),
                                ],
                              ),
                            ),
                          ).paddingOnly(bottom: 20, top: 10),
                        ],
                      ).paddingSymmetric(horizontal: 15),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
