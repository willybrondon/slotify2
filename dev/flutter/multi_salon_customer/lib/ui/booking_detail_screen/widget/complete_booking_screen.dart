// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/review_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class CompleteBookingScreen extends StatelessWidget {
  CompleteBookingScreen({super.key});

  BookingDetailScreenController bookingDetailScreenController = Get.find<BookingDetailScreenController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10),
      child: GetBuilder<BookingDetailScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getComplete.isEmpty
              ? logic.isLoading.value == true
                  ? Shimmers.completeBookingShimmer()
                  : Center(
                      child: Text(
                        "txtNotAvailableComplete".tr,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
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
                        logic.startCompleted = 0;
                        logic.getComplete = [];

                        return logic.onGetAllBookingApiCall(
                          userId: Constant.storage.read<String>('userId') ?? "",
                          status: "completed",
                          start: logic.startCompleted.toString(),
                          limit: logic.limitCompleted.toString(),
                        );
                      },
                      color: AppColors.primaryAppColor,
                      child: Column(
                        children: [
                          Expanded(
                            child: AnimationLimiter(
                              child: ListView.builder(
                                scrollDirection: Axis.vertical,
                                physics: const BouncingScrollPhysics(
                                  parent: AlwaysScrollableScrollPhysics(),
                                ),
                                padding: const EdgeInsets.only(bottom: 40),
                                controller: logic.scrollController2,
                                itemCount: logic.getComplete.length,
                                itemBuilder: (context, index) {
                                  // ---- Show Multiple Name of Service ---- //
                                  List<dynamic>? names = logic.getComplete[index].service?.map((e) => e.name.toString()).toList();

                                  String? result = names?.join(',');

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getComplete.length,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: InkWell(
                                          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                          onTap: () {
                                            Get.toNamed(AppRoutes.bookingInformation, arguments: [logic.getComplete[index].id]);
                                          },
                                          child: Container(
                                            decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(12),
                                                color: AppColors.whiteColor,
                                                border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1)),
                                            child: Stack(
                                              children: [
                                                Align(
                                                  alignment: Alignment.topRight,
                                                  child: GestureDetector(
                                                    onLongPress: () {
                                                      String bookingId = logic.getComplete[index].bookingId ?? "";
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
                                                        color: AppColors.primaryAppColor,
                                                      ),
                                                      child: Text(
                                                        "#${logic.getComplete[index].bookingId}",
                                                        style: TextStyle(
                                                          fontFamily: AppFontFamily.sfProDisplay,
                                                          fontSize: 13,
                                                          color: AppColors.whiteColor,
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
                                                              height: 110,
                                                              width: 110,
                                                              decoration: BoxDecoration(
                                                                borderRadius: BorderRadius.circular(12),
                                                              ),
                                                              child: ClipRRect(
                                                                borderRadius: BorderRadius.circular(12),
                                                                child: CachedNetworkImage(
                                                                  imageUrl: logic.getComplete[index].service?[0].image ?? "",
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
                                                                  width: Get.width * 0.33,
                                                                  child: Text(
                                                                    result ?? "",
                                                                    style: TextStyle(
                                                                        fontFamily: AppFontFamily.sfProDisplay,
                                                                        overflow: TextOverflow.ellipsis,
                                                                        fontSize: 17,
                                                                        color: AppColors.primaryTextColor),
                                                                  ),
                                                                ),
                                                                SizedBox(height: Get.height * 0.005),
                                                                Text(
                                                                  logic.getComplete[index].category?.first.name ?? "",
                                                                  style: TextStyle(
                                                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                                                      fontSize: 16,
                                                                      color: AppColors.service),
                                                                ),
                                                                SizedBox(height: Get.height * 0.005),
                                                                Container(
                                                                  alignment: Alignment.center,
                                                                  decoration: BoxDecoration(
                                                                    borderRadius: BorderRadius.circular(7),
                                                                    color: AppColors.currencyBoxBg,
                                                                  ),
                                                                  child: Padding(
                                                                    padding:
                                                                        const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                                                                    child: Text(
                                                                      "$currency ${logic.getComplete[index].amount?.toStringAsFixed(2)}",
                                                                      style: TextStyle(
                                                                        fontFamily: AppFontFamily.sfProDisplayBold,
                                                                        fontSize: 16,
                                                                        color: AppColors.primaryAppColor,
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
                                                                        "${logic.getComplete[index].expert?.image}",
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
                                                                      "  ${logic.getComplete[index].expert?.fname ?? ""} ${logic.getComplete[index].expert?.lname ?? ""}",
                                                                      style: TextStyle(
                                                                        fontFamily: AppFontFamily.sfProDisplayMedium,
                                                                        fontSize: 11.5,
                                                                        color: AppColors.service,
                                                                      ),
                                                                    ),
                                                                  ],
                                                                )
                                                              ],
                                                            )
                                                          ],
                                                        ),
                                                      ),
                                                      Container(
                                                        decoration: BoxDecoration(
                                                          color: AppColors.bgTime,
                                                          borderRadius: BorderRadius.circular(12),
                                                        ),
                                                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
                                                        child: Row(
                                                          children: [
                                                            Container(
                                                              height: 40,
                                                              width: 40,
                                                              decoration: BoxDecoration(
                                                                shape: BoxShape.circle,
                                                                color: AppColors.bgCircle,
                                                              ),
                                                              child: Image.asset(AppAsset.icBooking).paddingAll(10),
                                                            ).paddingOnly(right: 12),
                                                            Column(
                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                              children: [
                                                                Text(
                                                                  logic.getComplete[index].date.toString(),
                                                                  style: TextStyle(
                                                                    fontFamily: AppFontFamily.heeBo700,
                                                                    fontSize: 14,
                                                                    color: AppColors.primaryTextColor,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  "Booking Date",
                                                                  style: TextStyle(
                                                                    fontFamily: AppFontFamily.heeBo500,
                                                                    fontSize: 12,
                                                                    color: AppColors.service,
                                                                  ),
                                                                )
                                                              ],
                                                            ),
                                                            const Spacer(),
                                                            Container(
                                                              height: 36,
                                                              width: 2,
                                                              color: AppColors.serviceBorder,
                                                            ),
                                                            const Spacer(),
                                                            Container(
                                                              height: 40,
                                                              width: 40,
                                                              decoration: BoxDecoration(
                                                                shape: BoxShape.circle,
                                                                color: AppColors.bgCircle,
                                                              ),
                                                              child: Image.asset(
                                                                AppAsset.icClock,
                                                              ).paddingAll(10),
                                                            ).paddingOnly(right: 12),
                                                            Column(
                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                              children: [
                                                                Text(
                                                                  logic.getComplete[index].time?[0] ?? "",
                                                                  style: TextStyle(
                                                                    fontFamily: AppFontFamily.heeBo700,
                                                                    fontSize: 14,
                                                                    color: AppColors.primaryTextColor,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  "Booking Timing",
                                                                  style: TextStyle(
                                                                    fontFamily: AppFontFamily.heeBo500,
                                                                    fontSize: 12,
                                                                    color: AppColors.service,
                                                                  ),
                                                                )
                                                              ],
                                                            ),
                                                            const Spacer(),
                                                          ],
                                                        ),
                                                      ).paddingOnly(top: 12, left: 12, right: 12),
                                                      SizedBox(height: Get.height * 0.02),
                                                      logic.getComplete[index].isReviewed == true
                                                          ? const SizedBox()
                                                          : GestureDetector(
                                                              onTap: () {
                                                                Get.dialog(
                                                                  Dialog(
                                                                    backgroundColor: AppColors.transparent,
                                                                    child: ReviewDialog(
                                                                      bookingId: logic.getComplete[index].bookingId ?? "",
                                                                    ),
                                                                  ),
                                                                );
                                                              },
                                                              child: Container(
                                                                margin: const EdgeInsets.symmetric(horizontal: 12),
                                                                decoration: BoxDecoration(
                                                                  borderRadius: BorderRadius.circular(44),
                                                                  color: AppColors.greenColor.withOpacity(
                                                                    0.08,
                                                                  ),
                                                                ),
                                                                height: 50,
                                                                width: Get.width,
                                                                child: Center(
                                                                  child: Text(
                                                                    "txtGetReview".tr,
                                                                    style: TextStyle(
                                                                      color: AppColors.primaryAppColor,
                                                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                                                      fontSize: 16,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ),
                                                            ).paddingOnly(bottom: Get.height * 0.02),
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
}
