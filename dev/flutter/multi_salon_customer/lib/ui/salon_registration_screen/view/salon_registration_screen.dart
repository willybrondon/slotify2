import 'dart:io';

import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/salon_registration_screen/controller/salon_registration_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

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
                    "Hello, Salon!",
                    style: TextStyle(
                      fontFamily: FontFamily.sfProDisplay,
                      fontSize: 18,
                      color: AppColors.whiteColor,
                    ),
                  ),
                  Text(
                    "Ready to Take Your Salon to the Next Level",
                    style: TextStyle(
                      fontFamily: FontFamily.sfProDisplayRegular,
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
                          fontFamily: FontFamily.sfProDisplayBold,
                        ),
                      ),
                    ).paddingOnly(top: 20),
                    Center(
                      child: Text(
                        "txtFillDetails".tr,
                        style: TextStyle(
                          color: AppColors.email,
                          fontSize: 13.5,
                          fontFamily: FontFamily.sfProDisplayRegular,
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
                                          "Select Image",
                                          style: TextStyle(
                                              color: AppColors.email.withOpacity(0.5),
                                              fontSize: 13.5,
                                              fontFamily: FontFamily.sfProDisplayRegular),
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
                      title: "Salon Name",
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: FontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "Enter your salon name",
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        controller: logic.nameController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter your salon name";
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "Email",
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: FontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "Enter your email",
                        obscureText: false,
                        textInputType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        controller: logic.emailController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter your email";
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "Mobile Number",
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: FontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "Enter your mobile number",
                        obscureText: false,
                        textInputType: TextInputType.number,
                        textInputAction: TextInputAction.next,
                        controller: logic.mobileController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter your mobile number";
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "Count of experts",
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: FontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "Enter your experts count",
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        textInputType: TextInputType.number,
                        maxLength: 2,
                        controller: logic.expertController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter your experts count";
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "Address",
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: FontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "Enter your address",
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        controller: logic.addressController,
                        maxLine: 6,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter your address";
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    TextFormFieldCustom(
                      title: "About",
                      hintTextColor: AppColors.subTitle,
                      hintTextSize: 15,
                      hintTextStyle: FontFamily.sfProDisplayRegular,
                      borderWidth: 1,
                      borderColor: AppColors.grey.withOpacity(0.1),
                      method: TextFieldCustom(
                        height: 50,
                        width: Get.width,
                        hintText: "Enter your salon details",
                        obscureText: false,
                        textInputAction: TextInputAction.next,
                        controller: logic.aboutController,
                        maxLine: 6,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter your salon details";
                          }
                          return null;
                        },
                      ),
                    ).paddingOnly(top: 15),
                    AppButton(
                      height: 55,
                      width: Get.width,
                      buttonColor: AppColors.primaryAppColor,
                      buttonText: "Register",
                      fontFamily: FontFamily.sfProDisplay,
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
