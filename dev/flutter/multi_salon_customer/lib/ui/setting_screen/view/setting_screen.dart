import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/delete_account_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/setting_screen/controller/setting_controller.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class SettingScreen extends StatelessWidget {
  const SettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtSetting".tr,
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
        ),
      ),
      body: GetBuilder<LoginScreenController>(
        id: Constant.idBookingAndLogin,
        builder: (logic) {
          return logic.isLogIn != true
              ? Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  child: Column(
                    children: [
                      settingMenu(
                        leadingImage: AppAsset.icLanguage,
                        title: "txtLanguage".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.language);
                        },
                      ),
                    ],
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  child: Column(
                    children: [
                      settingMenu(
                        leadingImage: AppAsset.icNotifications,
                        title: "txtNotification".tr,
                      ),
                      settingMenu(
                        leadingImage: AppAsset.icLanguage,
                        title: "txtLanguage".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.language);
                        },
                      ),
                      settingMenu(
                        leadingImage: AppAsset.icDeleteAccount,
                        title: "txtDeleteAccount".tr,
                        onTap: () {
                          Get.dialog(
                            barrierColor: AppColors.blackColor.withOpacity(0.8),
                            Dialog(
                              backgroundColor: AppColors.transparent,
                              surfaceTintColor: AppColors.transparent,
                              shadowColor: AppColors.transparent,
                              elevation: 0,
                              child: DeleteAccountDialog(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                );
        },
      ),
    );
  }

  settingMenu({String? leadingImage, title, Function()? onTap}) {
    return Column(
      children: [
        InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.grey.withOpacity(0.1),
                width: 1,
              ),
            ),
            padding: const EdgeInsets.all(8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 50,
                      width: 50,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: AppColors.profileIconBg,
                      ),
                      child: Image.asset(leadingImage!, height: 27, width: 27),
                    ),
                    SizedBox(width: Get.width * 0.05),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 16.5,
                            color: AppColors.appText,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                title == "txtDeleteAccount".tr
                    ? const SizedBox()
                    : title == "txtNotification".tr
                        ? GetBuilder<SettingController>(
                            id: Constant.idSwitchOn,
                            builder: (logic) {
                              return SizedBox(
                                height: 30,
                                child: Switch(
                                  value: logic.isSwitchOn ?? true,
                                  activeColor: AppColors.greenColor,
                                  activeTrackColor: AppColors.whiteColor,
                                  inactiveThumbColor: AppColors.redText,
                                  inactiveTrackColor: AppColors.whiteColor,
                                  trackOutlineColor: WidgetStatePropertyAll(AppColors.grey.withOpacity(0.15)),
                                  trackColor: WidgetStatePropertyAll(AppColors.switchBox),
                                  onChanged: (value) {
                                    logic.onSwitch(value);
                                  },
                                ),
                              );
                            },
                          )
                        : Image.asset(AppAsset.icArrowRight, height: 22, width: 22),
              ],
            ),
          ),
        ),
        SizedBox(height: Get.height * 0.02),
      ],
    );
  }
}
