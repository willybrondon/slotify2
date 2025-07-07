import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/attendance_dialog.dart';
import 'package:salon_2/custom/dialog/exit_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/revenue_screen/controller/revenue_screen_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class RevenueScreen extends StatefulWidget {
  const RevenueScreen({super.key});

  @override
  State<RevenueScreen> createState() => _RevenueScreenState();
}

class _RevenueScreenState extends State<RevenueScreen> with WidgetsBindingObserver {
  RevenueScreenController revenueScreenController = Get.find<RevenueScreenController>();
  LoginScreenController loginScreenController = Get.put(LoginScreenController());
  BottomBarController bottomBarController = Get.find<BottomBarController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await loginScreenController.onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());
      loginScreenController.getExpertCategory?.data?.showDialog == false ? showDialogIfNeeded() : null;
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
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

    return WillPopScope(
      onWillPop: () async {
        return await Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
            backgroundColor: AppColors.transparent,
            shadowColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            child: const ExitDialog(),
          ),
        );
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
              color: AppColors.primaryAppColor,
              padding: EdgeInsets.only(top: statusBarHeight),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Row(
                  children: [
                    GetBuilder<LoginScreenController>(
                      id: Constant.idProgressView,
                      builder: (logic) {
                        return Container(
                          margin: const EdgeInsets.only(left: 15, right: 10),
                          height: 55,
                          width: 55,
                          decoration: BoxDecoration(
                            border: Border.all(width: 0.8, color: AppColors.whiteColor),
                            shape: BoxShape.circle,
                          ),
                          padding: const EdgeInsets.all(2),
                          child: CircleAvatar(
                            radius: 35,
                            backgroundImage: NetworkImage(
                              Constant.storage.read("hostImage") ??
                                  "${ApiConstant.BASE_URL}static/media/male.459a8699b07b4b9bf3d6.png",
                            ),
                          ),
                        );
                      },
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "${"txtHello".tr}, ${Constant.storage.read<String>('fName').toString()} 👋",
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplayBold,
                            fontSize: 18,
                            color: AppColors.whiteColor,
                          ),
                        ),
                        Text(
                          "txtWelcomeService".tr,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplayRegular,
                            fontSize: 15,
                            color: AppColors.whiteColor,
                          ),
                        ),
                      ],
                    )
                  ],
                ).paddingOnly(bottom: 8)
              ]),
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
                            "txtMyEarning".tr,
                            style: TextStyle(
                              fontFamily: FontFamily.sfProDisplayBold,
                              color: AppColors.primaryTextColor,
                              fontSize: 21.5,
                            ),
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            color: AppColors.whiteColor,
                            border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
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
                                              margin: const EdgeInsets.symmetric(horizontal: 10),
                                              width: Get.width * 0.25,
                                              alignment: Alignment.center,
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(45),
                                                color: logic.selectedIndex == index
                                                    ? AppColors.primaryAppColor
                                                    : AppColors.tabUnSelect,
                                              ),
                                              child: Text(
                                                category[index],
                                                style: TextStyle(
                                                  fontFamily: FontFamily.sfProDisplayMedium,
                                                  fontSize: 15,
                                                  color: logic.selectedIndex == index ? AppColors.whiteColor : AppColors.service,
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
                              GetBuilder<RevenueScreenController>(
                                id: Constant.idMyEarnings,
                                builder: (logic) {
                                  return Container(
                                    margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          "txtMyRevenue".tr,
                                          style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplayMedium,
                                            color: AppColors.title,
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(
                                          height: 5,
                                        ),
                                        logic.isLoading.value == true
                                            ? Shimmers.myRevenueShimmer()
                                            : Text(
                                                "$currency ${logic.getExpertEarningCategory?.bookingStats?.amount?.toStringAsFixed(2)}",
                                                style: TextStyle(
                                                  fontFamily: FontFamily.sfProDisplayBold,
                                                  color: AppColors.primaryAppColor,
                                                  fontSize: 30,
                                                ),
                                              ),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 0),
                                          child: Divider(
                                            color: AppColors.greyColor.withOpacity(0.2),
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            Container(
                                              height: 15,
                                              width: 15,
                                              margin: const EdgeInsets.only(right: 10),
                                              decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.primaryAppColor),
                                            ),
                                            Text(
                                              "txtBookingDetails".tr,
                                              style: TextStyle(
                                                fontFamily: FontFamily.sfProDisplay,
                                                color: AppColors.primaryTextColor,
                                                fontSize: 18,
                                              ),
                                            ),
                                          ],
                                        ),
                                        InkWell(
                                          onTap: () {
                                            Get.find<BottomBarController>().onClick(1);
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(top: 18, right: 5, bottom: 10),
                                            alignment: Alignment.center,
                                            height: 30,
                                            child: logic.isLoading.value == true
                                                ? Shimmers.myRevenueBooking()
                                                : Row(
                                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                    children: [
                                                      Text(
                                                        "txtPendingBooking".tr,
                                                        style: TextStyle(
                                                          fontFamily: FontFamily.sfProDisplayMedium,
                                                          color: AppColors.title,
                                                          fontSize: 16,
                                                        ),
                                                      ),
                                                      const Spacer(),
                                                      Text(
                                                        logic.getExpertEarningCategory?.bookingStats?.pendingBooking.toString() ??
                                                            '',
                                                        style: TextStyle(
                                                          fontFamily: FontFamily.sfProDisplayBold,
                                                          color: AppColors.countBooking,
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
                                          padding: const EdgeInsets.symmetric(horizontal: 0),
                                          child: Divider(color: AppColors.greyColor.withOpacity(0.2)),
                                        ),
                                        InkWell(
                                          onTap: () {
                                            Get.find<BottomBarController>().onClick(1);
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(top: 10, right: 5, bottom: 10),
                                            alignment: Alignment.center,
                                            height: 30,
                                            child: logic.isLoading.value == true
                                                ? Shimmers.myRevenueBooking()
                                                : Row(
                                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                    children: [
                                                      Text(
                                                        "txtCompleteBooking".tr,
                                                        style: TextStyle(
                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                            color: AppColors.title,
                                                            fontSize: 15),
                                                      ),
                                                      const Spacer(),
                                                      Text(
                                                        logic.getExpertEarningCategory?.bookingStats?.completedBooking
                                                                .toString() ??
                                                            '',
                                                        style: TextStyle(
                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                            color: AppColors.countBooking,
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
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 0),
                                          child: Divider(color: AppColors.greyColor.withOpacity(0.2)),
                                        ),
                                        InkWell(
                                          onTap: () {
                                            Get.find<BottomBarController>().onClick(1);
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                                            alignment: Alignment.center,
                                            height: 30,
                                            child: logic.isLoading.value == true
                                                ? Shimmers.myRevenueBooking()
                                                : Row(
                                                    children: [
                                                      Text(
                                                        "txtCancelBooking".tr,
                                                        style: TextStyle(
                                                          fontFamily: FontFamily.sfProDisplayMedium,
                                                          color: AppColors.title,
                                                          fontSize: 15,
                                                        ),
                                                      ),
                                                      const Spacer(),
                                                      Text(
                                                        logic.getExpertEarningCategory?.bookingStats?.cancelBooking.toString() ??
                                                            '',
                                                        style: TextStyle(
                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                            color: AppColors.countBooking,
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

  List category = ["txtToday".tr, "txtYesterday".tr, "txtThisWeek".tr, "txtThisMonth".tr];
}
