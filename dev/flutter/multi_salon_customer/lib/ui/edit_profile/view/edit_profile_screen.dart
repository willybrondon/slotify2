// ignore_for_file: must_be_immutable

import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';

class EditProfileScreen extends StatelessWidget {
  EditProfileScreen({super.key});

  final EditProfileScreenController editProfileScreenController = Get.find<EditProfileScreenController>();
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController = Get.find<ProfileScreenController>();

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        return Constant.storage.read<bool>('isLogIn') == true && Constant.storage.read<bool>('isUpdate') == false ? false : true;
      },
      child: Form(
        key: editProfileScreenController.formKey,
        child: Scaffold(
          backgroundColor: AppColors.backGround,
          bottomNavigationBar: GetBuilder<EditProfileScreenController>(
            id: Constant.idUpdate,
            builder: (logic) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                height: 65,
                width: double.infinity,
                child: AppButton(
                  buttonColor: AppColors.primaryAppColor,
                  color: AppColors.whiteColor,
                  fontSize: 18,
                  fontFamily: FontFamily.sfProDisplay,
                  buttonText: "txtUpdate".tr,
                  onTap: () async {
                    FocusScopeNode currentFocus = FocusScope.of(context);
                    if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                      currentFocus.focusedChild?.unfocus();
                    }
                    logic.onUpdateClick();
                  },
                ),
              ).paddingOnly(bottom: 10);
            },
          ),
          appBar: PreferredSize(
            preferredSize: const Size.fromHeight(55),
            child: GetBuilder<LoginScreenController>(
              id: Constant.idBookingAndLogin,
              builder: (logic) {
                log("message login:: ${Constant.storage.read<bool>('isLogIn')}");
                log("message update:: ${Constant.storage.read<bool>('isUpdate')}");

                return AppBarCustom(
                  title: Constant.storage.read<bool>('isLogIn') == true && Constant.storage.read<bool>('isUpdate') == false
                      ? "txtMakeProfile".tr
                      : "txtEditProfile".tr,
                  method: Constant.storage.read<bool>('isLogIn') == true && Constant.storage.read<bool>('isUpdate') == false
                      ? const SizedBox()
                      : InkWell(
                          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                          onTap: () {
                            Get.back();
                          },
                          child: Icon(
                            Icons.arrow_back,
                            color: AppColors.whiteColor,
                          ),
                        ),
                );
              },
            ),
          ),
          body: GetBuilder<EditProfileScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return ProgressDialog(
                inAsyncCall: logic.isLoading.value,
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    child: Column(
                      children: [
                        SizedBox(height: Get.height * 0.01),
                        GetBuilder<EditProfileScreenController>(
                          id: Constant.idUpdate,
                          builder: (logic) {
                            return Stack(
                              children: [
                                Center(
                                  child: Container(
                                    height: 130,
                                    width: 130,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        width: 2,
                                        color: AppColors.primaryAppColor,
                                      ),
                                    ),
                                    child: CircleAvatar(
                                      radius: 63,
                                      backgroundColor: AppColors.whiteColor,
                                      child: Container(
                                        height: 120,
                                        width: 120,
                                        clipBehavior: Clip.hardEdge,
                                        decoration: const BoxDecoration(shape: BoxShape.circle),
                                        child: logic.image?.path == null
                                            ? Image.network(
                                                profileScreenController.getUserCategory?.user?.image ??
                                                    "${ApiConstant.BASE_URL}static/male.png",
                                                errorBuilder: (context, error, stackTrace) => Container(
                                                  height: 120,
                                                  width: 120,
                                                  decoration: BoxDecoration(
                                                    shape: BoxShape.circle,
                                                    color: AppColors.grey.withOpacity(0.2),
                                                    image: const DecorationImage(
                                                      image: AssetImage(AppAsset.imMale),
                                                      fit: BoxFit.cover,
                                                    ),
                                                  ),
                                                ),
                                              )
                                            : CircleAvatar(
                                                radius: 60,
                                                backgroundImage: FileImage(
                                                  File(logic.image?.path ?? '${ApiConstant.BASE_URL}static/male.png'),
                                                ),
                                              ),
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 82,
                                  left: Get.width * 0.54,
                                  child: GestureDetector(
                                    onTap: () {
                                      logic.onPickImage();
                                    },
                                    child: Container(
                                      height: 35,
                                      width: 35,
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppColors.whiteColor,
                                      ),
                                      child: Container(
                                        alignment: Alignment.center,
                                        height: 32,
                                        width: 32,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: AppColors.primaryAppColor,
                                        ),
                                        child: Image.asset(
                                          AppAsset.icAddProfileImage,
                                          height: 18,
                                          width: 18,
                                          color: AppColors.whiteColor,
                                        ),
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            );
                          },
                        ),
                        SizedBox(height: Get.height * 0.01),
                        TextFormFieldCustom(
                          method: TextFieldCustom(
                            hintText: "txtEnterFirstName".tr,
                            obscureText: false,
                            controller: logic.fNameEditingController,
                            textInputAction: TextInputAction.next,
                            validator: (value) {
                              if (value!.isEmpty) {
                                return "txtEnterYourFirstName".tr;
                              }
                              return logic.fNameEditingController.text.isEmpty ? "" : null;
                            },
                          ),
                          title: "txtFirstName".tr,
                          borderColor: AppColors.greyColor.withOpacity(0.1),
                          borderWidth: 1,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 14.5,
                          hintTextStyle: FontFamily.sfProDisplayMedium,
                        ),
                        SizedBox(height: Get.height * 0.02),
                        TextFormFieldCustom(
                          method: TextFieldCustom(
                            hintText: "txtEnterLastName".tr,
                            obscureText: false,
                            controller: logic.lNameEditingController,
                            textInputAction: TextInputAction.next,
                            validator: Constant.storage.read<bool>('isGoogle') == false
                                ? (value) {
                                    if (value!.isEmpty) {
                                      return 'txtEnterYourLastName'.tr;
                                    }
                                    return null;
                                  }
                                : (value) {
                                    return null;
                                  },
                          ),
                          title: "txtLastName".tr,
                          borderColor: AppColors.greyColor.withOpacity(0.1),
                          borderWidth: 1,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 14.5,
                          hintTextStyle: FontFamily.sfProDisplayMedium,
                        ),
                        SizedBox(height: Get.height * 0.02),
                        logic.loginType == 1 || logic.loginType == 2
                            ? TextFormFieldCustom(
                                method: TextFieldCustom(
                                  hintText: "txtEnterEmail".tr,
                                  obscureText: false,
                                  readOnly: true,
                                  controller: logic.emailEditingController,
                                  textInputAction: TextInputAction.next,
                                  validator: Constant.storage.read<bool>('isGoogle') == false
                                      ? (value) {
                                          if (value!.isEmpty) {
                                            return "desEnterEmail".tr;
                                          } else if (logic.isEmailValid(value)) {
                                            return "desEnterValidEmail".tr;
                                          }
                                          return null;
                                        }
                                      : (value) {
                                          return null;
                                        },
                                ),
                                title: "txtEmail".tr,
                                borderColor: AppColors.greyColor.withOpacity(0.1),
                                borderWidth: 1,
                                hintTextColor: AppColors.subTitle,
                                hintTextSize: 14.5,
                                hintTextStyle: FontFamily.sfProDisplayMedium,
                              ).paddingOnly(bottom: Get.height * 0.02)
                            : const SizedBox(),
                        logic.loginType == 3
                            ? TextFormFieldCustom(
                                method: TextFieldCustom(
                                  hintText: "txtEnterContactNumber".tr,
                                  obscureText: false,
                                  fieldName: "MobileNumber",
                                  readOnly: true,
                                  textInputType: TextInputType.number,
                                  controller: logic.mobileNumberEditingController,
                                  textInputAction: TextInputAction.next,
                                  maxLength: 13,
                                  validator: Constant.storage.read<bool>('isMobile') == false ||
                                          Constant.storage.read<bool>('isGoogle') == true
                                      ? (value) {
                                          if (value!.isEmpty) {
                                            return 'Please enter a Mobile';
                                          } else if (value.length < 7) {
                                            return 'please a enter correct mobile number';
                                          }
                                          return null;
                                        }
                                      : (value) {
                                          return null;
                                        },
                                ),
                                title: "txtContactNumber".tr,
                                borderColor: AppColors.greyColor.withOpacity(0.1),
                                borderWidth: 1,
                                hintTextColor: AppColors.subTitle,
                                hintTextSize: 14.5,
                                hintTextStyle: FontFamily.sfProDisplayMedium,
                              ).paddingOnly(bottom: Get.height * 0.02)
                            : const SizedBox(),
                        TextFormFieldCustom(
                          method: TextFieldCustom(
                            hintText: "txtEnterAge".tr,
                            obscureText: false,
                            fieldName: "MobileNumber",
                            textInputType: TextInputType.number,
                            inputFormatters: [LengthLimitingTextInputFormatter(2)],
                            controller: editProfileScreenController.ageEditingController,
                            textInputAction: TextInputAction.next,
                          ),
                          title: "txtAge".tr,
                          borderColor: AppColors.greyColor.withOpacity(0.1),
                          borderWidth: 1,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 14.5,
                          hintTextStyle: FontFamily.sfProDisplayMedium,
                        ),
                        SizedBox(height: Get.height * 0.02),
                        TextFormFieldCustom(
                          method: TextFieldCustom(
                            hintText: "txtEnterBIO".tr,
                            obscureText: false,
                            controller: editProfileScreenController.bioEditingController,
                            textInputAction: TextInputAction.done,
                            maxLine: 4,
                            inputFormatters: [LengthLimitingTextInputFormatter(100)],
                          ),
                          title: "txtBio".tr,
                          borderColor: AppColors.greyColor.withOpacity(0.1),
                          borderWidth: 1,
                          hintTextColor: AppColors.subTitle,
                          hintTextSize: 14.5,
                          hintTextStyle: FontFamily.sfProDisplayMedium,
                        ),
                        SizedBox(height: Get.height * 0.01),
                        SizedBox(
                          height: 50,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            shrinkWrap: true,
                            padding: EdgeInsets.zero,
                            itemCount: genderList.length,
                            itemBuilder: (context, index) {
                              return GetBuilder<EditProfileScreenController>(
                                id: Constant.idEditProfile,
                                builder: (logic) {
                                  return Row(
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
                                                child: logic.checkedValue == index
                                                    ? Image.asset(AppAsset.icRound)
                                                    : const SizedBox(),
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
                                              fontFamily: FontFamily.sfProDisplayMedium),
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
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  static List genderList = [
    {"gender": "txtMale".tr, "id": "1"},
    {"gender": "txtFemale".tr, "id": "2"},
    {"gender": "txtOther".tr, "id": "3"},
  ];
}
