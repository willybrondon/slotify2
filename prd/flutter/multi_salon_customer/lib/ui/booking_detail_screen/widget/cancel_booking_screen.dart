import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class CancelBookingScreen extends StatelessWidget {
  const CancelBookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10),
      child: GetBuilder<BookingDetailScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getCancel.isEmpty
              ? logic.isLoading.value
                  ? Shimmers.cancelBookingShimmer()
                  : Center(
                      child: Text(
                        "txtNotAvailableCancel".tr,
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
                        logic.startCancel = 0;
                        logic.getCancel = [];

                        return logic.onGetAllBookingApiCall(
                          userId: Constant.storage.read<String>('UserId') ?? "",
                          status: "cancel",
                          start: logic.startCancel.toString(),
                          limit: logic.limitCancel.toString(),
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
                                padding: const EdgeInsets.only(bottom: 40),
                                controller: logic.scrollController1,
                                itemCount: logic.getCancel.length,
                                itemBuilder: (context, index) {
                                  // ---- Show Multiple Name of Service ---- //
                                  List<dynamic>? names = logic.getCancel[index].service?.map((e) => e.name.toString()).toList();

                                  String? result = names?.join(',');

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getCancel.length,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: InkWell(
                                          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                          onTap: () {
                                            Get.toNamed(AppRoutes.bookingInformation, arguments: [logic.getCancel[index].id]);
                                          },
                                          child: Container(
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(12),
                                              color: AppColors.whiteColor,
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
                                                      String bookingId = logic.getCancel[index].bookingId ?? "";
                                                      FlutterClipboard.copy(bookingId);
                                                      log("Copy Booking ID :: $bookingId");
                                                      Utils.showToast(Get.context!, "Copied $bookingId");
                                                    },
                                                    child: Container(
                                                      height: 28,
                                                      width: Get.width * 0.18,
                                                      alignment: Alignment.center,
                                                      decoration: BoxDecoration(
                                                        borderRadius: const BorderRadius.only(
                                                          bottomLeft: Radius.circular(15),
                                                          topRight: Radius.circular(12),
                                                        ),
                                                        color: AppColors.tabUnSelect,
                                                      ),
                                                      child: Text(
                                                        "#${logic.getCancel[index].bookingId}",
                                                        style: TextStyle(
                                                          fontFamily: FontFamily.sfProDisplay,
                                                          fontSize: 13,
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
                                                              height: 110,
                                                              width: 110,
                                                              decoration: BoxDecoration(
                                                                borderRadius: BorderRadius.circular(12),
                                                              ),
                                                              child: ClipRRect(
                                                                borderRadius: BorderRadius.circular(12),
                                                                child: CachedNetworkImage(
                                                                  imageUrl: logic.getCancel[index].service?[0].image ?? "",
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
                                                                  width: Get.width * 0.32,
                                                                  child: Text(
                                                                    result ?? "",
                                                                    style: TextStyle(
                                                                        fontFamily: FontFamily.sfProDisplay,
                                                                        fontSize: 17,
                                                                        color: AppColors.primaryTextColor),
                                                                  ),
                                                                ),
                                                                SizedBox(height: Get.height * 0.005),
                                                                Text(
                                                                  logic.getCancel[index].category?.first.name ?? "",
                                                                  style: TextStyle(
                                                                      fontFamily: FontFamily.sfProDisplayMedium,
                                                                      fontSize: 15,
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
                                                                      "$currency ${logic.getCancel[index].amount?.toStringAsFixed(2)}",
                                                                      style: TextStyle(
                                                                          fontFamily: FontFamily.sfProDisplayBold,
                                                                          fontSize: 16,
                                                                          color: AppColors.currency),
                                                                    ),
                                                                  ),
                                                                ),
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
                                                                        "${logic.getCancel[index].expert?.image}",
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
                                                                      "  ${logic.getCancel[index].expert?.fname ?? ""} ${logic.getCancel[index].expert?.lname ?? ""}",
                                                                      style: TextStyle(
                                                                        fontFamily: FontFamily.sfProDisplayMedium,
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
                                                      SizedBox(height: Get.height * 0.01),
                                                      Padding(
                                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                                        child: Divider(color: AppColors.greyColor.withOpacity(0.2)),
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
                                                                  logic.getCancel[index].date ?? "",
                                                                  style: TextStyle(
                                                                      fontFamily: FontFamily.sfProDisplayMedium,
                                                                      fontSize: 12.5,
                                                                      color: AppColors.service),
                                                                ),
                                                              ],
                                                            ),
                                                            Row(
                                                              children: [
                                                                Image.asset(AppAsset.icClock, height: 20, width: 20),
                                                                SizedBox(width: Get.width * 0.02),
                                                                Text(
                                                                  logic.getCancel[index].time?[0] ?? "",
                                                                  style: TextStyle(
                                                                      fontFamily: FontFamily.sfProDisplayMedium,
                                                                      fontSize: 12.5,
                                                                      color: AppColors.service),
                                                                ),
                                                              ],
                                                            )
                                                          ],
                                                        ),
                                                      ),
                                                      SizedBox(height: Get.height * 0.02),
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
