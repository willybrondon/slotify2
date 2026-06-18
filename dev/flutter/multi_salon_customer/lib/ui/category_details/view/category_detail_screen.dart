import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/category_details/controller/category_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class CategoryDetailScreen extends StatelessWidget {
  final CategoryDetailController categoryDetailController =
      Get.find<CategoryDetailController>();
  final SearchScreenController searchScreenController =
      Get.find<SearchScreenController>();
  final HomeScreenController homeScreenController =
      Get.find<HomeScreenController>();

  CategoryDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvoked: (bool didPop) {
        homeScreenController.checkItem.clear();
        homeScreenController.totalMinute = 0;
        homeScreenController.serviceId.clear();
        homeScreenController.withOutTaxRupee = 0.0;
        homeScreenController.totalPrice = 0.0;
        homeScreenController.finalTaxRupee = 0.0;
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "${categoryDetailController.categoryName}",
            method: InkWell(
              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
              onTap: () {
                Get.back();
              },
              child: Icon(
                Icons.arrow_back,
                color: AppColors.blackColor,
              ),
            ),
          ),
        ),
        bottomNavigationBar: GetBuilder<CategoryDetailController>(
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
                                width: Get.width * 0.62,
                                child: SizedBox(
                                  height: 20,
                                  width: Get.width * 0.02,
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Text(
                                      logic.checkItem.join(", "),
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplay,
                                        fontSize: 17.5,
                                        color: AppColors.categoryService,
                                      ),
                                    ),
                                  ),
                                ),
                              ).paddingOnly(left: 5, bottom: 7),
                              Text(
                                "${logic.totalMinute} ${"txtMinutes".tr}",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplay,
                                  fontSize: 15.5,
                                  color: AppColors.darkGrey3,
                                ),
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
                            if (Constant.storage.read<bool>('isLogIn') ??
                                false) {
                              log("Total Minute :: ${logic.totalMinute}");

                              Get.toNamed(AppRoutes.selectBranch, arguments: [
                                logic.checkItem,
                                0.0,
                                0.0,
                                logic.totalMinute.toInt(),
                                logic.serviceId,
                                0.0,
                              ]);
                            } else {
                              Get.toNamed(AppRoutes.signIn,
                                  arguments: [logic.checkItem.isNotEmpty]);
                              await Get.find<SignInController>()
                                  .getDataFromArgs();
                            }
                          },
                        )
                      ],
                    ),
                  )
                : const SizedBox();
          },
        ),
        body: GetBuilder<CategoryDetailController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.categoryDetailsShimmer()
                : RefreshIndicator(
                    onRefresh: () async {
                      return await logic.onGetServiceApiCall(
                          categoryId: logic.categoryId!);
                    },
                    color: AppColors.primaryAppColor,
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              height: 55,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: AppColors.whiteColor,
                                boxShadow: Constant.boxShadow,
                              ),
                              child: TextField(
                                controller: logic.categoryDetailEditingController,
                                onChanged: (_) =>
                                    logic.update([Constant.idServiceList]),
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  fontSize: 13.8,
                                  color: AppColors.blackColor,
                                ),
                                decoration: InputDecoration(
                                  prefixIcon: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Image.asset(
                                      AppAsset.icSearch,
                                      height: 21,
                                      width: 21,
                                      color: AppColors.darkGrey,
                                    ),
                                  ),
                                  hintText: 'txtCategoryServiceSearchHint'.tr,
                                  hintStyle: TextStyle(
                                    color: AppColors.darkGrey.withOpacity(0.7),
                                    fontSize: 13.8,
                                    fontFamily:
                                        AppFontFamily.sfProDisplayMedium,
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                ),
                              ),
                            ).paddingOnly(top: 10),
                            SizedBox(height: Get.height * 0.02),
                            Text(
                              "txtServices".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 18,
                                color: AppColors.primaryTextColor,
                              ),
                            ),
                            SizedBox(height: Get.height * 0.02),
                            GetBuilder<CategoryDetailController>(
                              id: Constant.idServiceList,
                              builder: (logic) {
                                final filtered = logic.filteredServices;
                                return filtered.isEmpty
                                    ? Center(
                                        child: Column(
                                          children: [
                                            Image.asset(
                                              AppAsset.icNoService,
                                              height: 185,
                                              width: 185,
                                            ),
                                            Text(
                                              "txtNotAvailableServices".tr,
                                              style: TextStyle(
                                                color:
                                                    AppColors.primaryTextColor,
                                                fontFamily:
                                                    AppFontFamily.sfProDisplay,
                                                fontSize: 18,
                                              ),
                                            )
                                          ],
                                        ).paddingOnly(top: 155),
                                      )
                                    : AnimationLimiter(
                                        child: ListView.separated(
                                          itemCount: filtered.length,
                                          shrinkWrap: true,
                                          padding: EdgeInsets.zero,
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          itemBuilder: (context, index) {
                                            final service = filtered[index];
                                            final origIndex =
                                                logic.serviceIndexOf(service);
                                            if (origIndex < 0) {
                                              return const SizedBox.shrink();
                                            }
                                            return AnimationConfiguration
                                                .staggeredGrid(
                                              position: index,
                                              duration: const Duration(
                                                  milliseconds: 800),
                                              columnCount: filtered.length,
                                              child: SlideAnimation(
                                                child: FadeInAnimation(
                                                  child: GestureDetector(
                                                    onTap: () {
                                                      if (logic.isCategorySelected[
                                                              origIndex] ==
                                                          true) {
                                                        logic.onCheckBoxClick(
                                                            false, origIndex);
                                                      } else {
                                                        logic.onCheckBoxClick(
                                                            true, origIndex);
                                                      }
                                                    },
                                                    child: Container(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                          horizontal: 6,
                                                          vertical: 6),
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(10),
                                                        color: AppColors
                                                            .whiteColor,
                                                        border: Border.all(
                                                          color: AppColors.grey
                                                              .withOpacity(0.1),
                                                          width: 1,
                                                        ),
                                                      ),
                                                      child: Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Row(
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .start,
                                                            children: [
                                                              Container(
                                                                height: 80,
                                                                width: 80,
                                                                decoration:
                                                                    BoxDecoration(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              12),
                                                                  border: Border
                                                                      .all(
                                                                    color: AppColors
                                                                        .grey
                                                                        .withOpacity(
                                                                            0.2),
                                                                    width: 1,
                                                                  ),
                                                                ),
                                                                child:
                                                                    ClipRRect(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              10),
                                                                  child:
                                                                      CachedNetworkImage(
                                                                    imageUrl:
                                                                        service.image ?? "",
                                                                    fit: BoxFit
                                                                        .cover,
                                                                    placeholder:
                                                                        (context,
                                                                            url) {
                                                                      return Image.asset(AppAsset
                                                                              .icServicePlaceholder)
                                                                          .paddingAll(
                                                                              10);
                                                                    },
                                                                    errorWidget:
                                                                        (context,
                                                                            url,
                                                                            error) {
                                                                      return Icon(
                                                                        Icons
                                                                            .error_outline,
                                                                        color: AppColors
                                                                            .blackColor,
                                                                        size:
                                                                            20,
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              ),
                                                              SizedBox(
                                                                  width:
                                                                      Get.width *
                                                                          0.03),
                                                              Column(
                                                                crossAxisAlignment:
                                                                    CrossAxisAlignment
                                                                        .start,
                                                                children: [
                                                                  Text(
                                                                    service.name ?? "",
                                                                    style: TextStyle(
                                                                        fontFamily:
                                                                            AppFontFamily
                                                                                .sfProDisplay,
                                                                        fontSize:
                                                                            17,
                                                                        color: AppColors
                                                                            .primaryTextColor),
                                                                  ),
                                                                  Text(
                                                                    "${service.duration ?? 0} ${"txtMinutes".tr}",
                                                                    style: TextStyle(
                                                                        fontFamily:
                                                                            AppFontFamily
                                                                                .sfProDisplayMedium,
                                                                        fontSize:
                                                                            13,
                                                                        color: AppColors
                                                                            .service),
                                                                  ),
                                                                ],
                                                              ).paddingOnly(
                                                                  top: 5),
                                                            ],
                                                          ),
                                                          GestureDetector(
                                                            onTap: () {
                                                              if (logic.isCategorySelected[
                                                                      origIndex] ==
                                                                  true) {
                                                                logic
                                                                    .onCheckBoxClick(
                                                                        false,
                                                                        origIndex);
                                                              } else {
                                                                logic
                                                                    .onCheckBoxClick(
                                                                        true,
                                                                        origIndex);
                                                              }
                                                            },
                                                            child: Container(
                                                              height: 25,
                                                              width: 25,
                                                              padding:
                                                                  const EdgeInsets
                                                                      .all(7),
                                                              decoration:
                                                                  BoxDecoration(
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            6),
                                                                border: Border.all(
                                                                    color: AppColors
                                                                        .greyColor
                                                                        .withOpacity(
                                                                            0.5)),
                                                              ),
                                                              child: logic.isCategorySelected[
                                                                      origIndex]
                                                                  ? Image.asset(
                                                                      AppAsset
                                                                          .icCheck,
                                                                      color: AppColors
                                                                          .primaryAppColor,
                                                                    )
                                                                  : const SizedBox(),
                                                            ).paddingOnly(
                                                                right: 10),
                                                          )
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            );
                                          },
                                          separatorBuilder: (context, index) {
                                            return SizedBox(
                                                height: Get.height * 0.01);
                                          },
                                        ),
                                      );
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
          },
        ),
      ),
    );
  }
}
