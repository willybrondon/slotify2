// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/log_out_dialog.dart';
import 'package:salon_2/custom/profile_menu/profile_menu.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static Future<void> _openEditProfile(
    ProfileScreenController logicProfile,
  ) async {
    await logicProfile.onGetUserApiCall();

    if (logicProfile.getUserCategory?.status == true) {
      Constant.storage.write(
          'fName', logicProfile.getUserCategory?.user?.fname);
      Constant.storage.write(
          'lName', logicProfile.getUserCategory?.user?.lname);
      Constant.storage.write('salonRequestSent',
          logicProfile.getUserCategory?.user?.salonRequestSent);

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
  }

  static String _profileDisplayName(ProfileScreenController logicProfile) {
    final fn = (Constant.storage.read<String>('fName') ?? '').trim();
    final ln = (Constant.storage.read<String>('lName') ?? '').trim();
    final combined = '$fn $ln'.trim();
    if (combined.isNotEmpty) return combined;
    final email = logicProfile.getUserCategory?.user?.email ??
        Constant.storage.read<String>('UserEmail') ??
        '';
    if (email.contains('@')) {
      return email.split('@').first.trim();
    }
    return email.trim().isNotEmpty ? email.trim() : '—';
  }

  static String _profileContact(ProfileScreenController logicProfile) {
    if (logicProfile.getUserCategory?.user?.loginType == 3) {
      return logicProfile.getUserCategory?.user?.mobile?.toString() ?? '';
    }
    return logicProfile.getUserCategory?.user?.email?.toString() ??
        Constant.storage.read<String>('UserEmail') ??
        '';
  }

  @override
  Widget build(BuildContext context) {
    final statusBarHeight = MediaQuery.of(context).padding.top;
    final loginScreenController = Get.put(LoginScreenController());
    final profileScreenController = Get.isRegistered<ProfileScreenController>()
        ? Get.find<ProfileScreenController>()
        : Get.put(ProfileScreenController());

    log("Profile isLogIn :: ${loginScreenController.isLogIn}");

    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.find<BottomBarController>().onClick(0);
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        body: GetBuilder<LoginScreenController>(
          id: Constant.idBookingAndLogin,
          builder: (loginLogic) {
            loginLogic.isLogIn =
                Constant.storage.read<bool>('isLogIn') ?? false;
            loginLogic.isUpdate =
                Constant.storage.read<bool>('isUpdate') ?? false;

            if (loginLogic.isLogIn != true) {
              return SignInScreen();
            }

            return GetBuilder<ProfileScreenController>(
              id: Constant.idProgressView,
              init: profileScreenController,
              builder: (logicProfile) {
                return SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          Container(
                            height: Get.height * 0.17 + statusBarHeight,
                            width: double.infinity,
                            color: AppColors.whiteColor,
                            child: Center(
                              child: Text(
                                "txtProfile".tr,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplayBold,
                                  fontSize: 20,
                                  color: AppColors.blackColor,
                                ),
                              ).paddingOnly(bottom: 35),
                            ),
                          ),
                          Padding(
                            padding:
                                EdgeInsets.only(top: Get.height * 0.13),
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
                                        color:
                                            AppColors.grey.withOpacity(0.2),
                                      ),
                                      child: Image.network(
                                        Constant.storage
                                                .read<String>('userImage') ??
                                            "${ApiConstant.BASE_URL}static/male.png",
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                Container(
                                          height: 120,
                                          width: 120,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: AppColors.grey
                                                .withOpacity(0.2),
                                            image: const DecorationImage(
                                              image: AssetImage(
                                                  AppAsset.imMale),
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
                                    onTap: () =>
                                        _openEditProfile(logicProfile),
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
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Text(
                        _profileDisplayName(logicProfile),
                        style: TextStyle(
                          fontFamily: AppFontFamily.heeBo800,
                          fontSize: 20,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                      if (_profileContact(logicProfile).isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            _profileContact(logicProfile),
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo500,
                              fontSize: 16,
                              color: AppColors.email,
                            ),
                          ),
                        ),
                      Divider(color: AppColors.greyColor.withOpacity(0.1))
                          .paddingOnly(
                              top: 10, bottom: 10, left: 15, right: 15),
                      CustomMenu(
                        leadingImage: AppAsset.icProfile,
                        title: "txtMyAccount".tr,
                        subtitle: "txtAccountDetails".tr,
                        onTap: () => _openEditProfile(logicProfile),
                      ),
                      GetBuilder<SplashController>(
                        id: Constant.idSettingsRefresh,
                        builder: (splashLogic) {
                          if (splashLogic.settingCategory?.setting
                                  ?.isWalletPay !=
                              true) {
                            return const SizedBox.shrink();
                          }
                          return CustomMenu(
                            leadingImage: AppAsset.icWallet,
                            title: "txtMyWallet".tr,
                            subtitle: "txtMyWalletTransactionHistory".tr,
                            onTap: () {
                              Get.toNamed(AppRoutes.wallet);
                            },
                          );
                        },
                      ),
                      CustomMenu(
                        leadingImage: AppAsset.icOrder,
                        title: "txtMyOrder".tr,
                        subtitle: "txtMyOrderOrderHistory".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.order);
                        },
                      ),
                      CustomMenu(
                        leadingImage: AppAsset.icSetting,
                        title: "txtSetting".tr,
                        subtitle: "txtAppLanguage".tr,
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
                        subtitle: "txtComplainSection".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.raiseComplain);
                        },
                      ),
                      CustomMenu(
                        leadingImage: AppAsset.icSalon,
                        title: "txtSalon".tr,
                        subtitle: "txtRegisterYourSalon".tr,
                        onTap: () {
                          Get.toNamed(AppRoutes.salonRegistration);
                        },
                      ),
                      CustomMenu(
                        leadingImage: AppAsset.icLogOut,
                        title: "txtLogOut".tr,
                        subtitle: "txtLogOut".tr,
                        onTap: () {
                          Get.dialog(
                            barrierColor:
                                AppColors.blackColor.withOpacity(0.8),
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
                      const SizedBox(height: 24),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
