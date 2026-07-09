// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class SignInScreen extends StatelessWidget {
  SignInScreen({super.key});

  final SignInController signInController = Get.put(SignInController());

  InputDecoration _fieldDecoration(String hint) {
    return InputDecoration(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      fillColor: AppColors.brandGrayLight,
      filled: true,
      hintStyle: TextStyle(
        color: AppColors.brandGrayMuted,
        fontSize: 14,
        fontFamily: AppFontFamily.sfProDisplayRegular,
      ),
      hintText: hint,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.lineColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.brandTerracotta, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.brandTerracotta),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.brandTerracotta, width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvoked: (bool didPop) {
        if (didPop) return;
      },
      child: Scaffold(
        backgroundColor: AppColors.brandWhite,
        resizeToAvoidBottomInset: true,
        body: GetBuilder<SignInController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return ProgressDialog(
              inAsyncCall: logic.isLoading.value,
              child: SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Form(
                    key: signInController.formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 8),
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
                          "txtWelcomeBack".tr,
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
                          "txtFillDetails".tr,
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
                          "txtEmail".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayBold,
                            fontSize: 14,
                            color: AppColors.brandBlack,
                          ),
                        ),
                        const SizedBox(height: 8),
                        GetBuilder<SignInController>(
                          builder: (emailLogic) {
                            return TextFormField(
                              controller: emailLogic.emailController,
                              cursorColor: AppColors.brandTerracotta,
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              style: TextStyle(
                                fontSize: 15,
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                color: AppColors.brandBlack,
                              ),
                              decoration:
                                  _fieldDecoration("txtEnterEmail".tr),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'desEnterEmail'.tr;
                                } else if (!emailLogic.isEmailValid(value)) {
                                  return 'desEnterValidEmail'.tr;
                                }
                                return null;
                              },
                            );
                          },
                        ),
                        const SizedBox(height: 20),
                        Text(
                          "txtPassword".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayBold,
                            fontSize: 14,
                            color: AppColors.brandBlack,
                          ),
                        ),
                        const SizedBox(height: 8),
                        GetBuilder<SignInController>(
                          builder: (pwLogic) {
                            return TextFormField(
                              controller: pwLogic.passwordController,
                              obscureText: pwLogic.isObscure,
                              cursorColor: AppColors.brandTerracotta,
                              textInputAction: TextInputAction.done,
                              style: TextStyle(
                                fontSize: 15,
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                color: AppColors.brandBlack,
                              ),
                              decoration: _fieldDecoration("txtEnterPassword".tr)
                                  .copyWith(
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    pwLogic.isObscure
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    color: AppColors.brandGrayMuted,
                                    size: 22,
                                  ),
                                  onPressed: pwLogic.onClickObscure,
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'txtPleaseEnterPassword'.tr;
                                } else if (value.length < 6) {
                                  return 'txtPasswordCharacters'.tr;
                                }
                                return null;
                              },
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            GetBuilder<SignInController>(
                              id: Constant.idRemember,
                              builder: (rememberLogic) {
                                return GestureDetector(
                                  onTap: rememberLogic.onRememberClick,
                                  child: Row(
                                    children: [
                                      Container(
                                        height: 22,
                                        width: 22,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                            color: rememberLogic.isRemember
                                                ? AppColors.brandTerracotta
                                                : AppColors.roundBorder,
                                            width: 1.5,
                                          ),
                                          color: rememberLogic.isRemember
                                              ? AppColors.brandTerracotta
                                              : AppColors.brandWhite,
                                        ),
                                        child: rememberLogic.isRemember
                                            ? const Icon(
                                                Icons.check,
                                                size: 16,
                                                color: Colors.white,
                                              )
                                            : null,
                                      ),
                                      const SizedBox(width: 10),
                                      Text(
                                        "txtRememberMe".tr,
                                        style: TextStyle(
                                          color: AppColors.brandBlack,
                                          fontFamily:
                                              AppFontFamily.sfProDisplayRegular,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                            const Spacer(),
                            GestureDetector(
                              onTap: () => Get.toNamed(AppRoutes.forgotPassword),
                              child: Text(
                                "txtForgetPassword".tr,
                                style: TextStyle(
                                  color: AppColors.brandTerracotta,
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  fontSize: 13,
                                  decoration: TextDecoration.underline,
                                  decorationColor: AppColors.brandTerracotta,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: () {
                              FocusScopeNode currentFocus =
                                  FocusScope.of(context);
                              if (!currentFocus.hasPrimaryFocus &&
                                  currentFocus.focusedChild != null) {
                                currentFocus.focusedChild?.unfocus();
                              }
                              logic.onClickSignIn();
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
                              "txtSignIn".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Center(
                          child: GestureDetector(
                            onTap: () {
                              Get.toNamed(
                                AppRoutes.signUp,
                                arguments: [logic.isDataSelected],
                              );
                              logic.emailController.clear();
                              logic.passwordController.clear();
                            },
                            child: RichText(
                              text: TextSpan(
                                text: '${"txtNotMember".tr} ',
                                style: TextStyle(
                                  color: AppColors.brandGrayMuted,
                                  fontSize: 14,
                                  fontFamily:
                                      AppFontFamily.sfProDisplayRegular,
                                ),
                                children: [
                                  TextSpan(
                                    text: "txtSignUp".tr,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontFamily:
                                          AppFontFamily.sfProDisplayBold,
                                      color: AppColors.brandTerracotta,
                                      decoration: TextDecoration.underline,
                                      decorationColor:
                                          AppColors.brandTerracotta,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Center(
                          child: GestureDetector(
                            onTap: () {
                              Get.toNamed(
                                AppRoutes.guestLogin,
                                arguments: [logic.isDataSelected],
                              );
                            },
                            child: Text(
                              'txtGuestBookingLink'.tr,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                fontSize: 14,
                                color: AppColors.brandBlack,
                                decoration: TextDecoration.underline,
                                decorationColor: AppColors.brandBlack,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Center(
                          child: GestureDetector(
                            onTap: () => Get.toNamed(AppRoutes.salonRegistration),
                            child: RichText(
                              textAlign: TextAlign.center,
                              text: TextSpan(
                                text: "${"txtJustStartedYour".tr} ",
                                style: TextStyle(
                                  color: AppColors.brandGrayMuted,
                                  fontSize: 13,
                                  fontFamily:
                                      AppFontFamily.sfProDisplayRegular,
                                ),
                                children: [
                                  TextSpan(
                                    text: "txtCreateAnAccount".tr,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontFamily:
                                          AppFontFamily.sfProDisplayBold,
                                      color: AppColors.brandTerracotta,
                                      decoration: TextDecoration.underline,
                                      decorationColor:
                                          AppColors.brandTerracotta,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
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
