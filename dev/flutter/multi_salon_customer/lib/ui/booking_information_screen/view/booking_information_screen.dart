// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_information_screen/controller/booking_information_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class BookingInformationScreen extends StatelessWidget {
  BookingInformationScreen({super.key});

  BookingInformationController bookingInformationController = Get.find<BookingInformationController>();
  BookingDetailScreenController bookingDetailScreenController = Get.find<BookingDetailScreenController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtBookingInformation".tr,
          method: InkWell(
            overlayColor: WidgetStatePropertyAll(AppColors.transparent),
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
      body: GetBuilder<BookingInformationController>(
        id: Constant.idProgressView,
        builder: (logic) {
          List<String>? names = logic.getBookingInformationCategory?.booking?.serviceId?.map((e) => e.name.toString()).toList();

          String? result = names?.join(', ');

          List? parts;
          String str = logic.getBookingInformationCategory?.booking?.date.toString() ?? "";
          parts = str.split(' ');
          String date = parts[0];

          return logic.isLoading.value == true
              ? Shimmers.bookingInformationShimmer()
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.whiteColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1),
                        ),
                        margin: const EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 8),
                        child: Column(
                          children: [
                            Stack(
                              children: [
                                Align(
                                  alignment: Alignment.topRight,
                                  child: GestureDetector(
                                    onLongPress: () {
                                      String bookingId = logic.getBookingInformationCategory?.booking?.bookingId ?? "";
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
                                        "#${logic.getBookingInformationCategory?.booking?.bookingId}",
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplay, fontSize: 12, color: AppColors.service),
                                      ),
                                    ),
                                  ),
                                ),
                                Row(
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
                                          imageUrl: "${logic.getBookingInformationCategory?.booking?.serviceId?.first.image}",
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
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
                                                fontFamily: FontFamily.sfProDisplay,
                                                fontSize: 17,
                                                overflow: TextOverflow.ellipsis,
                                                color: AppColors.primaryTextColor),
                                          ),
                                        ),
                                        SizedBox(height: Get.height * 0.005),
                                        Text(
                                          logic.getBookingInformationCategory?.booking?.serviceId?.first.categoryId?.name ?? "",
                                          style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplayMedium,
                                            fontSize: 14,
                                            color: AppColors.service,
                                          ),
                                        ),
                                        SizedBox(height: Get.height * 0.005),
                                        Container(
                                          alignment: Alignment.center,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(7),
                                            color: AppColors.green2,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                                            child: Text(
                                              "$currency ${logic.getBookingInformationCategory?.booking?.amount?.toStringAsFixed(2)}",
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
                                                shape: BoxShape.circle,
                                                image: DecorationImage(
                                                  image: NetworkImage(
                                                      logic.getBookingInformationCategory?.booking?.expertId?.image ?? ""),
                                                  fit: BoxFit.cover,
                                                ),
                                              ),
                                            ),
                                            Text(
                                              "  ${logic.getBookingInformationCategory?.booking?.expertId?.fname} ${logic.getBookingInformationCategory?.booking?.expertId?.lname}",
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
                                ).paddingOnly(left: 10, top: 10),
                              ],
                            ),
                            Divider(color: AppColors.border).paddingOnly(top: 5),
                            Row(
                              children: [
                                Image.asset(
                                  AppAsset.icBooking,
                                  height: 20,
                                  width: 20,
                                  color: AppColors.primaryAppColor,
                                ),
                                Text(
                                  date,
                                  style: TextStyle(
                                    fontFamily: FontFamily.sfProDisplay,
                                    fontSize: 12,
                                    color: AppColors.primaryTextColor,
                                  ),
                                ).paddingOnly(right: 10, left: 5),
                                const Spacer(),
                                Image.asset(
                                  AppAsset.icClock,
                                  height: 20,
                                  width: 20,
                                ),
                                Text(
                                  "${logic.getBookingInformationCategory?.booking?.duration} ${"txtMinutes".tr}",
                                  style: TextStyle(
                                    fontFamily: FontFamily.sfProDisplay,
                                    fontSize: 12,
                                    color: AppColors.primaryTextColor,
                                  ),
                                ).paddingOnly(right: 10, left: 5),
                                const Spacer(),
                                Image.asset(
                                  AppAsset.icCheckOut,
                                  height: 20,
                                  width: 20,
                                ),
                                Container(
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(7),
                                    color: logic.getBookingInformationCategory?.booking?.status == "cancel"
                                        ? AppColors.lightRedColor
                                        : AppColors.green2,
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                                    child: Text(
                                      logic.getBookingInformationCategory?.booking?.status == "pending"
                                          ? "Pending"
                                          : logic.getBookingInformationCategory?.booking?.status == "completed"
                                              ? "Completed"
                                              : "Cancelled",
                                      style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplay,
                                        fontSize: 11,
                                        color: logic.getBookingInformationCategory?.booking?.status == "cancel"
                                            ? AppColors.redColor
                                            : AppColors.currency,
                                      ),
                                    ),
                                  ),
                                ).paddingOnly(left: 5)
                              ],
                            ).paddingOnly(left: 8, right: 8),
                            Divider(color: AppColors.border),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "txtServicesDetails".tr,
                                style: TextStyle(
                                  fontSize: 18,
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                ),
                              ).paddingOnly(bottom: 13, left: 8),
                            ),
                            for (var index = 0;
                                index < (logic.getBookingInformationCategory?.booking?.serviceId?.length ?? 0);
                                index++)
                              Container(
                                height: 53,
                                padding: const EdgeInsets.only(right: 8),
                                child: Row(
                                  children: [
                                    DottedBorder(
                                      color: AppColors.roundBorder,
                                      borderType: BorderType.Circle,
                                      strokeWidth: 1,
                                      dashPattern: const [2.5, 2],
                                      child: Container(
                                        height: 40,
                                        width: 40,
                                        decoration: const BoxDecoration(shape: BoxShape.circle),
                                        clipBehavior: Clip.hardEdge,
                                        child: CachedNetworkImage(
                                          imageUrl: "${logic.getBookingInformationCategory?.booking?.serviceId?[index].image}",
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                          },
                                        ),
                                      ),
                                    ).paddingOnly(right: 12, left: 10),
                                    Text(
                                      logic.getBookingInformationCategory?.booking?.serviceId?[index].name ?? "",
                                      style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplayMedium,
                                        fontSize: 15,
                                        color: AppColors.service,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            Container(
                              height: 48,
                              color: AppColors.blue,
                              padding: const EdgeInsets.only(left: 10, right: 10),
                              child: Row(
                                children: [
                                  Text(
                                    "txtSubtotal".tr,
                                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 15, color: AppColors.service),
                                  ),
                                  const Spacer(),
                                  Text(
                                    "$currency ${logic.getBookingInformationCategory?.booking?.withoutTax?.toStringAsFixed(2)}",
                                    style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplayBold, fontSize: 15, color: AppColors.primaryAppColor),
                                  )
                                ],
                              ),
                            ).paddingOnly(top: 10),
                            Container(
                              height: 48,
                              color: AppColors.red,
                              padding: const EdgeInsets.only(left: 10, right: 10),
                              child: Row(
                                children: [
                                  Text(
                                    "txtTax".tr,
                                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 15, color: AppColors.service),
                                  ),
                                  const Spacer(),
                                  Text(
                                    "$currency ${logic.getBookingInformationCategory?.booking?.tax?.toStringAsFixed(2)}",
                                    style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplayBold, fontSize: 15, color: AppColors.primaryAppColor),
                                  )
                                ],
                              ),
                            ),
                            Container(
                              height: 48,
                              decoration: BoxDecoration(
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(20),
                                  bottomRight: Radius.circular(20),
                                ),
                                color: AppColors.green2,
                              ),
                              padding: const EdgeInsets.only(left: 10, right: 10),
                              child: Row(
                                children: [
                                  Text(
                                    "txtTotalAmount".tr,
                                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 15, color: AppColors.service),
                                  ),
                                  const Spacer(),
                                  Text(
                                    "$currency ${logic.getBookingInformationCategory?.booking?.amount?.toStringAsFixed(2)}",
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      fontSize: 15,
                                      color: AppColors.primaryAppColor,
                                    ),
                                  )
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          "txtSalonDetails".tr,
                          style: TextStyle(
                            fontSize: 17,
                            fontFamily: FontFamily.sfProDisplayBold,
                            color: AppColors.primaryTextColor,
                          ),
                        ).paddingOnly(left: 12, top: 5),
                      ),
                      Container(
                        width: Get.width,
                        decoration: BoxDecoration(
                          color: AppColors.whiteColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: AppColors.greyColor.withOpacity(0.15),
                            width: 1,
                          ),
                        ),
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  logic.getBookingInformationCategory?.booking?.salonId?.name ?? "",
                                  style: TextStyle(
                                    color: AppColors.primaryTextColor,
                                    fontFamily: FontFamily.sfProDisplayBold,
                                    fontSize: 16.5,
                                  ),
                                ),
                              ],
                            ).paddingOnly(bottom: 10),
                            Row(
                              children: [
                                Image.asset(
                                  AppAsset.icLocation,
                                  height: 20,
                                  width: 20,
                                ).paddingOnly(right: 8),
                                SizedBox(
                                  width: Get.width * 0.8,
                                  child: Text(
                                    "${logic.getBookingInformationCategory?.booking?.salonId?.addressDetails?.addressLine1}, ${logic.getBookingInformationCategory?.booking?.salonId?.addressDetails?.landMark}, ${logic.getBookingInformationCategory?.booking?.salonId?.addressDetails?.city}, ${logic.getBookingInformationCategory?.booking?.salonId?.addressDetails?.state}, ${logic.getBookingInformationCategory?.booking?.salonId?.addressDetails?.country}",
                                    style: TextStyle(
                                      color: AppColors.locationText,
                                      fontFamily: FontFamily.sfProDisplay,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ],
                            ).paddingOnly(bottom: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () {
                                      logic.launchMaps();
                                    },
                                    child: Container(
                                      height: 50,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(13),
                                        color: AppColors.directionBox,
                                        boxShadow: Constant.boxShadow,
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Image.asset(
                                            AppAsset.icDirectionFilled,
                                            height: 22,
                                            width: 22,
                                          ).paddingOnly(right: 12),
                                          Text(
                                            "txtDirection".tr,
                                            style: TextStyle(
                                              color: AppColors.whiteColor,
                                              fontFamily: FontFamily.sfProDisplayBold,
                                              fontSize: 16.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 13),
                                GetBuilder<BookingInformationController>(
                                  builder: (logic) {
                                    return Expanded(
                                      child: GestureDetector(
                                        onTap: () {
                                          logic.makingPhoneCall();
                                        },
                                        child: Container(
                                          height: 50,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(13),
                                            color: AppColors.callBox,
                                            boxShadow: Constant.boxShadow,
                                          ),
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Image.asset(
                                                AppAsset.icCallFilled,
                                                height: 22,
                                                width: 22,
                                              ).paddingOnly(right: 12),
                                              Text(
                                                "txtCall".tr,
                                                style: TextStyle(
                                                  color: AppColors.whiteColor,
                                                  fontFamily: FontFamily.sfProDisplayBold,
                                                  fontSize: 16.5,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ).paddingOnly(bottom: 10, top: 10),
                          ],
                        ),
                      ).paddingOnly(left: 13, right: 13, top: 8, bottom: 10),
                      logic.getBookingInformationCategory?.booking?.status == "cancel"
                          ? Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "txtReasonCancel".tr,
                                style: TextStyle(
                                  fontSize: 17,
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                ),
                              ).paddingOnly(left: 12),
                            )
                          : const SizedBox(),
                      logic.getBookingInformationCategory?.booking?.status == "cancel"
                          ? Container(
                              width: Get.width,
                              decoration: BoxDecoration(
                                color: AppColors.whiteColor,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.greyColor.withOpacity(0.15),
                                  width: 1,
                                ),
                              ),
                              padding: const EdgeInsets.all(10),
                              child: Text(
                                logic.getBookingInformationCategory?.booking?.cancel?.reason ?? "",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontFamily: FontFamily.sfProDisplayMedium,
                                  color: AppColors.service,
                                ),
                              ),
                            ).paddingOnly(left: 13, right: 13, top: 8)
                          : const SizedBox(),
                      logic.getBookingInformationCategory?.booking?.status == "cancel"
                          ? Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "* ${"CancelledBy"} ${logic.getBookingInformationCategory?.booking?.cancel?.person}",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontFamily: FontFamily.sfProDisplayMedium,
                                  color: AppColors.redColor,
                                ),
                              ).paddingOnly(left: 14, top: 4, bottom: 15),
                            )
                          : const SizedBox(),
                    ],
                  ),
                );
        },
      ),
    );
  }
}
