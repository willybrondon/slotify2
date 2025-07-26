// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/controller/sign_up_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class SignUpScreen extends StatelessWidget {
  SignUpScreen({super.key});

  SignUpController signUpController = Get.find<SignUpController>();

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
      body: GetBuilder<SignUpController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: Form(
                key: signUpController.formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Text(
                        "txtCreateYourAccount".tr,
                        style: TextStyle(
                            color: AppColors.primaryTextColor, fontSize: 21, fontFamily: AppFontFamily.sfProDisplayBold),
                      ),
                    ).paddingOnly(top: 20),
                    Center(
                      child: Text(
                        "txtFillDetails".tr,
                        style: TextStyle(color: AppColors.email, fontSize: 13.5, fontFamily: AppFontFamily.sfProDisplayRegular),
                      ),
                    ),
                    GetBuilder<SignUpController>(
                      builder: (logic) {
                        return TextFormFieldCustom(
                          title: "txtFirstName".tr,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 15,
                          hintTextStyle: AppFontFamily.sfProDisplayRegular,
                          borderWidth: 1,
                          borderColor: AppColors.grey.withOpacity(0.1),
                          method: TextFieldCustom(
                            height: 50,
                            width: Get.width,
                            hintText: "txtEnterFirstName".tr,
                            obscureText: false,
                            textInputType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            controller: logic.fNameController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'txtEnterYourFirstName'.tr;
                              }
                              return null;
                            },
                          ),
                        );
                      },
                    ).paddingOnly(left: 15, right: 15, top: 15),
                    GetBuilder<SignUpController>(
                      builder: (logic) {
                        return TextFormFieldCustom(
                          title: "txtLastName".tr,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 15,
                          hintTextStyle: AppFontFamily.sfProDisplayRegular,
                          borderWidth: 1,
                          borderColor: AppColors.grey.withOpacity(0.1),
                          method: TextFieldCustom(
                            height: 50,
                            width: Get.width,
                            hintText: "txtEnterLastName".tr,
                            obscureText: false,
                            textInputType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            controller: logic.lNameController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'txtEnterYourLastName'.tr;
                              }
                              return null;
                            },
                          ),
                        );
                      },
                    ).paddingOnly(left: 15, right: 15, top: 15),
                    GetBuilder<SignUpController>(
                      builder: (logic) {
                        return TextFormFieldCustom(
                          title: "txtEmail".tr,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 16,
                          hintTextStyle: AppFontFamily.sfProDisplayRegular,
                          borderWidth: 1,
                          borderColor: AppColors.grey.withOpacity(0.1),
                          method: TextFieldCustom(
                            height: 15,
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
                        );
                      },
                    ).paddingOnly(left: 15, right: 15, top: 15),
                    GetBuilder<SignUpController>(
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
                            suffixIcon: logic.isObscure
                                ? InkWell(
                                    overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                    onTap: () {
                                      logic.onClickObscure();
                                    },
                                    child: Image.asset(
                                      AppAsset.icInvisible,
                                      cacheHeight: 22,
                                    ),
                                  )
                                : InkWell(
                                    overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                    onTap: () {
                                      logic.onClickObscure();
                                    },
                                    child: Image.asset(AppAsset.icVisible, cacheHeight: 22)),
                            hintText: "txtEnterPassword".tr,
                            obscureText: logic.isObscure,
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
                    GetBuilder<SignUpController>(
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
                            hintText: "txtEnterConfirmPassword".tr,
                            obscureText: logic.isObscure,
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
                    GetBuilder<SignUpController>(
                      builder: (logic) {
                        return TextFormFieldCustom(
                          method: TextFieldCustom(
                            hintText: "txtEnterAge".tr,
                            obscureText: false,
                            fieldName: "MobileNumber",
                            textInputType: TextInputType.number,
                            inputFormatters: [LengthLimitingTextInputFormatter(2)],
                            controller: logic.ageController,
                            textInputAction: TextInputAction.next,
                          ),
                          title: "txtAge".tr,
                          borderColor: AppColors.greyColor.withOpacity(0.1),
                          borderWidth: 1,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 14.5,
                          hintTextStyle: AppFontFamily.sfProDisplayMedium,
                        );
                      },
                    ).paddingOnly(left: 15, right: 15, top: 15),
                    SizedBox(
                      height: 50,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        shrinkWrap: true,
                        padding: EdgeInsets.zero,
                        itemCount: genderList.length,
                        itemBuilder: (context, index) {
                          return GetBuilder<SignUpController>(
                            id: Constant.idChangeGender,
                            builder: (logic) {
                              return Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  logic.checkedValue != index
                                      ? GestureDetector(
                                          onTap: () {
                                            logic.onGenderChange(index);
                                          },
                                          child: Container(
                                            height: 20,
                                            width: 20,
                                            decoration: BoxDecoration(
                                                shape: BoxShape.circle, border: Border.all(color: AppColors.greyColor2)),
                                          ),
                                        )
                                      : GestureDetector(
                                          onTap: () {
                                            logic.onGenderChange(index);
                                          },
                                          child: Container(
                                            height: 20,
                                            width: 20,
                                            padding: const EdgeInsets.all(1.3),
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                width: 1,
                                                color: AppColors.service,
                                              ),
                                            ),
                                            child:
                                                logic.checkedValue == index ? Image.asset(AppAsset.icRound) : const SizedBox(),
                                          ),
                                        ),
                                  SizedBox(width: Get.width * 0.03),
                                  GestureDetector(
                                    onTap: () {
                                      logic.onGenderChange(index);
                                    },
                                    child: Text(
                                      genderList[index]["gender"],
                                      style: TextStyle(
                                          fontSize: 16,
                                          color: AppColors.primaryTextColor,
                                          fontFamily: AppFontFamily.sfProDisplayMedium),
                                    ),
                                  ),
                                ],
                              );
                            },
                          );
                        },
                        separatorBuilder: (context, index) {
                          return SizedBox(
                            width: Get.width * 0.12,
                          );
                        },
                      ),
                    ).paddingOnly(left: 13, right: 13),
                    GetBuilder<SignUpController>(
                      id: Constant.idBookingAndLogin,
                      builder: (logic) {
                        return AppButton(
                          onTap: () async {
                            FocusScopeNode currentFocus = FocusScope.of(context);
                            if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                              currentFocus.focusedChild?.unfocus();
                            }

                            await logic.onCheckSignUpUserApiCall(
                              email: logic.emailController.text,
                              loginType: "1",
                              password: logic.confirmPasswordController.text,
                            );

                            if (logic.checkSignUpCategory?.status == true) {
                              logic.onClickSignup();
                            } else {
                              Utils.showToast(Get.context!, logic.checkSignUpCategory?.message ?? "");
                            }
                          },
                          height: 55,
                          width: Get.width,
                          buttonColor: AppColors.primaryAppColor,
                          buttonText: "txtSignUp".tr,
                          fontFamily: AppFontFamily.sfProDisplay,
                          color: AppColors.whiteColor,
                          fontSize: 20,
                        ).paddingAll(13);
                      },
                    ),
                    Center(
                      child: InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          Get.back();
                        },
                        child: RichText(
                          text: TextSpan(
                            text: '${"txtHaveAccount".tr} ',
                            style: TextStyle(
                              color: AppColors.email,
                              fontSize: 14,
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                            ),
                            children: <TextSpan>[
                              TextSpan(
                                text: 'txtSignIn'.tr,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: AppFontFamily.sfProDisplay,
                                  color: AppColors.categoryService,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ).paddingOnly(bottom: 20)
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  static List genderList = [
    {"gender": "txtMale".tr, "id": "1"},
    {"gender": "txtFemale".tr, "id": "2"},
    {"gender": "txtOther".tr, "id": "3"},
  ];
}
