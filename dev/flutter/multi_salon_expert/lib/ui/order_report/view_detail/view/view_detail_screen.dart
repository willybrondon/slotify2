// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/custom_title/custom_titles.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/order_report/view_detail/controller/view_detail_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class ViewDetailScreen extends StatelessWidget {
  ViewDetailScreen({super.key});

  ViewDetailController viewDetailController = Get.find<ViewDetailController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppColors.transparent,
        flexibleSpace: AppBarCustom(
          title: "txtViewDetails".tr,
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
        children: [
          Container(
            width: Get.width,
            margin: const EdgeInsets.only(top: 15, right: 15, left: 15),
            padding: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: Constant.boxShadow,
            ),
            child: Stack(
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: GestureDetector(
                    onLongPress: () {
                      String bookingId = viewDetailController.orderDetails?.bookingId ?? "";
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
                        color: AppColors.primaryAppColor,
                      ),
                      child: Text(
                        "#${viewDetailController.orderDetails?.bookingId}",
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: AppFontFamily.heeBo500,
                          color: AppColors.whiteColor,
                        ),
                      ),
                    ),
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  color: AppColors.grey.withOpacity(0.06),
                                ),
                                margin: const EdgeInsets.only(right: 10),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: CachedNetworkImage(
                                    imageUrl: viewDetailController.orderDetails?.serviceImage?.first ?? "",
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
                                        viewDetailController.orderDetails?.service?.join(", ") ?? "",
                                        style: TextStyle(
                                          fontSize: 18,
                                          overflow: TextOverflow.ellipsis,
                                          fontFamily: AppFontFamily.sfProDisplayBold,
                                          color: AppColors.primaryTextColor,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      viewDetailController.orderDetails?.service?.first ?? "",
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontFamily: AppFontFamily.sfProDisplayRegular,
                                        color: AppColors.service,
                                      ),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(6),
                                        color: AppColors.currencyBoxBg,
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 7),
                                        child: Text(
                                          '$currency ${viewDetailController.orderDetails?.withoutTax?.toStringAsFixed(2)}',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontFamily: AppFontFamily.heeBo800,
                                            color: AppColors.primaryAppColor,
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
                                            "",
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
                                          "  ${viewDetailController.orderDetails?.userFname} ${viewDetailController.orderDetails?.userLname}",
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontFamily: AppFontFamily.sfProDisplayMedium,
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
                        ],
                      ),
                    ).paddingOnly(bottom: 10),
                    CustomTitles(title: "txtBookingDateTiming".tr, fontSize: 16),
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
                                viewDetailController.orderDetails?.date ?? "",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 14,
                                  color: AppColors.primaryTextColor,
                                ),
                              ),
                              Text(
                                "txtBookingDate".tr,
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
                                viewDetailController.orderDetails?.startTime ?? '',
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 14,
                                  color: AppColors.primaryTextColor,
                                ),
                              ),
                              Text(
                                "txtBookingTiming".tr,
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
                    ).paddingOnly(top: 10, bottom: 10),
                    Divider(color: AppColors.greyColor.withOpacity(0.15)),
                    CustomTitles(title: 'txtOrderStatus'.tr, fontSize: 16).paddingOnly(top: 10),
                    (viewDetailController.orderDetails?.status == "completed")
                        ? Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color: AppColors.greenBg,
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                            child: Text(
                              'txtOrderSuccessfully'.tr,
                              style: TextStyle(
                                fontSize: 16,
                                fontFamily: AppFontFamily.heeBo700,
                                color: AppColors.greenColor,
                              ),
                            ),
                          ).paddingOnly(top: 10, bottom: 10)
                        : (viewDetailController.orderDetails?.status == "cancel")
                            ? Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  color: AppColors.greenBg,
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                child: Text(
                                  'txtCancelled'.tr,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontFamily: AppFontFamily.heeBo700,
                                    color: AppColors.greenColor,
                                  ),
                                ),
                              ).paddingOnly(top: 10, bottom: 10)
                            : (viewDetailController.orderDetails?.status == "pending")
                                ? Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      color: AppColors.greenBg,
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                    child: Text(
                                      'txtPending'.tr,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontFamily: AppFontFamily.heeBo700,
                                        color: AppColors.greenColor,
                                      ),
                                    ),
                                  ).paddingOnly(top: 10, bottom: 10)
                                : Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      color: AppColors.greenBg,
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                    child: Text(
                                      'Pending',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontFamily: AppFontFamily.heeBo700,
                                        color: AppColors.greenColor,
                                      ),
                                    ),
                                  ).paddingOnly(top: 10, bottom: 10),
                    viewDetailController.reviews?.isEmpty == true
                        ? const SizedBox()
                        : Divider(color: AppColors.greyColor.withOpacity(0.15)),
                    viewDetailController.reviews?.isEmpty == true
                        ? const SizedBox()
                        : CustomTitles(title: "txtOrderReview".tr, fontSize: 16).paddingOnly(top: 10),
                    viewDetailController.reviews?.isEmpty == true
                        ? const SizedBox()
                        : Container(
                            width: Get.width,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color: AppColors.yellowBg,
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "${viewDetailController.reviews?.first.userId?.fname ?? ""} ${viewDetailController.reviews?.first.userId?.lname ?? ""}",
                                      style: TextStyle(
                                        fontSize: 17,
                                        fontFamily: AppFontFamily.heeBo700,
                                        color: AppColors.primaryAppColor,
                                      ),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(6),
                                        color: AppColors.whiteColor,
                                      ),
                                      padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 7),
                                      child: Row(
                                        children: [
                                          Image.asset(AppAsset.icStar, height: 15).paddingOnly(right: 4),
                                          Text(
                                            viewDetailController.reviews?.first.rating?.toStringAsFixed(1) ?? "",
                                            style: TextStyle(
                                              fontSize: 15,
                                              fontFamily: AppFontFamily.heeBo600,
                                              color: AppColors.primaryAppColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  width: Get.width * 0.62,
                                  child: Text(
                                    viewDetailController.reviews?.first.review ?? "",
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontFamily: AppFontFamily.heeBo500,
                                      color: AppColors.reviewText,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ).paddingOnly(top: 10, bottom: 10),
                  ],
                ).paddingOnly(left: 12, top: 10, right: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
