import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/login_screen/reset_password_screen/controller/reset_password_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class ResetPasswordScreen extends StatelessWidget {
  const ResetPasswordScreen({super.key});

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
      body: GetBuilder<ResetPasswordController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: Column(children: [
                Center(
                  child: Text(
                    "txtResetPassword".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      color: AppColors.primaryTextColor,
                      fontSize: 20,
                    ),
                  ),
                ).paddingOnly(top: 20),
                Text("desSetPassword".tr,
                    style: TextStyle(fontFamily: AppFontFamily.sfProDisplayRegular, color: AppColors.email, fontSize: 15)),
                GetBuilder<ResetPasswordController>(
                  builder: (logic) {
                    return TextFormFieldCustom(
                      title: "txtPassword".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 16,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 15,
                        maxLine: 1,
                        width: Get.width,
                        suffixIcon: logic.isPasswordObscure
                            ? InkWell(
                                onTap: () {
                                  logic.onClickPasswordObscure();
                                },
                                child: Image.asset(
                                  AppAsset.icInvisible,
                                  cacheHeight: 22,
                                ),
                              )
                            : InkWell(
                                onTap: () {
                                  logic.onClickPasswordObscure();
                                },
                                child: Image.asset(AppAsset.icVisible, cacheHeight: 22)),
                        hintText: "txtEnterPassword".tr,
                        obscureText: logic.isPasswordObscure,
                        textInputType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        controller: logic.passwordController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'txtPleaseEnterPassword'.tr;
                          } else if (value.length < 6) {
                            return 'txtPasswordCharacters'.tr;
                          }
                          return null;
                        },
                      ),
                    );
                  },
                ).paddingOnly(left: 15, right: 15, top: 15),
                GetBuilder<ResetPasswordController>(
                  builder: (logic) {
                    return TextFormFieldCustom(
                      title: "txtConfirmPassword".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        maxLine: 1,
                        suffixIcon: logic.isConfirmPasswordObscure
                            ? InkWell(
                                onTap: () {
                                  logic.onClickConfirmPasswordObscure();
                                },
                                child: Image.asset(
                                  AppAsset.icInvisible,
                                  cacheHeight: 22,
                                ),
                              )
                            : InkWell(
                                onTap: () {
                                  logic.onClickConfirmPasswordObscure();
                                },
                                child: Image.asset(AppAsset.icVisible, cacheHeight: 22)),
                        hintText: "txtEnterConfirmPassword".tr,
                        obscureText: logic.isConfirmPasswordObscure,
                        textInputType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        controller: logic.confirmPasswordController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'txtPleaseConfirmPassword'.tr;
                          } else if (value != logic.passwordController.text) {
                            return 'desPasswordNotMatch'.tr;
                          }
                          return null;
                        },
                      ),
                    );
                  },
                ).paddingOnly(left: 15, right: 15, top: 15),
                GetBuilder<ResetPasswordController>(
                  builder: (logic) {
                    return AppButton(
                        height: 55,
                        width: Get.width,
                        buttonColor: AppColors.primaryAppColor,
                        buttonText: "txtResetPassword".tr,
                        fontFamily: AppFontFamily.sfProDisplay,
                        color: AppColors.whiteColor,
                        fontSize: 19,
                        onTap: () async {
                          FocusScopeNode currentFocus = FocusScope.of(context);
                          if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                            currentFocus.focusedChild?.unfocus();
                          }

                          if (logic.passwordController.text.isNotEmpty && logic.confirmPasswordController.text.isNotEmpty) {
                            await logic.onResetPasswordApiCall(
                                email: logic.emailId.toString(),
                                newPassword: logic.passwordController.text,
                                confirmPassword: logic.confirmPasswordController.text);

                            if (logic.resetPasswordCategory?.status == true) {
                              Get.close(3);
                            } else {
                              Utils.showToast(Get.context!, logic.resetPasswordCategory?.message ?? "");
                            }
                          }
                        }).paddingOnly(top: 40, left: 15, right: 15);
                  },
                )
              ]),
            ),
          );
        },
      ),
    );
  }
}
