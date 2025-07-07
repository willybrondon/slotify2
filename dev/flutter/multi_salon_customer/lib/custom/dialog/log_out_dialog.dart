import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/setting/controller/setting_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

class LogOutDialog extends StatelessWidget {
  final SettingController settingController = Get.put(SettingController());
  final SignInController signInController = Get.put(SignInController());
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();

  LogOutDialog({super.key});

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
              borderRadius: BorderRadius.circular(48),
            ),
            child: Column(
              children: [
                Image.asset(
                  AppAsset.icLogo,
                  height: 100,
                  width: 100,
                ).paddingOnly(top: 15, bottom: 35),
                Text(
                  "txtLogOut".tr,
                  style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 24),
                ),
                SizedBox(
                  width: Get.width * 0.6,
                  child: Text(
                    "desLogOut".tr,
                    textAlign: TextAlign.center,
                    style: TextStyle(fontFamily: FontFamily.sfProDisplayRegular, color: AppColors.captionDialog, fontSize: 16),
                  ),
                ),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SizedBox(width: 10),
                    Button(
                      buttonColor: AppColors.whiteColor,
                      buttonText: "txtClose".tr,
                      textColor: AppColors.primaryAppColor,
                      fontStyle: FontFamily.sfProDisplay,
                      fontSize: 16.5,
                      height: 48,
                      width: Get.width * 0.31,
                      onTap: () {
                        Get.back();
                      },
                    ),
                    const Spacer(),
                    Button(
                      buttonColor: AppColors.cancelButton,
                      buttonText: "txtLogOut".tr,
                      textColor: AppColors.whiteColor,
                      fontStyle: FontFamily.sfProDisplay,
                      fontSize: 16.5,
                      height: 48,
                      width: Get.width * 0.31,
                      onTap: () {
                        Constant.storage.erase();
                        signInController.googleSignIn.signOut();

                        logic.isLogIn = false;

                        Get.offAllNamed(AppRoutes.initial);
                      },
                    ),
                    const SizedBox(width: 10),
                  ],
                ).paddingOnly(bottom: 15)
              ],
            ));
      },
    );
  }
}
