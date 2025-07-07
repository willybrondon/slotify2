// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

class ExpertServiceDetailScreen extends StatelessWidget {
  ExpertServiceDetailScreen({super.key});

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        homeScreenController.onBack();
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "txtMyServices".tr,
            method: GetBuilder<HomeScreenController>(
              id: Constant.idBottomService,
              builder: (logic) {
                return InkWell(
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                  onTap: () {
                    logic.onBack();
                    Get.back();
                  },
                  child: Icon(
                    Icons.arrow_back,
                    color: AppColors.whiteColor,
                  ),
                );
              },
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
                                        fontFamily: FontFamily.sfProDisplay,
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
                                        fontFamily: FontFamily.sfProDisplay,
                                        fontSize: 15,
                                        color: AppColors.currency.withOpacity(0.9)),
                                  ),
                                  Text(
                                    " ($currency${logic.finalTaxRupeeExpert.toStringAsFixed(2)} ${"txtTax".tr})",
                                    style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplay,
                                        fontSize: 12,
                                        color: AppColors.currency.withOpacity(0.9)),
                                  ),
                                  SizedBox(width: Get.width * 0.02),
                                  Text(
                                    "= $currency ${logic.totalPriceExpert.toStringAsFixed(2)}",
                                    style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplayBold, fontSize: 17, color: AppColors.currency),
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
                              fontFamily: FontFamily.sfProDisplayMedium,
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
          id: Constant.idServiceList,
          builder: (logic) {
            return AnimationLimiter(
              child: GridView.builder(
                scrollDirection: Axis.vertical,
                physics: const ScrollPhysics(),
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: logic.getExpertCategory?.data?.services?.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 6,
                ),
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
                                      decoration: const BoxDecoration(shape: BoxShape.circle),
                                      clipBehavior: Clip.hardEdge,
                                      child: CachedNetworkImage(
                                        imageUrl: logic.getExpertCategory?.data?.services?[index].id?.image ?? "",
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
                                fontFamily: FontFamily.sfProDisplay,
                                fontSize: 13.5,
                                color: AppColors.category,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ).paddingOnly(top: 10, left: 15, right: 15),
            );
          },
        ),
      ),
    );
  }
}
