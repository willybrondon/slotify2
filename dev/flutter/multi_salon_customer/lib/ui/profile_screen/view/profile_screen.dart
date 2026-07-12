// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/log_out_dialog.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
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

  /// First + last name from storage; if empty, use part before @ from email (guest / minimal profile).
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

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    final loginScreenController = Get.put(LoginScreenController());
    loginScreenController.isLogIn =
        Constant.storage.read<bool>('isLogIn') ?? false;
    loginScreenController.isUpdate =
        Constant.storage.read<bool>('isUpdate') ?? false;

    log("loginScreenController.emailController.text${loginScreenController.otpEditingController.text}");

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
        body: loginScreenController.isLogIn != true
            ? SignInScreen()
            : GetBuilder<ProfileScreenController>(
                id: Constant.idProgressView,
                builder: (logic) {
                  return ProgressDialog(
                    inAsyncCall: logic.isLoading.value,
                    child: SingleChildScrollView(
                      child: GetBuilder<ProfileScreenController>(
                        id: Constant.idProgressView,
                        init: ProfileScreenController(),
                        builder: (logicProfile) {
                          return Column(
                            children: [
                              Stack(
                                children: [
                                  Container(
                                    height: Get.height * 0.17 + statusBarHeight,
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      color: AppColors.whiteColor,
                                    ),
                                    child: Center(
                                      child: Text(
                                        "txtProfile".tr,
                                        style: TextStyle(
                                          fontFamily:
                                              AppFontFamily.sfProDisplayBold,
                                          fontSize: 20,
                                          color: AppColors.blackColor,
                                        ),
                                      ).paddingOnly(bottom: 35),
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.only(
                                        top: Get.height * 0.13),
                                    child: Stack(
                                      children: [
                                        Center(
                                          child: CircleAvatar(
                                            radius: 63,
                                            backgroundColor:
                                                AppColors.whiteColor,
                                            child: Container(
                                              height: 120,
                                              width: 120,
                                              clipBehavior: Clip.hardEdge,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: AppColors.grey
                                                    .withOpacity(0.2),
                                              ),
                                              child: Image.network(
                                                Constant.storage.read<String>(
                                                        'userImage') ??
                                                    "${ApiConstant.BASE_URL}static/male.png",
                                                fit: BoxFit.cover,
                                                errorBuilder: (context, error,
                                                        stackTrace) =>
                                                    Container(
                                                  height: 120,
                                                  width: 120,
                                                  decoration: BoxDecoration(
                                                    shape: BoxShape.circle,
                                                    color: AppColors.grey
                                                        .withOpacity(0.2),
                                                    image:
                                                        const DecorationImage(
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
                                            onTap: () => _openEditProfile(
                                              logicProfile,
                                            ),
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
                                                  color: AppColors
                                                      .primaryAppColor,
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
                                  )
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
                              Text(
                                logicProfile.getUserCategory?.user?.loginType ==
                                        3
                                    ? logicProfile.getUserCategory?.user?.mobile
                                            .toString() ??
                                        ""
                                    : logicProfile.getUserCategory?.user?.email
                                            .toString() ??
                                        "",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo500,
                                  fontSize: 16,
                                  color: AppColors.email,
                                ),
                              ),
                              SizedBox(height: Get.height * 0.04),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12),
                                child: editUserprofile(logicProfile),
                              ),
                              const SizedBox(height: 24),
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

  editUserprofile(ProfileScreenController logicProfile) {
    return Column(
      children: [
        profileMenu(
          leadingImage: AppAsset.icProfile,
          title: "txtMyAccount".tr,
          subtitle: "txtAccountDetails".tr,
          onTap: () => _openEditProfile(logicProfile),
        ),
        GetBuilder<SplashController>(
          id: Constant.idSettingsRefresh,
          builder: (splashLogic) {
            if (splashLogic.settingCategory?.setting?.isWalletPay != true) {
              return const SizedBox.shrink();
            }
            return profileMenu(
              leadingImage: AppAsset.icWallet,
              title: "txtMyWallet".tr,
              subtitle: "txtMyWalletTransactionHistory".tr,
              onTap: () {
                Get.toNamed(AppRoutes.wallet);
              },
            );
          },
        ),
        profileMenu(
          leadingImage: AppAsset.icOrder,
          title: "txtMyOrder".tr,
          subtitle: "txtMyOrderOrderHistory".tr,
          onTap: () {
            Get.toNamed(AppRoutes.order);
          },
        ),
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
          subtitle: "txtPrivacyPolicyTC".tr,
          onTap: () {
            Get.toNamed(AppRoutes.aboutApp);
          },
        ),
        // profileMenu(
        //   leadingImage: AppAsset.icHelp,
        //   title: "txtHelp".tr,
        //   subtitle: "txtPrivacy".tr,
        //   onTap: () {
        //     Get.toNamed(AppRoutes.help);
        //   },
        // ),
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
          title: "txtSalon".tr,
          subtitle: "txtRegisterYourSalon".tr,
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

  Widget profileMenu(
      {String? leadingImage, title, subtitle, Function()? onTap}) {
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
                SizedBox(width: Get.width * 0.04),
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
                    SizedBox(
                      width: Get.width * 0.64,
                      child: Text(
                        subtitle,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 12.5,
                          color: AppColors.profileTitle,
                        ),
                      ),
                    ),
                  ],
                ),
                Image.asset(AppAsset.icArrow, height: 23, width: 23)
                    .paddingOnly(right: 7),
              ],
            ),
          ),
        ),
        SizedBox(height: Get.height * 0.02),
      ],
    );
  }
}
