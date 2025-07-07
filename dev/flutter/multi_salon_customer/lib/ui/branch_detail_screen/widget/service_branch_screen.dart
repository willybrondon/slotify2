// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/login/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class ServiceBranchScreen extends StatelessWidget {
  ServiceBranchScreen({super.key});

  BranchDetailController branchDetailController = Get.find<BranchDetailController>();

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
                                      fontFamily: FontFamily.sfProDisplay,
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
                                      fontFamily: FontFamily.sfProDisplay,
                                      fontSize: 15,
                                      color: AppColors.currency.withOpacity(0.9)),
                                ),
                                Text(
                                  " ($currency${logic.finalTaxRupee.toStringAsFixed(2)} ${"txtTax".tr})",
                                  style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplay,
                                      fontSize: 12,
                                      color: AppColors.currency.withOpacity(0.9)),
                                ),
                                SizedBox(width: Get.width * 0.02),
                                Text(
                                  "= $currency ${logic.totalPrice.toStringAsFixed(2)}",
                                  style:
                                      TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 17, color: AppColors.currency),
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
                        fontFamily: FontFamily.sfProDisplay,
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
      body: branchDetailController.isLoading.value == true
          ? Shimmers.serviceBranchShimmer()
          : branchDetailController.getSalonDetailCategory?.salon?.serviceIds?.isEmpty == true
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
                          fontFamily: FontFamily.sfProDisplay,
                          fontSize: 18,
                        ),
                      )
                    ],
                  ),
                )
              : GetBuilder<BranchDetailController>(
                  id: Constant.idServiceList,
                  builder: (logic) {
                    return ListView.separated(
                      itemCount: logic.getSalonDetailCategory?.salon?.serviceIds?.length ?? 0,
                      shrinkWrap: true,
                      padding: EdgeInsets.zero,
                      physics: const NeverScrollableScrollPhysics(),
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
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                            margin: const EdgeInsets.only(left: 15, right: 15),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color: AppColors.whiteColor,
                              border: Border.all(
                                color: AppColors.grey.withOpacity(0.1),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      height: 100,
                                      width: 100,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(10),
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
                                      ),
                                    ),
                                    SizedBox(width: Get.width * 0.03),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          logic.getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.name ?? "",
                                          style: TextStyle(
                                              fontFamily: FontFamily.sfProDisplay,
                                              fontSize: 17,
                                              color: AppColors.primaryTextColor),
                                        ),
                                        Text(
                                          "${logic.getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.duration} ${"txtMinutes".tr}",
                                          style: TextStyle(
                                              fontFamily: FontFamily.sfProDisplayMedium, fontSize: 13, color: AppColors.service),
                                        ),
                                        SizedBox(height: Get.height * 0.02),
                                        Container(
                                          alignment: Alignment.center,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(7),
                                            color: AppColors.green2,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10),
                                            child: Text(
                                              "$currency ${logic.getSalonDetailCategory?.salon?.serviceIds?[index].price?.toStringAsFixed(2)}",
                                              style: TextStyle(
                                                  fontFamily: FontFamily.sfProDisplayBold,
                                                  fontSize: 16,
                                                  color: AppColors.currency),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                GestureDetector(
                                  onTap: () {
                                    if (logic.isBranchSelected[index] == true) {
                                      logic.onCheckBoxClick(false, index);
                                    } else {
                                      logic.onCheckBoxClick(true, index);
                                    }
                                  },
                                  child: Container(
                                          height: 25,
                                          width: 25,
                                          padding: const EdgeInsets.all(7),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(color: AppColors.greyColor.withOpacity(0.5)),
                                          ),
                                          child: logic.isBranchSelected[index]
                                              ? Image.asset(
                                                  AppAsset.icCheck,
                                                  color: AppColors.primaryAppColor,
                                                )
                                              : const SizedBox())
                                      .paddingOnly(right: 10),
                                )
                              ],
                            ),
                          ),
                        );
                      },
                      separatorBuilder: (context, index) {
                        return SizedBox(height: Get.height * 0.01);
                      },
                    );
                  },
                ),
    );
  }
}
