// ignore_for_file: must_be_immutable

import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
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
        backgroundColor: AppColors.bgColor,
        bottomNavigationBar: GetBuilder<EditProfileController>(
          builder: (logic) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              height: 65,
              width: double.infinity,
              child: AppButton(
                buttonColor: AppColors.primaryAppColor,
                buttonText: "txtUpdate".tr,
                fontFamily: FontFamily.sfProDisplay,
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
                                left: Get.width * 0.55,
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
                                          border: Border.all(color: AppColors.whiteColor, width: 1)),
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
                          return TextFormFieldCustom(
                            method: TextFieldCustom(
                              hintText: "txtEnterFirstName".tr,
                              obscureText: false,
                              controller: logic.fNameEditingController,
                              textInputAction: TextInputAction.next,
                              validator: (value) {
                                return logic.fNameEditingController.text.isEmpty ? "First name is required" : null;
                              },
                            ),
                            title: "txtFirstName".tr,
                          );
                        },
                      ),
                      GetBuilder<EditProfileController>(
                        builder: (logic) {
                          return TextFormFieldCustom(
                              method: TextFieldCustom(
                                hintText: "txtEnterLastName".tr,
                                obscureText: false,
                                controller: logic.lNameEditingController,
                                textInputAction: TextInputAction.next,
                                validator: (value) {
                                  return logic.lNameEditingController.text.isEmpty ? "Last name is required" : null;
                                },
                              ),
                              title: "txtLastName".tr);
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
