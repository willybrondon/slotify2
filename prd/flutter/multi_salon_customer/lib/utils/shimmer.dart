import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:shimmer/shimmer.dart';

class Shimmers {
  static Shimmer homeServiceShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red.withOpacity(0.3)),
        child: Column(
          children: [
            Container(
              height: 50,
              width: Get.width,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red),
            ),
            SizedBox(height: Get.height * 0.02),
            Container(
              height: 50,
              width: Get.width,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red),
            ),
          ],
        ),
      ),
    );
  }

  static Shimmer searchScreenShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.separated(
        itemCount: 4,
        shrinkWrap: true,
        padding: EdgeInsets.zero,
        physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
        itemBuilder: (context, index) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: Colors.red.withOpacity(0.3),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 80,
                      width: 80,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10), border: Border.all(width: 1, color: AppColors.red)),
                      child: Image.asset(AppAsset.icServicePlaceholder).paddingAll(5),
                    ),
                    SizedBox(width: Get.width * 0.03),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 14,
                          width: 120,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(3), color: Colors.red),
                        ).paddingOnly(top: 5, bottom: 8),
                        Container(
                          height: 12,
                          width: 95,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(3), color: Colors.red),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          );
        },
        separatorBuilder: (context, index) {
          return SizedBox(height: Get.height * 0.02);
        },
      ).paddingOnly(left: 10, right: 10, top: 80),
    );
  }

  static Shimmer homeCategoryShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: GridView.builder(
        scrollDirection: Axis.vertical,
        physics: const ScrollPhysics(),
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        itemCount: 4,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          childAspectRatio: 0.65,
          crossAxisSpacing: 9,
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
                  child: Image.asset(
                    AppAsset.icCategoryPlaceholder,
                    height: 40,
                    width: 40,
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
          );
        },
      ),
    );
  }

  static Shimmer homeExpertShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: GridView.builder(
        scrollDirection: Axis.vertical,
        physics: const ScrollPhysics(),
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        itemCount: 4,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2, childAspectRatio: 0.78, crossAxisSpacing: 13.5, mainAxisSpacing: 2),
        itemBuilder: (BuildContext context, int index) {
          return Container(
            width: Get.width * 0.45,
            margin: const EdgeInsets.only(top: 10),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(21), color: Colors.red.withOpacity(0.3)),
            child: Column(
              children: [
                Container(
                  height: 86,
                  width: 86,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(width: 1, color: AppColors.red)),
                  child: Image.asset(AppAsset.icPlaceHolder),
                ),
                SizedBox(height: Get.height * 0.015),
                Container(
                  height: 15,
                  width: 45,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red),
                ),
                SizedBox(height: Get.height * 0.015),
                Container(
                    width: Get.width * 0.18,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(7), color: Colors.red))
              ],
            ),
          );
        },
      ),
    );
  }

  static Shimmer categoryDetailsShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 55,
                width: double.infinity,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red),
                child: Row(
                  children: [
                    Container(
                      height: 23,
                      width: 23,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                    ).paddingOnly(left: 10, right: 10),
                    Container(
                      height: 13.8,
                      width: 13.8,
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                    )
                  ],
                ),
              ).paddingOnly(top: 10),
              SizedBox(height: Get.height * 0.02),
              Container(
                  height: 16, width: 100, decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
              SizedBox(height: Get.height * 0.02),
              ListView.separated(
                itemCount: 4,
                shrinkWrap: true,
                padding: EdgeInsets.zero,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              height: 100,
                              width: 100,
                              decoration: BoxDecoration(
                                  border: Border.all(width: 1.5, color: AppColors.red), borderRadius: BorderRadius.circular(10)),
                              child: Image.asset(AppAsset.icServicePlaceholder).paddingOnly(top: 10, bottom: 10),
                            ),
                          ),
                          SizedBox(width: Get.width * 0.03),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                  height: 18,
                                  width: 100,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              SizedBox(height: Get.height * 0.02),
                              Container(
                                  height: 15,
                                  width: 150,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              SizedBox(height: Get.height * 0.02),
                              Container(
                                  height: 16,
                                  width: 80,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                            ],
                          ),
                        ],
                      ),
                    ],
                  );
                },
                separatorBuilder: (context, index) {
                  return SizedBox(height: Get.height * 0.02);
                },
              )
            ],
          ),
        ),
      ),
    );
  }

  static Shimmer nearByBranchesShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        itemCount: 5,
        physics: const BouncingScrollPhysics(),
        scrollDirection: Axis.horizontal,
        shrinkWrap: true,
        itemBuilder: (context, index) {
          return Container(
            width: Get.width * 0.85,
            margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.3),
              borderRadius: BorderRadius.circular(19),
            ),
            child: Column(
              children: [
                SizedBox(
                  height: Get.height * 0.18,
                  child: Image.asset(
                    AppAsset.icImagePlaceholder,
                    height: 100,
                    width: 100,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      height: 15,
                      width: 110,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    ),
                    const Spacer(),
                    Container(
                      height: 20,
                      width: 30,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        color: Colors.red,
                      ),
                    ),
                  ],
                ).paddingOnly(top: 10, left: 3, right: 3, bottom: 10),
                Row(
                  children: [
                    Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    ).paddingOnly(right: 10),
                    Container(
                      height: 15,
                      width: 110,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    )
                  ],
                ).paddingOnly(bottom: 5),
              ],
            ),
          );
        },
      ),
    );
  }

  static Shimmer nearByBranchesWithLocationShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        itemCount: 3,
        physics: const BouncingScrollPhysics(),
        scrollDirection: Axis.vertical,
        itemBuilder: (context, index) {
          return Container(
            width: Get.width * 0.85,
            margin: const EdgeInsets.only(right: 10, bottom: 5, left: 10, top: 5),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.3),
              borderRadius: BorderRadius.circular(19),
            ),
            child: Column(
              children: [
                Container(
                  height: Get.height * 0.22,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(25),
                ),
                Row(
                  children: [
                    Container(
                      height: 15,
                      width: 110,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    ),
                    const Spacer(),
                    Container(
                      height: 20,
                      width: 30,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        color: Colors.red,
                      ),
                    ),
                  ],
                ).paddingOnly(top: 10, left: 3, right: 3, bottom: 10),
                Row(
                  children: [
                    Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    ).paddingOnly(right: 10),
                    Container(
                      height: 15,
                      width: 110,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    )
                  ],
                ).paddingOnly(bottom: 5),
                Row(
                  children: [
                    Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    ).paddingOnly(right: 10),
                    Container(
                      height: 15,
                      width: 110,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), color: Colors.red),
                    )
                  ],
                ).paddingOnly(top: 5),
              ],
            ),
          );
        },
      ),
    );
  }

  static Shimmer serviceBranchShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ListView.separated(
                itemCount: 4,
                shrinkWrap: true,
                padding: EdgeInsets.zero,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                                height: 100,
                                width: 100,
                                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                          ),
                          SizedBox(width: Get.width * 0.03),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                  height: 18,
                                  width: 100,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              SizedBox(height: Get.height * 0.02),
                              Container(
                                  height: 15,
                                  width: 150,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              SizedBox(height: Get.height * 0.02),
                              Container(
                                  height: 16,
                                  width: 80,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                            ],
                          ),
                        ],
                      ),
                    ],
                  );
                },
                separatorBuilder: (context, index) {
                  return SizedBox(height: Get.height * 0.02);
                },
              )
            ],
          ),
        ),
      ),
    );
  }

  static Shimmer selectExpertShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
              height: 16, width: 120, decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
          GridView.builder(
            scrollDirection: Axis.vertical,
            physics: const ScrollPhysics(),
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            itemCount: 4,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.78,
              crossAxisSpacing: 13.5,
              mainAxisSpacing: 2,
            ),
            itemBuilder: (BuildContext context, int index) {
              return Container(
                width: Get.width * 0.45,
                margin: const EdgeInsets.only(top: 10),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red.withOpacity(0.3)),
                child: Column(
                  children: [
                    Container(
                      height: 86,
                      width: 86,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(border: Border.all(width: 1.2, color: Colors.red), shape: BoxShape.circle),
                      child: Image.asset(AppAsset.icPlaceHolder),
                    ),
                    SizedBox(height: Get.height * 0.015),
                    Container(
                        height: 15,
                        width: 60,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
                    SizedBox(height: Get.height * 0.015),
                    Container(
                      width: Get.width * 0.17,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                    )
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  static Shimmer selectSlotShimmer() {
    return Shimmer.fromColors(
        baseColor: Constant.baseColor,
        highlightColor: Constant.highlightColor,
        period: Constant.period,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 20, left: 15, bottom: 10),
              child: Container(
                  height: 16, width: 100, decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
            ),
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
        ));
  }

  static Shimmer selectPaymentShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
              height: 16, width: 100, decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
          SizedBox(height: Get.height * 0.02),
          ListView.separated(
            itemCount: 3,
            shrinkWrap: true,
            padding: EdgeInsets.zero,
            itemBuilder: (context, index) {
              return Container(
                height: 60,
                width: Get.width,
                padding: const EdgeInsets.only(left: 10, right: 5),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                            height: 40,
                            width: 40,
                            alignment: Alignment.center,
                            decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red)),
                        SizedBox(width: Get.width * 0.04),
                        Container(
                            height: 15,
                            width: 60,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red)),
                      ],
                    ),
                  ],
                ),
              );
            },
            separatorBuilder: (context, index) {
              return SizedBox(height: Get.height * 0.02);
            },
          )
        ],
      ),
    );
  }

  static Shimmer pendingBookingShimmer() {
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
                                child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(10),
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
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                                height: 18,
                                width: 100,
                                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                            Container(
                                height: 18,
                                width: 100,
                                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                          ],
                        ),
                      ),
                      SizedBox(height: Get.height * 0.02),
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

  static Shimmer completeBookingShimmer() {
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
                                    child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(10),
                                  )),
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
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                  height: 18,
                                  width: 100,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                              Container(
                                  height: 18,
                                  width: 100,
                                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                            ],
                          ),
                        ),
                        SizedBox(height: Get.height * 0.02),
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
        ));
  }

  static Shimmer cancelBookingShimmer() {
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
                                  child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(10),
                                )),
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
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                                height: 18,
                                width: 100,
                                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                            Container(
                                height: 18,
                                width: 100,
                                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                          ],
                        ),
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

  static Shimmer notificationShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.builder(
        itemCount: 10,
        padding: const EdgeInsets.all(10),
        physics: const BouncingScrollPhysics(),
        shrinkWrap: true,
        scrollDirection: Axis.vertical,
        itemBuilder: (context, index) {
          return Row(
            children: [
              Container(
                height: 50,
                width: 50,
                margin: const EdgeInsets.only(bottom: 10, right: 10),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.red,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      height: 14,
                      width: 95,
                      margin: const EdgeInsets.only(bottom: 10, right: 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        color: AppColors.red,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          height: 12.5,
                          width: 140,
                          margin: const EdgeInsets.only(bottom: 10, right: 10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(5),
                            color: AppColors.red,
                          ),
                        ),
                        Container(
                          height: 12.5,
                          width: 30,
                          margin: const EdgeInsets.only(bottom: 10, right: 10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(3),
                            color: AppColors.red,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  static Shimmer expertDetailShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red.withOpacity(0.3)),
                child: Column(
                  children: [
                    Container(
                      height: 110,
                      width: 110,
                      alignment: Alignment.center,
                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    ),
                    SizedBox(height: Get.height * 0.01),
                    Container(
                        height: 18,
                        width: 100,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
                    SizedBox(height: Get.height * 0.015),
                    Container(
                      width: Get.width * 0.19,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(7), color: Colors.red),
                    ),
                    SizedBox(height: Get.height * 0.015),
                    Divider(thickness: 1, color: AppColors.greyColor.withOpacity(0.2)),
                    SizedBox(height: Get.height * 0.015),
                    Row(children: [
                      Container(
                        height: 45,
                        width: 45,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                      ),
                      SizedBox(width: Get.width * 0.03),
                      Container(
                          height: 16,
                          width: 100,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
                    ]),
                    SizedBox(height: Get.height * 0.014),
                    Row(children: [
                      Container(
                        height: 45,
                        width: 45,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                      ),
                      SizedBox(width: Get.width * 0.03),
                      Container(
                          height: 16,
                          width: 100,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
                    ]),
                    SizedBox(height: Get.height * 0.014),
                    Row(children: [
                      Container(
                        height: 45,
                        width: 45,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                      ),
                      SizedBox(width: Get.width * 0.03),
                      Container(
                          height: 16,
                          width: 100,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.red)),
                    ]),
                  ],
                ),
              ),
              SizedBox(height: Get.height * 0.02),
              ListView.separated(
                itemCount: 2,
                shrinkWrap: true,
                padding: EdgeInsets.zero,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.red.withOpacity(0.3),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              height: 16,
                              width: 50,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.red.withOpacity(0.3),
                              ),
                            ),
                            Container(
                              width: Get.width * 0.14,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 5,
                              ),
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6), color: AppColors.oceanBlue.withOpacity(0.3)),
                            ),
                          ],
                        ),
                        SizedBox(height: Get.height * 0.01),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              height: 14,
                              width: 55,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.red.withOpacity(0.3),
                              ),
                            ),
                            Container(
                              height: 13,
                              width: 50,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.red.withOpacity(0.3),
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  );
                },
                separatorBuilder: (context, index) {
                  return SizedBox(height: Get.height * 0.02);
                },
              )
            ],
          ),
        ),
      ),
    );
  }

  static Shimmer expertReviewShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: ListView.separated(
        itemCount: 10,
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        itemBuilder: (context, index) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.red.withOpacity(0.3),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      height: 16,
                      width: 60,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                    ),
                    Container(
                      width: Get.width * 0.14,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(6), color: Colors.red),
                    ),
                  ],
                ),
                SizedBox(height: Get.height * 0.01),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      height: 14,
                      width: 60,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                    ),
                    Container(
                      height: 13,
                      width: 60,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.red),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
        separatorBuilder: (context, index) {
          return SizedBox(height: Get.height * 0.02);
        },
      ),
    );
  }

  static Shimmer branchDetailShimmer() {
    return Shimmer.fromColors(
      baseColor: Constant.baseColor,
      highlightColor: Constant.highlightColor,
      period: Constant.period,
      child: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverList(
              delegate: SliverChildListDelegate.fixed(
                [
                  Container(
                    height: 20,
                    width: 20,
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5)),
                  ).paddingOnly(top: 10, left: 15, right: 230, bottom: 10),
                  Row(
                    children: [
                      Container(
                        height: 20,
                        width: 20,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5)),
                      ).paddingOnly(right: 10),
                      Container(
                        height: 20,
                        width: Get.width * 0.75,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5)),
                      ),
                    ],
                  ).paddingOnly(left: 15, right: 15, bottom: 10),
                  Row(
                    children: [
                      Container(
                        height: 20,
                        width: 20,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5)),
                      ).paddingOnly(right: 10),
                      Container(
                        height: 20,
                        width: 180,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5)),
                      ),
                    ],
                  ).paddingOnly(left: 15, right: 15, bottom: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        height: 50,
                        width: Get.width * 0.44,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(13)),
                      ),
                      Container(
                        height: 50,
                        width: Get.width * 0.44,
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(13)),
                      )
                    ],
                  ).paddingOnly(left: 15, right: 15, bottom: 10, top: 10),
                  Divider(color: AppColors.greyColor.withOpacity(0.2)),
                ],
              ),
            ),
          ];
        },
        body: Column(
          children: [
            GetBuilder<BranchDetailController>(
              builder: (logic) {
                return TabBar(
                  controller: logic.tabController,
                  tabs: logic.tabs,
                  labelStyle: const TextStyle(
                    fontSize: 16,
                    fontFamily: FontFamily.sfProDisplayRegular,
                  ),
                  physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  indicatorPadding: const EdgeInsets.all(3),
                  indicator: BoxDecoration(
                    borderRadius: BorderRadius.circular(55),
                    color: Colors.red.withOpacity(0.3),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: Colors.red,
                  unselectedLabelStyle: const TextStyle(
                    fontFamily: FontFamily.sfProDisplayRegular,
                    fontSize: 15,
                  ),
                  isScrollable: false,
                  unselectedLabelColor: Colors.red,
                  dividerColor: Colors.transparent,
                );
              },
            ),
            Expanded(
              child: GetBuilder<BranchDetailController>(
                builder: (logic) {
                  return TabBarView(
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    controller: logic.tabController,
                    children: [
                      SizedBox(
                        height: Get.height * 0.28,
                        child: ListView.separated(
                          itemCount: 4,
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          itemBuilder: (context, index) {
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        height: 100,
                                        width: 100,
                                        decoration: BoxDecoration(
                                            border: Border.all(width: 1.5, color: AppColors.red),
                                            borderRadius: BorderRadius.circular(10)),
                                        child: Image.asset(AppAsset.icServicePlaceholder).paddingOnly(top: 10, bottom: 10),
                                      ),
                                    ),
                                    SizedBox(width: Get.width * 0.03),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                            height: 18,
                                            width: 85,
                                            decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5))),
                                        SizedBox(height: Get.height * 0.01),
                                        Container(
                                            height: 15,
                                            width: 110,
                                            decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5))),
                                        SizedBox(height: Get.height * 0.03),
                                        Container(
                                            height: 20,
                                            width: 50,
                                            decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(5))),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                          separatorBuilder: (context, index) {
                            return SizedBox(height: Get.height * 0.02);
                          },
                        ),
                      ).paddingOnly(left: 15, right: 15),
                      SizedBox(
                        height: Get.height * 0.28,
                        child: ListView.separated(
                          itemCount: 4,
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          itemBuilder: (context, index) {
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        height: 100,
                                        width: 100,
                                        decoration: BoxDecoration(
                                            border: Border.all(width: 1.5, color: AppColors.red),
                                            borderRadius: BorderRadius.circular(10)),
                                        child: Image.asset(AppAsset.icServicePlaceholder).paddingOnly(top: 10, bottom: 10),
                                      ),
                                    ),
                                    SizedBox(width: Get.width * 0.03),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                            height: 18,
                                            width: 100,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                            height: 15,
                                            width: 150,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                            height: 16,
                                            width: 80,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                          separatorBuilder: (context, index) {
                            return SizedBox(height: Get.height * 0.02);
                          },
                        ),
                      ).paddingOnly(left: 15, right: 15),
                      SizedBox(
                        height: Get.height * 0.28,
                        child: ListView.separated(
                          itemCount: 4,
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          itemBuilder: (context, index) {
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        height: 100,
                                        width: 100,
                                        decoration: BoxDecoration(
                                            border: Border.all(width: 1.5, color: AppColors.red),
                                            borderRadius: BorderRadius.circular(10)),
                                        child: Image.asset(AppAsset.icServicePlaceholder).paddingOnly(top: 10, bottom: 10),
                                      ),
                                    ),
                                    SizedBox(width: Get.width * 0.03),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                            height: 18,
                                            width: 100,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                            height: 15,
                                            width: 150,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                            height: 16,
                                            width: 80,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                          separatorBuilder: (context, index) {
                            return SizedBox(height: Get.height * 0.02);
                          },
                        ),
                      ).paddingOnly(left: 15, right: 15),
                      SizedBox(
                        height: Get.height * 0.28,
                        child: ListView.separated(
                          itemCount: 4,
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          itemBuilder: (context, index) {
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Container(
                                        height: 100,
                                        width: 100,
                                        decoration: BoxDecoration(
                                            border: Border.all(width: 1.5, color: AppColors.red),
                                            borderRadius: BorderRadius.circular(10)),
                                        child: Image.asset(AppAsset.icServicePlaceholder).paddingOnly(top: 10, bottom: 10),
                                      ),
                                    ),
                                    SizedBox(width: Get.width * 0.03),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                            height: 18,
                                            width: 100,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                            height: 15,
                                            width: 150,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                            height: 16,
                                            width: 80,
                                            decoration:
                                                BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10))),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                          separatorBuilder: (context, index) {
                            return SizedBox(height: Get.height * 0.02);
                          },
                        ),
                      ).paddingOnly(left: 15, right: 15),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
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
                          borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.red, width: 1.2)),
                      child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(10),
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
                color: AppColors.green2,
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
}
