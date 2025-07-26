import 'dart:io';

import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/salon_registration_screen/controller/salon_registration_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class SalonRegistrationScreen extends StatelessWidget {
  const SalonRegistrationScreen({super.key});

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
              ).paddingOnly(left: 15, right: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "txtHelloSalon".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplay,
                      fontSize: 18,
                      color: AppColors.whiteColor,
                    ),
                  ),
                  Text(
                    "txtReadySalon".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayRegular,
                      fontSize: 13,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ],
              ),
            ],
          ).paddingOnly(bottom: 13),
        ),
      ),
      body: GetBuilder<SalonRegistrationController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: Form(
                key: logic.formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Text(
                        "txtCreateYourAccount".tr,
                        style: TextStyle(
                          color: AppColors.primaryTextColor,
                          fontSize: 21,
                          fontFamily: AppFontFamily.sfProDisplayBold,
                        ),
                      ),
                    ).paddingOnly(top: 20),
                    Center(
                      child: Text(
                        "txtFillDetails".tr,
                        style: TextStyle(
                          color: AppColors.email,
                          fontSize: 13.5,
                          fontFamily: AppFontFamily.sfProDisplayRegular,
                        ),
                      ),
                    ),
                    DottedBorder(
                      color: AppColors.roundBorder,
                      borderType: BorderType.RRect,
                      radius: const Radius.circular(12),
                      strokeWidth: 1,
                      dashPattern: const [2.5, 2.5],
                      child: GetBuilder<SalonRegistrationController>(
                        id: Constant.idPickSalonImage,
                        builder: (logic) {
                          return GestureDetector(
                            onTap: () {
                              logic.onPickImage();
                            },
                            child: Container(
                              height: 130,
                              width: 130,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1),
                              ),
                              child: logic.image?.path == null
                                  ? Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Image.asset(
                                          AppAsset.icAddProfileImage,
                                          height: 30,
                                          color: AppColors.email.withOpacity(0.5),
                                        ),
                                        Text(
                                          "txtSelectImage".tr,
                                          style: TextStyle(
                                              color: AppColors.email.withOpacity(0.5),
                                              fontSize: 13.5,
                                              fontFamily: AppFontFamily.sfProDisplayRegular),
                                        ),
                                      ],
                                    )
                                  : Container(
                                      height: 130,
                                      width: 130,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: AppColors.grey.withOpacity(0.1),
                                          width: 1,
                                        ),
                                      ),
                                      child: Image.file(
                                        File(logic.image?.path ?? '${ApiConstant.BASE_URL}static/male.png'),
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                            ),
                          );
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "txtSalonName".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "desEnterSalonName".tr,
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        controller: logic.nameController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "desPleaseEnterSalonName".tr;
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "txtEmail".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
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
                            return "desEnterEmail".tr;
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "txtMobileNumber".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "desEnterMobileNumber".tr,
                        obscureText: false,
                        textInputType: TextInputType.number,
                        textInputAction: TextInputAction.next,
                        controller: logic.mobileController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "desPleaseEnterMobileNumber".tr;
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "txtCountOfExperts".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "desEnterExpertCount".tr,
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        textInputType: TextInputType.number,
                        maxLength: 2,
                        controller: logic.expertController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "desPleaseEnterExpertCount".tr;
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "txtAddress".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "desEnterAddress".tr,
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        controller: logic.addressController,
                        maxLine: 6,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "desPleaseEnterAddress".tr;
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "txtAbout".tr,
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: AppFontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "desEnterSalonDetail".tr,
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        controller: logic.aboutController,
                        maxLine: 6,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "desPleaseEnterSalonDetail".tr;
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    AppButton(
                      height: 55,
                      width: Get.width,
                      buttonColor: AppColors.primaryAppColor,
                      buttonText: "txtRegister".tr,
                      fontFamily: AppFontFamily.sfProDisplay,
                      color: AppColors.whiteColor,
                      fontSize: 18,
                      onTap: () async {
                        logic.onClickRegister();
                      },
                    ).paddingOnly(top: 15, bottom: 15)
                  ],
                ).paddingOnly(left: 12, right: 12),
              ),
            ),
          );
        },
      ),
    );
  }
}
