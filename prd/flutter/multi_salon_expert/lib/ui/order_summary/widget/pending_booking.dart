// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/cancel_order_dialog.dart';
import 'package:salon_2/custom/dialog/check_in_dialog.dart';
import 'package:salon_2/custom/dialog/check_out_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/order_summary/controller/order_summary_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class PendingBooking extends StatelessWidget {
  PendingBooking({super.key});

  OrderSummaryController orderSummaryController = Get.put(OrderSummaryController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtPendingBooking".tr,
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
      body: RefreshIndicator(
        onRefresh: () => orderSummaryController.getOrderSummary(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "pending",
          month: orderSummaryController.selectedDate.toString(),
        ),
        color: AppColors.primaryAppColor,
        child: GetBuilder<OrderSummaryController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value == true
                ? Shimmers.pendingOrderShimmer()
                : logic.getOrderSummaryData!.bookingStats!.pendingBookingsArray!.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Image.asset(AppAsset.icNoService, height: 155, width: 155),
                            Text(
                              "txtNotPendingOrder".tr,
                              style: TextStyle(
                                  fontFamily: FontFamily.sfProDisplayMedium, fontSize: 20, color: AppColors.primaryTextColor),
                            ),
                          ],
                        ),
                      )
                    : Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                        child: GetBuilder<OrderSummaryController>(
                          id: Constant.idProgressView,
                          builder: (logic) {
                            return AnimationLimiter(
                              child: ListView.separated(
                                padding: EdgeInsets.zero,
                                itemCount: logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?.length ?? 0,
                                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                                itemBuilder: (context, index) {
                                  // ---- Show Multiple Name of Service ---- //
                                  List<String>? names = logic
                                      .getOrderSummaryData?.bookingStats?.pendingBookingsArray?[index].services
                                      ?.map((e) => e.name.toString())
                                      .toList();

                                  String? result = names?.join(',');

                                  logic.str =
                                      logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?[index].analytic.toString() ??
                                          "";
                                  logic.parts = logic.str?.split(' ');
                                  logic.date = logic.parts?[0];

                                  log("str :: ${logic.str}");
                                  log("parts :: ${logic.parts}");
                                  log("date :: ${logic.date}");

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?.length ?? 0,
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
                                                            ?.pendingBookingsArray?[index].bookingId ??
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
                                                          bottomLeft: Radius.circular(15), topRight: Radius.circular(12)),
                                                      color: AppColors.tabUnSelect,
                                                    ),
                                                    child: Text(
                                                      "#${logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?[index].bookingId}",
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
                                                              logic.getOrderSummaryData?.bookingStats
                                                                      ?.pendingBookingsArray?[index].services?.first.image ??
                                                                  "",
                                                              height: 100,
                                                              width: 100,
                                                              fit: BoxFit.cover),
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
                                                                logic.getOrderSummaryData?.bookingStats
                                                                        ?.pendingBookingsArray?[index].category?.name ??
                                                                    "",
                                                                style: TextStyle(
                                                                    fontSize: 14,
                                                                    fontFamily: FontFamily.sfProDisplayRegular,
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
                                                                    '$currency ${logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?[index].amount}',
                                                                    style: TextStyle(
                                                                        fontSize: 16,
                                                                        fontFamily: FontFamily.sfProDisplayBold,
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
                                                                                ?.pendingBookingsArray?[index]
                                                                                .user
                                                                                ?.image ??
                                                                            ""),
                                                                        fit: BoxFit.cover,
                                                                      ),
                                                                      shape: BoxShape.circle,
                                                                    ),
                                                                  ),
                                                                  Text(
                                                                    "   ${logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?[index].user?.fname}  ${logic.getOrderSummaryData?.bookingStats?.pendingBookingsArray?[index].user?.lname}",
                                                                    style: TextStyle(
                                                                        fontSize: 12,
                                                                        fontFamily: FontFamily.sfProDisplayMedium,
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
                                                      child: Divider(color: AppColors.greyColor.withOpacity(0.3)),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                                      child: Row(
                                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                        children: [
                                                          Row(
                                                            children: [
                                                              Image.asset(AppAsset.icBooking, height: 21, width: 21),
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
                                                              Image.asset(AppAsset.icClock, height: 21, width: 21),
                                                              SizedBox(width: Get.width * 0.02),
                                                              Text(
                                                                logic.getOrderSummaryData?.bookingStats
                                                                        ?.pendingBookingsArray?[index].time?[0] ??
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
                                                    GetBuilder<BookingScreenController>(
                                                      id: Constant.idCheckInUpdate,
                                                      builder: (logic) {
                                                        return Container(
                                                          margin: const EdgeInsets.only(top: 20),
                                                          child: logic.statusWiseBookingCategory?.data?[index].status == "confirm"
                                                              ? Row(
                                                                  children: [
                                                                    Expanded(
                                                                      child: GetBuilder<BookingScreenController>(
                                                                        id: Constant.idCheckIn,
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 43,
                                                                            buttonColor: logic.statusWiseBookingCategory
                                                                                        ?.data?[index].status ==
                                                                                    "confirm"
                                                                                ? AppColors.greenColor
                                                                                : AppColors.tabUnSelect,
                                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                                            fontSize: 15,
                                                                            buttonText: "txtCheckIn".tr,
                                                                            icon: logic.statusWiseBookingCategory?.data?[index]
                                                                                        .status ==
                                                                                    "confirm"
                                                                                ? AppAsset.icCheckIn
                                                                                : null,
                                                                            iconColor: AppColors.whiteColor,
                                                                            textColor: logic.statusWiseBookingCategory
                                                                                        ?.data?[index].status ==
                                                                                    "confirm"
                                                                                ? AppColors.whiteColor
                                                                                : AppColors.tabUnSelect,
                                                                            onTap: () {
                                                                              log("This Appointment Already Check-In");
                                                                              Utils.showToast(
                                                                                  Get.context!, "txtCheckInAppointment".tr);
                                                                            },
                                                                          );
                                                                        },
                                                                      ),
                                                                    ),
                                                                    Expanded(
                                                                      child: GetBuilder<BookingScreenController>(
                                                                        id: Constant.idCheckOut,
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 43,
                                                                            buttonColor: logic.statusWiseBookingCategory
                                                                                        ?.data?[index].status ==
                                                                                    "completed"
                                                                                ? AppColors.greenColor
                                                                                : AppColors.tabUnSelect,
                                                                            textColor: logic.statusWiseBookingCategory
                                                                                        ?.data?[index].status ==
                                                                                    "completed"
                                                                                ? AppColors.whiteColor
                                                                                : AppColors.buttonText,
                                                                            fontFamily: FontFamily.sfProDisplay,
                                                                            fontSize: 15,
                                                                            buttonText: "txtCheckOut".tr,
                                                                            icon: logic.statusWiseBookingCategory?.data?[index]
                                                                                        .status ==
                                                                                    "completed"
                                                                                ? AppAsset.icCheckIn
                                                                                : null,
                                                                            iconColor: AppColors.whiteColor,
                                                                            onTap: () {
                                                                              Get.dialog(
                                                                                Dialog(
                                                                                  backgroundColor: Colors.transparent,
                                                                                  child: CheckOutDialog(
                                                                                    id: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].bookingId ??
                                                                                        "",
                                                                                    bookingId: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].id ??
                                                                                        "",
                                                                                    serviceImage: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].service?.first.image ??
                                                                                        "",
                                                                                    serviceName: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].service?.first.name ??
                                                                                        "",
                                                                                    subCategoryName: logic
                                                                                            .statusWiseBookingCategory
                                                                                            ?.data?[index]
                                                                                            .category
                                                                                            ?.first
                                                                                            .name ??
                                                                                        "",
                                                                                    rupee: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].withoutTax
                                                                                            .toString() ??
                                                                                        "",
                                                                                    expertImage: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].expert?.image ??
                                                                                        "",
                                                                                    expertName:
                                                                                        "${logic.statusWiseBookingCategory?.data?[index].expert?.fname} ${logic.statusWiseBookingCategory?.data?[index].expert?.lname}",
                                                                                    index: index,
                                                                                    paymentType: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].paymentType ??
                                                                                        "",
                                                                                    userName:
                                                                                        "${logic.statusWiseBookingCategory?.data?[index].user?.fname} ${logic.statusWiseBookingCategory?.data?[index].user?.lname}",
                                                                                  ),
                                                                                ),
                                                                              );
                                                                            },
                                                                          );
                                                                        },
                                                                      ),
                                                                    ),
                                                                  ],
                                                                )
                                                              : Row(
                                                                  children: [
                                                                    Expanded(
                                                                      child: GetBuilder<BookingScreenController>(
                                                                        id: Constant.idCheckIn,
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 42,
                                                                            buttonColor: AppColors.tabUnSelect,
                                                                            buttonText: "txtCheckIn".tr,
                                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                                            textColor: AppColors.buttonText,
                                                                            fontSize: 14,
                                                                            icon: logic.statusWiseBookingCategory?.data?[index]
                                                                                        .status ==
                                                                                    "confirm"
                                                                                ? AppAsset.icCheckIn
                                                                                : null,
                                                                            iconColor: AppColors.whiteColor,
                                                                            onTap: () {
                                                                              log("Entering onTap function");
                                                                              if (logic.statusWiseBookingCategory?.data?[index]
                                                                                      .status ==
                                                                                  "confirm") {
                                                                                Utils.showToast(
                                                                                    Get.context!, "txtCheckInAppointment".tr);
                                                                              } else {
                                                                                log("Booking Id :: ${logic.statusWiseBookingCategory?.data?[index].id}");
                                                                                Constant.storage.write(
                                                                                    'bookingId',
                                                                                    logic.statusWiseBookingCategory?.data?[index]
                                                                                        .id);
                                                                                Get.dialog(
                                                                                  Dialog(
                                                                                    backgroundColor: Colors.transparent,
                                                                                    child: CheckInDialog(
                                                                                      id: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].bookingId ??
                                                                                          "",
                                                                                      bookingId: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].id ??
                                                                                          '',
                                                                                      serviceImage: logic
                                                                                              .statusWiseBookingCategory
                                                                                              ?.data?[index]
                                                                                              .service
                                                                                              ?.first
                                                                                              .image ??
                                                                                          "",
                                                                                      serviceName: logic
                                                                                              .statusWiseBookingCategory
                                                                                              ?.data?[index]
                                                                                              .service
                                                                                              ?.first
                                                                                              .name ??
                                                                                          "",
                                                                                      subCategoryName: logic
                                                                                              .statusWiseBookingCategory
                                                                                              ?.data?[index]
                                                                                              .category
                                                                                              ?.first
                                                                                              .name ??
                                                                                          "",
                                                                                      rupee: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].withoutTax
                                                                                              .toString() ??
                                                                                          "",
                                                                                      expertImage: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].expert?.image ??
                                                                                          "",
                                                                                      expertName:
                                                                                          "${logic.statusWiseBookingCategory?.data?[index].expert?.fname} ${logic.statusWiseBookingCategory?.data?[index].expert?.lname}",
                                                                                      index: index,
                                                                                    ),
                                                                                  ),
                                                                                );
                                                                              }
                                                                            },
                                                                          );
                                                                        },
                                                                      ),
                                                                    ),
                                                                    Expanded(
                                                                      child: GetBuilder<BookingScreenController>(
                                                                        id: Constant.idCheckOut,
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 42,
                                                                            buttonColor: logic.statusWiseBookingCategory
                                                                                        ?.data?[index].status ==
                                                                                    "completed"
                                                                                ? AppColors.greenColor
                                                                                : AppColors.tabUnSelect,
                                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                                            fontSize: 14,
                                                                            buttonText: "txtCheckOut".tr,
                                                                            textColor: AppColors.buttonText,
                                                                            icon: logic.statusWiseBookingCategory?.data?[index]
                                                                                        .status ==
                                                                                    "completed"
                                                                                ? AppAsset.icCheckIn
                                                                                : null,
                                                                            iconColor: AppColors.whiteColor,
                                                                            onTap: () {
                                                                              if (logic.statusWiseBookingCategory?.data?[index]
                                                                                      .status ==
                                                                                  "confirm") {
                                                                                Get.dialog(
                                                                                  Dialog(
                                                                                    backgroundColor: Colors.transparent,
                                                                                    child: CheckOutDialog(
                                                                                      id: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].bookingId ??
                                                                                          "",
                                                                                      bookingId: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].id ??
                                                                                          "",
                                                                                      serviceImage: logic
                                                                                              .statusWiseBookingCategory
                                                                                              ?.data?[index]
                                                                                              .service
                                                                                              ?.first
                                                                                              .image ??
                                                                                          "",
                                                                                      serviceName: logic
                                                                                              .statusWiseBookingCategory
                                                                                              ?.data?[index]
                                                                                              .service
                                                                                              ?.first
                                                                                              .name ??
                                                                                          "",
                                                                                      subCategoryName: logic
                                                                                              .statusWiseBookingCategory
                                                                                              ?.data?[index]
                                                                                              .category
                                                                                              ?.first
                                                                                              .name ??
                                                                                          "",
                                                                                      rupee: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].withoutTax
                                                                                              .toString() ??
                                                                                          "",
                                                                                      expertImage: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].expert?.image ??
                                                                                          "",
                                                                                      expertName:
                                                                                          "${logic.statusWiseBookingCategory?.data?[index].expert?.fname} ${logic.statusWiseBookingCategory?.data?[index].expert?.lname}",
                                                                                      index: index,
                                                                                      paymentType: logic.statusWiseBookingCategory
                                                                                              ?.data?[index].paymentType ??
                                                                                          "",
                                                                                      userName:
                                                                                          "${logic.statusWiseBookingCategory?.data?[index].user?.fname} ${logic.statusWiseBookingCategory?.data?[index].user?.lname}",
                                                                                    ),
                                                                                  ),
                                                                                );
                                                                              } else {
                                                                                Utils.showToast(
                                                                                    Get.context!, "txtCheckInFirst".tr);
                                                                              }
                                                                            },
                                                                          );
                                                                        },
                                                                      ),
                                                                    ),
                                                                    Expanded(
                                                                      child: GetBuilder<BookingScreenController>(
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 42,
                                                                            textColor: AppColors.redColor,
                                                                            buttonColor: AppColors.lightRedColor,
                                                                            buttonText: "txtCancel".tr,
                                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                                            fontSize: 14,
                                                                            onTap: () {
                                                                              Get.dialog(
                                                                                Dialog(
                                                                                  backgroundColor: Colors.transparent,
                                                                                  child: CancelOrderDialog(
                                                                                    id: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].bookingId ??
                                                                                        "",
                                                                                    bookingId: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].id ??
                                                                                        "",
                                                                                    serviceImage: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].service?.first.image ??
                                                                                        "",
                                                                                    serviceName: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].service?.first.name ??
                                                                                        "",
                                                                                    subCategoryName: logic
                                                                                            .statusWiseBookingCategory
                                                                                            ?.data?[index]
                                                                                            .category
                                                                                            ?.first
                                                                                            .name ??
                                                                                        "",
                                                                                    rupee: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].withoutTax
                                                                                            .toString() ??
                                                                                        "",
                                                                                    expertImage: logic.statusWiseBookingCategory
                                                                                            ?.data?[index].expert?.image ??
                                                                                        "",
                                                                                    expertName:
                                                                                        "${logic.statusWiseBookingCategory?.data?[index].expert?.fname} ${logic.statusWiseBookingCategory?.data?[index].expert?.lname}",
                                                                                    index: index,
                                                                                  ),
                                                                                ),
                                                                              );
                                                                            },
                                                                          );
                                                                        },
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                        );
                                                      },
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
