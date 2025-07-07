// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/order_summary/controller/order_summary_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class CompleteBooking extends StatelessWidget {
  CompleteBooking({super.key});

  OrderSummaryController orderSummaryController = Get.put(OrderSummaryController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
            title: "txtCompleteBooking".tr,
            method: InkWell(
                onTap: () {
                  Get.back();
                },
                child: Icon(
                  Icons.arrow_back,
                  color: AppColors.whiteColor,
                ))),
      ),
      body: RefreshIndicator(
        onRefresh: () => orderSummaryController.getOrderSummary(
            expertId: Constant.storage.read<String>("expertId").toString(), status: "completed",month: orderSummaryController.selectedDate.toString(),),
        color: AppColors.primaryAppColor,
        child: GetBuilder<OrderSummaryController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value == true
                ? Shimmers.completeOrderShimmer()
                : logic.getOrderSummaryData!.bookingStats!.completedBookingsArray!.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Image.asset(AppAsset.icNoService, height: 155, width: 155),
                            Text(
                              "txtNotCompletedOrder".tr,
                              style: TextStyle(
                                  fontFamily: FontFamily.sfProDisplayMedium,
                                  fontSize: 20,
                                  color: AppColors.primaryTextColor),
                            ),
                          ],
                        ),
                      )
                    : Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                        child: GetBuilder<OrderSummaryController>(
                          id: Constant.idOnChangeTabBar,
                          builder: (logic) {
                            return AnimationLimiter(
                              child: ListView.separated(
                                scrollDirection: Axis.vertical,
                                shrinkWrap: true,
                                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                                padding: EdgeInsets.zero,
                                itemCount:
                                    logic.getOrderSummaryData?.bookingStats?.completedBookingsArray?.length ??
                                        0,
                                itemBuilder: (context, index) {
                                  // ---- Show Multiple Name of Service ---- //
                                  List<String>? names = logic.getOrderSummaryData?.bookingStats
                                      ?.completedBookingsArray?[index].services
                                      ?.map((e) => e.name.toString())
                                      .toList();

                                  String? result = names?.join(',');

                                  logic.str = logic.getOrderSummaryData?.bookingStats
                                          ?.completedBookingsArray?[index].analytic
                                          .toString() ??
                                      "";
                                  logic.parts = logic.str?.split(' ');
                                  logic.date = logic.parts?[0];

                                  log("str :: ${logic.str}");
                                  log("parts :: ${logic.parts}");
                                  log("date :: ${logic.date}");

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getOrderSummaryData?.bookingStats
                                            ?.completedBookingsArray?.length ??
                                        0,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: Container(
                                          margin: const EdgeInsets.only(top: 10),
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                              color: AppColors.whiteColor,
                                              borderRadius: BorderRadius.circular(10),
                                              boxShadow: Constant.boxShadow),
                                          child: Stack(
                                            children: [
                                              Align(
                                                alignment: Alignment.topRight,
                                                child: GestureDetector(
                                                  onLongPress: () {
                                                    String bookingId = logic.getOrderSummaryData?.bookingStats
                                                            ?.completedBookingsArray?[index].bookingId ??
                                                        "";
                                                    FlutterClipboard.copy(bookingId);
                                                    Utils.showToast(Get.context!, "Copied $bookingId");
                                                    log("Copy Booking ID :: $bookingId");
                                                  },
                                                  child: Container(
                                                    height: 30,
                                                    width: Get.width * 0.2,
                                                    alignment: Alignment.center,
                                                    decoration: BoxDecoration(
                                                      borderRadius: const BorderRadius.only(
                                                          bottomLeft: Radius.circular(15),
                                                          topRight: Radius.circular(12)),
                                                      color: AppColors.tabUnSelect,
                                                    ),
                                                    child: Text(
                                                      "#${logic.getOrderSummaryData?.bookingStats?.completedBookingsArray?[index].bookingId}",
                                                      style: TextStyle(
                                                        fontSize: 12,
                                                        fontFamily: FontFamily.sfProDisplay,
                                                        color: AppColors.buttonText,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                margin: const EdgeInsets.all(10),
                                                child: Column(
                                                  mainAxisSize: MainAxisSize.max,
                                                  children: [
                                                    Row(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        ClipRRect(
                                                          borderRadius: BorderRadius.circular(12),
                                                          child: Image.network(
                                                            logic
                                                                    .getOrderSummaryData
                                                                    ?.bookingStats
                                                                    ?.completedBookingsArray?[index]
                                                                    .services
                                                                    ?.first
                                                                    .image ??
                                                                "",
                                                            height: 100,
                                                            width: 100,
                                                            fit: BoxFit.cover,
                                                          ),
                                                        ).paddingOnly(right: 10),
                                                        Container(
                                                          height: 100,
                                                          margin: const EdgeInsets.only(bottom: 7),
                                                          child: Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                            children: [
                                                              SizedBox(
                                                                height: 20,
                                                                width: 90,
                                                                child: Text(
                                                                  result ?? "",
                                                                  style: TextStyle(
                                                                      fontSize: 18,
                                                                      overflow: TextOverflow.ellipsis,
                                                                      fontFamily: FontFamily.sfProDisplayBold,
                                                                      color: AppColors.primaryTextColor),
                                                                ),
                                                              ),
                                                              Text(
                                                                logic
                                                                        .getOrderSummaryData
                                                                        ?.bookingStats
                                                                        ?.completedBookingsArray?[index]
                                                                        .category
                                                                        ?.name ??
                                                                    "",
                                                                style: TextStyle(
                                                                    fontSize: 14,
                                                                    fontFamily:
                                                                        FontFamily.sfProDisplayRegular,
                                                                    color: AppColors.service),
                                                              ),
                                                              Container(
                                                                height: 28,
                                                                width: 78,
                                                                decoration: BoxDecoration(
                                                                  borderRadius: BorderRadius.circular(6),
                                                                  color: AppColors.green,
                                                                ),
                                                                child: Center(
                                                                  child: Text(
                                                                    '$currency ${logic.getOrderSummaryData?.bookingStats?.completedBookingsArray?[index].rupee}',
                                                                    style: TextStyle(
                                                                        fontSize: 16,
                                                                        fontFamily:
                                                                            FontFamily.sfProDisplayBold,
                                                                        color: AppColors.currency),
                                                                  ),
                                                                ),
                                                              ),
                                                              Row(
                                                                children: [
                                                                  Container(
                                                                    height: 19,
                                                                    width: 19,
                                                                    decoration: BoxDecoration(
                                                                      image: DecorationImage(
                                                                        image: NetworkImage(logic
                                                                                .getOrderSummaryData
                                                                                ?.bookingStats
                                                                                ?.completedBookingsArray?[
                                                                                    index]
                                                                                .user
                                                                                ?.image ??
                                                                            ""),
                                                                        fit: BoxFit.cover,
                                                                      ),
                                                                      shape: BoxShape.circle,
                                                                    ),
                                                                  ),
                                                                  Text(
                                                                    "  ${logic.getOrderSummaryData?.bookingStats?.completedBookingsArray?[index].user?.fname}  ${logic.getOrderSummaryData?.bookingStats?.completedBookingsArray?[index].user?.lname}",
                                                                    style: TextStyle(
                                                                        fontSize: 12,
                                                                        fontFamily:
                                                                            FontFamily.sfProDisplayMedium,
                                                                        color: AppColors.service),
                                                                  )
                                                                ],
                                                              )
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                                      child: Divider(
                                                          color: AppColors.greyColor.withOpacity(0.2)),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                                      child: Row(
                                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                        children: [
                                                          Row(
                                                            children: [
                                                              Image.asset(AppAsset.icBooking,
                                                                  height: 21, width: 21),
                                                              SizedBox(width: Get.width * 0.02),
                                                              Text(
                                                                logic.date.toString(),
                                                                style: TextStyle(
                                                                  fontFamily: FontFamily.sfProDisplayMedium,
                                                                  fontSize: 13,
                                                                  color: AppColors.service,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                          Row(
                                                            children: [
                                                              Image.asset(AppAsset.icClock,
                                                                  height: 21, width: 21),
                                                              SizedBox(width: Get.width * 0.02),
                                                              Text(
                                                                logic
                                                                        .getOrderSummaryData
                                                                        ?.bookingStats
                                                                        ?.completedBookingsArray?[index]
                                                                        .time?[0] ??
                                                                    "",
                                                                style: TextStyle(
                                                                  fontFamily: FontFamily.sfProDisplayMedium,
                                                                  fontSize: 13,
                                                                  color: AppColors.service,
                                                                ),
                                                              ),
                                                            ],
                                                          )
                                                        ],
                                                      ),
                                                    ),
                                                    Container(
                                                      margin: const EdgeInsets.only(top: 20),
                                                      child: AppButton(
                                                        height: 43,
                                                        width: Get.width,
                                                        buttonColor: AppColors.lightGreenColor,
                                                        buttonText: "txtOrderSuccessfully".tr,
                                                        fontFamily: FontFamily.sfProDisplay,
                                                        fontSize: 15,
                                                        textColor: AppColors.greenColor,
                                                        icon: AppAsset.icOrderConfirm,
                                                        iconColor: AppColors.greenColor,
                                                        onTap: () {},
                                                      ),
                                                    )
                                                  ],
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                                separatorBuilder: (context, position) {
                                  return Container(
                                    height: 10,
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      );
          },
        ),
      ),
    );
  }
}
