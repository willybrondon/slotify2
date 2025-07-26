import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

/// =================== Branch Detail Top view =================== ///
class BranchDetailTopView extends StatelessWidget {
  const BranchDetailTopView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return PreferredSize(
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
                ).paddingOnly(left: 20, top: 25),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// =================== Branch Detail Info view =================== ///
class BranchDetailInfoView extends StatelessWidget {
  const BranchDetailInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? Shimmers.branchDetailShimmer()
            : NestedScrollView(
                headerSliverBuilder: (context, innerBoxIsScrolled) {
                  return [
                    const SliverList(
                      delegate: SliverChildListDelegate.fixed(
                        [BranchDetailDataView()],
                      ),
                    ),
                  ];
                },
                body: const BranchDetailTabView(),
              );
      },
    );
  }
}

class BranchDetailDataView extends StatelessWidget {
  const BranchDetailDataView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Container(
          color: AppColors.detailBg,
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    logic.getSalonDetailCategory?.salon?.name ?? "",
                    style: TextStyle(
                      color: AppColors.appText,
                      fontFamily: AppFontFamily.heeBo800,
                      fontSize: 18,
                    ),
                  ),
                ],
              ).paddingOnly(top: 10, left: 15, right: 15, bottom: 10),
              Row(
                children: [
                  Image.asset(
                    AppAsset.icLocation,
                    height: 22,
                    width: 22,
                  ).paddingOnly(right: 8),
                  SizedBox(
                    width: Get.width * 0.8,
                    child: Text(
                      "${logic.getSalonDetailCategory?.salon?.addressDetails?.addressLine1}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.landMark}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.city}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.state}, ${logic.getSalonDetailCategory?.salon?.addressDetails?.country}",
                      style: TextStyle(
                        color: AppColors.termsDialog,
                        fontFamily: AppFontFamily.heeBo600,
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
                    height: 22,
                    width: 22,
                  ).paddingOnly(right: 8),
                  RichText(
                    text: TextSpan(
                      text: logic.getSalonDetailCategory?.salon?.distance == null
                          ? ""
                          : "${logic.getSalonDetailCategory?.salon?.distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.appText,
                        fontFamily: AppFontFamily.heeBo600,
                      ),
                      children: <TextSpan>[
                        TextSpan(
                          text: 'txtFromLocation'.tr,
                          style: TextStyle(
                            fontSize: 14,
                            fontFamily: AppFontFamily.heeBo600,
                            color: AppColors.termsDialog,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ).paddingOnly(left: 15, right: 15, bottom: 10),
              Row(
                children: [
                  Image.asset(
                    AppAsset.icStarFilled,
                    height: 19,
                    width: 19,
                  ).paddingOnly(right: 8),
                  RichText(
                    text: TextSpan(
                      text: "4.8",
                      style: TextStyle(
                        color: AppColors.ratingYellow,
                        fontSize: 16.5,
                        fontFamily: AppFontFamily.heeBo700,
                      ),
                      children: <TextSpan>[
                        TextSpan(
                          text: "  (1280)",
                          style: TextStyle(
                            fontSize: 14,
                            fontFamily: AppFontFamily.heeBo600,
                            color: AppColors.termsDialog,
                          ),
                        ),
                      ],
                    ),
                  ).paddingOnly(top: 3),
                ],
              ).paddingOnly(left: 15, right: 15, bottom: 10),
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
                          borderRadius: BorderRadius.circular(10),
                          color: AppColors.appText,
                          boxShadow: Constant.boxShadow,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset(
                              AppAsset.icDirectionFilled,
                              height: 24,
                              width: 24,
                            ).paddingOnly(right: 12),
                            Text(
                              "txtDirection".tr,
                              style: TextStyle(
                                color: AppColors.whiteColor,
                                fontFamily: AppFontFamily.heeBo600,
                                fontSize: 17,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        logic.makingPhoneCall();
                      },
                      child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: AppColors.callBox,
                          boxShadow: Constant.boxShadow,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset(
                              AppAsset.icCallFilled,
                              height: 24,
                              width: 24,
                            ).paddingOnly(right: 12),
                            Text(
                              "txtCallSalon".tr,
                              style: TextStyle(
                                color: AppColors.whiteColor,
                                fontFamily: AppFontFamily.heeBo600,
                                fontSize: 17,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ).paddingOnly(left: 15, right: 15, bottom: 20, top: 3),
            ],
          ),
        );
      },
    );
  }
}

/// =================== Branch Detail TabBar view =================== ///
class BranchDetailTabView extends StatelessWidget {
  const BranchDetailTabView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const BranchDetailTabBarView(),
        Divider(color: AppColors.greyColor.withOpacity(0.2)).paddingOnly(bottom: 5),
        const BranchDetailTabBarItemView(),
      ],
    );
  }
}

class BranchDetailTabBarView extends StatelessWidget {
  const BranchDetailTabBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BranchDetailController>(
      builder: (logic) {
        return Align(
          alignment: AlignmentDirectional.centerStart,
          child: TabBar(
            tabAlignment: TabAlignment.start,
            controller: logic.tabController,
            tabs: logic.tabs,
            isScrollable: true,
            labelStyle: const TextStyle(
              fontSize: 16,
              fontFamily: AppFontFamily.heeBo500,
            ),
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            indicatorPadding: const EdgeInsets.all(3),
            indicator: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: AppColors.primaryAppColor,
            ),
            indicatorSize: TabBarIndicatorSize.tab,
            labelColor: AppColors.whiteColor,
            unselectedLabelStyle: const TextStyle(
              fontFamily: AppFontFamily.heeBo500,
              fontSize: 15,
            ),
            unselectedLabelColor: AppColors.service,
            dividerColor: Colors.transparent,
            overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          ),
        );
      },
    );
  }
}

/// =================== Branch Detail TabBar item iew =================== ///
class BranchDetailTabBarItemView extends StatelessWidget {
  const BranchDetailTabBarItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GetBuilder<BranchDetailController>(
        builder: (logic) {
          return TabBarView(
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            controller: logic.tabController,
            children: const [
              BranchDetailTabBarServiceView(),
              BranchDetailTabBarProductView(),
              BranchDetailTabBarStaffView(),
              BranchDetailTabBarGalleryView(),
              BranchDetailTabBarReviewView(),
              BranchDetailTabBarAboutView(),
            ],
          );
        },
      ),
    );
  }
}

/// =================== About View
class BranchDetailTabBarAboutView extends StatelessWidget {
  const BranchDetailTabBarAboutView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: GetBuilder<BranchDetailController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                logic.getSalonDetailCategory?.salon?.about?.isEmpty == true
                    ? const SizedBox()
                    : Text(
                        logic.getSalonDetailCategory?.salon?.about ?? "",
                        style: TextStyle(
                          color: AppColors.termsDialog,
                          fontFamily: AppFontFamily.heeBo400,
                          fontSize: 13,
                        ),
                      ).paddingOnly(bottom: 13),
                Text(
                  "txtWorkingHours".tr,
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo800,
                    color: AppColors.locationText,
                    fontSize: 18,
                  ),
                ),
                for (logic.index = 0; logic.index < (logic.getSalonDetailCategory?.salon?.salonTime?.length ?? 0); logic.index++)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        logic.getSalonDetailCategory?.salon?.salonTime?[logic.index].day ?? "",
                        style: TextStyle(
                          fontSize: 15,
                          fontFamily: AppFontFamily.heeBo500,
                          color: AppColors.service,
                        ),
                      ).paddingOnly(top: 15),
                      Text(
                        "${logic.getSalonDetailCategory?.salon?.salonTime?[logic.index].openTime} - ${logic.getSalonDetailCategory?.salon?.salonTime?[logic.index].closedTime}",
                        style: TextStyle(
                          fontSize: 15,
                          fontFamily: AppFontFamily.heeBo700,
                          color: AppColors.primaryAppColor,
                        ),
                      ).paddingOnly(top: 15)
                    ],
                  ),
              ],
            ).paddingOnly(left: 15, right: 15);
          },
        ),
      ),
    );
  }
}

/// =================== Service View
class BranchDetailTabBarServiceView extends StatelessWidget {
  const BranchDetailTabBarServiceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: GetBuilder<BranchDetailController>(
        id: Constant.idBottomService,
        builder: (logic) {
          return logic.checkItem.isNotEmpty
              ? Container(
                  height: Get.height * 0.120,
                  width: double.infinity,
                  alignment: Alignment.bottomLeft,
                  decoration: BoxDecoration(
                    color: AppColors.categoryBottom,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.blackColor.withOpacity(0.05),
                        offset: const Offset(
                          0.0,
                          1.0,
                        ),
                        blurRadius: 2.0,
                        spreadRadius: 2.0,
                      ), //BoxShadow
                      const BoxShadow(
                        color: Colors.black12,
                        offset: Offset(0.0, 0.0),
                        blurRadius: 0.0,
                        spreadRadius: 0.0,
                      ),
                    ],
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              height: 23,
                              width: Get.width * 0.61,
                              child: SizedBox(
                                height: 20,
                                width: Get.width * 0.02,
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: Text(
                                    logic.checkItem.join(", "),
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 17,
                                      color: AppColors.categoryService,
                                    ),
                                  ),
                                ),
                              ),
                            ).paddingOnly(left: 5, bottom: 7),
                            Row(
                              children: [
                                Text(
                                  "$currency ${logic.withOutTaxRupee.toStringAsFixed(2)}",
                                  style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 15,
                                      color: AppColors.currency.withOpacity(0.9)),
                                ),
                                Text(
                                  " ($currency${logic.finalTaxRupee.toStringAsFixed(2)} ${"txtTax".tr})",
                                  style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 12,
                                      color: AppColors.currency.withOpacity(0.9)),
                                ),
                                SizedBox(width: Get.width * 0.02),
                                Text(
                                  "= $currency ${logic.totalPrice.toStringAsFixed(2)}",
                                  style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold, fontSize: 17, color: AppColors.currency),
                                ),
                              ],
                            ).paddingOnly(left: 5),
                          ],
                        ),
                      ),
                      const Spacer(),
                      AppButton(
                        height: 50,
                        buttonColor: AppColors.primaryAppColor,
                        buttonText: "txtBookNow".tr,
                        width: Get.width * 0.28,
                        fontFamily: AppFontFamily.sfProDisplay,
                        color: AppColors.whiteColor,
                        onTap: () async {
                          if (Constant.storage.read<bool>('isLogIn') ?? false) {
                            log("Total Minute :: ${logic.totalMinute}");
                            Get.toNamed(AppRoutes.booking, arguments: [
                              logic.checkItem,
                              double.parse(logic.totalPrice.toStringAsFixed(2)),
                              double.parse(logic.finalTaxRupee.toStringAsFixed(2)),
                              logic.totalMinute,
                              logic.serviceId,
                              logic.withOutTaxRupee,
                              logic.salonId
                            ]);
                          } else {
                            Get.toNamed(AppRoutes.signIn, arguments: [logic.checkItem.isNotEmpty]);
                            await Get.find<SignInController>().getDataFromArgs();
                          }
                        },
                      )
                    ],
                  ),
                )
              : const SizedBox();
        },
      ),
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.isLoading.value == true
              ? Shimmers.serviceBranchShimmer()
              : logic.getSalonDetailCategory?.salon?.serviceIds?.isEmpty == true
                  ? Center(
                      child: Column(
                        children: [
                          Image.asset(
                            AppAsset.icNoService,
                            height: 170,
                            width: 170,
                          ).paddingOnly(top: 50),
                          Text(
                            "txtNotAvailableServices".tr,
                            style: TextStyle(
                              color: AppColors.primaryTextColor,
                              fontFamily: AppFontFamily.sfProDisplay,
                              fontSize: 18,
                            ),
                          )
                        ],
                      ),
                    )
                  : GetBuilder<BranchDetailController>(
                      id: Constant.idServiceList,
                      builder: (logic) {
                        return GridView.builder(
                          itemCount: logic.getSalonDetailCategory?.salon?.serviceIds?.length ?? 0,
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.87,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                          ),
                          itemBuilder: (context, index) {
                            return GestureDetector(
                              onTap: () {
                                if (logic.isBranchSelected[index] == true) {
                                  logic.onCheckBoxClick(false, index);
                                } else {
                                  logic.onCheckBoxClick(true, index);
                                }
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(18),
                                  color: AppColors.whiteColor,
                                  border: Border.all(
                                    color: AppColors.serviceBgBorder,
                                    width: 1,
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Expanded(
                                      child: Container(
                                        width: Get.width,
                                        decoration: const BoxDecoration(
                                          borderRadius:
                                              BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16)),
                                        ),
                                        clipBehavior: Clip.hardEdge,
                                        child: CachedNetworkImage(
                                          imageUrl:
                                              "${logic.getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.image}",
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icServicePlaceholder).paddingAll(11);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset.icServicePlaceholder).paddingAll(11);
                                          },
                                        ),
                                      ).paddingOnly(left: 3, right: 3, top: 3),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              SizedBox(
                                                width: Get.width * 0.3,
                                                child: Text(
                                                  logic.getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.name ?? "",
                                                  overflow: TextOverflow.ellipsis,
                                                  style: TextStyle(
                                                    fontFamily: AppFontFamily.heeBo700,
                                                    fontSize: 13.5,
                                                    color: AppColors.appText,
                                                  ),
                                                ),
                                              ),
                                              const Spacer(),
                                              Image.asset(
                                                AppAsset.icStarFilled,
                                                height: 14,
                                                width: 14,
                                              ).paddingOnly(right: 5),
                                              Text(
                                                "4.8",
                                                style: TextStyle(
                                                  color: AppColors.ratingYellow,
                                                  fontSize: 12,
                                                  fontFamily: AppFontFamily.heeBo700,
                                                ),
                                              ).paddingOnly(top: 3),
                                            ],
                                          ),
                                          Text(
                                            "${logic.getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.duration} ${"txtMinutes".tr}",
                                            style: TextStyle(
                                              fontFamily: AppFontFamily.heeBo600,
                                              fontSize: 13,
                                              color: AppColors.service,
                                            ),
                                          ).paddingOnly(top: 4, bottom: 4),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                "$currency ${logic.getSalonDetailCategory?.salon?.serviceIds?[index].price?.toStringAsFixed(2)}",
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo800,
                                                  fontSize: 14.5,
                                                  color: AppColors.primaryAppColor,
                                                ),
                                              ),
                                              GestureDetector(
                                                onTap: () {
                                                  if (logic.isBranchSelected[index] == true) {
                                                    logic.onCheckBoxClick(false, index);
                                                  } else {
                                                    logic.onCheckBoxClick(true, index);
                                                  }
                                                },
                                                child: logic.isBranchSelected[index]
                                                    ? Image.asset(AppAsset.icCheckRound, height: 28)
                                                    : Image.asset(AppAsset.icPlusRound, height: 28),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ).paddingOnly(left: 12, right: 12, bottom: 12);
                      },
                    );
        },
      ),
    );
  }
}

/// =================== Product View
class BranchDetailTabBarProductView extends StatelessWidget {
  const BranchDetailTabBarProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getSalonDetailCategory?.product?.isEmpty == true
              ? Center(
                  child: Column(
                    children: [
                      Image.asset(
                        AppAsset.icNoService,
                        height: 170,
                        width: 170,
                      ).paddingOnly(top: 50),
                      Text(
                        "desNoProductFound".tr,
                        style: TextStyle(
                          color: AppColors.primaryTextColor,
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 18,
                        ),
                      )
                    ],
                  ),
                )
              : GridView.builder(
                  scrollDirection: Axis.vertical,
                  physics: const ScrollPhysics(),
                  padding: EdgeInsets.zero,
                  shrinkWrap: true,
                  itemCount: logic.getSalonDetailCategory?.product?.length ?? 0,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.68,
                    crossAxisSpacing: 10,
                  ),
                  itemBuilder: (BuildContext context, int index) {
                    return InkWell(
                      onTap: () async {
                        if (Constant.storage.read<bool>('isLogIn') ?? false) {
                          Get.toNamed(
                            AppRoutes.productDetail,
                            arguments: [
                              logic.getSalonDetailCategory?.product?[index].id,
                            ],
                          );
                        } else {
                          Get.toNamed(AppRoutes.signIn, arguments: [logic.checkItem.isNotEmpty]);
                          await Get.find<SignInController>().getDataFromArgs();
                        }
                      },
                      overlayColor: WidgetStateColor.transparent,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(21),
                          color: AppColors.whiteColor,
                          boxShadow: Constant.boxShadow,
                          border: Border.all(
                            color: AppColors.grey.withOpacity(0.1),
                            width: 1,
                          ),
                        ),
                        child: Stack(
                          children: [
                            Column(
                              children: [
                                const Spacer(),
                                const Spacer(),
                                const Spacer(),
                                const Spacer(),
                                CachedNetworkImage(
                                  imageUrl: logic.getSalonDetailCategory?.product?[index].mainImage ?? "",
                                  height: 80,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) {
                                    return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                  },
                                  errorWidget: (context, url, error) {
                                    return Image.asset(AppAsset.icImagePlaceholder).paddingAll(30);
                                  },
                                ),
                                const Spacer(),
                                Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    Constant.capitalizeFirstLetter(
                                        logic.getSalonDetailCategory?.product?[index].productName ?? ""),
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 14,
                                      color: AppColors.appText,
                                    ),
                                  ).paddingOnly(left: 10, right: 5),
                                ),
                                const Spacer(),
                                Row(
                                  children: [
                                    Container(
                                      decoration: BoxDecoration(
                                        color: AppColors.currencyBg,
                                        borderRadius: BorderRadius.circular(34),
                                      ),
                                      padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 9),
                                      child: Text(
                                        "$currency ${logic.getSalonDetailCategory?.product?[index].price ?? ""}",
                                        style: TextStyle(
                                          fontFamily: AppFontFamily.heeBo800,
                                          fontSize: 14,
                                          color: AppColors.primaryAppColor,
                                        ),
                                      ),
                                    ).paddingOnly(right: 7),
                                  ],
                                ).paddingOnly(left: 10, right: 6),
                                const Spacer(),
                              ],
                            ),
                            logic.getSalonDetailCategory?.salon?.isBestSeller == true
                                ? Container(
                                    height: 22,
                                    width: Get.width * 0.18,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(21),
                                        bottomRight: Radius.circular(21),
                                        topRight: Radius.circular(21),
                                      ),
                                      color: AppColors.sellerBg,
                                    ),
                                    child: Text(
                                      "txtBestSeller".tr,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.heeBo700,
                                        fontSize: 10,
                                        color: AppColors.sellerYellow,
                                      ),
                                    ),
                                  )
                                : const SizedBox(),
                          ],
                        ),
                      ).paddingOnly(bottom: 10),
                    );
                  },
                ).paddingOnly(left: 12, right: 12, bottom: 12);
        },
      ),
    );
  }
}

/// =================== Staff View
class BranchDetailTabBarStaffView extends StatelessWidget {
  const BranchDetailTabBarStaffView({super.key});

  @override
  Widget build(BuildContext context) {
    HomeScreenController homeScreenController = Get.find<HomeScreenController>();

    return Scaffold(
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.isLoading.value == true
              ? Shimmers.selectExpertShimmer()
              : logic.getSalonDetailCategory?.experts?.isEmpty == true
                  ? Center(
                      child: Column(
                        children: [
                          Image.asset(AppAsset.icNoExpert, height: 150, width: 150).paddingOnly(bottom: 7),
                          Text(
                            "txtNoFoundExpert".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplay,
                              fontSize: 18,
                              color: AppColors.primaryTextColor,
                            ),
                          )
                        ],
                      ),
                    ).paddingOnly(top: Get.height * 0.1)
                  : GridView.builder(
                      scrollDirection: Axis.vertical,
                      physics: const ScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount: logic.getSalonDetailCategory?.experts?.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.80,
                        crossAxisSpacing: 13.5,
                        mainAxisSpacing: 2,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        logic.rating = logic.getSalonDetailCategory?.experts?[index].review;
                        logic.roundedRating = logic.rating?.round();
                        logic.filledStars = logic.roundedRating?.clamp(0, 5);

                        return InkWell(
                          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                          onTap: () {
                            homeScreenController.onGetExpertApiCall(
                                expertId: logic.getSalonDetailCategory?.experts?[index].id ?? "");

                            Get.toNamed(
                              AppRoutes.expertDetail,
                              arguments: [
                                logic.getSalonDetailCategory?.experts?[index].id,
                                index,
                                logic.getSalonDetailCategory?.experts?[index].review
                              ],
                            );
                          },
                          child: Container(
                            width: Get.width * 0.45,
                            margin: const EdgeInsets.only(top: 10),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(18),
                              color: AppColors.whiteColor,
                              boxShadow: Constant.boxShadow,
                            ),
                            child: Align(
                              alignment: Alignment.center,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  DottedBorder(
                                    color: AppColors.roundBorder,
                                    borderType: BorderType.RRect,
                                    radius: const Radius.circular(41),
                                    strokeWidth: 1,
                                    dashPattern: const [3, 3],
                                    child: Container(
                                      height: 80,
                                      width: 80,
                                      decoration: const BoxDecoration(shape: BoxShape.circle),
                                      clipBehavior: Clip.hardEdge,
                                      child: CachedNetworkImage(
                                        imageUrl: "${logic.getSalonDetailCategory?.experts?[index].image}",
                                        fit: BoxFit.cover,
                                        placeholder: (context, url) {
                                          return Image.asset(AppAsset.icPlaceHolder);
                                        },
                                        errorWidget: (context, url, error) {
                                          return Image.asset(AppAsset.icPlaceHolder);
                                        },
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: Get.height * 0.015),
                                  Text(
                                    "${logic.getSalonDetailCategory?.experts?[index].fname} ${logic.getSalonDetailCategory?.experts?[index].lname}",
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 15.5,
                                      color: AppColors.appText,
                                    ),
                                  ),
                                  SizedBox(height: Get.height * 0.015),
                                  Container(
                                    height: 32,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8),
                                      color: AppColors.yellow2,
                                    ),
                                    child: SizedBox(
                                      height: 15,
                                      child: ListView.separated(
                                        shrinkWrap: true,
                                        itemCount: 5,
                                        scrollDirection: Axis.horizontal,
                                        padding: const EdgeInsets.symmetric(horizontal: 13),
                                        itemBuilder: (context, index) {
                                          if (index < (logic.filledStars ?? 0)) {
                                            return Image.asset(
                                              AppAsset.icStarFilled,
                                              height: 15,
                                              width: 15,
                                            );
                                          } else {
                                            return Image.asset(
                                              AppAsset.icStarOutline,
                                              height: 15,
                                              width: 15,
                                            );
                                          }
                                        },
                                        separatorBuilder: (context, index) {
                                          return SizedBox(width: Get.width * 0.017);
                                        },
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ).paddingOnly(left: 15, right: 15);
        },
      ),
    );
  }
}

/// =================== Review View
class BranchDetailTabBarReviewView extends StatelessWidget {
  const BranchDetailTabBarReviewView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return logic.getSalonDetailCategory?.reviews?.isEmpty == true
              ? Center(
                  child: Column(
                    children: [
                      Image.asset(AppAsset.icNoReview, height: 152, width: 152),
                      Text(
                        "txtNoReviewSalon".tr,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplay,
                          fontSize: 18,
                          color: AppColors.primaryTextColor,
                        ),
                      )
                    ],
                  ),
                ).paddingOnly(top: 50)
              : ListView.separated(
                  itemCount: logic.getSalonDetailCategory?.reviews?.length ?? 0,
                  shrinkWrap: true,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  itemBuilder: (context, index) {
                    String dateTimeString = logic.getSalonDetailCategory?.reviews?[index].createdAt.toString() ?? "";
                    DateTime dateTime = DateTime.parse(dateTimeString);
                    logic.date = DateFormat('yyyy-MM-dd').format(dateTime);

                    log("The date is :: ${logic.date}");

                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 15),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: AppColors.whiteColor,
                        boxShadow: Constant.boxShadow,
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "${logic.getSalonDetailCategory?.reviews?[index].userId?.fname} ${logic.getSalonDetailCategory?.reviews?[index].userId?.lname}",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 18,
                                  color: AppColors.appText,
                                ),
                              ),
                              Container(
                                width: Get.width * 0.14,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  color: AppColors.oceanBlue.withOpacity(0.30),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Image.asset(
                                      (logic.getSalonDetailCategory?.reviews?[index].rating ?? 0) >= 4
                                          ? AppAsset.icGreenStar
                                          : AppAsset.icRedStar,
                                      height: 15,
                                      width: 15,
                                    ),
                                    SizedBox(width: Get.width * 0.02),
                                    Text(
                                      "${logic.getSalonDetailCategory?.reviews?[index].rating}",
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayBold,
                                        fontSize: 15,
                                        color: AppColors.blackColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                logic.getSalonDetailCategory?.reviews?[index].review ?? "",
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo500,
                                  fontSize: 14,
                                  color: AppColors.termsDialog,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: Text(
                                  logic.date ?? "",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.heeBo600,
                                    fontSize: 13,
                                    color: AppColors.termsDialog,
                                  ),
                                ),
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
                );
        },
      ),
    );
  }
}

/// =================== Gallery View
class BranchDetailTabBarGalleryView extends StatelessWidget {
  const BranchDetailTabBarGalleryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      body: GetBuilder<BranchDetailController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return GridView.builder(
            scrollDirection: Axis.vertical,
            physics: const ScrollPhysics(),
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            itemCount: logic.getSalonDetailCategory?.salon?.image?.length ?? 0,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 0.75,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              mainAxisExtent: 120,
            ),
            itemBuilder: (context, index) {
              return Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  color: AppColors.grey.withOpacity(0.5),
                ),
                clipBehavior: Clip.hardEdge,
                child: CachedNetworkImage(
                  imageUrl: logic.getSalonDetailCategory?.salon?.image?[index] ?? "",
                  fit: BoxFit.cover,
                  placeholder: (context, url) {
                    return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                  },
                  errorWidget: (context, url, error) {
                    return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                  },
                ),
              );
            },
          ).paddingAll(12);
        },
      ),
    );
  }
}
