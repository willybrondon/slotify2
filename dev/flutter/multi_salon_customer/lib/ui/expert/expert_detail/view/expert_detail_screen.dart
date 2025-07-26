// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/expert_detail/expert_detail.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/ui/expert/expert_detail/widget/expert_service_detail_screen.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class ExpertDetailScreen extends StatelessWidget {
  ExpertDetailScreen({super.key});

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  ExpertDetailController expertDetailController = Get.find<ExpertDetailController>();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvoked: (bool didPop) {
        Constant.storage.remove("expertDetail");
        homeScreenController.onBack();
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "txtExpertsDetails".tr,
            method: InkWell(
              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
              onTap: () {
                Constant.storage.remove("expertDetail");
                homeScreenController.onBack();
                Get.back();
              },
              child: Icon(
                Icons.arrow_back,
                color: AppColors.whiteColor,
              ),
            ),
          ),
        ),
        bottomNavigationBar: GetBuilder<HomeScreenController>(
          id: Constant.idBottomService,
          builder: (logic) {
            return logic.checkItemExpert.isNotEmpty
                ? Container(
                    height: Get.height * 0.12,
                    width: double.infinity,
                    alignment: Alignment.bottomLeft,
                    decoration: BoxDecoration(
                      color: AppColors.primaryAppColor.withOpacity(0.1),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(16),
                        topRight: Radius.circular(16),
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
                                width: Get.width * 0.62,
                                child: SizedBox(
                                  height: 20,
                                  width: Get.width * 0.02,
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Text(
                                      logic.checkItemExpert.join(", "),
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplay,
                                        fontSize: 17.5,
                                        color: AppColors.categoryService,
                                      ),
                                    ),
                                  ),
                                ),
                              ).paddingOnly(left: 5, bottom: 7),
                              Row(
                                children: [
                                  Text(
                                    "$currency ${logic.withOutTaxRupeeExpert.toStringAsFixed(2)}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 15,
                                      color: AppColors.currency.withOpacity(0.9),
                                    ),
                                  ),
                                  Text(
                                    " ($currency${logic.finalTaxRupeeExpert.toStringAsFixed(2)} ${"txtTax".tr})",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 12,
                                      color: AppColors.currency.withOpacity(0.9),
                                    ),
                                  ),
                                  SizedBox(width: Get.width * 0.02),
                                  Text(
                                    "= $currency ${logic.totalPriceExpert.toStringAsFixed(2)}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      fontSize: 17,
                                      color: AppColors.currency,
                                    ),
                                  ),
                                ],
                              ).paddingOnly(left: 5),
                            ],
                          ),
                        ),
                        const Spacer(),
                        GetBuilder<HomeScreenController>(
                          id: Constant.idConfirm,
                          builder: (logic) {
                            return AppButton(
                              height: 50,
                              buttonColor: AppColors.primaryAppColor,
                              buttonText: "txtBookNow".tr,
                              width: Get.width * 0.28,
                              color: AppColors.whiteColor,
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              fontSize: 15,
                              onTap: () async {
                                if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                  Constant.storage
                                      .write("expertDetail", homeScreenController.getExpertCategory?.data?.expert?.id);

                                  Get.toNamed(AppRoutes.booking, arguments: [
                                    homeScreenController.checkItemExpert,
                                    homeScreenController.totalPriceExpert,
                                    homeScreenController.finalTaxRupeeExpert,
                                    homeScreenController.totalMinuteExpert,
                                    homeScreenController.serviceIdExpert,
                                    homeScreenController.withOutTaxRupeeExpert,
                                    homeScreenController.getExpertCategory?.data?.expert?.salonId?.id
                                  ]);
                                } else {
                                  Get.toNamed(AppRoutes.signIn, arguments: [homeScreenController.checkItemExpert.isNotEmpty]);
                                  await Get.find<SignInController>().getDataFromArgs();
                                }
                              },
                            );
                          },
                        )
                      ],
                    ),
                  )
                : const SizedBox();
          },
        ),
        body: GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            log("logic.getExpertCategory?.data?.services?.length :: ${logic.getExpertCategory?.data?.services?.length}");
            log("logic.isSelected.length :: ${logic.isExpertSelected.length}");

            return logic.isLoading.value == true
                ? Shimmers.expertDetailShimmer()
                : SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          GetBuilder<HomeScreenController>(
                            id: Constant.idExpertDetail,
                            builder: (logic) {
                              return logic.getExpertCategory != null
                                  ? Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                      margin: const EdgeInsets.only(top: 17),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                        color: AppColors.whiteColor,
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppColors.blackColor.withOpacity(0.02),
                                            offset: const Offset(
                                              0.0,
                                              1.0,
                                            ),
                                            blurRadius: 3.0,
                                            spreadRadius: 2.0,
                                          ),
                                          const BoxShadow(
                                            color: Colors.black12,
                                            offset: Offset(0.0, 0.0),
                                            blurRadius: 0.0,
                                            spreadRadius: 0.0,
                                          ),
                                        ],
                                      ),
                                      child: Column(
                                        children: [
                                          DottedBorder(
                                            color: AppColors.roundBorder,
                                            borderType: BorderType.RRect,
                                            radius: const Radius.circular(53),
                                            strokeWidth: 1,
                                            dashPattern: const [2.5, 2.5],
                                            child: Container(
                                              height: 102,
                                              width: 102,
                                              decoration: const BoxDecoration(
                                                shape: BoxShape.circle,
                                              ),
                                              clipBehavior: Clip.hardEdge,
                                              child: CachedNetworkImage(
                                                imageUrl: logic.getExpertCategory?.data?.expert?.image ?? "",
                                                fit: BoxFit.cover,
                                                placeholder: (context, url) {
                                                  return Image.asset(AppAsset.icPlaceHolder);
                                                },
                                                errorWidget: (context, url, error) {
                                                  return Image.asset(AppAsset.icPlaceHolder);
                                                },
                                              ),
                                            ),
                                          ).paddingOnly(top: 5),
                                          SizedBox(height: Get.height * 0.01),
                                          Text(
                                            "${logic.getExpertCategory?.data?.expert?.fname} ${logic.getExpertCategory?.data?.expert?.lname}",
                                            style: TextStyle(
                                                fontFamily: AppFontFamily.sfProDisplayBold,
                                                fontSize: 18,
                                                color: AppColors.primaryTextColor),
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
                                                  if (index < (logic.getExpertCategory?.data?.expert?.review ?? 0)) {
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
                                          SizedBox(height: Get.height * 0.015),
                                          Divider(thickness: 1, color: AppColors.greyColor.withOpacity(0.1)),
                                          SizedBox(height: Get.height * 0.015),
                                          ExpertDetails(
                                            leadingIcon: AppAsset.icEmail,
                                            title: "${logic.getExpertCategory?.data?.expert?.email}",
                                          ),
                                          SizedBox(height: Get.height * 0.014),
                                          ExpertDetails(
                                            leadingIcon: AppAsset.icCall,
                                            title: "${logic.getExpertCategory?.data?.expert?.mobile}",
                                          ),
                                          SizedBox(height: Get.height * 0.014),
                                          ExpertDetails(
                                            leadingIcon: AppAsset.icAge,
                                            title: "${logic.getExpertCategory?.data?.expert?.age}",
                                          ),
                                          SizedBox(height: Get.height * 0.014),
                                          ExpertDetails(
                                            leadingIcon: AppAsset.icSalon1,
                                            title: "${logic.getExpertCategory?.data?.expert?.salonId?.name}",
                                          ),
                                        ],
                                      ),
                                    ).paddingOnly(right: 16)
                                  : const SizedBox();
                            },
                          ),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) {
                                    return ExpertServiceDetailScreen();
                                  },
                                ),
                              );
                            },
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "txtMyServices".tr,
                                  style: TextStyle(
                                      fontSize: 20,
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      color: AppColors.primaryTextColor),
                                ).paddingOnly(top: 15, left: 3, bottom: 8),
                                Text(
                                  "txtViewAll".tr,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontFamily: AppFontFamily.sfProDisplayMedium,
                                    decoration: TextDecoration.underline,
                                    decorationColor: AppColors.service,
                                    color: AppColors.service,
                                  ),
                                ).paddingOnly(top: 15, right: 16, bottom: 8),
                              ],
                            ),
                          ),
                          GetBuilder<HomeScreenController>(
                            id: Constant.idServiceList,
                            builder: (logic) {
                              return AnimationLimiter(
                                child: Container(
                                  height: 106,
                                  padding: const EdgeInsets.only(top: 5),
                                  child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    physics: const AlwaysScrollableScrollPhysics(),
                                    padding: EdgeInsets.zero,
                                    shrinkWrap: true,
                                    itemCount: logic.getExpertCategory?.data?.services?.length,
                                    itemBuilder: (BuildContext context, int index) {
                                      return AnimationConfiguration.staggeredGrid(
                                        position: index,
                                        duration: const Duration(milliseconds: 800),
                                        columnCount: logic.getExpertCategory?.data?.services?.length ?? 0,
                                        child: FadeInAnimation(
                                          child: ScaleAnimation(
                                            child: Column(
                                              children: [
                                                GestureDetector(
                                                  onTap: () {
                                                    if (logic.isExpertSelected[index] == true) {
                                                      logic.onCheckBoxClick(false, index);
                                                    } else {
                                                      logic.onCheckBoxClick(true, index);
                                                    }
                                                  },
                                                  child: Stack(
                                                    children: [
                                                      DottedBorder(
                                                        color: AppColors.roundBorder,
                                                        borderType: BorderType.RRect,
                                                        radius: const Radius.circular(40),
                                                        strokeWidth: 1,
                                                        dashPattern: const [2.5, 2],
                                                        child: Container(
                                                          height: 70,
                                                          width: 70,
                                                          decoration: const BoxDecoration(
                                                            shape: BoxShape.circle,
                                                          ),
                                                          clipBehavior: Clip.hardEdge,
                                                          child: CachedNetworkImage(
                                                            imageUrl:
                                                                logic.getExpertCategory?.data?.services?[index].id?.image ?? "",
                                                            fit: BoxFit.cover,
                                                            placeholder: (context, url) {
                                                              return Image.asset(AppAsset.icServicePlaceholder).paddingAll(10);
                                                            },
                                                            errorWidget: (context, url, error) {
                                                              return Icon(
                                                                Icons.error_outline,
                                                                color: AppColors.blackColor,
                                                                size: 20,
                                                              );
                                                            },
                                                          ),
                                                        ),
                                                      ).paddingOnly(bottom: 8),
                                                      Positioned(
                                                        top: 50,
                                                        left: Get.width * 0.125,
                                                        child: logic.isExpertSelected[index]
                                                            ? Container(
                                                                height: 22,
                                                                width: 22,
                                                                padding: const EdgeInsets.all(7),
                                                                decoration: BoxDecoration(
                                                                  shape: BoxShape.circle,
                                                                  color: AppColors.primaryAppColor,
                                                                ),
                                                                child: Image.asset(
                                                                  AppAsset.icCheck,
                                                                ),
                                                              )
                                                            : const SizedBox(),
                                                      )
                                                    ],
                                                  ),
                                                ),
                                                Text(
                                                  logic.getExpertCategory?.data?.services?[index].id?.name ?? "",
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: TextStyle(
                                                    fontFamily: AppFontFamily.sfProDisplay,
                                                    fontSize: 13.5,
                                                    color: AppColors.category,
                                                  ),
                                                ),
                                              ],
                                            ).paddingOnly(right: 8),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              );
                            },
                          ),
                          Divider(thickness: 1, color: AppColors.greyColor.withOpacity(0.1)).paddingOnly(top: 10, bottom: 10),
                          GetBuilder<ExpertDetailController>(
                            id: Constant.idUserReview,
                            builder: (logic) {
                              return logic.getReviewCategory?.data?.isEmpty == true
                                  ? Center(
                                      child: Column(
                                        children: [
                                          Image.asset(
                                            AppAsset.icNoReview,
                                            height: 140,
                                            fit: BoxFit.cover,
                                          ),
                                          Text(
                                            "txtNoFoundReview".tr,
                                            style: TextStyle(
                                              fontFamily: AppFontFamily.sfProDisplayBold,
                                              fontSize: 15,
                                              color: AppColors.primaryTextColor,
                                            ),
                                          ).paddingOnly(bottom: 25, top: 10)
                                        ],
                                      ),
                                    )
                                  : Column(
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                Text(
                                                  "txtReviews".tr,
                                                  style: TextStyle(
                                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                                      fontSize: 18,
                                                      color: AppColors.review),
                                                ),
                                                SizedBox(width: Get.width * 0.02),
                                                Text(
                                                  "txtBasedReviews".tr,
                                                  style: TextStyle(
                                                    fontFamily: AppFontFamily.sfProDisplayMedium,
                                                    fontSize: 14,
                                                    color: AppColors.grey,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            GestureDetector(
                                              onTap: () {
                                                Get.toNamed(AppRoutes.expertReview);
                                              },
                                              child: Column(
                                                children: [
                                                  Text(
                                                    "txtViewAll".tr,
                                                    style: TextStyle(
                                                        fontFamily: AppFontFamily.sfProDisplayRegular,
                                                        fontSize: 13,
                                                        color: AppColors.grey,
                                                        decoration: TextDecoration.underline,
                                                        decorationColor: AppColors.grey),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(height: Get.height * 0.02),
                                        ListView.builder(
                                          itemCount: (logic.getReviewCategory?.data?.length ?? 0) > 6
                                              ? 6
                                              : logic.getReviewCategory?.data?.length ?? 0,
                                          shrinkWrap: true,
                                          padding: EdgeInsets.zero,
                                          physics: const NeverScrollableScrollPhysics(),
                                          itemBuilder: (context, index) {
                                            logic.str = logic.getReviewCategory?.data?[index].createdAt.toString();
                                            logic.parts = logic.str?.split('T');
                                            logic.date = logic.parts?[0];
                                            logic.time = logic.parts?[1].trim();

                                            return Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                              margin: const EdgeInsets.only(bottom: 10),
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
                                                        "${logic.getReviewCategory?.data?[index].userId?.fname ?? ""} ${logic.getReviewCategory?.data?[index].userId?.lname ?? ""}",
                                                        style: TextStyle(
                                                          fontFamily: AppFontFamily.sfProDisplayBold,
                                                          fontSize: 16.5,
                                                          color: AppColors.primaryTextColor,
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
                                                          color: AppColors.oceanBlue.withOpacity(0.3),
                                                        ),
                                                        child: Row(
                                                          mainAxisAlignment: MainAxisAlignment.center,
                                                          children: [
                                                            Image.asset(
                                                              (logic.getReviewCategory?.data?[index].rating?.toInt() ?? 0) >= 4
                                                                  ? AppAsset.icGreenStar
                                                                  : AppAsset.icRedStar,
                                                              height: 15,
                                                              width: 15,
                                                            ),
                                                            SizedBox(width: Get.width * 0.02),
                                                            Text(
                                                              logic.getReviewCategory?.data?[index].rating.toString() ?? "",
                                                              maxLines: 1,
                                                              overflow: TextOverflow.ellipsis,
                                                              style: TextStyle(
                                                                fontFamily: AppFontFamily.sfProDisplayMedium,
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
                                                        logic.getReviewCategory?.data?[index].review.toString() ?? "",
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                        style: TextStyle(
                                                          fontFamily: AppFontFamily.sfProDisplayMedium,
                                                          fontSize: 14,
                                                          color: AppColors.grey,
                                                        ),
                                                      ),
                                                      Padding(
                                                        padding: const EdgeInsets.only(top: 12),
                                                        child: Text(
                                                          logic.date ?? "",
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                          style: TextStyle(
                                                            fontFamily: AppFontFamily.sfProDisplayMedium,
                                                            fontSize: 13,
                                                            color: AppColors.grey,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  )
                                                ],
                                              ),
                                            );
                                          },
                                        ).paddingOnly(bottom: 10)
                                      ],
                                    );
                            },
                          ),
                        ],
                      ),
                    ),
                  );
          },
        ),
      ),
    );
  }
}
