// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/log_out_dialog.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    final LoginScreenController loginScreenController = Get.put(LoginScreenController());
    log("loginScreenController.emailController.text${loginScreenController.emailController.text}");

    final ProfileScreenController profileScreenController = Get.put(ProfileScreenController());
    log("profileScreenController.bookingIdController.text${profileScreenController.bookingIdController.text}");

    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.find<BottomBarController>().onClick(0);
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.whiteColor,
        body: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: GetBuilder<LoginScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        height: Get.height * 0.17 + statusBarHeight,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppColors.primaryAppColor,
                        ),
                        child: Center(
                          child: Text(
                            "txtProfile".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayBold,
                              fontSize: 20,
                              color: AppColors.whiteColor,
                            ),
                          ).paddingOnly(bottom: 35),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: Get.height * 0.13),
                        child: Center(
                          child: CircleAvatar(
                            radius: 63,
                            backgroundColor: AppColors.whiteColor,
                            child: CircleAvatar(
                              backgroundColor: AppColors.whiteColor,
                              radius: 60,
                              backgroundImage: NetworkImage(Constant.storage.read("hostImage") ??
                                  '${ApiConstant.BASE_URL}static/media/male.459a8699b07b4b9bf3d6.png'),
                            ),
                          ),
                        ),
                      )
                    ],
                  ),
                  SizedBox(height: Get.height * 0.01),
                  Text(
                    "${Constant.storage.read("fName")} ${Constant.storage.read("lName")}",
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 20,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(color: AppColors.idBg, borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                    child: Text(
                      "ID :- ${Constant.storage.read("uniqueID")}",
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo600,
                        fontSize: 15,
                        color: AppColors.primaryAppColor,
                      ),
                    ),
                  ),
                  Divider(color: AppColors.greyColor.withOpacity(0.1)).paddingOnly(top: 10,bottom: 10,left: 15,right: 15),
                  CustomMenu(
                    leadingImage: AppAsset.icProfile,
                    title: "txtMyAccount".tr,
                    subtitle: "txtAccountDetails".tr,
                    onTap: () {
                      Get.toNamed(
                        AppRoutes.editProfile,
                        arguments: logic.loginCategory?.expert,
                      );
                    },
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icWallet,
                    title: "txtWallet".tr,
                    subtitle: "txtOrderAttendance".tr,
                    onTap: () {
                      Get.toNamed(AppRoutes.wallet);
                    },
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icSetting,
                    title: "txtSetting".tr,
                    subtitle: "txtNotificationLanguages".tr,
                    onTap: () {
                      Get.toNamed(AppRoutes.setting);
                    },
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icAboutApp,
                    title: "txtAboutApp".tr,
                    subtitle: "txtPrivacyPolicyTC".tr,
                    onTap: () {
                      Get.toNamed(AppRoutes.aboutApp);
                    },
                  ),
                  CustomMenu(
                    leadingImage: AppAsset.icRaiseComplain,
                    title: "txtComplain".tr,
                    subtitle: "txtComplainComplainHistory".tr,
                    onTap: () {
                      Get.toNamed(AppRoutes.raiseComplain);
                    },
                  ),
                  // CustomMenu(
                  //   leadingImage: AppAsset.icMenu,
                  //   title: "txtOtherInfo".tr,
                  //   subtitle: "${"txtSalonDetails".tr}, ${"txtServicesDetails".tr}",
                  //   onTap: () {
                  //     Get.toNamed(AppRoutes.salonService);
                  //   },
                  // ),
                  CustomMenu(
                    leadingImage: AppAsset.icLogOut,
                    title: "txtLogOut".tr,
                    subtitle: "txtLogOut".tr,
                    onTap: () {
                      Get.dialog(
                        Dialog(
                          backgroundColor: AppColors.transparent,
                          surfaceTintColor: AppColors.transparent,
                          shadowColor: AppColors.transparent,
                          elevation: 0,
                          child: const LogOutDialog(),
                        ),
                      );
                    },
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
