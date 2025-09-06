import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/custom_title/custom_titles.dart';
import 'package:salon_2/custom/dialog/attendance_dialog.dart';
import 'package:salon_2/custom/dialog/exit_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/revenue_screen/controller/revenue_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class RevenueScreen extends StatefulWidget {
  const RevenueScreen({super.key});

  @override
  State<RevenueScreen> createState() => _RevenueScreenState();
}

class _RevenueScreenState extends State<RevenueScreen>
    with WidgetsBindingObserver {
  RevenueScreenController revenueScreenController =
      Get.find<RevenueScreenController>();
  LoginScreenController loginScreenController =
      Get.put(LoginScreenController());
  BottomBarController bottomBarController = Get.find<BottomBarController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await loginScreenController.onGetExpertApiCall(
            expertId: Constant.storage.read<String>("expertId").toString());

        if (loginScreenController.getExpertCategory?.status == true) {
          earning = loginScreenController.getExpertCategory?.data?.earning
              ?.toStringAsFixed(2);

          loginScreenController.getExpertCategory?.data?.showDialog == false
              ? showDialogIfNeeded()
              : null;
        } else {
          log("Expert API failed in RevenueScreen: ${loginScreenController.getExpertCategory?.message}");
          // Don't logout on API failure, just log the error
          // The user should remain logged in for network issues
        }
      } catch (e) {
        log("Error calling expert API in RevenueScreen: $e");
        // Don't logout on network errors, just log the error
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);

    switch (state) {
      case AppLifecycleState.resumed:
        log("App resumed - user is back to the app");
        // App has come back to the foreground
        // No need to logout or clear session
        break;
      case AppLifecycleState.inactive:
        log("App inactive - user is interacting with another app");
        // App is inactive but still visible
        break;
      case AppLifecycleState.paused:
        log("App paused - app is in background");
        // App is in background but not terminated
        // Keep session active
        break;
      case AppLifecycleState.detached:
        log("App detached - app is being terminated");
        // App is being terminated
        break;
      case AppLifecycleState.hidden:
        log("App hidden - app is hidden");
        // App is hidden
        break;
    }
  }

  void showDialogIfNeeded() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.dialog(
        barrierDismissible: false,
        Dialog(
          backgroundColor: AppColors.transparent,
          shadowColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          child: const AttendanceDialog(),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) async {
        await Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
            backgroundColor: AppColors.transparent,
            shadowColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            child: const ExitDialog(),
          ),
        );
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(100),
          child: AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: AppColors.transparent,
            flexibleSpace: Container(
              height: 90 + statusBarHeight,
              width: double.infinity,
              color: AppColors.whiteColor,
              padding: EdgeInsets.only(top: statusBarHeight),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "SKEDISY",
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo800,
                              fontSize: 23,
                              color: AppColors.blackColor,
                            ),
                          ),
                          Text(
                            Constant.storage.read<String>('fName').toString(),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo400,
                              fontSize: 15,
                              color: AppColors.blackColor,
                            ),
                          ),
                        ],
                      ),
                      // Image.asset(AppAsset.icNotificationFilled, height: 40)
                    ],
                  ).paddingOnly(bottom: 8)
                ],
              ).paddingOnly(left: 18, right: 18),
            ),
          ),
        ),
        backgroundColor: AppColors.backGround,
        body: GetBuilder<RevenueScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RefreshIndicator(
                  onRefresh: () async {
                    log("Enter Refresh Function");
                    await logic.onSelectBooking(logic.selectedIndex);
                  },
                  color: AppColors.primaryAppColor,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(left: 14),
                          child: Text(
                            "txtMyRevenue".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayBold,
                              color: AppColors.primaryTextColor,
                              fontSize: 21.5,
                            ),
                          ),
                        ),
                        GetBuilder<RevenueScreenController>(
                          id: Constant.idRevenueTabBar,
                          builder: (logic) {
                            return Container(
                              margin: const EdgeInsets.symmetric(vertical: 10),
                              height: 40,
                              child: ListView.builder(
                                itemCount: category.length,
                                scrollDirection: Axis.horizontal,
                                shrinkWrap: true,
                                itemBuilder: (context, index) {
                                  return RefreshIndicator(
                                    onRefresh: () {
                                      return logic.onSelectBooking(index);
                                    },
                                    child: InkWell(
                                      onTap: () {
                                        logic.onSelectBooking(index);
                                      },
                                      child: Container(
                                        margin: const EdgeInsets.symmetric(
                                            horizontal: 10),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 8, horizontal: 15),
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          color: logic.selectedIndex == index
                                              ? AppColors.primaryAppColor
                                              : AppColors.tabUnSelect,
                                        ),
                                        child: Text(
                                          category[index],
                                          style: TextStyle(
                                            fontFamily: AppFontFamily.heeBo500,
                                            fontSize: 16,
                                            color: logic.selectedIndex == index
                                                ? AppColors.whiteColor
                                                : AppColors.service,
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            );
                          },
                        ),
                        Divider(color: AppColors.greyColor.withOpacity(0.2)),
                        Container(
                          height: 100,
                          width: Get.width,
                          margin: const EdgeInsets.all(12),
                          padding: const EdgeInsets.all(15),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(15),
                            image: const DecorationImage(
                              image: AssetImage(AppAsset.imWalletBox),
                              fit: BoxFit.cover,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "txtMyBalance".tr,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo500,
                                  fontSize: 16,
                                  color: AppColors.whiteColor,
                                ),
                              ),
                              logic.isLoading.value == true
                                  ? Shimmers.myRevenueShimmer()
                                  : Text(
                                      "$currency ${logic.getExpertEarningCategory?.bookingStats?.amount?.toStringAsFixed(2) ?? ""}",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.heeBo800,
                                        fontSize: 28,
                                        color: AppColors.whiteColor,
                                      ),
                                    ),
                            ],
                          ),
                        ),
                        CustomTitles(title: "txtBookingDetails".tr)
                            .paddingOnly(left: 15),
                        GetBuilder<RevenueScreenController>(
                          id: Constant.idMyEarnings,
                          builder: (logic) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 10, horizontal: 12),
                              margin: const EdgeInsets.all(15),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(22),
                                color: AppColors.whiteColor,
                                boxShadow: Constant.boxShadow,
                                border: Border.all(
                                  color: AppColors.grey.withOpacity(0.15),
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                children: [
                                  InkWell(
                                    onTap: () {
                                      Get.find<BottomBarController>()
                                          .onClick(1);
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(
                                          right: 5, bottom: 10, top: 5),
                                      alignment: Alignment.center,
                                      height: 30,
                                      child: logic.isLoading.value == true
                                          ? Shimmers.myRevenueBooking()
                                          : Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text(
                                                  "txtPendingBooking".tr,
                                                  style: TextStyle(
                                                    fontFamily:
                                                        AppFontFamily.heeBo500,
                                                    color: AppColors.service,
                                                    fontSize: 16,
                                                  ),
                                                ),
                                                const Spacer(),
                                                Text(
                                                  logic
                                                          .getExpertEarningCategory
                                                          ?.bookingStats
                                                          ?.pendingBooking
                                                          .toString() ??
                                                      '',
                                                  style: TextStyle(
                                                    fontFamily:
                                                        AppFontFamily.heeBo700,
                                                    color: AppColors
                                                        .primaryAppColor,
                                                    fontSize: 17,
                                                  ),
                                                ).paddingOnly(right: 20),
                                                Image.asset(
                                                  AppAsset.icArrowRight,
                                                  height: 25,
                                                  width: 25,
                                                )
                                              ],
                                            ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 0),
                                    child: Divider(
                                        color: AppColors.greyColor
                                            .withOpacity(0.2)),
                                  ),
                                  InkWell(
                                    onTap: () {
                                      Get.find<BottomBarController>()
                                          .onClick(1);
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(
                                          top: 10, right: 5, bottom: 10),
                                      alignment: Alignment.center,
                                      height: 30,
                                      child: logic.isLoading.value == true
                                          ? Shimmers.myRevenueBooking()
                                          : Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text(
                                                  "txtCompleteBooking".tr,
                                                  style: TextStyle(
                                                    fontFamily:
                                                        AppFontFamily.heeBo500,
                                                    color: AppColors.service,
                                                    fontSize: 16,
                                                  ),
                                                ),
                                                const Spacer(),
                                                Text(
                                                  logic
                                                          .getExpertEarningCategory
                                                          ?.bookingStats
                                                          ?.completedBooking
                                                          .toString() ??
                                                      '',
                                                  style: TextStyle(
                                                    fontFamily:
                                                        AppFontFamily.heeBo700,
                                                    color: AppColors
                                                        .primaryAppColor,
                                                    fontSize: 17,
                                                  ),
                                                ).paddingOnly(right: 20),
                                                Image.asset(
                                                  AppAsset.icArrowRight,
                                                  height: 25,
                                                  width: 25,
                                                )
                                              ],
                                            ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 0),
                                    child: Divider(
                                        color: AppColors.greyColor
                                            .withOpacity(0.2)),
                                  ),
                                  InkWell(
                                    onTap: () {
                                      Get.find<BottomBarController>()
                                          .onClick(1);
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(
                                          top: 5, right: 5, bottom: 10),
                                      alignment: Alignment.center,
                                      height: 30,
                                      child: logic.isLoading.value == true
                                          ? Shimmers.myRevenueBooking()
                                          : Row(
                                              children: [
                                                Text(
                                                  "txtCancelBooking".tr,
                                                  style: TextStyle(
                                                    fontFamily:
                                                        AppFontFamily.heeBo500,
                                                    color: AppColors.service,
                                                    fontSize: 16,
                                                  ),
                                                ),
                                                const Spacer(),
                                                Text(
                                                  logic
                                                          .getExpertEarningCategory
                                                          ?.bookingStats
                                                          ?.cancelBooking
                                                          .toString() ??
                                                      '',
                                                  style: TextStyle(
                                                      fontFamily: AppFontFamily
                                                          .heeBo700,
                                                      color: AppColors
                                                          .primaryAppColor,
                                                      fontSize: 17),
                                                ).paddingOnly(right: 20),
                                                Image.asset(
                                                  AppAsset.icArrowRight,
                                                  height: 25,
                                                  width: 25,
                                                )
                                              ],
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        )
                      ],
                    ),
                  ),
                )
              ],
            );
          },
        ),
      ),
    );
  }

  List category = [
    "txtToday".tr,
    "txtYesterday".tr,
    "txtThisWeek".tr,
    "txtThisMonth".tr
  ];
}
