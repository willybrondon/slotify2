import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/text_field/address_text_field.dart';
import 'package:salon_2/ui/complain_screen/controller/raise_complain_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class RaiseComplainTopView extends StatelessWidget {
  const RaiseComplainTopView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtComplain".tr,
      method: InkWell(
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
  }
}

class RaiseComplainContactView extends StatelessWidget {
  const RaiseComplainContactView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "txtEnterContactDetails".tr,
          style: TextStyle(
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo600,
            fontSize: 17,
          ),
        ).paddingOnly(top: 15, bottom: 15),
        GetBuilder<RaiseComplainController>(
          builder: (logic) {
            return AddressTextField(
              labelText: "txtEnterContactDetails".tr,
              hintText: "txtEnterNumberOrEmail".tr,
              controller: logic.bookingIdController,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return "desPleaseEnterContact".tr;
                }
                return null;
              },
            ).paddingOnly(bottom: 25);
          },
        ),
      ],
    );
  }
}

class RaiseComplainOrSuggestionView extends StatelessWidget {
  const RaiseComplainOrSuggestionView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "txtComplainOrSuggestion".tr,
          style: TextStyle(
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo600,
            fontSize: 17,
          ),
        ).paddingOnly(bottom: 15),
        GetBuilder<RaiseComplainController>(
          builder: (logic) {
            return AddressTextField(
              labelText: "txtEnterComplaint".tr,
              hintText: "txtTypeSomething".tr,
              controller: logic.raiseComplainController,
              maxLines: 5,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return "desPleaseEnterContact".tr;
                }
                return null;
              },
            ).paddingOnly(bottom: 25);
          },
        ),
      ],
    );
  }
}

class RaiseComplainAddImageView extends StatelessWidget {
  const RaiseComplainAddImageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "txtImage".tr,
          style: TextStyle(
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo600,
            fontSize: 17,
          ),
        ).paddingOnly(bottom: 15),
        GetBuilder<RaiseComplainController>(
          id: Constant.idComplainImage,
          builder: (logic) {
            return GestureDetector(
              onTap: () {
                logic.onPickImage();
              },
              child: Image.asset(AppAsset.icBrowse, height: 45).paddingOnly(bottom: 12),
            );
          },
        ),
        GetBuilder<RaiseComplainController>(
          id: Constant.idComplainImage,
          builder: (logic) {
            return logic.selectImageFile != null ? const RaiseComplainShowImageView() : const SizedBox();
          },
        ),
      ],
    );
  }
}

class RaiseComplainShowImageView extends StatelessWidget {
  const RaiseComplainShowImageView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<RaiseComplainController>(
      id: Constant.idComplainImage,
      builder: (logic) {
        return Container(
          height: Get.height * 0.18,
          width: Get.width * 0.36,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            image: DecorationImage(
              image: FileImage(
                File(logic.selectImageFile?.path ?? ""),
              ),
              fit: BoxFit.cover,
            ),
          ),
        ).paddingOnly(top: 15, left: 15);
      },
    );
  }
}

class RaiseComplainBottomView extends StatelessWidget {
  const RaiseComplainBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<RaiseComplainController>(
      builder: (logic) {
        return AppButton(
          height: 55,
          width: Get.width,
          fontFamily: AppFontFamily.sfProDisplayBold,
          fontSize: 20,
          color: AppColors.whiteColor,
          buttonColor: AppColors.primaryAppColor,
          buttonText: "txtSubmit".tr,
          onTap: () async {
            await logic.onRaiseComplainApiCall(
              bookingId: logic.bookingIdController.text,
              details: logic.raiseComplainController.text,
              userId: Constant.storage.read<String>("UserId"),
              selectImageFile: '',
            );

            if (logic.raiseComplainCategory?.status == true) {
              Utils.showToast(Get.context!, logic.raiseComplainCategory?.message ?? "");
              Get.back();
            } else {
              Utils.showToast(Get.context!, logic.raiseComplainCategory?.message ?? "");
            }
          },
        ).paddingOnly(left: 12, right: 12, bottom: 15);
      },
    );
  }
}
