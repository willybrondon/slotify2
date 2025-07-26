// ignore_for_file: must_be_immutable

import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/address_text_field.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class EditProfileScreen extends GetView<EditProfileController> {
  EditProfileScreen({super.key});

  EditProfileController editProfileScreenController = Get.find<EditProfileController>();

  final formKey = GlobalKey<FormState>();

  void submit() {
    if (formKey.currentState!.validate()) {
      // editProfileScreenController.onUpdateClick();

      if (Constant.storage.read("uniqueID") == "1858125") {
        Utils.showToast(Get.context!, "txtDoNotPermission".tr);
      } else {
        editProfileScreenController.onUpdateClick();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    log("***********************${Constant.storage.read("hostImage")}");

    return Form(
      key: formKey,
      child: Scaffold(
        backgroundColor: AppColors.whiteColor,
        bottomNavigationBar: GetBuilder<EditProfileController>(
          builder: (logic) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              height: 65,
              width: double.infinity,
              child: AppButton(
                buttonColor: AppColors.primaryAppColor,
                buttonText: "txtUpdate".tr,
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 17.5,
                onTap: () async {
                  submit();
                },
              ),
            ).paddingOnly(bottom: 10);
          },
        ),
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "txtEditProfile".tr,
            method: InkWell(
              onTap: () {
                Get.back();
              },
              child: Icon(
                Icons.arrow_back,
                color: AppColors.whiteColor,
              ),
            ),
          ),
        ),
        body: GetBuilder<EditProfileController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return ProgressDialog(
              inAsyncCall: logic.isLoading.value,
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  child: Column(
                    children: [
                      GetBuilder<EditProfileController>(
                        builder: (logic) {
                          return Stack(
                            children: [
                              Center(
                                child: CircleAvatar(
                                  radius: 63,
                                  backgroundColor: AppColors.whiteColor,
                                  child: CircleAvatar(
                                    backgroundColor: AppColors.whiteColor,
                                    radius: 60,
                                    backgroundImage: logic.image?.path == null
                                        ? NetworkImage(Constant.storage.read("hostImage"))
                                        : FileImage(File(logic.image?.path ?? '')) as ImageProvider<Object>?,
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 88,
                                left: Get.width * 0.52,
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
                                      height: 34,
                                      width: 34,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppColors.primaryAppColor,
                                        border: Border.all(color: AppColors.whiteColor, width: 1),
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
                      GetBuilder<EditProfileController>(
                        builder: (logic) {
                          return  AddressTextField(
                            labelText:  "txtEnterFirstName".tr,
                            controller: logic.fNameEditingController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return "desPleaseEnterFirstName".tr;
                              }
                              return null;
                            },
                          ).paddingOnly(bottom: 25,top: 25);
                        },
                      ),
                      GetBuilder<EditProfileController>(
                        builder: (logic) {
                          return  AddressTextField(
                            labelText: "txtEnterLastName".tr,
                            controller: logic.lNameEditingController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return "desPleaseEnterLastName".tr;
                              }
                              return null;
                            },
                          ).paddingOnly(bottom: 25);
                        },
                      ),
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
