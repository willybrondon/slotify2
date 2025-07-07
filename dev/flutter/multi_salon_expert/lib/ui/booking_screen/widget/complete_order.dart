// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
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

class CompleteOrder extends StatelessWidget {
  CompleteOrder({super.key});

  BookingScreenController bookingScreenController = Get.find<BookingScreenController>();

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () {
        bookingScreenController.startCompleted = 0;
        bookingScreenController.getComplete = [];

        return bookingScreenController.onStatusWiseBookingApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "completed",
          start: bookingScreenController.startCompleted.toString(),
          limit: bookingScreenController.limitCompleted.toString(),
        );
      },
      color: AppColors.primaryAppColor,
      child: GetBuilder<BookingScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getComplete.isEmpty
              ? logic.isLoading.value
                  ? Shimmers.completeOrderShimmer()
                  : Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Image.asset(AppAsset.icNoService, height: 155, width: 155),
                          Text(
                            "txtNotCompletedOrder".tr,
                            style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayMedium, fontSize: 20, color: AppColors.primaryTextColor),
                          ),
                        ],
                      ),
                    )
              : Container(
                  margin: const EdgeInsets.symmetric(horizontal: 10),
                  child: GetBuilder<BookingScreenController>(
                    id: Constant.idOnChangeTabBar,
                    builder: (logic) {
                      return Column(
                        children: [
                          Expanded(
                            child: AnimationLimiter(
                              child: ListView.separated(
                                scrollDirection: Axis.vertical,
                                shrinkWrap: true,
                                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                                padding: EdgeInsets.zero,
                                itemCount: logic.getComplete.length,
                                controller: logic.completedScrollController,
                                itemBuilder: (context, index) {
                                  // ---- Show Multiple Name of Service ---- //
                                  List<String>? names = logic.getComplete[index].service?.map((e) => e.name.toString()).toList();

                                  String? result = names?.join(',');

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getComplete.length,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: InkWell(
                                          overlayColor: MaterialStatePropertyAll(AppColors.transparent),
                                          onTap: () {
                                            Get.toNamed(AppRoutes.bookingInformation, arguments: [logic.getComplete[index].id]);
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(top: 10),
                                            width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: AppColors.whiteColor,
                                              borderRadius: BorderRadius.circular(10),
                                              border: Border.all(
                                                width: 1,
                                                color: AppColors.grey.withOpacity(0.1),
                                              ),
                                            ),
                                            child: Stack(
                                              children: [
                                                Align(
                                                  alignment: Alignment.topRight,
                                                  child: GestureDetector(
                                                    onLongPress: () {
                                                      String bookingId = logic.getComplete[index].bookingId ?? "";
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
                                                        "#${logic.getComplete[index].bookingId}",
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
                                                                imageUrl: logic.getComplete[index].service?.first.image ?? "",
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
                                                                      color: AppColors.primaryTextColor,
                                                                    ),
                                                                  ),
                                                                ),
                                                                Text(
                                                                  logic.getComplete[index].category?.first.name ?? "",
                                                                  style: TextStyle(
                                                                    fontSize: 14,
                                                                    fontFamily: FontFamily.sfProDisplayRegular,
                                                                    color: AppColors.service,
                                                                  ),
                                                                ),
                                                                Container(
                                                                  decoration: BoxDecoration(
                                                                    borderRadius: BorderRadius.circular(6),
                                                                    color: AppColors.green,
                                                                  ),
                                                                  child: Padding(
                                                                    padding:
                                                                        const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                                                    child: Text(
                                                                      '$currency ${logic.getComplete[index].expertEarning?.toStringAsFixed(2)}',
                                                                      style: TextStyle(
                                                                        fontSize: 16,
                                                                        fontFamily: FontFamily.sfProDisplayBold,
                                                                        color: AppColors.currency,
                                                                      ),
                                                                    ),
                                                                  ),
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
                                                                        "${logic.getComplete[index].user?.image}",
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
                                                                      "  ${logic.getComplete[index].user?.fname} ${logic.getComplete[index].user?.lname}",
                                                                      style: TextStyle(
                                                                        fontSize: 12,
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
                                                                SizedBox(width: Get.width * 0.03),
                                                                Text(
                                                                  logic.getComplete[index].date ?? "",
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
                                                                SizedBox(width: Get.width * 0.03),
                                                                Text(
                                                                  logic.getComplete[index].time?.first ?? "",
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
                                                          fontFamily: FontFamily.sfProDisplayBold,
                                                          fontSize: 15,
                                                          textColor: AppColors.greenColor,
                                                          icon: AppAsset.icOrderConfirm,
                                                          iconColor: AppColors.greenColor,
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
                                    ),
                                  );
                                },
                                separatorBuilder: (context, position) {
                                  return Container(
                                    height: 10,
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
                  ),
                );
        },
      ),
    );
  }
}
