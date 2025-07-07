// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/log_out_dialog.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    final ProfileScreenController profileScreenController = Get.put(ProfileScreenController());
    LoginScreenController loginScreenController = Get.put(LoginScreenController());

    log("loginScreenController.emailController.text${loginScreenController.otpEditingController.text}");

    return WillPopScope(
      onWillPop: () async {
        Get.find<BottomBarController>().onClick(0);
        return false;
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        body: GetBuilder<ProfileScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return ProgressDialog(
              inAsyncCall: logic.isLoading.value,
              child: SingleChildScrollView(
                child: GetBuilder<LoginScreenController>(
                  id: Constant.idBookingAndLogin,
                  builder: (logic) {
                    return Column(
                      children: [
                        logic.isUpdate == false
                            ? Container(
                                height: 95,
                                width: double.infinity,
                                alignment: Alignment.center,
                                color: AppColors.primaryAppColor,
                                child: Text(
                                  "txtProfile".tr,
                                  style: TextStyle(
                                    fontFamily: FontFamily.sfProDisplayBold,
                                    fontSize: 20,
                                    color: AppColors.whiteColor,
                                  ),
                                ).paddingOnly(top: 30),
                              )
                            : const SizedBox(),
                        logic.isUpdate == false
                            ? Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 30),
                                child: userprofile(),
                              )
                            : GetBuilder<ProfileScreenController>(
                                id: Constant.idProgressView,
                                init: ProfileScreenController(),
                                builder: (logicProfile) {
                                  return Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
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
                                                  fontFamily: FontFamily.sfProDisplayBold,
                                                  fontSize: 20,
                                                  color: AppColors.whiteColor,
                                                ),
                                              ).paddingOnly(bottom: 35),
                                            ),
                                          ),
                                          Padding(
                                            padding: EdgeInsets.only(top: Get.height * 0.13),
                                            child: Stack(
                                              children: [
                                                Center(
                                                  child: CircleAvatar(
                                                    radius: 63,
                                                    backgroundColor: AppColors.whiteColor,
                                                    child: Container(
                                                      height: 120,
                                                      width: 120,
                                                      clipBehavior: Clip.hardEdge,
                                                      decoration: BoxDecoration(
                                                        shape: BoxShape.circle,
                                                        color: AppColors.grey.withOpacity(0.2),
                                                      ),
                                                      child: Image.network(
                                                        Constant.storage.read<String>('userImage') ??
                                                            "${ApiConstant.BASE_URL}static/male.png",
                                                        fit: BoxFit.cover,
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
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Positioned(
                                                  top: 88,
                                                  left: Get.width * 0.55,
                                                  child: GestureDetector(
                                                    onTap: () async {
                                                      await logicProfile.onGetUserApiCall();

                                                      if (logicProfile.getUserCategory?.status == true) {
                                                        Constant.storage
                                                            .write('fName', profileScreenController.getUserCategory?.user?.fname);
                                                        Constant.storage
                                                            .write('lName', profileScreenController.getUserCategory?.user?.lname);
                                                        Constant.storage.write('salonRequestSent',
                                                            profileScreenController.getUserCategory?.user?.salonRequestSent);

                                                        Future.delayed(const Duration(milliseconds: 100), () async {
                                                          await Get.put<EditProfileScreenController>(
                                                                  EditProfileScreenController())
                                                              .getDataFromArgs();
                                                          await Get.put<EditProfileScreenController>(
                                                                  EditProfileScreenController())
                                                              .getArgumentsData();
                                                        });

                                                        Get.toNamed(AppRoutes.editProfile, arguments: [
                                                          logicProfile.getUserCategory?.user?.fname,
                                                          logicProfile.getUserCategory?.user?.lname,
                                                          logicProfile.getUserCategory?.user?.email,
                                                          logicProfile.getUserCategory?.user?.mobile,
                                                          logicProfile.getUserCategory?.user?.age ?? 0,
                                                          logicProfile.getUserCategory?.user?.bio,
                                                          logicProfile.getUserCategory?.user?.loginType,
                                                          false
                                                        ]);
                                                      } else {
                                                        Utils.showToast(
                                                            Get.context!, logicProfile.getUserCategory?.message ?? "");
                                                      }
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
                                                          AppAsset.icProfileEdit,
                                                          height: 18,
                                                          width: 18,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                )
                                              ],
                                            ),
                                          )
                                        ],
                                      ),
                                      SizedBox(height: Get.height * 0.01),
                                      Text(
                                        "${Constant.storage.read<String>("fName")} ${Constant.storage.read<String>("lName")}",
                                        style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplayBold,
                                            fontSize: 18,
                                            color: AppColors.primaryTextColor),
                                      ),
                                      Text(
                                        logicProfile.getUserCategory?.user?.loginType == 3
                                            ? logicProfile.getUserCategory?.user?.mobile.toString() ?? ""
                                            : logicProfile.getUserCategory?.user?.email.toString() ?? "",
                                        style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplayRegular, fontSize: 15, color: AppColors.email),
                                      ),
                                      SizedBox(height: Get.height * 0.04),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: logic.isLogIn == true ? editUserprofile() : userprofile(),
                                      )
                                    ],
                                  );
                                },
                              ),
                      ],
                    );
                  },
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  userprofile() {
    return Column(
      children: [
        profileMenu(
          leadingImage: AppAsset.icSetting,
          title: "txtSetting".tr,
          subtitle: "txtAppLanguage".tr,
          onTap: () {
            Get.toNamed(AppRoutes.setting);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icAboutApp,
          title: "txtAboutApp".tr,
          subtitle: "txtRateUs".tr,
          onTap: () {
            Get.toNamed(AppRoutes.aboutApp);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icHelp,
          title: "txtHelp".tr,
          subtitle: "txtPrivacy".tr,
          onTap: () {
            Get.toNamed(AppRoutes.help);
          },
        ),
        GetBuilder<BottomBarController>(
          init: BottomBarController(),
          builder: (controller) {
            return profileMenu(
              leadingImage: AppAsset.icSignIn,
              title: "txtSignIn".tr,
              subtitle: "txtSignInYourAccount".tr,
              onTap: () {
                controller.onClick(1);
              },
            );
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icSalon,
          title: "Salon",
          subtitle: "Register your salon",
          onTap: () {
            Get.toNamed(AppRoutes.salonRegistration);
          },
        ),
      ],
    );
  }

  editUserprofile() {
    return Column(
      children: [
        profileMenu(
          leadingImage: AppAsset.icSetting,
          title: "txtSetting".tr,
          subtitle: "txtAppLanguage".tr,
          onTap: () {
            Get.toNamed(AppRoutes.setting);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icAboutApp,
          title: "txtAboutApp".tr,
          subtitle: "txtRateUs".tr,
          onTap: () {
            Get.toNamed(AppRoutes.aboutApp);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icHelp,
          title: "txtHelp".tr,
          subtitle: "txtPrivacy".tr,
          onTap: () {
            Get.toNamed(AppRoutes.help);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icRaiseComplain,
          title: "txtComplain".tr,
          subtitle: "txtComplainSection".tr,
          onTap: () {
            Get.toNamed(AppRoutes.raiseComplain);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icSalon,
          title: "Salon",
          subtitle: "Register your salon",
          onTap: () {
            Get.toNamed(AppRoutes.salonRegistration);
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icLogOut,
          title: "txtLogOut".tr,
          subtitle: "txtLogOut".tr,
          onTap: () {
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Dialog(
                backgroundColor: AppColors.transparent,
                surfaceTintColor: AppColors.transparent,
                shadowColor: AppColors.transparent,
                elevation: 0,
                child: LogOutDialog(),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget profileMenu({String? leadingImage, title, subtitle, Function()? onTap}) {
    return Column(
      children: [
        InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: onTap,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    height: 45,
                    width: 45,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.roundBg),
                    child: Image.asset(leadingImage!, height: 25, width: 25),
                  ),
                  SizedBox(width: Get.width * 0.04),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 16.5, color: AppColors.primaryTextColor),
                      ),
                      SizedBox(
                        width: Get.width * 0.68,
                        child: Text(
                          subtitle,
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplayMedium,
                            fontSize: 12.5,
                            color: AppColors.subTitle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Image.asset(AppAsset.icArrowRight, height: 20, width: 20).paddingOnly(right: 7),
            ],
          ),
        ),
        SizedBox(height: Get.height * 0.04),
      ],
    );
  }
}
