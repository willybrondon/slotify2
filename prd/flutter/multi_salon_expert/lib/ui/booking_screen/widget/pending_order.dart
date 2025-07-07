// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/cancel_order_dialog.dart';
import 'package:salon_2/custom/dialog/check_in_dialog.dart';
import 'package:salon_2/custom/dialog/check_out_dialog.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class PendingOrder extends StatelessWidget {
  PendingOrder({super.key});

  BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () {
        bookingScreenController.startPending = 0;
        bookingScreenController.getPending = [];

        return bookingScreenController.onStatusWiseBookingApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "pending",
          start: bookingScreenController.startPending.toString(),
          limit: bookingScreenController.limitPending.toString(),
        );
      },
      color: AppColors.primaryAppColor,
      child: GetBuilder<BookingScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getPending.isEmpty
              ? logic.isLoading.value
                  ? Shimmers.pendingOrderShimmer()
                  : Center(
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
              : GetBuilder<BookingScreenController>(
                  id: Constant.idOnChangeTabBar,
                  builder: (logic) {
                    return Column(
                      children: [
                        Expanded(
                          child: AnimationLimiter(
                            child: ListView.builder(
                              padding: EdgeInsets.zero,
                              itemCount: logic.getPending.length,
                              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                              controller: logic.pendingScrollController,
                              itemBuilder: (context, index) {
                                // ---- Show Multiple Name of Service ---- //
                                List<String>? names = logic.getPending[index].service?.map((e) => e.name.toString()).toList();

                                String? result = names?.join(',');

                                return AnimationConfiguration.staggeredGrid(
                                  position: index,
                                  duration: const Duration(milliseconds: 800),
                                  columnCount: logic.getPending.length,
                                  child: SlideAnimation(
                                    child: FadeInAnimation(
                                      child: InkWell(
                                        overlayColor: MaterialStatePropertyAll(AppColors.transparent),
                                        onTap: () {
                                          Get.toNamed(AppRoutes.bookingInformation, arguments: [logic.getPending[index].id]);
                                        },
                                        child: Container(
                                          margin: const EdgeInsets.only(top: 10),
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color: AppColors.whiteColor,
                                            borderRadius: BorderRadius.circular(16),
                                            border: Border.all(
                                              color: AppColors.grey.withOpacity(0.1),
                                              width: 1,
                                            ),
                                          ),
                                          child: Stack(
                                            children: [
                                              Align(
                                                alignment: Alignment.topRight,
                                                child: GestureDetector(
                                                  onLongPress: () {
                                                    String bookingId = logic.getPending[index].bookingId ?? "";
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
                                                        topRight: Radius.circular(12),
                                                      ),
                                                      color: AppColors.tabUnSelect,
                                                    ),
                                                    child: Text(
                                                      "#${logic.getPending[index].bookingId}",
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
                                                        Container(
                                                          height: 100,
                                                          width: 100,
                                                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                                                          margin: const EdgeInsets.only(right: 10),
                                                          child: ClipRRect(
                                                            borderRadius: BorderRadius.circular(12),
                                                            child: CachedNetworkImage(
                                                              imageUrl: logic.getPending[index].service?.first.image ?? "",
                                                              fit: BoxFit.cover,
                                                              placeholder: (context, url) {
                                                                return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                                                              },
                                                              errorWidget: (context, url, error) {
                                                                return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                                                              },
                                                            ),
                                                          ),
                                                        ),
                                                        Container(
                                                          height: 105,
                                                          margin: const EdgeInsets.only(bottom: 7),
                                                          child: Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                            children: [
                                                              SizedBox(
                                                                width: Get.width * 0.43,
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
                                                                logic.getPending[index].category?.first.name ?? "",
                                                                style: TextStyle(
                                                                    fontSize: 14,
                                                                    fontFamily: FontFamily.sfProDisplayRegular,
                                                                    color: AppColors.service),
                                                              ),
                                                              Row(
                                                                children: [
                                                                  Container(
                                                                    decoration: BoxDecoration(
                                                                      borderRadius: BorderRadius.circular(6),
                                                                      color: AppColors.green,
                                                                    ),
                                                                    child: Padding(
                                                                      padding:
                                                                          const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                                                      child: Text(
                                                                        '$currency ${logic.getPending[index].expertEarning?.toStringAsFixed(2)}',
                                                                        style: TextStyle(
                                                                          fontSize: 16,
                                                                          fontFamily: FontFamily.sfProDisplayBold,
                                                                          color: AppColors.currency,
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  logic.getPending[index].paymentType == 'cashAfterService'
                                                                      ? Image.asset(AppAsset.icPoint, height: 16, width: 16)
                                                                          .paddingOnly(left: 5, right: 5)
                                                                      : const SizedBox.shrink(),
                                                                  logic.getPending[index].paymentType == 'cashAfterService'
                                                                      ? Text(
                                                                          "Cash After Service",
                                                                          style: TextStyle(
                                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                                            fontSize: 13,
                                                                            color: AppColors.greenColor,
                                                                          ),
                                                                        )
                                                                      : const SizedBox.shrink()
                                                                ],
                                                              ),
                                                              Row(
                                                                children: [
                                                                  Container(
                                                                    height: 19,
                                                                    width: 19,
                                                                    decoration: BoxDecoration(
                                                                      color: AppColors.grey.withOpacity(0.2),
                                                                      shape: BoxShape.circle,
                                                                    ),
                                                                    clipBehavior: Clip.hardEdge,
                                                                    child: Image.network(
                                                                      "${logic.getPending[index].user?.image}",
                                                                      fit: BoxFit.cover,
                                                                      errorBuilder: (context, error, stackTrace) {
                                                                        return Icon(
                                                                          Icons.error_outline,
                                                                          color: AppColors.blackColor,
                                                                          size: 10,
                                                                        );
                                                                      },
                                                                    ),
                                                                  ),
                                                                  Text(
                                                                    "  ${logic.getPending[index].user?.fname} ${logic.getPending[index].user?.lname}",
                                                                    style: TextStyle(
                                                                      fontSize: 11,
                                                                      fontFamily: FontFamily.sfProDisplayMedium,
                                                                      color: AppColors.service,
                                                                    ),
                                                                  )
                                                                ],
                                                              )
                                                            ],
                                                          ),
                                                        )
                                                      ],
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                                      child: Divider(
                                                        color: AppColors.greyColor.withOpacity(0.15),
                                                      ),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                                      child: Row(
                                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                        children: [
                                                          Row(
                                                            children: [
                                                              Image.asset(AppAsset.icBooking, height: 20, width: 20),
                                                              SizedBox(width: Get.width * 0.015),
                                                              Text(
                                                                logic.getPending[index].date ?? "",
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
                                                              Image.asset(AppAsset.icClock, height: 20, width: 20),
                                                              SizedBox(width: Get.width * 0.015),
                                                              Text(
                                                                logic.getPending[index].time?[0] ?? "",
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
                                                          child: logic.getPending[index].status == "confirm"
                                                              ? Row(
                                                                  children: [
                                                                    Expanded(
                                                                      child: GetBuilder<BookingScreenController>(
                                                                        id: Constant.idCheckIn,
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 43,
                                                                            buttonColor: AppColors.tabUnSelect,
                                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                                            fontSize: 15,
                                                                            buttonText: "txtCheckIn".tr,
                                                                            icon: AppAsset.icCheckIn,
                                                                            iconColor: AppColors.buttonText,
                                                                            textColor: AppColors.buttonText,
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
                                                                            buttonColor: AppColors.greenColor,
                                                                            textColor: AppColors.whiteColor,
                                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                                            fontSize: 15,
                                                                            buttonText: "txtCheckOut".tr,
                                                                            iconColor: AppColors.whiteColor,
                                                                            onTap: () {
                                                                              Get.dialog(
                                                                                GetBuilder<BookingScreenController>(
                                                                                  id: Constant.idProgressView,
                                                                                  builder: (logic) {
                                                                                    return ProgressDialog(
                                                                                      inAsyncCall: logic.isLoading1.value,
                                                                                      child: Dialog(
                                                                                        backgroundColor: Colors.transparent,
                                                                                        shadowColor: AppColors.transparent,
                                                                                        surfaceTintColor: AppColors.transparent,
                                                                                        child: CheckOutDialog(
                                                                                          id: logic.getPending[index].bookingId ??
                                                                                              "",
                                                                                          bookingId:
                                                                                              logic.getPending[index].id ?? "",
                                                                                          serviceImage: logic.getPending[index]
                                                                                                  .service?.first.image ??
                                                                                              "",
                                                                                          serviceName: logic.getPending[index]
                                                                                                  .service?.first.name ??
                                                                                              "",
                                                                                          subCategoryName: logic.getPending[index]
                                                                                                  .category?.first.name ??
                                                                                              "",
                                                                                          rupee: logic
                                                                                              .getPending[index].withoutTax
                                                                                              .toString(),
                                                                                          expertImage: logic.getPending[index]
                                                                                                  .expert?.image ??
                                                                                              "",
                                                                                          expertName:
                                                                                              "${logic.getPending[index].expert?.fname} ${logic.getPending[index].expert?.lname}",
                                                                                          index: index,
                                                                                          paymentType: logic.getPending[index]
                                                                                                  .paymentType ??
                                                                                              "",
                                                                                          userName:
                                                                                              "${logic.getPending[index].user?.fname} ${logic.getPending[index].user?.lname}",
                                                                                        ),
                                                                                      ),
                                                                                    );
                                                                                  },
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
                                                                            buttonColor: AppColors.greenColor,
                                                                            buttonText: "txtCheckIn".tr,
                                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                                            textColor: AppColors.whiteColor,
                                                                            fontSize: 14,
                                                                            onTap: () {
                                                                              if (logic.getPending[index].status == "confirm") {
                                                                                Utils.showToast(
                                                                                    Get.context!, "txtCheckInAppointment".tr);
                                                                              } else {
                                                                                log("Booking Id :: ${logic.getPending[index].id}");
                                                                                Constant.storage.write(
                                                                                    'bookingId', logic.getPending[index].id);
                                                                                Get.dialog(
                                                                                  GetBuilder<BookingScreenController>(
                                                                                    id: Constant.idProgressView,
                                                                                    builder: (logic) {
                                                                                      return ProgressDialog(
                                                                                        inAsyncCall: logic.isLoading1.value,
                                                                                        child: Dialog(
                                                                                          backgroundColor: Colors.transparent,
                                                                                          shadowColor: AppColors.transparent,
                                                                                          surfaceTintColor: AppColors.transparent,
                                                                                          child: CheckInDialog(
                                                                                            id: logic.getPending[index]
                                                                                                    .bookingId ??
                                                                                                "",
                                                                                            bookingId:
                                                                                                logic.getPending[index].id ?? '',
                                                                                            serviceImage: logic.getPending[index]
                                                                                                    .service?.first.image ??
                                                                                                "",
                                                                                            serviceName: logic.getPending[index]
                                                                                                    .service?.first.name ??
                                                                                                "",
                                                                                            subCategoryName: logic
                                                                                                    .getPending[index]
                                                                                                    .category
                                                                                                    ?.first
                                                                                                    .name ??
                                                                                                "",
                                                                                            rupee: logic
                                                                                                .getPending[index].withoutTax
                                                                                                .toString(),
                                                                                            expertImage: logic.getPending[index]
                                                                                                    .expert?.image ??
                                                                                                "",
                                                                                            expertName:
                                                                                                "${logic.getPending[index].expert?.fname} ${logic.getPending[index].expert?.lname}",
                                                                                            index: index,
                                                                                          ),
                                                                                        ),
                                                                                      );
                                                                                    },
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
                                                                        builder: (logic) {
                                                                          return AppButton(
                                                                            height: 42,
                                                                            textColor: AppColors.redColor,
                                                                            buttonColor: AppColors.lightRedColor,
                                                                            buttonText: "txtCancel".tr,
                                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                                            fontSize: 14,
                                                                            onTap: () {
                                                                              Get.dialog(
                                                                                GetBuilder<BookingScreenController>(
                                                                                  id: Constant.idProgressView,
                                                                                  builder: (logic) {
                                                                                    return ProgressDialog(
                                                                                      inAsyncCall: logic.isLoading1.value,
                                                                                      child: Dialog(
                                                                                        backgroundColor: Colors.transparent,
                                                                                        shadowColor: AppColors.transparent,
                                                                                        surfaceTintColor: AppColors.transparent,
                                                                                        child: CancelOrderDialog(
                                                                                          id: logic.getPending[index].bookingId ??
                                                                                              "",
                                                                                          bookingId:
                                                                                              logic.getPending[index].id ?? "",
                                                                                          serviceImage: logic.getPending[index]
                                                                                                  .service?.first.image ??
                                                                                              "",
                                                                                          serviceName: logic.getPending[index]
                                                                                                  .service?.first.name ??
                                                                                              "",
                                                                                          subCategoryName: logic.getPending[index]
                                                                                                  .category?.first.name ??
                                                                                              "",
                                                                                          rupee: logic
                                                                                              .getPending[index].withoutTax
                                                                                              .toString(),
                                                                                          expertImage: logic.getPending[index]
                                                                                                  .expert?.image ??
                                                                                              "",
                                                                                          expertName:
                                                                                              "${logic.getPending[index].expert?.fname} ${logic.getPending[index].expert?.lname}",
                                                                                          index: index,
                                                                                        ),
                                                                                      ),
                                                                                    );
                                                                                  },
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
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        logic.isLoading.value == true
                            ? CircularProgressIndicator(
                                color: AppColors.primaryAppColor,
                              ).paddingOnly(bottom: 7)
                            : const SizedBox()
                      ],
                    );
                  },
                );
        },
      ),
    );
  }
}
