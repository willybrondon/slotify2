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
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';
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
            title: Constant.storage.read<bool>('isLogIn') == true &&
                    Constant.storage.read<bool>('isUpdate') == false
                ? "txtMakeProfile".tr
                : "txtEditProfile".tr,
            method: Constant.storage.read<bool>('isLogIn') == true &&
                    Constant.storage.read<bool>('isUpdate') == false
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
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          const EditProfileImageView().paddingOnly(bottom: 12, top: 15),
          const EditProfileDataView().paddingAll(15),
          // Add extra padding at bottom to ensure button is visible when scrolling
          SizedBox(height: Get.height * 0.15),
        ],
      ),
    );
  }
}

class EditProfileImageView extends StatelessWidget {
  const EditProfileImageView({super.key});

  @override
  Widget build(BuildContext context) {
    ProfileScreenController profileScreenController =
        Get.find<ProfileScreenController>();

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
                      child: ClipOval(
                        child: logic.profileImage != null
                            ? Image.file(
                                logic.profileImage!,
                                width: 126,
                                height: 126,
                                fit: BoxFit.cover,
                              )
                            : logic.profileImageUrl != null &&
                                    logic.profileImageUrl!.isNotEmpty
                                ? CachedNetworkImage(
                                    imageUrl: logic.profileImageUrl!,
                                    width: 126,
                                    height: 126,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Image.asset(
                                        AppAsset.icImagePlaceholder),
                                    errorWidget: (context, url, error) =>
                                        Image.asset(
                                            AppAsset.icImagePlaceholder),
                                  )
                                : Image.asset(
                                    AppAsset.icImagePlaceholder,
                                    width: 126,
                                    height: 126,
                                    fit: BoxFit.cover,
                                  ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: () {
                      logic.pickImage();
                    },
                    child: Container(
                      height: 40,
                      width: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primaryAppColor,
                      ),
                      child: Icon(
                        Icons.camera_alt,
                        color: AppColors.whiteColor,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class EditProfileDataView extends StatelessWidget {
  const EditProfileDataView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<EditProfileScreenController>(
      id: Constant.idUpdate,
      builder: (logic) {
        return Column(
          children: [
            const EditProfileEditView(),
            const EditProfileGenderView(),
          ],
        );
      },
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
            fontFamily: FontFamily.heeBo700,
            buttonText: "txtUpdateProfile".tr,
            onTap: () async {
              FocusScopeNode currentFocus = FocusScope.of(context);
              if (!currentFocus.hasPrimaryFocus &&
                  currentFocus.focusedChild != null) {
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
