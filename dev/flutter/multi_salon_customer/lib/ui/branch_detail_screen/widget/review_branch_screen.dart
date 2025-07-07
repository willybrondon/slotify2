// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

class ReviewBranchScreen extends StatelessWidget {
  ReviewBranchScreen({super.key});

  BranchDetailController branchDetailController = Get.find<BranchDetailController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: branchDetailController.getSalonDetailCategory!.reviews!.isEmpty
          ? Center(
              child: Column(
                children: [
                  Image.asset(AppAsset.icNoReview, height: 152, width: 152),
                  Text(
                    "txtNoReviewSalon".tr,
                    style: TextStyle(
                      fontFamily: FontFamily.sfProDisplay,
                      fontSize: 18,
                      color: AppColors.primaryTextColor,
                    ),
                  )
                ],
              ),
            ).paddingOnly(top: 50)
          : GetBuilder<BranchDetailController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return ListView.separated(
                  itemCount: logic.getSalonDetailCategory?.reviews?.length ?? 0,
                  shrinkWrap: true,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  itemBuilder: (context, index) {
                    logic.str = logic.getSalonDetailCategory?.reviews?[index].createdAt.toString();
                    logic.parts = logic.str?.split('T0');
                    logic.date = logic.parts?[0];
                    logic.time = logic.parts?[1].trim();

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
                                    fontFamily: FontFamily.sfProDisplayBold,
                                    fontSize: 16.5,
                                    color: AppColors.primaryTextColor),
                              ),
                              Container(
                                width: Get.width * 0.14,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(6),
                                    color: AppColors.oceanBlue.withOpacity(0.30)),
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
                                        fontFamily: FontFamily.sfProDisplayBold,
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
                                  fontFamily: FontFamily.sfProDisplayMedium,
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
                                    fontFamily: FontFamily.sfProDisplayMedium,
                                    fontSize: 13,
                                    color: AppColors.grey,
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
