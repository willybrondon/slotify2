import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/revenue_detail/controller/revenue_detail_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class PaymentHistoryScreen extends StatelessWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtPaymentHistory".tr,
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
      body: GetBuilder<RevenueDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return SizedBox(
            height: Get.height,
            width: Get.width,
            child: logic.isLoading.value
                ? Shimmers.paymentHistoryShimmer()
                : logic.paymentHistoryCategory?.settlements?.first.bookingId?.isEmpty ?? true
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
                    : ListView.builder(
                        scrollDirection: Axis.vertical,
                        shrinkWrap: true,
                        physics: const BouncingScrollPhysics(),
                        itemCount: logic.paymentHistoryCategory?.settlements?.first.bookingId?.length ?? 0,
                        itemBuilder: (context, index) {
                          // ---- Show Multiple Name of Service ---- //
                          List<String>? names = logic
                              .paymentHistoryCategory?.settlements?.first.bookingId?[index].serviceId
                              ?.map((e) => e.name.toString())
                              .toList();

                          String? result = names?.join(',');

                          return Container(
                            height: 105,
                            margin: const EdgeInsets.only(top: 10, left: 10, right: 10),
                            padding: const EdgeInsets.all(10),
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppColors.whiteColor,
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(
                                width: 1,
                                color: AppColors.grey.withOpacity(0.1),
                              ),
                              boxShadow: Constant.boxShadow,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "${logic.paymentHistoryCategory?.settlements?.first.bookingId?[index].userId?.fname ?? ""} ${logic.paymentHistoryCategory?.settlements?.first.bookingId?[index].userId?.lname ?? ""}",
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontFamily: FontFamily.sfProDisplayBold,
                                        color: AppColors.primaryTextColor,
                                      ),
                                    ),
                                    Container(
                                      height: 30,
                                      width: 81,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(6),
                                        color: AppColors.green,
                                      ),
                                      child: Center(
                                        child: Text(
                                          "$currency ${logic.paymentHistoryCategory?.settlements?.first.bookingId?[index].expertEarning?.toStringAsFixed(2)}",
                                          style: TextStyle(
                                              fontSize: 16,
                                              fontFamily: FontFamily.sfProDisplayBold,
                                              color: AppColors.currency),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: 17,
                                  width: 150,
                                  child: Align(
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      result ?? "",
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontFamily: FontFamily.sfProDisplayMedium,
                                        color: AppColors.service,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                ),
                                Row(
                                  children: [
                                    Image.asset(
                                      AppAsset.icBooking,
                                      height: 25,
                                      width: 25,
                                      color: AppColors.iconColor,
                                    ),
                                    Text(
                                      "${logic.paymentHistoryCategory?.settlements?.first.bookingId?[index].date}",
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontFamily: FontFamily.sfProDisplay,
                                        color: AppColors.blackColor1,
                                      ),
                                    ).paddingOnly(left: 5, right: 12),
                                    Image.asset(
                                      AppAsset.icClock,
                                      height: 25,
                                      width: 25,
                                      color: AppColors.iconColor,
                                    ),
                                    Text(
                                      "${logic.paymentHistoryCategory?.settlements?.first.bookingId?[index].startTime}",
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontFamily: FontFamily.sfProDisplay,
                                        color: AppColors.blackColor1,
                                      ),
                                    ).paddingOnly(left: 5),
                                    const Spacer(),
                                    Text(
                                      logic.paymentHistoryCategory?.settlements?.first.statusOfTransaction ==
                                              0
                                          ? "Pending"
                                          : "Credited",
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontFamily: FontFamily.sfProDisplay,
                                        color: AppColors.currency,
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          );
                        },
                      ),
          );
        },
      ),
    );
  }
}
