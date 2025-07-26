// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class SearchScreen extends StatelessWidget {
  SearchScreen({super.key});
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SearchScreenController searchScreenController = Get.find<SearchScreenController>();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvoked: (bool didPop) {
        FocusScopeNode currentFocus = FocusScope.of(context);
        if (currentFocus.focusedChild != null) {
          homeScreenController.isSelected = List.generate(
            (homeScreenController.getAllServiceCategory?.services?.length ?? 0),
            (index) => homeScreenController.checkItem.contains(
              homeScreenController.getAllServiceCategory?.services?[index].name,
            ),
          );
          log("Selected List is in Service :: ${homeScreenController.isSelected}");
        } else {
          homeScreenController.withOutTaxRupee = 0.0;
          homeScreenController.totalPrice = 0.0;
          homeScreenController.finalTaxRupee = 0.0;
          homeScreenController.totalMinute = 0;
          homeScreenController.checkItem.clear();
          homeScreenController.serviceId.clear();
          homeScreenController.serviceName.clear();

          homeScreenController.searchEditingController.clear();
          homeScreenController.isSelected = List.generate(
            (homeScreenController.getAllServiceCategory?.services?.length ?? 0),
            (index) => false,
          );
          homeScreenController.onGetAllServiceApiCall(city: city ?? "");
        }
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.whiteColor,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "txtSearchService".tr,
            method: InkWell(
              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
              onTap: () async {
                homeScreenController.withOutTaxRupee = 0.0;
                homeScreenController.totalPrice = 0.0;
                homeScreenController.finalTaxRupee = 0.0;
                homeScreenController.totalMinute = 0;
                homeScreenController.checkItem.clear();
                homeScreenController.serviceId.clear();
                homeScreenController.serviceName.clear();

                homeScreenController.searchEditingController.clear();
                homeScreenController.isSelected =
                    List.generate((homeScreenController.getAllServiceCategory?.services?.length ?? 0), (index) => false);
                homeScreenController.onGetAllServiceApiCall(city: city ?? "");

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
            return logic.checkItem.isNotEmpty
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
                              ).paddingOnly(left: 5, bottom: 7),
                              Text(
                                "${logic.totalMinute} ${"txtMinutes".tr}",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplay,
                                  fontSize: 15,
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
                          color: AppColors.whiteColor,
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 15,
                          onTap: () async {
                            if (Constant.storage.read<bool>('isLogIn') ?? false) {
                              log("Total Minute :: ${logic.totalMinute}");
                              log("Service id searchh :: ${logic.serviceId}");
                              log("Service name searchh :: ${logic.checkItem}");

                              Get.toNamed(AppRoutes.selectBranch, arguments: [
                                logic.checkItem,
                                0.0,
                                0.0,
                                logic.totalMinute,
                                logic.serviceId,
                                0.0,
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
        body: GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Stack(
              children: [
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 15, left: 16, right: 16, bottom: 15),
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12), color: AppColors.whiteColor, boxShadow: Constant.boxShadow),
                  child: TextFieldCustom(
                    prefixIcon: Padding(
                      padding: const EdgeInsets.all(13.0),
                      child: Image.asset(
                        AppAsset.icSearch,
                        height: 21,
                        width: 21,
                        color: AppColors.darkGrey,
                      ),
                    ),
                    hintText: "txtSearchServices".tr,
                    obscureText: false,
                    textInputAction: TextInputAction.done,
                    controller: logic.searchEditingController,
                    onEditingComplete: () async {
                      FocusScopeNode currentFocus = FocusScope.of(context);
                      if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                        currentFocus.focusedChild?.unfocus();
                      }

                      logic.isSelected = List.generate((logic.getAllServiceCategory?.services?.length ?? 0),
                          (index) => logic.checkItem.contains(logic.getAllServiceCategory?.services?[index].name));
                      log("Selected List is in Service :: ${logic.isSelected}");
                    },
                    onChanged: (text) {
                      logic.printLatestValue(text?.trim().toString());
                      return null;
                    },
                  ),
                ),
                logic.getAllServiceCategory?.services?.isEmpty == true
                    ? logic.isLoading.value
                        ? Shimmers.searchScreenShimmer()
                        : SizedBox(
                            height: Get.height,
                            width: Get.width,
                            child: Stack(
                              children: [
                                Center(
                                  child: Column(
                                    children: [
                                      Image.asset(
                                        AppAsset.icNoService,
                                        height: 185,
                                        width: 185,
                                      ).paddingOnly(top: Get.height * 0.25),
                                      Text(
                                        "txtNotAvailableServices".tr,
                                        style: TextStyle(
                                          fontFamily: AppFontFamily.sfProDisplayMedium,
                                          fontSize: 17,
                                          color: AppColors.primaryTextColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          )
                    : GetBuilder<HomeScreenController>(
                        id: Constant.idSearchService,
                        builder: (logic) {
                          return RefreshIndicator(
                            onRefresh: () {
                              logic.searchEditingController.clear();

                              return logic.onGetAllServiceApiCall(city: city ?? "");
                            },
                            color: AppColors.primaryAppColor,
                            child: SizedBox(
                              height: Get.height,
                              width: Get.width,
                              child: AnimationLimiter(
                                child: ListView.builder(
                                  itemCount: logic.getAllServiceCategory?.services?.length,
                                  shrinkWrap: true,
                                  padding: EdgeInsets.zero,
                                  controller: logic.serviceScrollController,
                                  physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                                  itemBuilder: (context, index) {
                                    return AnimationConfiguration.staggeredGrid(
                                      position: index,
                                      duration: const Duration(milliseconds: 800),
                                      columnCount: logic.getAllServiceCategory?.services?.length ?? 0,
                                      child: SlideAnimation(
                                        child: FadeInAnimation(
                                          child: GetBuilder<HomeScreenController>(
                                            id: Constant.idServiceList,
                                            builder: (logicService) {
                                              return InkWell(
                                                overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                                onTap: () {
                                                  if (logicService.isSelected[index] == true) {
                                                    logicService.onServiceCheckBoxClick(false, index);
                                                  } else {
                                                    logicService.onServiceCheckBoxClick(true, index);
                                                  }
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                                                  decoration: BoxDecoration(
                                                    borderRadius: BorderRadius.circular(10),
                                                    color: AppColors.whiteColor,
                                                    boxShadow: Constant.boxShadow,
                                                    border: Border.all(color: AppColors.grey.withOpacity(0.1), width: 1),
                                                  ),
                                                  margin: const EdgeInsets.only(bottom: 10, left: 10, right: 10),
                                                  child: Row(
                                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                    children: [
                                                      Row(
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        children: [
                                                          Container(
                                                            height: 80,
                                                            width: 80,
                                                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                                                            child: ClipRRect(
                                                              borderRadius: BorderRadius.circular(10),
                                                              child: CachedNetworkImage(
                                                                imageUrl:
                                                                    logic.getAllServiceCategory?.services?[index].image ?? "",
                                                                fit: BoxFit.cover,
                                                                placeholder: (context, url) {
                                                                  return Image.asset(AppAsset.icServicePlaceholder).paddingAll(5);
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
                                                          SizedBox(width: Get.width * 0.03),
                                                          Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                              SizedBox(
                                                                width: 170,
                                                                child: Text(
                                                                  logic.getAllServiceCategory?.services?[index].name ?? "",
                                                                  overflow: TextOverflow.ellipsis,
                                                                  style: TextStyle(
                                                                      fontFamily: AppFontFamily.sfProDisplay,
                                                                      fontSize: 17,
                                                                      color: AppColors.primaryTextColor),
                                                                ),
                                                              ),
                                                              Text(
                                                                "${logic.getAllServiceCategory?.services?[index].duration ?? 0} ${"txtMinutes".tr}",
                                                                style: TextStyle(
                                                                    fontFamily: AppFontFamily.sfProDisplayMedium,
                                                                    fontSize: 13,
                                                                    color: AppColors.darkGrey3),
                                                              ),
                                                            ],
                                                          ).paddingOnly(top: 5),
                                                        ],
                                                      ),
                                                      GetBuilder<HomeScreenController>(
                                                        id: Constant.idServiceList,
                                                        builder: (logic) {
                                                          return GestureDetector(
                                                            onTap: () {
                                                              if (logic.isSelected[index] == true) {
                                                                logic.onServiceCheckBoxClick(false, index);
                                                              } else {
                                                                logic.onServiceCheckBoxClick(true, index);
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
                                                              child: logic.isSelected[index]
                                                                  ? Image.asset(
                                                                      AppAsset.icCheck,
                                                                      color: AppColors.primaryAppColor,
                                                                    )
                                                                  : const SizedBox(),
                                                            ).paddingOnly(right: 10),
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
                                      ),
                                    );
                                  },
                                ).paddingOnly(top: 80, bottom: 10),
                              ),
                            ),
                          );
                        },
                      )
              ],
            );
          },
        ),
      ),
    );
  }
}
