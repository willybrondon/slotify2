import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/select_date_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/revenue_detail/controller/revenue_detail_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class RevenueDetailScreen extends StatelessWidget {
  const RevenueDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtMyRevenue".tr,
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
      body: SingleChildScrollView(
        child: GetBuilder<RevenueDetailController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Current Earnings",
                      style: TextStyle(
                        fontFamily: FontFamily.sfProDisplayBold,
                        color: AppColors.primaryTextColor,
                        fontSize: 20,
                      ),
                    ),
                    Text(
                      "$currency $currentEarning",
                      style: TextStyle(
                        color: AppColors.currency,
                        fontFamily: FontFamily.sfProDisplayBold,
                        fontSize: 23.5,
                      ),
                    )
                  ],
                ),
                Divider(color: AppColors.greyColor.withOpacity(0.2)).paddingOnly(bottom: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "txtRevenueDetails".tr,
                      style: TextStyle(
                        fontFamily: FontFamily.sfProDisplayBold,
                        color: AppColors.primaryTextColor,
                        fontSize: 20,
                      ),
                    ),
                    GetBuilder<RevenueDetailController>(
                      builder: (logicClickMonth) {
                        return GestureDetector(
                          onTap: () {
                            Get.dialog(
                              Dialog(
                                backgroundColor: AppColors.transparent,
                                surfaceTintColor: AppColors.transparent,
                                shadowColor: AppColors.transparent,
                                elevation: 0,
                                child: const SelectDateDialog(),
                              ),
                            );
                          },
                          child: Container(
                            height: 35,
                            width: 100,
                            decoration: BoxDecoration(color: AppColors.tabUnSelect, borderRadius: BorderRadius.circular(40)),
                            child: Center(
                              child: logicClickMonth.startDateFormatted.isEmpty && logicClickMonth.endDateFormatted.isEmpty
                                  ? Text(
                                      "All",
                                      style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplay,
                                        color: AppColors.primaryAppColor,
                                        fontSize: 15,
                                      ),
                                    )
                                  : Text(
                                      "${logicClickMonth.startDateFormatted} - \n${logicClickMonth.endDateFormatted}",
                                      style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplay,
                                        color: AppColors.primaryAppColor,
                                        fontSize: 15,
                                      ),
                                    ),
                            ),
                          ),
                        );
                      },
                    )
                  ],
                ),
                SizedBox(height: Get.height * 0.02),
                Container(
                  height: Get.height * 0.11,
                  width: Get.width,
                  padding: const EdgeInsets.only(top: 12, left: 15),
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.all(
                      Radius.circular(16),
                    ),
                    color: AppColors.whiteColor,
                    boxShadow: Constant.boxShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "txtTotalIncome".tr,
                        style: TextStyle(
                          color: AppColors.greyColor,
                          fontFamily: FontFamily.sfProDisplayMedium,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      logic.paymentHistoryCategory?.settlements?.isNotEmpty == true
                          ? Text(
                              "$currency ${logic.paymentHistoryCategory?.settlements?.first.expertEarning?.toStringAsFixed(2)}",
                              style: TextStyle(
                                color: AppColors.currency,
                                fontFamily: FontFamily.sfProDisplayBold,
                                fontSize: 30,
                              ),
                            )
                          : Text(
                              "$currency 0.0",
                              style: TextStyle(
                                color: AppColors.currency,
                                fontFamily: FontFamily.sfProDisplayBold,
                                fontSize: 30,
                              ),
                            ),
                    ],
                  ),
                ),
                Text("txtPaymentDetails".tr,
                        style:
                            TextStyle(fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 20))
                    .paddingOnly(top: 13, bottom: 10),
                GetBuilder<RevenueDetailController>(
                  id: Constant.idProgressView,
                  builder: (logic) {
                    return logic.isLoading.value
                        ? Shimmers.revenueDetailsShimmer()
                        : logic.paymentHistoryCategory?.settlements?.isEmpty ?? true
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Image.asset(AppAsset.icNoService, height: 155, width: 155).paddingOnly(top: 50),
                                    Text(
                                      "txtNoDataFound".tr,
                                      style: TextStyle(
                                          fontFamily: FontFamily.sfProDisplayMedium,
                                          fontSize: 20,
                                          color: AppColors.primaryTextColor),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                itemCount: logic.paymentHistoryCategory?.settlements?.length ?? 0,
                                itemBuilder: (context, index) {
                                  int recievePayment = logic.paymentHistoryCategory?.settlements?.first.bookingId?.length ?? 0;
                                  return InkWell(
                                    onTap: () {
                                      log("Settlement ID :: ${logic.paymentHistoryCategory?.settlements?[index].id}");

                                      Get.toNamed(
                                        AppRoutes.paymentHistory,
                                        arguments: logic.paymentHistoryCategory?.settlements?[index].id,
                                      );
                                    },
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          "Receive Payment",
                                          style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplayMedium,
                                            color: AppColors.title,
                                            fontSize: 15,
                                          ),
                                        ),
                                        const Spacer(),
                                        Text(
                                          recievePayment.toString(),
                                          style: TextStyle(
                                              fontFamily: FontFamily.sfProDisplayBold,
                                              color: AppColors.primaryTextColor,
                                              fontSize: 17),
                                        ).paddingOnly(right: 13),
                                        Image.asset(
                                          AppAsset.icArrowRight,
                                          height: 25,
                                          width: 25,
                                          color: AppColors.title,
                                        )
                                      ],
                                    ),
                                  );
                                },
                                separatorBuilder: (context, index) {
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 7),
                                    child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
                                  );
                                },
                              );
                  },
                )
              ],
            ).paddingOnly(top: 15, left: 15, right: 15);
          },
        ),
      ),
    );
  }
}
