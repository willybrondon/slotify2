// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/order_summary/controller/order_summary_controller.dart';
import 'package:salon_2/ui/order_summary/widget/cancel_booking.dart';
import 'package:salon_2/ui/order_summary/widget/complete_booking.dart';
import 'package:salon_2/ui/order_summary/widget/pending_booking.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class OrderSummary extends StatelessWidget {
  OrderSummary({super.key});

  var tabs = [
    Tab(text: "txtToday".tr),
    Tab(text: "txtYesterday".tr),
    Tab(text: "txtThisWeek".tr),
    Tab(text: "txtThisMonth".tr),
  ];

  @override
  Widget build(BuildContext context) {
    String currentMonth = DateFormat('yyyy-MM').format(DateTime.now());

    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtOrderSummary".tr,
          method: InkWell(
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
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GetBuilder<OrderSummaryController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "txtOrderDetails".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo800,
                      color: AppColors.primaryTextColor,
                      fontSize: 22,
                    ),
                  ).paddingOnly(bottom: 6),
                  GestureDetector(
                    onTap: () => logic.onClickMonth(),
                    child: Container(
                      height: 35,
                      width: 100,
                      decoration: BoxDecoration(color: AppColors.tabUnSelect, borderRadius: BorderRadius.circular(40)),
                      child: Center(
                        child: Text(
                          logic.selectedDate.toString(),
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            color: AppColors.primaryAppColor,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ).paddingOnly(right: 10),
                  )
                ],
              );
            },
          ),
          GetBuilder<OrderSummaryController>(
            id: Constant.idProgressView,
            builder: (logic) {
              String currentMonth = DateFormat('yyyy-MM').format(DateTime.now());
              log("The current month :: $currentMonth");
              return logic.selectedDate == currentMonth
                  ? TabBar(
                      tabAlignment: TabAlignment.start,
                      controller: logic.tabController,
                      tabs: tabs,
                      labelStyle: const TextStyle(
                        fontSize: 16,
                        fontFamily: AppFontFamily.heeBo500,
                      ),
                      physics: const BouncingScrollPhysics(),
                      indicatorPadding: const EdgeInsets.all(4),
                      indicator: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        color: AppColors.primaryAppColor,
                      ),
                      indicatorSize: TabBarIndicatorSize.tab,
                      labelColor: AppColors.whiteColor,
                      isScrollable: true,
                      unselectedLabelColor: AppColors.service,
                      dividerColor: Colors.transparent,
                      overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                    )
                  : const OrderSummaryTabView();
            },
          ),
          GetBuilder<OrderSummaryController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return logic.selectedDate == currentMonth
                  ? Expanded(
                      child: TabBarView(
                        controller: logic.tabController,
                        physics: const BouncingScrollPhysics(),
                        children: List.generate(4, (index) => const OrderSummaryTabView()),
                      ),
                    )
                  : const SizedBox.shrink();
            },
          )
        ],
      ).paddingOnly(top: 15, left: 15),
    );
  }
}

class OrderSummaryTabView extends StatelessWidget {
  const OrderSummaryTabView({super.key});

  @override
  Widget build(BuildContext context) {
    String currentMonth = DateFormat('yyyy-MM').format(DateTime.now());

    return GetBuilder<OrderSummaryController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? Shimmers.orderSummaryShimmer()
            : Column(
                children: [
                  InkWell(
                    onTap: () {
                      if (logic.selectedDate == currentMonth) {
                        Get.offNamed(AppRoutes.bottom);
                        Get.find<BottomBarController>().onClick(1);
                      } else {
                        Get.to(PendingBooking());
                      }
                    },
                    child: Container(
                      margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                      alignment: Alignment.center,
                      height: 30,
                      child: Row(
                        children: [
                          Text(
                            "txtPendingBooking".tr,
                            style: TextStyle(fontFamily: AppFontFamily.sfProDisplayMedium, color: AppColors.title, fontSize: 15),
                          ),
                          const Spacer(),
                          Text(
                            logic.getOrderSummaryData?.bookingStats?.pendingBooking.toString() ?? "",
                            style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 17),
                          ).paddingOnly(right: Get.width * 0.05),
                          Image.asset(
                            AppAsset.icArrowRight,
                            height: 22,
                            width: 22,
                          )
                        ],
                      ),
                    ),
                  ),
                  Divider(color: AppColors.greyColor.withOpacity(0.1)),
                  InkWell(
                    onTap: () {
                      if (logic.selectedDate == currentMonth) {
                        Get.offNamed(AppRoutes.bottom);
                        Get.find<BottomBarController>().onClick(1);
                      } else {
                        Get.to(CompleteBooking());
                      }
                    },
                    child: Container(
                      margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                      alignment: Alignment.center,
                      height: 30,
                      child: Row(
                        children: [
                          Text(
                            "txtCompleteBooking".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              color: AppColors.title,
                              fontSize: 15,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            logic.getOrderSummaryData?.bookingStats?.completedBooking.toString() ?? "",
                            style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 17),
                          ).paddingOnly(right: Get.width * 0.05),
                          Image.asset(
                            AppAsset.icArrowRight,
                            height: 22,
                            width: 22,
                          )
                        ],
                      ),
                    ),
                  ),
                  Divider(color: AppColors.greyColor.withOpacity(0.1)),
                  InkWell(
                    onTap: () {
                      if (logic.selectedDate == currentMonth) {
                        Get.offNamed(AppRoutes.bottom);
                        Get.find<BottomBarController>().onClick(1);
                      } else {
                        Get.to(CancelBooking());
                      }
                    },
                    child: Container(
                      margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                      alignment: Alignment.center,
                      height: 30,
                      child: Row(
                        children: [
                          Text(
                            "txtCancelBooking".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              color: AppColors.title,
                              fontSize: 15,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            logic.getOrderSummaryData?.bookingStats?.cancelBooking.toString() ?? "",
                            style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 17),
                          ).paddingOnly(right: Get.width * 0.05),
                          Image.asset(
                            AppAsset.icArrowRight,
                            height: 22,
                            width: 22,
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ).paddingOnly(top: 10, right: 15);
      },
    );
  }
}
