// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class ViewAllCategoryScreen extends StatelessWidget {
  ViewAllCategoryScreen({super.key});

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  ViewAllCategoryController viewAllCategoryController = Get.find<ViewAllCategoryController>();

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        homeScreenController.startExpert = 0;
        homeScreenController.getExpert = [];
        homeScreenController.onGetAllExpertApiCall(
          start: homeScreenController.startExpert.toString(),
          limit: homeScreenController.limitExpert.toString(),
        );
        return true;
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: viewAllCategoryController.title == "txtCategory".tr ? "txtCategories".tr : "txtExperts".tr,
            method: InkWell(
              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
              onTap: () {
                homeScreenController.startExpert = 0;
                homeScreenController.getExpert = [];
                homeScreenController.onGetAllExpertApiCall(
                  start: homeScreenController.startExpert.toString(),
                  limit: homeScreenController.limitExpert.toString(),
                );
                Get.back();
              },
              child: Icon(
                Icons.arrow_back,
                color: AppColors.whiteColor,
              ),
            ),
          ),
        ),
        body: GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return viewAllCategoryController.title == "txtCategory".tr
                ? AnimationLimiter(
                    child: GridView.builder(
                      scrollDirection: Axis.vertical,
                      physics: const ScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount: logic.getAllCategory?.data?.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        childAspectRatio: 0.8,
                        crossAxisSpacing: 6,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 800),
                          columnCount: logic.getAllCategory?.data?.length ?? 0,
                          child: ScaleAnimation(
                            child: FadeInAnimation(
                              child: InkWell(
                                overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                onTap: () {
                                  Get.toNamed(
                                    AppRoutes.categoryDetail,
                                    arguments: [
                                      "${logic.getAllCategory?.data?[index].id}",
                                      "${logic.getAllCategory?.data?[index].name}"
                                    ],
                                  );
                                },
                                child: OverflowBox(
                                  maxWidth: double.infinity,
                                  maxHeight: double.infinity,
                                  child: Column(
                                    children: [
                                      DottedBorder(
                                        color: AppColors.roundBorder,
                                        borderType: BorderType.RRect,
                                        radius: const Radius.circular(35),
                                        strokeWidth: 1,
                                        dashPattern: const [2.5, 2.5],
                                        child: Container(
                                          height: 70,
                                          width: 70,
                                          decoration: const BoxDecoration(shape: BoxShape.circle),
                                          clipBehavior: Clip.hardEdge,
                                          child: CachedNetworkImage(
                                            imageUrl: logic.getAllCategory?.data?[index].image ?? "",
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) {
                                              return Image.asset(AppAsset.icCategoryPlaceholder).paddingAll(5);
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
                                      ).paddingOnly(top: 10, bottom: 5),
                                      SizedBox(
                                        child: Text(
                                          logic.getAllCategory?.data![index].name.toString() ?? "",
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplayMedium,
                                            fontSize: 12.5,
                                            color: AppColors.category,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  )
                : logic.getExpert.isEmpty
                    ? Center(
                        child: Column(
                          children: [
                            Image.asset(
                              AppAsset.icNoExpert,
                              height: 150,
                              width: 150,
                            ).paddingOnly(top: Get.height * 0.25, bottom: 25),
                            Text(
                              "txtNotExpert".tr,
                              style: TextStyle(
                                color: AppColors.primaryTextColor,
                                fontFamily: FontFamily.sfProDisplay,
                                fontSize: 18,
                              ),
                            )
                          ],
                        ),
                      )
                    : logic.isLoading1.value
                        ? Shimmers.homeExpertShimmer()
                        : Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Column(
                              children: [
                                Expanded(
                                  child: AnimationLimiter(
                                    child: GridView.builder(
                                      scrollDirection: Axis.vertical,
                                      controller: logic.expertScrollController,
                                      physics: const BouncingScrollPhysics(),
                                      padding: const EdgeInsets.only(bottom: 40),
                                      itemCount: logic.getExpert.length,
                                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 2,
                                        childAspectRatio: 0.85,
                                        crossAxisSpacing: 13.5,
                                        mainAxisSpacing: 2,
                                      ),
                                      itemBuilder: (BuildContext context, int index) {
                                        logic.rating = logic.getExpert[index].review ?? 0.0;
                                        logic.roundedRating = logic.rating?.round();
                                        logic.filledStars = logic.roundedRating?.clamp(0, 5);

                                        return AnimationConfiguration.staggeredGrid(
                                          position: index,
                                          duration: const Duration(milliseconds: 800),
                                          columnCount: logic.getExpert.length,
                                          child: ScaleAnimation(
                                            child: FadeInAnimation(
                                              child: GestureDetector(
                                                onTap: () async {
                                                  await logic.onGetExpertApiCall(expertId: logic.getExpert[index].id ?? "");

                                                  Get.toNamed(
                                                    AppRoutes.expertDetail,
                                                    arguments: [
                                                      logic.getExpert[index].id,
                                                      index,
                                                      logic.getExpert[index].review,
                                                    ],
                                                  );
                                                },
                                                child: OverflowBox(
                                                  maxHeight: double.infinity,
                                                  maxWidth: double.infinity,
                                                  child: Container(
                                                    width: Get.width * 0.45,
                                                    margin: const EdgeInsets.only(top: 10),
                                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                                    decoration: BoxDecoration(
                                                      borderRadius: BorderRadius.circular(21),
                                                      color: AppColors.whiteColor,
                                                      boxShadow: Constant.boxShadow,
                                                    ),
                                                    child: Column(
                                                      children: [
                                                        DottedBorder(
                                                          color: AppColors.roundBorder,
                                                          borderType: BorderType.RRect,
                                                          radius: const Radius.circular(41),
                                                          strokeWidth: 1,
                                                          dashPattern: const [2.5, 2.5],
                                                          child: Container(
                                                            height: 82,
                                                            width: 82,
                                                            decoration: const BoxDecoration(shape: BoxShape.circle),
                                                            clipBehavior: Clip.hardEdge,
                                                            child: CachedNetworkImage(
                                                              imageUrl: logic.getExpert[index].image ?? "",
                                                              fit: BoxFit.cover,
                                                              placeholder: (context, url) {
                                                                return Image.asset(AppAsset.icPlaceHolder);
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
                                                        ),
                                                        SizedBox(height: Get.height * 0.015),
                                                        Text(
                                                          "${logic.getExpert[index].fname} ${logic.getExpert[index].lname}",
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                          style: TextStyle(
                                                            fontFamily: FontFamily.sfProDisplay,
                                                            fontSize: 15,
                                                            color: AppColors.primaryTextColor,
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
                                                                if (index < logic.filledStars!) {
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
                                              ),
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                ),
                                logic.isLoading.value == true
                                    ? CircularProgressIndicator(
                                        color: AppColors.primaryAppColor,
                                      ).paddingOnly(bottom: 7)
                                    : const SizedBox()
                              ],
                            ),
                          );
          },
        ),
      ),
    );
  }
}
