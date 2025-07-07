import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:shimmer/shimmer.dart';

class Shimmers {
  static Shimmer myRevenueShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Container(
        height: 30,
        width: 100,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Colors.red,
        ),
      ),
    );
  }

  static Shimmer myRevenueBooking() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            height: 15,
            width: 110,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(5),
              color: Colors.red,
            ),
          ),
          Container(
            height: 15,
            width: 35,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(5),
              color: Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  static Shimmer revenueShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.only(left: 14, top: 15),
              height: 21,
              width: 50,
            ),
            Container(
              margin: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.red.withOpacity(0.3),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 10),
                    height: 40,
                    child: ListView.builder(
                      itemCount: 3,
                      scrollDirection: Axis.horizontal,
                      shrinkWrap: true,
                      itemBuilder: (context, index) {
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 10),
                          width: Get.width * 0.25,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                        );
                      },
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 25,
                          width: 50,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                        ),
                        const SizedBox(
                          height: 10,
                        ),
                        Text(
                          "txtBookingDetails".tr,
                          style:
                              TextStyle(fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 19),
                        ),
                        Container(
                          margin: const EdgeInsets.only(top: 18, right: 5, bottom: 10),
                          alignment: Alignment.center,
                          height: 30,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                height: 15,
                                width: 100,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                              ),
                              Container(
                                height: 17,
                                width: 50,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 0),
                          child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
                        ),
                        Container(
                          margin: const EdgeInsets.only(top: 10, right: 5, bottom: 10),
                          alignment: Alignment.center,
                          height: 30,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                height: 15,
                                width: 100,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                              ),
                              Container(
                                height: 17,
                                width: 50,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 0),
                          child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
                        ),
                        Container(
                          margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                          alignment: Alignment.center,
                          height: 30,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                height: 15,
                                width: 100,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                              ),
                              Container(
                                height: 17,
                                width: 50,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(9), color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Shimmer pendingOrderShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        scrollDirection: Axis.vertical,
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.zero,
        itemCount: 2,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.red.withOpacity(0.3),
            ),
            child: Stack(
              children: [
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
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                height: 95,
                                width: 95,
                                decoration: BoxDecoration(border: Border.all(width: 1.2, color: AppColors.red)),
                                child: Image.asset(AppAsset.icPlaceholder).paddingAll(10),
                              ),
                            ),
                            SizedBox(width: Get.width * 0.03),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                    height: 12,
                                    width: 100,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 12,
                                    width: 80,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 40,
                                    width: 100,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 16,
                                    width: 50,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              ],
                            )
                          ],
                        ),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Divider(color: AppColors.greyColor.withOpacity(0.5)),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Row(
                        children: [
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(40), color: Colors.red),
                            height: 45,
                            width: 140,
                          ),
                          const Spacer(),
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(40), color: Colors.red),
                            height: 45,
                            width: 140,
                          ),
                        ],
                      ),
                      SizedBox(height: Get.height * 0.02),
                    ],
                  ),
                )
              ],
            ),
          ).paddingAll(10);
        },
      ),
    );
  }

  static Shimmer completeOrderShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        scrollDirection: Axis.vertical,
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.zero,
        itemCount: 2,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.red.withOpacity(0.3),
            ),
            child: Stack(
              children: [
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
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                height: 95,
                                width: 95,
                                decoration: BoxDecoration(border: Border.all(width: 1.2, color: AppColors.red)),
                                child: Image.asset(AppAsset.icPlaceholder).paddingAll(10),
                              ),
                            ),
                            SizedBox(width: Get.width * 0.03),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                    height: 12,
                                    width: 100,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 12,
                                    width: 80,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 40,
                                    width: 100,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 16,
                                    width: 50,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              ],
                            )
                          ],
                        ),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Divider(color: AppColors.greyColor.withOpacity(0.5)),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(40), color: Colors.red),
                        height: 45,
                        width: Get.width,
                      ),
                      SizedBox(height: Get.height * 0.02),
                    ],
                  ),
                )
              ],
            ),
          ).paddingAll(10);
        },
      ),
    );
  }

  static Shimmer cancelOrderShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        scrollDirection: Axis.vertical,
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.zero,
        itemCount: 2,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.red.withOpacity(0.3),
            ),
            child: Stack(
              children: [
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
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                height: 95,
                                width: 95,
                                decoration: BoxDecoration(border: Border.all(width: 1.2, color: AppColors.red)),
                                child: Image.asset(AppAsset.icPlaceholder).paddingAll(10),
                              ),
                            ),
                            SizedBox(width: Get.width * 0.03),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                    height: 12,
                                    width: 100,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 12,
                                    width: 80,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 40,
                                    width: 100,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                SizedBox(height: Get.height * 0.007),
                                Container(
                                    height: 16,
                                    width: 50,
                                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              ],
                            )
                          ],
                        ),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Divider(color: AppColors.greyColor.withOpacity(0.5)),
                      ),
                      SizedBox(height: Get.height * 0.01),
                    ],
                  ),
                )
              ],
            ),
          ).paddingAll(10);
        },
      ),
    );
  }

  static Shimmer attendanceShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 15, right: 5, bottom: 10),
            alignment: Alignment.center,
            height: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 17,
                  width: 130,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                ),
                Container(
                  height: 10,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 0),
            child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
          ),
          Container(
            margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
            alignment: Alignment.center,
            height: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 17,
                  width: 130,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                ),
                Container(
                  height: 10,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 0),
            child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
          ),
          Container(
            margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
            alignment: Alignment.center,
            height: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 17,
                  width: 130,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                ),
                Container(
                  height: 10,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                ),
              ],
            ),
          ),
        ],
      ).paddingOnly(top: 5, left: 15, right: 15),
    );
  }

  static Shimmer slotManagementShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3, childAspectRatio: 2, crossAxisSpacing: 5, mainAxisSpacing: 0.10),
            itemCount: 30,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  height: 30,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), color: Colors.red),
                  child: Center(
                    child: Container(
                        height: 15,
                        width: 50,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  static Shimmer orderDetailShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 10),
          child: ListView.separated(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            padding: EdgeInsets.zero,
            itemCount: 4,
            itemBuilder: (context, index) {
              return Container(
                  height: 120,
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 10),
                  decoration: BoxDecoration(color: Colors.red.withOpacity(0.3), borderRadius: BorderRadius.circular(5)),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 15,
                        width: 100,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Container(
                        height: 14,
                        width: 120,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Row(
                        children: [
                          Row(
                            children: [
                              Container(
                                height: 14,
                                width: 75,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                              ),
                              SizedBox(width: Get.width * 0.05),
                              Container(
                                height: 15.5,
                                width: 75,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                              ),
                            ],
                          ),
                        ],
                      ),
                      SizedBox(height: Get.height * 0.01),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            height: 16,
                            width: 130,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                          ),
                          Container(
                            height: 14,
                            width: 100,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                          ).paddingOnly(right: 10),
                        ],
                      ),
                    ],
                  ).paddingOnly(left: 12, top: 15));
            },
            separatorBuilder: (context, position) {
              return Container(
                height: 10,
              );
            },
          )),
    );
  }

  static Shimmer orderSummaryShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 15, right: 5, bottom: 10),
            alignment: Alignment.center,
            height: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 17,
                  width: 130,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                ),
                Container(
                  height: 10,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 0),
            child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
          ),
          Container(
            margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
            alignment: Alignment.center,
            height: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 17,
                  width: 130,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                ),
                Container(
                  height: 10,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 0),
            child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
          ),
          Container(
            margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
            alignment: Alignment.center,
            height: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 17,
                  width: 130,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                ),
                Container(
                  height: 10,
                  width: 50,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                ),
              ],
            ),
          ),
        ],
      ).paddingOnly(top: 5, left: 15, right: 15),
    );
  }

  static Shimmer revenueDetailsShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 10),
        child: ListView.separated(
          shrinkWrap: true,
          itemCount: 3,
          itemBuilder: (context, index) {
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "txtReceivePayment".tr,
                  style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayMedium,
                    color: AppColors.title,
                    fontSize: 15,
                  ),
                ),
                const Spacer(),
                Container(
                  height: 14,
                  width: 100,
                  color: Colors.red,
                ),
                Image.asset(
                  AppAsset.icArrowRight,
                  height: 25,
                  width: 25,
                  color: Colors.red,
                )
              ],
            );
          },
          separatorBuilder: (context, index) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 7),
              child: Divider(color: AppColors.greyColor.withOpacity(0.8)),
            );
          },
        ),
      ),
    );
  }

  static Shimmer paymentHistoryShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        scrollDirection: Axis.vertical,
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        itemCount: 4,
        itemBuilder: (context, index) {
          return Container(
            height: 105,
            margin: const EdgeInsets.only(top: 10, left: 10, right: 10),
            padding: const EdgeInsets.all(10),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.3),
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
                    Container(
                      height: 15,
                      width: 100,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                    ),
                    Container(
                      height: 30,
                      width: 81,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    height: 13,
                    width: 100,
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                    ).paddingOnly(right: 5),
                    Container(
                      height: 12,
                      width: 50,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                    ).paddingOnly(right: 10),
                    Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                    ).paddingOnly(right: 5),
                    Container(
                      height: 12,
                      width: 50,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                    ).paddingOnly(right: 5),
                    const Spacer(),
                    Container(
                      height: 14,
                      width: 50,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                    ),
                  ],
                )
              ],
            ),
          );
        },
      ),
    );
  }

  static Shimmer bookingInformationShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Container(
        color: Colors.red.withOpacity(0.3),
        margin: const EdgeInsets.all(10),
        child: Column(
          children: [
            Stack(
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: Container(
                    height: 30,
                    width: Get.width * 0.2,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(15),
                        topRight: Radius.circular(12),
                      ),
                      color: Colors.red,
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
                        color: Colors.red,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.03),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 20,
                          width: Get.width * 0.33,
                          color: Colors.red,
                        ),
                        SizedBox(height: Get.height * 0.005),
                        Container(
                          height: 14,
                          width: 90,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(6), color: Colors.red),
                        ),
                        SizedBox(height: Get.height * 0.005),
                        Container(
                          height: 25,
                          width: 70,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(7),
                            color: Colors.red,
                          ),
                        ).paddingOnly(bottom: 2),
                        SizedBox(height: Get.height * 0.005),
                        Row(
                          children: [
                            Container(
                              height: 20,
                              width: 20,
                              decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                            ).paddingOnly(right: 5),
                            Container(
                              height: 13,
                              width: 120,
                              decoration: BoxDecoration(borderRadius: BorderRadius.circular(6), color: Colors.red),
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
                Container(
                  height: 20,
                  width: 20,
                  color: Colors.red,
                ),
                Container(
                  height: 13,
                  width: 100,
                  color: Colors.red,
                ).paddingOnly(right: 10, left: 5),
                const Spacer(),
                Container(
                  height: 20,
                  width: 20,
                  color: Colors.red,
                ),
                Container(
                  height: 13,
                  width: 100,
                  color: Colors.red,
                ).paddingOnly(right: 10, left: 5),
              ],
            ).paddingOnly(left: 8, right: 8),
            Divider(color: AppColors.border),
            for (var index = 0; index < 4; index++)
              Container(
                height: 53,
                padding: const EdgeInsets.only(right: 8),
                child: Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.red,
                      ),
                    ).paddingOnly(right: 12, left: 10),
                    Container(
                      height: 15,
                      width: 120,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        color: Colors.red,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      height: 15,
                      width: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(3),
                        color: Colors.red,
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
                    "Subtotal",
                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 15, color: AppColors.service),
                  ),
                  const Spacer(),
                  Container(
                    height: 15,
                    width: 100,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(7), color: Colors.red),
                  ),
                ],
              ),
            ).paddingOnly(top: 10, bottom: 10),
            Container(
              height: 48,
              color: AppColors.red,
              padding: const EdgeInsets.only(left: 10, right: 10),
              child: Row(
                children: [
                  Text(
                    "Tax",
                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 15, color: AppColors.service),
                  ),
                  const Spacer(),
                  Container(
                    height: 15,
                    width: 100,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(7), color: Colors.red),
                  ),
                ],
              ),
            ).paddingOnly(bottom: 10),
            Container(
              height: 48,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
                color: AppColors.green,
              ),
              padding: const EdgeInsets.only(left: 10, right: 10),
              child: Row(
                children: [
                  Text(
                    "Total Amount",
                    style: TextStyle(fontFamily: FontFamily.sfProDisplay, fontSize: 15, color: AppColors.service),
                  ),
                  const Spacer(),
                  Container(
                    height: 15,
                    width: 100,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(7), color: Colors.red),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  static Shimmer salonDetailShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Container(
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
            Container(
              height: 20,
              width: Get.width * 0.33,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.red,
              ),
            ).paddingOnly(bottom: 10),
            Container(
              height: 20,
              width: Get.width * 0.33,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.red,
              ),
            )
          ],
        ),
      ).paddingOnly(left: 13, right: 13, top: 8, bottom: 10),
    );
  }

  static Shimmer serviceDetailShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: GridView.builder(
        scrollDirection: Axis.vertical,
        physics: const ScrollPhysics(),
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        itemCount: 10,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          childAspectRatio: 0.65,
          crossAxisSpacing: 20,
        ),
        itemBuilder: (BuildContext context, int index) {
          return Column(
            children: [
              Center(
                child: Container(
                  height: 100,
                  width: 100,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.4),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Container(
                height: 12,
                width: 50,
                alignment: Alignment.center,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red),
              ),
            ],
          ).paddingOnly(bottom: 10);
        },
      ),
    );
  }
}
