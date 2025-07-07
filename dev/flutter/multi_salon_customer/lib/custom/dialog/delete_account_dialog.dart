import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/setting/controller/setting_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class DeleteAccountDialog extends StatelessWidget {
  final SettingController settingController = Get.find<SettingController>();
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();

  DeleteAccountDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<LoginScreenController>(
      id: Constant.idBookingAndLogin,
      builder: (logic) {
        return Container(
          height: 345,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.dialogBg,
            borderRadius: BorderRadius.circular(45),
          ),
          child: Column(
            children: [
              Image.asset(
                AppAsset.icLogo,
                height: 100,
                width: 100,
              ).paddingOnly(top: 15, bottom: 35),
              Text(
                "txtDeleteAccount".tr,
                style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 24),
              ),
              SizedBox(
                width: Get.width * 0.6,
                child: Text(
                  "desDeletedPermanently".tr,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayRegular,
                    color: AppColors.captionDialog,
                    fontSize: 13,
                  ),
                ),
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 10),
                  Button(
                    buttonColor: AppColors.whiteColor,
                    buttonText: "txtCancel".tr,
                    textColor: AppColors.primaryAppColor,
                    fontStyle: FontFamily.sfProDisplay,
                    fontSize: 16.5,
                    height: 48,
                    width: Get.width * 0.31,
                    borderWidth: 1,
                    borderColor: AppColors.grey.withOpacity(0.08),
                    onTap: () {
                      Get.back();
                    },
                  ),
                  const Spacer(),
                  Button(
                    buttonColor: AppColors.cancelButton,
                    buttonText: "txtDelete".tr,
                    textColor: AppColors.whiteColor,
                    fontStyle: FontFamily.sfProDisplay,
                    fontSize: 16.5,
                    height: 48,
                    width: Get.width * 0.31,
                    onTap: () async {
                      Get.back();
                      await settingController.onDeleteUserApiCall(
                        userId: Constant.storage.read<String>('UserId').toString(),
                      );

                      if (settingController.deleteUserCategory?.status == true) {
                        loginScreenController.verification = false;

                        Constant.storage.erase();

                        logic.isLogIn = false;

                        Get.offAllNamed(AppRoutes.initial);
                      } else {
                        Utils.showToast(Get.context!, settingController.deleteUserCategory?.message ?? "");
                      }
                    },
                  ),
                  const SizedBox(width: 10),
                ],
              ),
              const SizedBox(height: 15)
            ],
          ),
        );
      },
    );
  }
}
