// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/branch_detail_screen/widget/review_branch_screen.dart';
import 'package:salon_2/ui/branch_detail_screen/widget/about_branch_screen.dart';
import 'package:salon_2/ui/branch_detail_screen/widget/service_branch_screen.dart';
import 'package:salon_2/ui/branch_detail_screen/widget/staff_branch_screen.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class BranchDetailScreen extends StatelessWidget {
  BranchDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return Scaffold(
            appBar: PreferredSize(
              preferredSize: const Size.fromHeight(230),
              child: Stack(
                children: [
                  Container(
                    height: Get.height * 0.3,
                    width: Get.width,
                    decoration: BoxDecoration(
                      color: AppColors.transparent,
                    ),
                    clipBehavior: Clip.hardEdge,
                    child: CachedNetworkImage(
                      imageUrl: "${logic.getSalonDetailCategory?.salon?.mainImage}",
                      fit: BoxFit.cover,
                      placeholder: (context, url) {
                        return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                      },
                      errorWidget: (context, url, error) {
                        return Image.asset(AppAsset.icImagePlaceholder).paddingAll(30);
                      },
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      Get.back();
                    },
                    child: Image.asset(
                      AppAsset.icBackArrow,
                      height: 25,
                      width: 25,
                      color: AppColors.whiteColor,
                    ).paddingOnly(left: 15, top: 15),
                  ),
                ],
              ),
            ),
            body: logic.isLoading.value
                ? Shimmers.branchDetailShimmer()
                : NestedScrollView(
                    headerSliverBuilder: (context, innerBoxIsScrolled) {
                      return [
                        SliverList(
                          delegate: SliverChildListDelegate.fixed(
                            [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    logic.getSalonDetailCategory?.salon?.name ?? "",
                                    style: TextStyle(
                                      color: AppColors.primaryTextColor,
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      fontSize: 16.5,
                                    ),
                                  ),
                                ],
                              ).paddingOnly(top: 10, left: 15, right: 15, bottom: 10),
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
                                      "${logic.getSalonDetailCategory?.salon?.addressDetails?.addressLine1}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.landMark}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.city}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.state}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.country}",
                                      style: TextStyle(
                                        color: AppColors.locationText,
                                        fontFamily: FontFamily.sfProDisplay,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                ],
                              ).paddingOnly(left: 15, right: 15, bottom: 10),
                              Row(
                                children: [
                                  Image.asset(
                                    AppAsset.icDirection,
                                    height: 20,
                                    width: 20,
                                  ).paddingOnly(right: 8),
                                  RichText(
                                    text: TextSpan(
                                      text: logic.getSalonDetailCategory?.salon?.distance == null
                                          ? ""
                                          : "${logic.getSalonDetailCategory?.salon?.distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                                      style: TextStyle(
                                        color: AppColors.locationText,
                                        fontSize: 13,
                                        fontFamily: FontFamily.sfProDisplayBold,
                                      ),
                                      children: <TextSpan>[
                                        TextSpan(
                                          text: 'txtFromLocation'.tr,
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontFamily: FontFamily.sfProDisplayMedium,
                                            color: AppColors.locationText,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ).paddingOnly(left: 15, right: 15, bottom: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      logic.launchMaps();
                                    },
                                    child: Container(
                                      height: 50,
                                      width: Get.width * 0.44,
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
                                  GetBuilder<BranchDetailController>(
                                    builder: (logic) {
                                      return GestureDetector(
                                        onTap: () {
                                          logic.makingPhoneCall();
                                        },
                                        child: Container(
                                          height: 50,
                                          width: Get.width * 0.44,
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
                                      );
                                    },
                                  ),
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
                              tabAlignment: TabAlignment.start,
                              controller: logic.tabController,
                              tabs: tabs,
                              isScrollable: true,
                              labelStyle: const TextStyle(
                                fontSize: 16,
                                fontFamily: FontFamily.sfProDisplayRegular,
                              ),
                              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              indicatorPadding: const EdgeInsets.all(3),
                              indicator: BoxDecoration(
                                borderRadius: BorderRadius.circular(55),
                                color: AppColors.primaryAppColor,
                              ),
                              indicatorSize: TabBarIndicatorSize.tab,
                              labelColor: AppColors.whiteColor,
                              unselectedLabelStyle: const TextStyle(
                                fontFamily: FontFamily.sfProDisplayRegular,
                                fontSize: 15,
                              ),
                              unselectedLabelColor: AppColors.service,
                              dividerColor: Colors.transparent,
                              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
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
                                  ServiceBranchScreen(),
                                  StaffBranchScreen(),
                                  ReviewBranchScreen(),
                                  AboutBranchScreen(),
                                ],
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
          );
        },
      ),
    );
  }

  var tabs = [
    Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [Image.asset(AppAsset.icServices, width: 18, height: 18).paddingOnly(right: 5), Text("txtServices".tr)],
      ),
    ),
    Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [Image.asset(AppAsset.icStaff, width: 20, height: 20).paddingOnly(right: 5), Text("txtStaff".tr)],
      ),
    ),
    Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [Image.asset(AppAsset.icReview, width: 18, height: 18).paddingOnly(right: 5), Text("txtReviews".tr)],
      ),
    ),
    Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [Image.asset(AppAsset.icAbout, width: 18, height: 18).paddingOnly(right: 5), Text("txtAbout".tr)],
      ),
    ),
  ];
}
