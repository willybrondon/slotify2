import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class LoginScreen extends StatelessWidget {
  LoginScreen({super.key});

  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();

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
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.brandWhite,
      resizeToAvoidBottomInset: true,
      body: GetBuilder<LoginScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          logic.isFirstTap = true;
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 36),
                    Center(
                      child: Image.asset(
                        AppAsset.icLogo,
                        height: 88,
                        width: 88,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      'txtLogIn'.tr,
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
                      'txtEnterID'.tr,
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
                      'txtEnterID'.tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 14,
                        color: AppColors.brandBlack,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: loginScreenController.emailController,
                      cursorColor: AppColors.brandTerracotta,
                      keyboardType: TextInputType.emailAddress,
                      style: TextStyle(
                        fontSize: 15,
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                        color: AppColors.brandBlack,
                      ),
                      decoration: _fieldDecoration('txtEnterID'.tr),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'txtPassword'.tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 14,
                        color: AppColors.brandBlack,
                      ),
                    ),
                    const SizedBox(height: 8),
                    GetBuilder<LoginScreenController>(
                      id: Constant.idPasswordVisible,
                      builder: (pwLogic) {
                        return TextFormField(
                          controller: loginScreenController.pwController,
                          obscureText: !pwLogic.isPasswordVisible,
                          cursorColor: AppColors.brandTerracotta,
                          style: TextStyle(
                            fontSize: 15,
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                            color: AppColors.brandBlack,
                          ),
                          decoration: _fieldDecoration('txtPassword'.tr).copyWith(
                            suffixIcon: IconButton(
                              icon: Icon(
                                pwLogic.isPasswordVisible
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: AppColors.brandGrayMuted,
                                size: 22,
                              ),
                              onPressed: pwLogic.onPasswordVisibility,
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                    GetBuilder<LoginScreenController>(
                      builder: (checkLogic) {
                        return GestureDetector(
                          onTap: () {
                            checkLogic.isCheck = !checkLogic.isCheck;
                            checkLogic.update();
                          },
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 22,
                                width: 22,
                                margin: const EdgeInsets.only(top: 2),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: checkLogic.isCheck
                                        ? AppColors.brandTerracotta
                                        : AppColors.roundBorder,
                                    width: 1.5,
                                  ),
                                  color: checkLogic.isCheck
                                      ? AppColors.brandTerracotta
                                      : AppColors.brandWhite,
                                ),
                                child: checkLogic.isCheck
                                    ? const Icon(
                                        Icons.check,
                                        size: 16,
                                        color: Colors.white,
                                      )
                                    : null,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: RichText(
                                  text: TextSpan(
                                    text: 'desTerms'.tr,
                                    style: TextStyle(
                                      color: AppColors.brandBlack,
                                      fontFamily:
                                          AppFontFamily.sfProDisplayRegular,
                                      fontSize: 13,
                                      height: 1.4,
                                    ),
                                    children: [
                                      TextSpan(
                                        text: 'desPolicy'.tr,
                                        style: TextStyle(
                                          color: AppColors.brandTerracotta,
                                          fontWeight: FontWeight.w600,
                                          decoration: TextDecoration.underline,
                                          fontFamily:
                                              AppFontFamily.sfProDisplayMedium,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () {
                          FocusScope.of(context).unfocus();
                          logic.onContinueClick();
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
                          'txtLogIn'.tr,
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
}
