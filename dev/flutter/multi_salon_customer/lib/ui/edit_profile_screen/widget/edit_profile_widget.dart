import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/text_field/address_text_field.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class EditProfileTopBarView extends StatelessWidget {
  const EditProfileTopBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return PreferredSize(
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
                    child: Image.asset(AppAsset.icBackArrow).paddingAll(16),
                  ),
          );
        },
      ),
    );
  }
}

class EditProfileWidgetView extends StatelessWidget {
  const EditProfileWidgetView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const EditProfileImageView().paddingOnly(bottom: 12, top: 15),
        const EditProfileDataView().paddingAll(15),
      ],
    );
  }
}

class EditProfileImageView extends StatelessWidget {
  const EditProfileImageView({super.key});

  @override
  Widget build(BuildContext context) {
    ProfileScreenController profileScreenController = Get.find<ProfileScreenController>();

    return Column(
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
                                profileScreenController.getUserCategory?.user?.image ?? "${ApiConstant.BASE_URL}static/male.png",
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
                  top: 92,
                  left: Get.width * 0.56,
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
      ],
    );
  }
}

class EditProfileDataView extends StatelessWidget {
  const EditProfileDataView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<EditProfileScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Form(
          key: logic.formKey,
          child: Column(
            children: [
              AddressTextField(
                labelText: "txtFirstName".tr,
                controller: logic.fNameEditingController,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "txtEnterFirstName".tr;
                  }
                  return null;
                },
              ).paddingOnly(bottom: 25),
              AddressTextField(
                labelText: "txtLastName".tr,
                controller: logic.lNameEditingController,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "txtEnterLastName".tr;
                  }
                  return null;
                },
              ).paddingOnly(bottom: 25),
              logic.loginType == 1 || logic.loginType == 2
                  ? AddressTextField(
                      labelText: "txtEmail".tr,
                      controller: logic.emailEditingController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return "desEnterEmail".tr;
                        }
                        return null;
                      },
                    ).paddingOnly(bottom: 25)
                  : const SizedBox(),
              logic.loginType == 3
                  ? AddressTextField(
                      labelText: "txtContactNumber".tr,
                      controller: logic.mobileNumberEditingController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return "txtEnterContactNumber".tr;
                        }
                        return null;
                      },
                    ).paddingOnly(bottom: 25)
                  : const SizedBox(),
              const EditProfileGenderView(),
            ],
          ),
        );
      },
    );
  }
}

class EditProfileGenderView extends StatelessWidget {
  const EditProfileGenderView({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
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
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.greyColor2),
                            ),
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
                            child: logic.checkedValue == index ? Image.asset(AppAsset.icRound) : const SizedBox(),
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
                        color: AppColors.appText,
                        fontFamily: AppFontFamily.heeBo500,
                      ),
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
    );
  }
}

class EditProfileEditView extends StatelessWidget {
  const EditProfileEditView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<EditProfileScreenController>(
      id: Constant.idUpdate,
      builder: (logic) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          height: 65,
          width: double.infinity,
          child: AppButton(
            buttonColor: AppColors.primaryAppColor,
            color: AppColors.whiteColor,
            fontSize: 16,
            fontFamily: AppFontFamily.heeBo700,
            buttonText: "txtUpdateProfile".tr,
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
    );
  }
}

List genderList = [
  {"gender": "txtMale".tr, "id": "1"},
  {"gender": "txtFemale".tr, "id": "2"},
  {"gender": "txtOther".tr, "id": "3"},
];
