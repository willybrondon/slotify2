// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/dialog/cancel_appointement_dialog.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class PendingBookingScreen extends StatelessWidget {
  PendingBookingScreen({super.key});

  BookingDetailScreenController bookingDetailScreenController = Get.find<BookingDetailScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10),
      child: GetBuilder<BookingDetailScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getPending.isEmpty
              ? logic.isLoading.value
                  ? Shimmers.pendingBookingShimmer()
                  : Center(
                      child: Text(
                        "txtNotAvailablePending".tr,
                        style: TextStyle(
                          fontFamily: FontFamily.sfProDisplayMedium,
                          fontSize: 17,
                          color: AppColors.primaryTextColor,
                        ),
                      ),
                    )
              : GetBuilder<BookingDetailScreenController>(
                  id: Constant.idProgressView,
                  builder: (logic) {
                    return RefreshIndicator(
                      onRefresh: () {
                        logic.startPending = 0;
                        logic.getPending = [];

                        return logic.onGetAllBookingApiCall(
                          userId: Constant.storage.read<String>('UserId') ?? "",
                          status: "pending",
                          start: logic.startPending.toString(),
                          limit: logic.limitPending.toString(),
                        );
                      },
                      color: AppColors.primaryAppColor,
                      child: Column(
                        children: [
                          Expanded(
                            child: AnimationLimiter(
                              child: ListView.builder(
                                scrollDirection: Axis.vertical,
                                physics: const BouncingScrollPhysics(),
                                controller: logic.scrollController,
                                padding: const EdgeInsets.only(bottom: 40),
                                itemCount: logic.getPending.length,
                                itemBuilder: (context, index) {
                                  // ---- Show Multiple Name of Service ---- //
                                  List<dynamic>? names = logic.getPending[index].service?.map((e) => e.name.toString()).toList();

                                  String? result = names?.join(',');

                                  // ---- Disable cancel Appointment Button ---- //
                                  String date = logic.getPending[index].date ?? "";
                                  String time = logic.getPending[index].time?[0] ?? "";
                                  DateTime bookingDateTime = parseDateTime(date, time);
                                  bool isBookingTimeInPast = bookingDateTime.isBefore(DateTime.now());

                                  log("Get All Booking Category data length :: ${logic.getPending.length}");

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getPending.length,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: InkWell(
                                          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                          onTap: () {
                                            Get.toNamed(AppRoutes.bookingInformation, arguments: [logic.getPending[index].id]);
                                          },
                                          child: Container(
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(16),
                                              color: AppColors.whiteColor,
                                              border: Border.all(
                                                color: AppColors.grey.withOpacity(0.1),
                                                width: 1,
                                              ),
                                            ),
                                            margin: const EdgeInsets.only(bottom: 10),
                                            child: Stack(
                                              children: [
                                                Align(
                                                  alignment: Alignment.topRight,
                                                  child: GestureDetector(
                                                    onLongPress: () {
                                                      String bookingId = logic.getPending[index].bookingId ?? "";
                                                      FlutterClipboard.copy(bookingId);
                                                      log("Copy Booking ID :: $bookingId");
                                                      Utils.showToast(Get.context!, "Copied $bookingId");
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
                                                        overflow: TextOverflow.ellipsis,
                                                        style: TextStyle(
                                                          fontFamily: FontFamily.sfProDisplay,
                                                          fontSize: 12,
                                                          color: AppColors.buttonText,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Container(
                                                  margin: const EdgeInsets.only(top: 10),
                                                  child: Column(
                                                    mainAxisSize: MainAxisSize.max,
                                                    children: [
                                                      Padding(
                                                        padding: const EdgeInsets.symmetric(horizontal: 10),
                                                        child: Row(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            Container(
                                                              height: 100,
                                                              width: 100,
                                                              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                                                              child: ClipRRect(
                                                                borderRadius: BorderRadius.circular(12),
                                                                child: CachedNetworkImage(
                                                                  imageUrl: logic.getPending[index].service?[0].image ?? "",
                                                                  fit: BoxFit.cover,
                                                                  placeholder: (context, url) {
                                                                    return Image.asset(AppAsset.icImagePlaceholder)
                                                                        .paddingAll(10);
                                                                  },
                                                                  errorWidget: (context, url, error) {
                                                                    return Image.asset(AppAsset.icImagePlaceholder)
                                                                        .paddingAll(10);
                                                                  },
                                                                ),
                                                              ),
                                                            ),
                                                            SizedBox(width: Get.width * 0.03),
                                                            Column(
                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                              children: [
                                                                SizedBox(
                                                                  height: 20,
                                                                  width: Get.width * 0.35,
                                                                  child: Text(
                                                                    result ?? "",
                                                                    style: TextStyle(
                                                                        fontFamily: FontFamily.sfProDisplay,
                                                                        fontSize: 17,
                                                                        overflow: TextOverflow.ellipsis,
                                                                        color: AppColors.primaryTextColor),
                                                                  ),
                                                                ),
                                                                SizedBox(height: Get.height * 0.005),
                                                                Text(
                                                                  logic.getPending[index].category?.first.name ?? "",
                                                                  style: TextStyle(
                                                                      fontFamily: FontFamily.sfProDisplayMedium,
                                                                      fontSize: 14,
                                                                      color: AppColors.service),
                                                                ),
                                                                SizedBox(height: Get.height * 0.005),
                                                                Container(
                                                                  alignment: Alignment.center,
                                                                  decoration: BoxDecoration(
                                                                    borderRadius: BorderRadius.circular(7),
                                                                    color: AppColors.green2,
                                                                  ),
                                                                  child: Padding(
                                                                    padding:
                                                                        const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                                                                    child: Text(
                                                                      "$currency ${logic.getPending[index].amount?.toStringAsFixed(2)}",
                                                                      style: TextStyle(
                                                                        fontFamily: FontFamily.sfProDisplayBold,
                                                                        fontSize: 16,
                                                                        color: AppColors.currency,
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ).paddingOnly(bottom: 2),
                                                                SizedBox(height: Get.height * 0.005),
                                                                Row(
                                                                  children: [
                                                                    Container(
                                                                      height: 18,
                                                                      width: 18,
                                                                      decoration: BoxDecoration(
                                                                        color: AppColors.grey.withOpacity(0.2),
                                                                        shape: BoxShape.circle,
                                                                      ),
                                                                      clipBehavior: Clip.hardEdge,
                                                                      child: Image.network(
                                                                        "${logic.getPending[index].expert?.image}",
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
                                                                      "  ${logic.getPending[index].expert?.fname ?? ""} ${logic.getPending[index].expert?.lname ?? ""}",
                                                                      style: TextStyle(
                                                                        fontFamily: FontFamily.sfProDisplayMedium,
                                                                        fontSize: 11.5,
                                                                        color: AppColors.service,
                                                                      ),
                                                                    ),
                                                                    logic.getPending[index].status == "confirm"
                                                                        ? Row(
                                                                            children: [
                                                                              Container(
                                                                                height: 10,
                                                                                width: 10,
                                                                                margin: const EdgeInsets.only(right: 4, left: 10),
                                                                                decoration: BoxDecoration(
                                                                                  shape: BoxShape.circle,
                                                                                  color: AppColors.greenColor,
                                                                                ),
                                                                              ),
                                                                              Text(
                                                                                'Work in Progress',
                                                                                style: TextStyle(
                                                                                    fontSize: 11,
                                                                                    fontFamily: FontFamily.sfProDisplayMedium,
                                                                                    color: AppColors.greenColor),
                                                                              ),
                                                                            ],
                                                                          )
                                                                        : const SizedBox(),
                                                                  ],
                                                                )
                                                              ],
                                                            )
                                                          ],
                                                        ),
                                                      ),
                                                      SizedBox(height: Get.height * 0.01),
                                                      Padding(
                                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                                        child: Divider(color: AppColors.greyColor.withOpacity(0.1)),
                                                      ),
                                                      SizedBox(height: Get.height * 0.01),
                                                      Padding(
                                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                                        child: Row(
                                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                          children: [
                                                            Row(
                                                              children: [
                                                                Image.asset(AppAsset.icCalendar, height: 21, width: 21),
                                                                SizedBox(width: Get.width * 0.02),
                                                                Text(
                                                                  logic.getPending[index].date.toString(),
                                                                  style: TextStyle(
                                                                    fontFamily: FontFamily.sfProDisplayMedium,
                                                                    fontSize: 12.5,
                                                                    color: AppColors.service,
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                            Row(
                                                              children: [
                                                                Image.asset(AppAsset.icClock, height: 20, width: 20),
                                                                SizedBox(width: Get.width * 0.02),
                                                                Text(
                                                                  logic.getPending[index].time?[0] ?? "",
                                                                  style: TextStyle(
                                                                    fontFamily: FontFamily.sfProDisplayMedium,
                                                                    fontSize: 12.5,
                                                                    color: AppColors.service,
                                                                  ),
                                                                ),
                                                              ],
                                                            )
                                                          ],
                                                        ),
                                                      ),
                                                      SizedBox(height: Get.height * 0.02),
                                                      logic.getPending[index].status == "pending"
                                                          ? GestureDetector(
                                                              onTap: isBookingTimeInPast
                                                                  ? null
                                                                  : () {
                                                                      Get.dialog(
                                                                        barrierColor: AppColors.blackColor.withOpacity(0.8),
                                                                        ProgressDialog(
                                                                          inAsyncCall: logic.isLoading1.value,
                                                                          child: Dialog(
                                                                            backgroundColor: AppColors.transparent,
                                                                            child: CancelAppointmentDialog(
                                                                              index: index,
                                                                              bookingId: logic.getPending[index].id ?? "",
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      );
                                                                      Constant.storage
                                                                          .write('bookingId', logic.getPending[index].id);
                                                                    },
                                                              child: Container(
                                                                decoration: BoxDecoration(
                                                                  borderRadius: BorderRadius.circular(50),
                                                                  color: isBookingTimeInPast
                                                                      ? AppColors.primaryAppColor.withOpacity(0.1)
                                                                      : AppColors.red,
                                                                ),
                                                                margin: const EdgeInsets.only(bottom: 13, left: 10, right: 10),
                                                                height: 48,
                                                                width: Get.width,
                                                                child: Center(
                                                                  child: isBookingTimeInPast
                                                                      ? Text(
                                                                          "txtCanNotCancel".tr,
                                                                          style: TextStyle(
                                                                            color: AppColors.greyColor,
                                                                            fontFamily: FontFamily.sfProDisplayMedium,
                                                                            fontSize: 16,
                                                                          ),
                                                                        )
                                                                      : Text(
                                                                          "txtCancelAppointment".tr,
                                                                          style: TextStyle(
                                                                            color: AppColors.redColor,
                                                                            fontFamily: FontFamily.sfProDisplay,
                                                                            fontSize: 15,
                                                                          ),
                                                                        ),
                                                                ),
                                                              ),
                                                            )
                                                          : const SizedBox(),
                                                    ],
                                                  ),
                                                )
                                              ],
                                            ),
                                          ).paddingAll(10),
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
                      ),
                    );
                  },
                );
        },
      ),
    );
  }

  DateTime parseDateTime(String date, String time) {
    try {
      String dateTimeString = '$date $time';
      return DateFormat("yyyy-MM-dd hh:mm a").parse(dateTimeString);
    } catch (e) {
      log('Error parsing date and time: $e');
      return DateTime.now();
    }
  }
}
