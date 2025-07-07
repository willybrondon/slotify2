// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class StaffBranchScreen extends StatelessWidget {
  StaffBranchScreen({super.key});

  BranchDetailController branchDetailController = Get.find<BranchDetailController>();
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: branchDetailController.isLoading.value == true
          ? Shimmers.selectExpertShimmer()
          : branchDetailController.getSalonDetailCategory!.experts!.isEmpty
              ? Center(
                  child: Column(
                    children: [
                      Image.asset(AppAsset.icNoExpert, height: 150, width: 150).paddingOnly(bottom: 7),
                      Text(
                        "txtNoFoundExpert".tr,
                        style: TextStyle(
                          fontFamily: FontFamily.sfProDisplay,
                          fontSize: 18,
                          color: AppColors.primaryTextColor,
                        ),
                      )
                    ],
                  ),
                ).paddingOnly(top: Get.height * 0.1)
              : GetBuilder<BranchDetailController>(
                  id: Constant.idProgressView,
                  builder: (logic) {
                    return GridView.builder(
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
                                      fontFamily: FontFamily.sfProDisplay,
                                      fontSize: 15.5,
                                      color: AppColors.category,
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
