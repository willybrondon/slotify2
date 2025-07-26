import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class HomeScreenTopView extends StatelessWidget {
  const HomeScreenTopView({super.key});

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    return Stack(
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
          child: Row(
            children: [
              Column(
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
                          fontFamily: AppFontFamily.sfProDisplayBold,
                          fontSize: 20,
                          color: AppColors.whiteColor,
                        ),
                      );
                    },
                  ),
                  Text(
                    "txtWelcomeService".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayRegular,
                      fontSize: 16,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ],
              ).paddingOnly(bottom: 10),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Get.toNamed(AppRoutes.wishlist);
                },
                child: Image.asset(
                  AppAsset.icLikeOutline,
                  height: 40,
                ).paddingOnly(right: 13),
              ),
              GestureDetector(
                onTap: () {
                  Get.toNamed(AppRoutes.cart);
                },
                child: Image.asset(
                  AppAsset.icCart,
                  height: 40,
                ),
              ),
            ],
          ),
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
              boxShadow: Constant.boxShadow,
            ),
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
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class HomeScreenCategoryView extends StatelessWidget {
  const HomeScreenCategoryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ViewAll(
          title: "txtCategory".tr,
          subtitle: "txtViewAll".tr,
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
                      itemCount: (logic.getAllCategory?.data?.length ?? 0) >= 8 ? 8 : logic.getAllCategory?.data?.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 6,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 650),
                          columnCount:
                              (logic.getAllCategory?.data?.length ?? 0) >= 8 ? 8 : logic.getAllCategory?.data?.length ?? 0,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: GestureDetector(
                                onTap: () async {
                                  Get.toNamed(
                                    AppRoutes.categoryDetail,
                                    arguments: [logic.getAllCategory?.data?[index].id, logic.getAllCategory?.data?[index].name],
                                  );
                                },
                                child: OverflowBox(
                                  maxWidth: double.infinity,
                                  maxHeight: double.infinity,
                                  child: Stack(
                                    children: [
                                      Container(
                                        height: 100,
                                        width: 80,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(14),
                                          color: AppColors.grey.withOpacity(0.1),
                                        ),
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
                                      Positioned(
                                        top: 74,
                                        child: Container(
                                          height: 27,
                                          width: 80,
                                          decoration: BoxDecoration(
                                            borderRadius: const BorderRadius.only(
                                              bottomLeft: Radius.circular(14),
                                              bottomRight: Radius.circular(14),
                                            ),
                                            color: AppColors.whiteColor.withOpacity(0.88),
                                            border: Border.all(
                                              color: AppColors.grey.withOpacity(0.08),
                                              width: 0.8,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              logic.getAllCategory?.data![index].name.toString() ?? "",
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.sfProDisplay,
                                                fontSize: 12.5,
                                                color: AppColors.appText,
                                              ),
                                            ).paddingOnly(left: 5, right: 5, bottom: 3),
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
                  );
          },
        ),
      ],
    );
  }
}

class HomeScreenNearSalonView extends StatelessWidget {
  const HomeScreenNearSalonView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ViewAll(
          title: "txtNearbyBranches".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(AppRoutes.branch);
          },
        ).paddingOnly(bottom: 10, top: 5),
        SizedBox(
          height: 265,
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
                                  fontFamily: AppFontFamily.sfProDisplayMedium,
                                  fontSize: 17,
                                  color: AppColors.primaryTextColor,
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          itemCount:
                              (logic.getAllSalonCategory?.data?.length ?? 0) > 5 ? 5 : logic.getAllSalonCategory?.data?.length,
                          physics: const BouncingScrollPhysics(),
                          scrollDirection: Axis.horizontal,
                          shrinkWrap: true,
                          itemBuilder: (context, index) {
                            return GestureDetector(
                              onTap: () {
                                Get.toNamed(AppRoutes.branchDetail, arguments: [logic.getAllSalonCategory?.data?[index].id]);
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
                                    Stack(
                                      children: [
                                        Container(
                                          height: 158,
                                          width: Get.width * 0.75,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(13),
                                            color: AppColors.grey.withOpacity(0.2),
                                          ),
                                          clipBehavior: Clip.hardEdge,
                                          child: CachedNetworkImage(
                                            imageUrl: logic.getAllSalonCategory?.data?[index].mainImage ?? "",
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                            },
                                            errorWidget: (context, url, error) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                            },
                                          ),
                                        ),
                                        GestureDetector(
                                          onTap: () async {
                                            if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                              logic.onLikeSalon(
                                                userId: Constant.storage.read<String>('userId') ?? "",
                                                salonId: logic.getAllSalonCategory?.data?[index].id ?? "",
                                                latitude: latitude.toString(),
                                                longitude: longitude.toString(),
                                              );
                                            } else {
                                              Get.toNamed(AppRoutes.signIn, arguments: [logic.checkItem.isNotEmpty]);
                                              await Get.find<SignInController>().getDataFromArgs();
                                            }
                                          },
                                          child: Align(
                                            alignment: Alignment.topRight,
                                            child: logic.isSalonSaved[index] == true
                                                ? Image.asset(
                                                    AppAsset.icLikeFilled,
                                                    height: 32,
                                                  ).paddingOnly(right: 7, top: 7)
                                                : Image.asset(
                                                    AppAsset.icLikeOutline,
                                                    height: 32,
                                                  ).paddingOnly(right: 7, top: 7),
                                          ),
                                        ),
                                      ],
                                    ),
                                    Row(
                                      children: [
                                        Text(
                                          logic.getAllSalonCategory?.data?[index].name ?? "",
                                          style: TextStyle(
                                            color: AppColors.primaryTextColor,
                                            fontFamily: AppFontFamily.sfProDisplayBold,
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
                                                logic.getAllSalonCategory?.data?[index].review?.toStringAsFixed(1) ?? "",
                                                style: TextStyle(
                                                  color: AppColors.yellow3,
                                                  fontFamily: AppFontFamily.sfProDisplayBold,
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
                                              color: AppColors.termsDialog,
                                              fontFamily: AppFontFamily.heeBo600,
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
                                              fontSize: 13,
                                              color: AppColors.appText,
                                              fontFamily: AppFontFamily.heeBo600,
                                            ),
                                            children: <TextSpan>[
                                              TextSpan(
                                                text: "txtFromLocation".tr,
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  fontFamily: AppFontFamily.heeBo600,
                                                  color: AppColors.termsDialog,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const Spacer(),
                                        Container(
                                          height: 25,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(6),
                                            color: AppColors.greenColorBg,
                                          ),
                                          padding: const EdgeInsets.symmetric(horizontal: 10),
                                          margin: const EdgeInsets.only(left: 5),
                                          child: Center(
                                            child: Text(
                                              "Open",
                                              style: TextStyle(
                                                color: AppColors.greenColor,
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 13,
                                              ),
                                            ),
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
      ],
    );
  }
}

class HomeScreenNewProductView extends StatelessWidget {
  const HomeScreenNewProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.productBg,
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ViewAll(
            title: "txtNewProducts".tr,
            subtitle: "txtViewAll".tr,
            onTap: () {
              Get.toNamed(
                AppRoutes.newProduct,
              );
            },
          ).paddingOnly(bottom: 10),
          SizedBox(
            height: 160,
            child: GetBuilder<HomeScreenController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return logic.isLoading.value
                    ? Shimmers.newProductShimmer()
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: EdgeInsets.zero,
                        shrinkWrap: true,
                        itemCount: logic.getNewProductModel?.data?.length ?? 0,
                        itemBuilder: (BuildContext context, int index) {
                          return AnimationConfiguration.staggeredGrid(
                            position: index,
                            duration: const Duration(milliseconds: 700),
                            columnCount: (logic.getNewProductModel?.data?.length ?? 0) >= 3
                                ? 3
                                : logic.getNewProductModel?.data?.length ?? 0,
                            child: FadeInAnimation(
                              child: ScaleAnimation(
                                child: InkWell(
                                  onTap: () {
                                    if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                      Get.toNamed(
                                        AppRoutes.productDetail,
                                        arguments: [
                                          logic.getNewProductModel?.data?[index].id,
                                        ],
                                      );
                                    } else {
                                      Get.find<BottomBarController>().onClick(1);
                                    }
                                  },
                                  overlayColor: WidgetStateColor.transparent,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(21),
                                      color: RandomColorGenerator.getRandomColor(),
                                      boxShadow: Constant.boxShadow,
                                    ),
                                    width: 110,
                                    child: Stack(
                                      children: [
                                        Column(
                                          children: [
                                            const Spacer(),
                                            const Spacer(),
                                            const Spacer(),
                                            const Spacer(),
                                            CachedNetworkImage(
                                              imageUrl: logic.getNewProductModel?.data?[index].mainImage ?? "",
                                              height: 80,
                                              fit: BoxFit.cover,
                                              placeholder: (context, url) {
                                                return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                              },
                                              errorWidget: (context, url, error) {
                                                return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                              },
                                            ),
                                            const Spacer(),
                                            Align(
                                              alignment: Alignment.centerLeft,
                                              child: Text(
                                                Constant.capitalizeFirstLetter(
                                                    logic.getNewProductModel?.data?[index].productName ?? ""),
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo700,
                                                  fontSize: 14,
                                                  color: AppColors.appText,
                                                ),
                                              ).paddingOnly(left: 7, right: 5),
                                            ),
                                            const SizedBox(height: 2),
                                            Row(
                                              children: [
                                                Text(
                                                  "$currency ${logic.getNewProductModel?.data?[index].price ?? ""}",
                                                  style: TextStyle(
                                                    fontFamily: AppFontFamily.heeBo800,
                                                    fontSize: 14,
                                                    color: AppColors.primaryAppColor,
                                                  ),
                                                ).paddingOnly(right: 7),
                                                logic.getNewProductModel?.data?[index].mrp == null
                                                    ? Container()
                                                    : Text(
                                                        "$currency ${logic.getNewProductModel?.data?[index].mrp ?? ""}",
                                                        style: TextStyle(
                                                          fontFamily: AppFontFamily.heeBo700,
                                                          fontSize: 14,
                                                          decoration: TextDecoration.lineThrough,
                                                          decorationColor: AppColors.currencyRed,
                                                          color: AppColors.currencyRed,
                                                          decorationThickness: 1.5,
                                                        ),
                                                      ),
                                              ],
                                            ).paddingOnly(left: 10, right: 7),
                                            const Spacer(),
                                            const Spacer(),
                                          ],
                                        ),
                                        Positioned(
                                          right: 8,
                                          top: 8,
                                          child: GestureDetector(
                                            onTap: () {
                                              if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                                logic.onNewProductSaved(
                                                  userId: Constant.storage.read<String>('userId') ?? "",
                                                  categoryId: logic.getNewProductModel?.data?[index].category ?? "",
                                                  productId: logic.getNewProductModel?.data?[index].id ?? "",
                                                );
                                              } else {
                                                Get.find<BottomBarController>().onClick(1);
                                              }
                                            },
                                            child: logic.isNewProductSaved[index] == true
                                                ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                                : Image.asset(AppAsset.icLikeOutline, height: 30),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ).paddingOnly(right: 10),
                                ),
                              ),
                            ),
                          );
                        },
                      );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class HomeScreenTrendingProduct extends StatelessWidget {
  const HomeScreenTrendingProduct({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ViewAll(
          title: "txtTrendingProducts".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.trendingProduct,
            );
          },
        ).paddingOnly(bottom: 10),
        SizedBox(
          height: 160,
          child: GetBuilder<HomeScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return logic.isLoading.value
                  ? Shimmers.trendingProductShimmer()
                  : ListView.builder(
                      scrollDirection: Axis.horizontal,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount: logic.getTrendingProductModel?.data?.length ?? 0,
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 650),
                          columnCount: (logic.getTrendingProductModel?.data?.length ?? 0) >= 3
                              ? 3
                              : logic.getTrendingProductModel?.data?.length ?? 0,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: InkWell(
                                onTap: () {
                                  if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                    Get.toNamed(
                                      AppRoutes.productDetail,
                                      arguments: [
                                        logic.getTrendingProductModel?.data?[index].id,
                                      ],
                                    );
                                  } else {
                                    Get.find<BottomBarController>().onClick(1);
                                  }
                                },
                                overlayColor: WidgetStateColor.transparent,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(21),
                                    color: RandomColorGenerator.getRandomColor(),
                                    boxShadow: Constant.boxShadow,
                                    border: Border.all(
                                      color: AppColors.grey.withOpacity(0.1),
                                      width: 1,
                                    ),
                                  ),
                                  width: 110,
                                  child: Stack(
                                    children: [
                                      Column(
                                        children: [
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          const Spacer(),
                                          CachedNetworkImage(
                                            imageUrl: logic.getTrendingProductModel?.data?[index].mainImage ?? "",
                                            height: 85,
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                            },
                                            errorWidget: (context, url, error) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                            },
                                          ),
                                          const Spacer(),
                                          const Spacer(),
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(
                                              Constant.capitalizeFirstLetter(
                                                  logic.getTrendingProductModel?.data?[index].productName ?? ""),
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 14,
                                                color: AppColors.appText,
                                              ),
                                            ).paddingOnly(left: 7, right: 5),
                                          ),
                                          Row(
                                            children: [
                                              Image.asset(AppAsset.icRedStar, height: 12, color: AppColors.yellow3),
                                              Text(
                                                "${logic.getTrendingProductModel?.data?[index].rating?.toStringAsFixed(1) ?? ""} | ${logic.getTrendingProductModel?.data?[index].sold ?? ""} Sold",
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo700,
                                                  fontSize: 12,
                                                  color: AppColors.ratingBlack,
                                                ),
                                              ).paddingOnly(left: 4),
                                            ],
                                          ).paddingOnly(left: 7, right: 7),
                                          Row(
                                            children: [
                                              Text(
                                                "$currency ${logic.getTrendingProductModel?.data?[index].price ?? ""}",
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo800,
                                                  fontSize: 14,
                                                  color: AppColors.primaryAppColor,
                                                ),
                                              ).paddingOnly(right: 7),
                                              logic.getTrendingProductModel?.data?[index].mrp == null
                                                  ? Container()
                                                  : Text(
                                                      "$currency ${logic.getTrendingProductModel?.data?[index].mrp ?? ""}",
                                                      style: TextStyle(
                                                        fontFamily: AppFontFamily.heeBo700,
                                                        fontSize: 14,
                                                        decoration: TextDecoration.lineThrough,
                                                        decorationColor: AppColors.currencyRed,
                                                        color: AppColors.currencyRed,
                                                        decorationThickness: 1.5,
                                                      ),
                                                    ),
                                            ],
                                          ).paddingOnly(left: 10, right: 7),
                                          const Spacer(),
                                          const Spacer(),
                                        ],
                                      ),
                                      logic.getTrendingProductModel?.data?[index].isBestSeller == true
                                          ? Container(
                                              height: 22,
                                              width: Get.width * 0.17,
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
                                      Positioned(
                                        right: 8,
                                        top: 8,
                                        child: GestureDetector(
                                          onTap: () {
                                            if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                              logic.onTrendingProductSaved(
                                                userId: Constant.storage.read<String>('userId') ?? "",
                                                categoryId: logic.getTrendingProductModel?.data?[index].category ?? "",
                                                productId: logic.getTrendingProductModel?.data?[index].id ?? "",
                                              );
                                            } else {
                                              Get.find<BottomBarController>().onClick(1);
                                            }
                                          },
                                          child: logic.isTrendingProductSaved[index] == true
                                              ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                              : Image.asset(AppAsset.icLikeOutline, height: 30),
                                        ),
                                      ),
                                    ],
                                  ),
                                ).paddingOnly(right: 10),
                              ),
                            ),
                          ),
                        );
                      },
                    );
            },
          ),
        ),
      ],
    ).paddingOnly(left: 15, right: 15, top: 15);
  }
}

class HomeScreenTopExpertView extends StatelessWidget {
  const HomeScreenTopExpertView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ViewAll(
          title: "txtTopExperts".tr,
          subtitle: "txtViewAll".tr,
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
                                fontFamily: AppFontFamily.sfProDisplay,
                                fontSize: 18,
                              ),
                            )
                          ],
                        ),
                      )
                    : AnimationLimiter(
                        child: SizedBox(
                          height: 185,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            physics: const ScrollPhysics(),
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount: (logic.getAllExpertCategory?.data?.length ?? 0) > 6
                                ? 6
                                : logic.getAllExpertCategory?.data?.length,
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
                                      child: Container(
                                        width: Get.width * 0.35,
                                        margin: const EdgeInsets.only(right: 10, top: 5, bottom: 5),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(21),
                                          color: AppColors.whiteColor,
                                          boxShadow: Constant.boxShadow,
                                          border: Border.all(
                                            color: AppColors.grey.withOpacity(0.1),
                                            width: 1,
                                          ),
                                        ),
                                        child: Column(
                                          children: [
                                            const Spacer(),
                                            const Spacer(),
                                            DottedBorder(
                                              color: AppColors.roundBorder,
                                              borderType: BorderType.RRect,
                                              radius: const Radius.circular(41),
                                              strokeWidth: 1.1,
                                              dashPattern: const [2.5, 2.5],
                                              child: Container(
                                                height: 70,
                                                width: 70,
                                                decoration: const BoxDecoration(shape: BoxShape.circle),
                                                clipBehavior: Clip.hardEdge,
                                                child: CachedNetworkImage(
                                                  imageUrl: logic.getAllExpertCategory?.data?[index].image ?? "",
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
                                            const Spacer(),
                                            Text(
                                              "${logic.getAllExpertCategory?.data?[index].fname} ${logic.getAllExpertCategory?.data?[index].lname}",
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo600,
                                                fontSize: 14,
                                                color: AppColors.category,
                                              ),
                                            ),
                                            const Spacer(),
                                            Container(
                                              height: 32,
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(8),
                                                color: AppColors.yellow2,
                                              ),
                                              child: SizedBox(
                                                height: 12,
                                                child: ListView.separated(
                                                  shrinkWrap: true,
                                                  itemCount: 5,
                                                  scrollDirection: Axis.horizontal,
                                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                                  itemBuilder: (context, index) {
                                                    if (index < logic.filledStars!) {
                                                      return Image.asset(
                                                        AppAsset.icStarFilled,
                                                        height: 13,
                                                        width: 13,
                                                      );
                                                    } else {
                                                      return Image.asset(
                                                        AppAsset.icStarOutline,
                                                        height: 13,
                                                        width: 13,
                                                      );
                                                    }
                                                  },
                                                  separatorBuilder: (context, index) {
                                                    return SizedBox(width: Get.width * 0.015);
                                                  },
                                                ),
                                              ),
                                            ),
                                            const Spacer(),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      );
          },
        ),
        SizedBox(height: Get.height * 0.01),
      ],
    );
  }
}

/*class HomeScreenNewProductView extends StatelessWidget {
  const HomeScreenNewProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.productBg,
      padding: const EdgeInsets.all(15),
      child: Column(
        children: [
          ViewAll(
            title: "txtNewProducts".tr,
            subtitle: "txtViewAll".tr,
            onTap: () {
              Get.toNamed(
                AppRoutes.newProduct,
              );
            },
          ).paddingOnly(bottom: 10),
          GetBuilder<HomeScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return logic.isLoading.value
                  ? Shimmers.newProductShimmer()
                  : GridView.builder(
                      scrollDirection: Axis.vertical,
                      physics: const ScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      itemCount:
                          (logic.getNewProductModel?.data?.length ?? 0) >= 3 ? 3 : logic.getNewProductModel?.data?.length ?? 0,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 10,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 700),
                          columnCount: (logic.getNewProductModel?.data?.length ?? 0) >= 3
                              ? 3
                              : logic.getNewProductModel?.data?.length ?? 0,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: InkWell(
                                onTap: () {
                                  if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                    Get.toNamed(
                                      AppRoutes.productDetail,
                                      arguments: [
                                        logic.getNewProductModel?.data?[index].id,
                                      ],
                                    );
                                  } else {
                                    Get.find<BottomBarController>().onClick(1);
                                  }
                                },
                                overlayColor: WidgetStateColor.transparent,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(21),
                                    color: RandomColorGenerator.getRandomColor(),
                                    boxShadow: Constant.boxShadow,
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
                                            imageUrl: logic.getNewProductModel?.data?[index].mainImage ?? "",
                                            height: 85,
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                            },
                                            errorWidget: (context, url, error) {
                                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                            },
                                          ),
                                          const Spacer(),
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: Text(
                                              Constant.capitalizeFirstLetter(
                                                  logic.getNewProductModel?.data?[index].productName ?? ""),
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 14,
                                                color: AppColors.appText,
                                              ),
                                            ).paddingOnly(left: 7, right: 5),
                                          ),
                                          const SizedBox(height: 2),
                                          Row(
                                            children: [
                                              Text(
                                                "$currency ${logic.getNewProductModel?.data?[index].price ?? ""}",
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo800,
                                                  fontSize: 14,
                                                  color: AppColors.primaryAppColor,
                                                ),
                                              ).paddingOnly(right: 7),
                                              logic.getNewProductModel?.data?[index].mrp == null
                                                  ? Container()
                                                  : Text(
                                                      "$currency ${logic.getNewProductModel?.data?[index].mrp ?? ""}",
                                                      style: TextStyle(
                                                        fontFamily: AppFontFamily.heeBo700,
                                                        fontSize: 14,
                                                        decoration: TextDecoration.lineThrough,
                                                        decorationColor: AppColors.currencyRed,
                                                        color: AppColors.currencyRed,
                                                        decorationThickness: 1.5,
                                                      ),
                                                    ),
                                            ],
                                          ).paddingOnly(left: 10, right: 7),
                                          const Spacer(),
                                          const Spacer(),
                                        ],
                                      ),
                                      Positioned(
                                        right: 8,
                                        top: 8,
                                        child: GestureDetector(
                                          onTap: () {
                                            logic.onNewProductSaved(
                                              userId: Constant.storage.read<String>('userId') ?? "",
                                              categoryId: logic.getNewProductModel?.data?[index].category ?? "",
                                              productId: logic.getNewProductModel?.data?[index].id ?? "",
                                            );
                                          },
                                          child: logic.isNewProductSaved[index] == true
                                              ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                              : Image.asset(AppAsset.icLikeOutline, height: 30),
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
                    );
            },
          ),
        ],
      ),
    );
  }
}

class HomeScreenTrendingProduct extends StatelessWidget {
  const HomeScreenTrendingProduct({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ViewAll(
          title: "txtTrendingProducts".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.trendingProduct,
            );
          },
        ).paddingOnly(bottom: 10),
        GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.trendingProductShimmer()
                : GridView.builder(
                    scrollDirection: Axis.vertical,
                    physics: const ScrollPhysics(),
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    itemCount: (logic.getTrendingProductModel?.data?.length ?? 0) >= 6
                        ? 6
                        : logic.getTrendingProductModel?.data?.length ?? 0,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 8,
                    ),
                    itemBuilder: (BuildContext context, int index) {
                      return AnimationConfiguration.staggeredGrid(
                        position: index,
                        duration: const Duration(milliseconds: 650),
                        columnCount: (logic.getTrendingProductModel?.data?.length ?? 0) >= 6
                            ? 6
                            : logic.getTrendingProductModel?.data?.length ?? 0,
                        child: FadeInAnimation(
                          child: ScaleAnimation(
                            child: InkWell(
                              onTap: () {
                                if (Constant.storage.read<bool>('isLogIn') ?? false) {
                                  Get.toNamed(
                                    AppRoutes.productDetail,
                                    arguments: [
                                      logic.getTrendingProductModel?.data?[index].id,
                                    ],
                                  );
                                } else {
                                  Get.find<BottomBarController>().onClick(1);
                                }
                              },
                              overlayColor: WidgetStateColor.transparent,
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(21),
                                  color: RandomColorGenerator.getRandomColor(),
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
                                        const Spacer(),
                                        CachedNetworkImage(
                                          imageUrl: logic.getTrendingProductModel?.data?[index].mainImage ?? "",
                                          height: 85,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                          },
                                        ),
                                        const Spacer(),
                                        const Spacer(),
                                        Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(
                                            Constant.capitalizeFirstLetter(
                                                logic.getTrendingProductModel?.data?[index].productName ?? ""),
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontFamily: AppFontFamily.heeBo700,
                                              fontSize: 14,
                                              color: AppColors.appText,
                                            ),
                                          ).paddingOnly(left: 7, right: 5),
                                        ),
                                        Row(
                                          children: [
                                            Image.asset(AppAsset.icRedStar, height: 12, color: AppColors.yellow3),
                                            Text(
                                              "${logic.getTrendingProductModel?.data?[index].review ?? ""} | ${logic.getTrendingProductModel?.data?[index].sold ?? ""} Sold",
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo700,
                                                fontSize: 12,
                                                color: AppColors.ratingBlack,
                                              ),
                                            ).paddingOnly(left: 4),
                                          ],
                                        ).paddingOnly(left: 7, right: 7),
                                        Row(
                                          children: [
                                            Text(
                                              "$currency ${logic.getTrendingProductModel?.data?[index].price ?? ""}",
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo800,
                                                fontSize: 14,
                                                color: AppColors.primaryAppColor,
                                              ),
                                            ).paddingOnly(right: 7),
                                            logic.getTrendingProductModel?.data?[index].mrp == null
                                                ? Container()
                                                : Text(
                                                    "$currency ${logic.getTrendingProductModel?.data?[index].mrp ?? ""}",
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily.heeBo700,
                                                      fontSize: 14,
                                                      decoration: TextDecoration.lineThrough,
                                                      decorationColor: AppColors.currencyRed,
                                                      color: AppColors.currencyRed,
                                                      decorationThickness: 1.5,
                                                    ),
                                                  ),
                                          ],
                                        ).paddingOnly(left: 10, right: 7),
                                        const Spacer(),
                                        const Spacer(),
                                      ],
                                    ),
                                    logic.getTrendingProductModel?.data?[index].isBestSeller == true
                                        ? Container(
                                            height: 22,
                                            width: Get.width * 0.17,
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
                                    Positioned(
                                      right: 8,
                                      top: 8,
                                      child: GestureDetector(
                                        onTap: () {
                                          logic.onTrendingProductSaved(
                                            userId: Constant.storage.read<String>('userId') ?? "",
                                            categoryId: logic.getTrendingProductModel?.data?[index].category ?? "",
                                            productId: logic.getTrendingProductModel?.data?[index].id ?? "",
                                          );
                                        },
                                        child: logic.isTrendingProductSaved[index] == true
                                            ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                            : Image.asset(AppAsset.icLikeOutline, height: 30),
                                      ),
                                    ),
                                  ],
                                ),
                              ).paddingOnly(bottom: 10),
                            ),
                          ),
                        ),
                      );
                    },
                  );
          },
        ),
      ],
    ).paddingOnly(left: 15, right: 15, top: 15);
  }
}*/
