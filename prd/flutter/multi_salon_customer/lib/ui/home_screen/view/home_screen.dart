// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/exit_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class HomeScreen extends StatelessWidget {
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;
    log("Latitude :: $latitude");
    log("Longitude :: $longitude");

    return WillPopScope(
      onWillPop: () async {
        return await Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
              backgroundColor: AppColors.transparent,
              shadowColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              elevation: 0,
              child: const ExitDialog()),
        );
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        body: GetBuilder<HomeScreenController>(
          builder: (logic) {
            return RefreshIndicator(
              onRefresh: () {
                return logic.onRefresh();
              },
              color: AppColors.primaryAppColor,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        Container(
                          height: Get.height * 0.15 + statusBarHeight,
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryAppColor,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              GetBuilder<ProfileScreenController>(
                                id: Constant.idProgressView,
                                init: ProfileScreenController(),
                                builder: (logic) {
                                  return Text(
                                    "${"txtHello".tr}, ${Constant.storage.read<String>("fName") ?? "txtGuest".tr} 👋",
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      fontSize: 20,
                                      color: AppColors.whiteColor,
                                    ),
                                  );
                                },
                              ),
                              Text(
                                "txtWelcomeService".tr,
                                style: TextStyle(
                                  fontFamily: FontFamily.sfProDisplayRegular,
                                  fontSize: 16,
                                  color: AppColors.whiteColor,
                                ),
                              ),
                            ],
                          ).paddingOnly(bottom: 10),
                        ),
                        GestureDetector(
                          onTap: () {
                            Get.toNamed(AppRoutes.search);
                          },
                          child: Container(
                            height: 55,
                            width: double.infinity,
                            margin: EdgeInsets.only(top: Get.height * 0.15, left: 16, right: 16),
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: AppColors.whiteColor,
                                boxShadow: Constant.boxShadow),
                            child: Row(
                              children: [
                                Image.asset(
                                  AppAsset.icSearch,
                                  height: 23,
                                  width: 23,
                                ).paddingOnly(left: 10, right: 10),
                                Text(
                                  "txtSearchServices".tr,
                                  style: TextStyle(
                                    color: AppColors.email,
                                    fontSize: 17,
                                    fontFamily: FontFamily.sfProDisplayRegular,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: Get.height * 0.02),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        /*Text(
                          "txtQuickBookAppointment".tr,
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplayBold,
                            fontSize: 17,
                            color: AppColors.primaryTextColor,
                          ),
                        ),
                        SizedBox(height: Get.height * 0.02),
                        GetBuilder<HomeScreenController>(
                          id: Constant.idProgressView,
                          builder: (logic) {
                            return logic.isLoading.value == true
                                ? Shimmers.homeServiceShimmer()
                                : Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(12),
                                      color: AppColors.whiteColor,
                                      boxShadow: Constant.boxShadow,
                                    ),
                                    child: Column(
                                      children: [
                                        GetBuilder<HomeScreenController>(
                                          id: Constant.idSearchService,
                                          builder: (logic) {
                                            return Container(
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(12),
                                                border: Border.all(
                                                  width: 1,
                                                  color: AppColors.greyColor.withOpacity(0.1),
                                                ),
                                              ),
                                              child: Theme(
                                                data: Theme.of(context).copyWith(
                                                  dividerColor: Colors.transparent,
                                                ),
                                                child: ExpansionTile(
                                                  backgroundColor: AppColors.transparent,
                                                  iconColor: AppColors.grey,
                                                  collapsedIconColor: AppColors.grey,
                                                  childrenPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                                  title: Text(
                                                    "txtServices".tr,
                                                    style: TextStyle(
                                                      fontFamily: FontFamily.sfProDisplayMedium,
                                                      fontSize: 14,
                                                      color: AppColors.darkGrey,
                                                    ),
                                                  ),
                                                  children: [
                                                    logic.getAllServiceCategory?.services?.isEmpty ?? true
                                                        ? Center(
                                                            child: Column(
                                                              children: [
                                                                Image.asset(
                                                                  AppAsset.icNoService,
                                                                  height: 150,
                                                                  width: 150,
                                                                ),
                                                                Text(
                                                                  "txtNotAvailableServices".tr,
                                                                  style: TextStyle(
                                                                      color: AppColors.primaryTextColor,
                                                                      fontFamily: FontFamily.sfProDisplay,
                                                                      fontSize: 18),
                                                                ).paddingOnly(bottom: 10)
                                                              ],
                                                            ),
                                                          )
                                                        : ListView.separated(
                                                            itemCount: (logic.getAllServiceCategory?.services?.length ?? 0) >= 13
                                                                ? 13
                                                                : logic.getAllServiceCategory?.services?.length ?? 0,
                                                            shrinkWrap: true,
                                                            physics: const NeverScrollableScrollPhysics(),
                                                            padding: EdgeInsets.zero,
                                                            itemBuilder: (context, index) {
                                                              return Column(
                                                                children: [
                                                                  InkWell(
                                                                    overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                                                                    onTap: () {
                                                                      if (logic.isSelected[index] == true) {
                                                                        logic.onCheckBoxClick(false, index);
                                                                      } else {
                                                                        logic.onCheckBoxClick(true, index);
                                                                      }
                                                                    },
                                                                    child: Row(
                                                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                                      children: [
                                                                        SizedBox(
                                                                          height: 22.0,
                                                                          width: 22.0,
                                                                          child: Checkbox(
                                                                            materialTapTargetSize:
                                                                                MaterialTapTargetSize.shrinkWrap,
                                                                            value: (index >= 0 && index < logic.isSelected.length)
                                                                                ? logic.isSelected[index]
                                                                                : false,
                                                                            activeColor: AppColors.primaryAppColor,
                                                                            checkColor: AppColors.whiteColor,
                                                                            onChanged: (value) {
                                                                              logic.onCheckBoxClick(value, index);
                                                                            },
                                                                          ),
                                                                        ),
                                                                        SizedBox(width: Get.width * 0.03),
                                                                        Text(
                                                                            logic.getAllServiceCategory?.services?[index].name ??
                                                                                "",
                                                                            style: TextStyle(
                                                                                fontFamily: FontFamily.sfProDisplayBold,
                                                                                fontSize: 15,
                                                                                color: AppColors.blackColor)),
                                                                        const Spacer(),
                                                                        Text(
                                                                          "$currency ${logic.getAllServiceCategory?.services?[index].price?.toStringAsFixed(2)}",
                                                                          style: TextStyle(
                                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                                            fontSize: 15,
                                                                            color: AppColors.greenColor,
                                                                          ),
                                                                        ),
                                                                      ],
                                                                    ),
                                                                  ),
                                                                  SizedBox(height: Get.height * 0.01),
                                                                  index !=
                                                                          (logic.getAllServiceCategory?.services?.length ?? 0) - 1
                                                                      ? Divider(
                                                                          color: AppColors.greyColor,
                                                                        )
                                                                      : Divider(
                                                                          color: AppColors.transparent,
                                                                        )
                                                                ],
                                                              );
                                                            },
                                                            separatorBuilder: (BuildContext context, int index) {
                                                              return SizedBox(height: Get.height * 0.01);
                                                            },
                                                          ),
                                                    GetBuilder<HomeScreenController>(
                                                      id: Constant.idBottomService,
                                                      builder: (logic) {
                                                        return logic.checkItem.isNotEmpty
                                                            ? Container(
                                                                height: 85,
                                                                width: double.infinity,
                                                                alignment: Alignment.bottomLeft,
                                                                decoration: BoxDecoration(
                                                                  color: AppColors.primaryAppColor.withOpacity(0.1),
                                                                  borderRadius: const BorderRadius.only(
                                                                    topLeft: Radius.circular(16),
                                                                    topRight: Radius.circular(16),
                                                                    bottomLeft: Radius.circular(16),
                                                                    bottomRight: Radius.circular(16),
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
                                                                            width: Get.width * 0.72,
                                                                            child: SizedBox(
                                                                              height: 20,
                                                                              width: Get.width * 0.02,
                                                                              child: SingleChildScrollView(
                                                                                scrollDirection: Axis.horizontal,
                                                                                child: Text(
                                                                                  logic.checkItem.join(" , "),
                                                                                  style: TextStyle(
                                                                                    fontFamily: FontFamily.sfProDisplayBold,
                                                                                    fontSize: 16,
                                                                                    color: AppColors.blackColor,
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
                                                                                  color: AppColors.currency.withOpacity(0.9),
                                                                                ),
                                                                              ),
                                                                              Text(
                                                                                " ($currency${logic.finalTaxRupee.toStringAsFixed(2)} ${"txtTax".tr})",
                                                                                style: TextStyle(
                                                                                  fontFamily: FontFamily.sfProDisplay,
                                                                                  fontSize: 12,
                                                                                  color: AppColors.currency.withOpacity(0.9),
                                                                                ),
                                                                              ),
                                                                              SizedBox(width: Get.width * 0.02),
                                                                              Text(
                                                                                "= $currency ${logic.totalPrice.toStringAsFixed(2)}",
                                                                                style: TextStyle(
                                                                                  fontFamily: FontFamily.sfProDisplayBold,
                                                                                  fontSize: 17,
                                                                                  color: AppColors.currency,
                                                                                ),
                                                                              ),
                                                                            ],
                                                                          ).paddingOnly(left: 5),
                                                                        ],
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              )
                                                            : const SizedBox();
                                                      },
                                                    )
                                                  ],
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                        SizedBox(height: Get.height * 0.02),
                                        GetBuilder<HomeScreenController>(
                                          id: Constant.idBottomService,
                                          builder: (logic) {
                                            return AppButton(
                                              height: 52,
                                              fontFamily: FontFamily.sfProDisplayBold,
                                              buttonColor: AppColors.primaryAppColor,
                                              fontSize: 18,
                                              color: AppColors.whiteColor,
                                              buttonText: "txtBookNow".tr,
                                              onTap: () async {
                                                if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                                  log("Total Minute :: ${logic.totalMinute}");
                                                  if (logic.checkItem.isEmpty) {
                                                    Utils.showToast(Get.context!, "txtPleaseSelectService".tr);
                                                  } else {
                                                    await logic.onGetServiceBasedSalonApiCall(
                                                      serviceId: logic.serviceId.join(","),
                                                      latitude: latitude ?? 0.0,
                                                      longitude: longitude ?? 0.0,
                                                    );
                                                    log("message status :: ${logic.getServiceBaseSalonCategory?.status}");

                                                    if (logic.getServiceBaseSalonCategory?.status == true) {
                                                      Get.toNamed(AppRoutes.selectBranch, arguments: [
                                                        logic.checkItem,
                                                        logic.totalPrice,
                                                        logic.finalTaxRupee,
                                                        logic.totalMinute,
                                                        logic.serviceId,
                                                        logic.withOutTaxRupee
                                                      ]);
                                                    } else {
                                                      Utils.showToast(Get.context!, "txtNotSalon".tr);
                                                    }
                                                  }
                                                } else {
                                                  Get.find<BottomBarController>().onClick(1);
                                                }
                                              },
                                            );
                                          },
                                        )
                                      ],
                                    ),
                                  );
                          },
                        ),
                        SizedBox(height: Get.height * 0.03),*/
                        ViewAll(
                          title: "txtCategory".tr,
                          subtitle: "txtViewAll".tr,
                          fontFamily: FontFamily.sfProDisplayMedium,
                          onTap: () {
                            Get.toNamed(
                              AppRoutes.category,
                              arguments: ["txtCategory".tr],
                            );
                          },
                        ),
                        SizedBox(height: Get.height * 0.015),
                        GetBuilder<HomeScreenController>(
                          id: Constant.idProgressView,
                          init: HomeScreenController(),
                          builder: (logic) {
                            return logic.isLoading.value
                                ? Shimmers.homeCategoryShimmer()
                                : AnimationLimiter(
                                    child: GridView.builder(
                                      scrollDirection: Axis.vertical,
                                      physics: const ScrollPhysics(),
                                      padding: EdgeInsets.zero,
                                      shrinkWrap: true,
                                      itemCount:
                                          (logic.getAllCategory?.data?.length ?? 0) >= 8 ? 8 : logic.getAllCategory?.data?.length,
                                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 4,
                                        childAspectRatio: 0.75,
                                        crossAxisSpacing: 6,
                                      ),
                                      itemBuilder: (BuildContext context, int index) {
                                        return AnimationConfiguration.staggeredGrid(
                                          position: index,
                                          duration: const Duration(milliseconds: 800),
                                          columnCount: (logic.getAllCategory?.data?.length ?? 0) >= 8
                                              ? 8
                                              : logic.getAllCategory?.data?.length ?? 0,
                                          child: FadeInAnimation(
                                            child: ScaleAnimation(
                                              child: GestureDetector(
                                                onTap: () async {
                                                  log("Category ID :: ${logic.getAllCategory?.data?[index].id}");

                                                  Get.toNamed(AppRoutes.categoryDetail, arguments: [
                                                    logic.getAllCategory?.data?[index].id,
                                                    logic.getAllCategory?.data?[index].name
                                                  ]);
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
                                                            imageUrl: "${logic.getAllCategory?.data?[index].image}",
                                                            fit: BoxFit.cover,
                                                            placeholder: (context, url) {
                                                              return Image.asset(AppAsset.icCategoryPlaceholder).paddingAll(15);
                                                            },
                                                            errorWidget: (context, url, error) {
                                                              return Image.asset(AppAsset.icCategoryPlaceholder).paddingAll(15);
                                                            },
                                                          ),
                                                        ),
                                                      ),
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
                                                        ).paddingOnly(top: 8, bottom: 10),
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
                                  );
                          },
                        ),
                        ViewAll(
                          title: "txtNearbyBranches".tr,
                          subtitle: "txtViewAll".tr,
                          fontFamily: FontFamily.sfProDisplayMedium,
                          onTap: () {
                            Get.toNamed(AppRoutes.branch);
                          },
                        ).paddingOnly(bottom: 10, top: 5),
                        SizedBox(
                          height: 256,
                          child: GetBuilder<HomeScreenController>(
                            id: Constant.idProgressView,
                            builder: (logic) {
                              return logic.isLoading.value
                                  ? Shimmers.nearByBranchesShimmer()
                                  : logic.getAllSalonCategory?.data?.isEmpty == true
                                      ? Align(
                                          alignment: Alignment.center,
                                          child: Column(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Image.asset(
                                                AppAsset.icNoService,
                                                height: 120,
                                                width: 120,
                                              ),
                                              Text(
                                                "txtNotSalon".tr,
                                                style: TextStyle(
                                                  fontFamily: FontFamily.sfProDisplayMedium,
                                                  fontSize: 17,
                                                  color: AppColors.primaryTextColor,
                                                ),
                                              ),
                                            ],
                                          ),
                                        )
                                      : ListView.builder(
                                          itemCount: (logic.getAllSalonCategory?.data?.length ?? 0) > 5
                                              ? 5
                                              : logic.getAllSalonCategory?.data?.length,
                                          physics: const BouncingScrollPhysics(),
                                          scrollDirection: Axis.horizontal,
                                          shrinkWrap: true,
                                          itemBuilder: (context, index) {
                                            return GestureDetector(
                                              onTap: () {
                                                Get.toNamed(AppRoutes.branchDetail,
                                                    arguments: [logic.getAllSalonCategory?.data?[index].id]);
                                              },
                                              child: Container(
                                                width: Get.width * 0.77,
                                                margin: const EdgeInsets.only(right: 10),
                                                padding: const EdgeInsets.all(6),
                                                decoration: BoxDecoration(
                                                  color: AppColors.whiteColor,
                                                  borderRadius: BorderRadius.circular(15),
                                                  border: Border.all(
                                                    color: AppColors.textFiledBg,
                                                    width: 1,
                                                  ),
                                                ),
                                                child: Column(
                                                  children: [
                                                    Container(
                                                      height: 158,
                                                      width: Get.width * 0.75,
                                                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(13)),
                                                      clipBehavior: Clip.hardEdge,
                                                      child: CachedNetworkImage(
                                                        imageUrl: logic.getAllSalonCategory?.data?[index].mainImage ?? "",
                                                        fit: BoxFit.cover,
                                                        placeholder: (context, url) {
                                                          return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
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
                                                    Row(
                                                      children: [
                                                        Text(
                                                          logic.getAllSalonCategory?.data?[index].name ?? "",
                                                          style: TextStyle(
                                                            color: AppColors.primaryTextColor,
                                                            fontFamily: FontFamily.sfProDisplayBold,
                                                            fontSize: 16.5,
                                                          ),
                                                        ),
                                                        const Spacer(),
                                                        Container(
                                                          height: 20,
                                                          decoration: BoxDecoration(
                                                            borderRadius: BorderRadius.circular(17),
                                                            color: AppColors.yellow1,
                                                          ),
                                                          padding: const EdgeInsets.symmetric(horizontal: 9),
                                                          margin: const EdgeInsets.only(left: 5),
                                                          child: Row(
                                                            children: [
                                                              Image.asset(
                                                                AppAsset.icStarFilled,
                                                                height: 12,
                                                                width: 12,
                                                                color: AppColors.yellow3,
                                                              ).paddingOnly(right: 5),
                                                              Text(
                                                                logic.getAllSalonCategory?.data?[index].review
                                                                        ?.toStringAsFixed(1) ??
                                                                    "",
                                                                style: TextStyle(
                                                                  color: AppColors.yellow3,
                                                                  fontFamily: FontFamily.sfProDisplayBold,
                                                                  fontSize: 13,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        )
                                                      ],
                                                    ).paddingOnly(top: 10, left: 3, right: 3),
                                                    Row(
                                                      children: [
                                                        Image.asset(
                                                          AppAsset.icLocation,
                                                          height: 17,
                                                          width: 17,
                                                        ).paddingOnly(right: 5),
                                                        SizedBox(
                                                          width: Get.width * 0.65,
                                                          child: Text(
                                                            "${logic.getAllSalonCategory?.data?[index].addressDetails?.addressLine1}, ${logic.getAllSalonCategory?.data?[index].addressDetails?.landMark}, ${logic.getAllSalonCategory?.data?[index].addressDetails?.city}, ${logic.getAllSalonCategory?.data?[index].addressDetails?.country}",
                                                            overflow: TextOverflow.ellipsis,
                                                            style: TextStyle(
                                                              color: AppColors.locationText,
                                                              fontFamily: FontFamily.sfProDisplay,
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    ).paddingOnly(bottom: 8, top: 5),
                                                    Row(
                                                      children: [
                                                        Image.asset(
                                                          AppAsset.icDirection,
                                                          height: 17,
                                                          width: 17,
                                                        ).paddingOnly(right: 5),
                                                        RichText(
                                                          text: TextSpan(
                                                            text: logic.getAllSalonCategory?.data?[index].distance == null
                                                                ? ""
                                                                : "${logic.getAllSalonCategory?.data?[index].distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                                                            style: TextStyle(
                                                              color: AppColors.locationText,
                                                              fontSize: 13,
                                                              fontFamily: FontFamily.sfProDisplayBold,
                                                            ),
                                                            children: <TextSpan>[
                                                              TextSpan(
                                                                text: "txtFromLocation".tr,
                                                                style: TextStyle(
                                                                  fontSize: 11,
                                                                  fontFamily: FontFamily.sfProDisplayRegular,
                                                                  color: AppColors.locationText,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            );
                                          },
                                        );
                            },
                          ),
                        ),
                        ViewAll(
                          title: "txtTopExperts".tr,
                          subtitle: "txtViewAll".tr,
                          fontFamily: FontFamily.sfProDisplayMedium,
                          onTap: () {
                            Get.toNamed(
                              AppRoutes.category,
                              arguments: ["txtTopExperts".tr],
                            );
                          },
                        ).paddingOnly(top: 13),
                        SizedBox(height: Get.height * 0.015),
                        GetBuilder<HomeScreenController>(
                          init: HomeScreenController(),
                          id: Constant.idProgressView,
                          builder: (logic) {
                            return logic.isLoading.value
                                ? Shimmers.homeExpertShimmer()
                                : logic.getAllExpertCategory?.data?.isEmpty ?? true
                                    ? Center(
                                        child: Column(
                                          children: [
                                            Image.asset(
                                              AppAsset.icNoExpert,
                                              height: 150,
                                              width: 150,
                                            ).paddingOnly(top: 30, bottom: 25),
                                            Text(
                                              "txtNotExpert".tr,
                                              style: TextStyle(
                                                  color: AppColors.primaryTextColor,
                                                  fontFamily: FontFamily.sfProDisplay,
                                                  fontSize: 18),
                                            )
                                          ],
                                        ),
                                      )
                                    : AnimationLimiter(
                                        child: GridView.builder(
                                          scrollDirection: Axis.vertical,
                                          physics: const ScrollPhysics(),
                                          padding: EdgeInsets.zero,
                                          shrinkWrap: true,
                                          itemCount: (logic.getAllExpertCategory?.data?.length ?? 0) > 6
                                              ? 6
                                              : logic.getAllExpertCategory?.data?.length,
                                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                            crossAxisCount: 2,
                                            childAspectRatio: 0.87,
                                            crossAxisSpacing: 13.5,
                                            mainAxisSpacing: 2,
                                          ),
                                          itemBuilder: (BuildContext context, int index) {
                                            logic.rating = logic.getAllExpertCategory?.data?[index].review ?? 0.0;
                                            logic.roundedRating = logic.rating?.round();
                                            logic.filledStars = logic.roundedRating?.clamp(0, 5);

                                            return AnimationConfiguration.staggeredGrid(
                                              position: index,
                                              duration: const Duration(milliseconds: 800),
                                              columnCount: (logic.getAllExpertCategory?.data?.length ?? 0) > 6
                                                  ? 6
                                                  : logic.getAllExpertCategory?.data?.length ?? 0,
                                              child: ScaleAnimation(
                                                child: FadeInAnimation(
                                                  child: GestureDetector(
                                                    onTap: () async {
                                                      log("logic.getAllExpertCategory?.data?[index].id::${logic.getAllExpertCategory?.data?[index].id}");

                                                      await logic.onGetExpertApiCall(
                                                          expertId: logic.getAllExpertCategory?.data?[index].id ?? "");

                                                      Get.toNamed(
                                                        AppRoutes.expertDetail,
                                                        arguments: [
                                                          logic.getAllExpertCategory?.data?[index].id,
                                                          index,
                                                          logic.getAllExpertCategory?.data?[index].review
                                                        ],
                                                      );
                                                    },
                                                    child: OverflowBox(
                                                      maxWidth: double.infinity,
                                                      maxHeight: double.infinity,
                                                      child: Container(
                                                        width: Get.width * 0.45,
                                                        margin: const EdgeInsets.only(top: 10),
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
                                                              strokeWidth: 1.1,
                                                              dashPattern: const [2.5, 2.5],
                                                              child: Container(
                                                                height: 78,
                                                                width: 78,
                                                                decoration: const BoxDecoration(shape: BoxShape.circle),
                                                                clipBehavior: Clip.hardEdge,
                                                                child: CachedNetworkImage(
                                                                  imageUrl: logic.getAllExpertCategory?.data?[index].image ?? "",
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
                                                            ).paddingOnly(top: 15),
                                                            SizedBox(height: Get.height * 0.008),
                                                            Text(
                                                              "${logic.getAllExpertCategory?.data?[index].fname} ${logic.getAllExpertCategory?.data?[index].lname}",
                                                              maxLines: 1,
                                                              overflow: TextOverflow.ellipsis,
                                                              style: TextStyle(
                                                                fontFamily: FontFamily.sfProDisplay,
                                                                fontSize: 15.5,
                                                                color: AppColors.category,
                                                              ),
                                                            ),
                                                            SizedBox(height: Get.height * 0.009),
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
                                      );
                          },
                        ),
                        SizedBox(height: Get.height * 0.02),
                      ],
                    ).paddingOnly(left: 15, right: 15),
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
