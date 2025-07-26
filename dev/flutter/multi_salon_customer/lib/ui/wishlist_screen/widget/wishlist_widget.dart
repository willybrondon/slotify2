import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/wishlist_screen/controller/wishlist_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class WishlistAppBarView extends StatelessWidget {
  const WishlistAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtWishlist".tr,
      method: InkWell(
        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        onTap: () {
          Get.back();
        },
        child: Icon(
          Icons.arrow_back,
          color: AppColors.whiteColor,
        ),
      ),
    );
  }
}

class WishlistTabView extends StatelessWidget {
  const WishlistTabView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        WishlistTabBarView(),
        WishlistTabBarItemView(),
      ],
    );
  }
}

class WishlistTabBarView extends StatelessWidget {
  const WishlistTabBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WishlistController>(
      id: Constant.idChangeTab,
      builder: (logic) {
        return TabBar(
          controller: logic.tabController,
          tabs: logic.tabs,
          labelStyle: const TextStyle(
            fontSize: 16,
            fontFamily: AppFontFamily.heeBo500,
          ),
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          indicatorPadding: const EdgeInsets.all(5),
          indicator: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: AppColors.primaryAppColor,
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          labelColor: AppColors.whiteColor,
          unselectedLabelStyle: const TextStyle(
            fontFamily: AppFontFamily.heeBo500,
            fontSize: 15,
          ),
          isScrollable: false,
          unselectedLabelColor: AppColors.service,
          dividerColor: Colors.transparent,
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        );
      },
    );
  }
}

class WishlistTabBarItemView extends StatelessWidget {
  const WishlistTabBarItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GetBuilder<WishlistController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return TabBarView(
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            controller: logic.tabController,
            children: [
              const WishlistSalonItemView(),
              const WishlistProductItemView().paddingAll(12),
            ],
          );
        },
      ),
    );
  }
}

class WishlistSalonItemView extends StatelessWidget {
  const WishlistSalonItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WishlistController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? Shimmers.nearByBranchesWithLocationShimmer()
            : logic.getFavouriteSalonModel?.favourite?.isEmpty == true || logic.getFavouriteSalonModel?.status == false
                ? Align(
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          AppAsset.icNoService,
                          height: 150,
                          width: 150,
                        ),
                        Text(
                          "desNoDataFoundWishlistSalon".tr,
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
                    itemCount: logic.getFavouriteSalonModel?.favourite?.length,
                    physics: const BouncingScrollPhysics(),
                    scrollDirection: Axis.vertical,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                        onTap: () {
                          Get.toNamed(
                            AppRoutes.branchDetail,
                            arguments: [
                              logic.getFavouriteSalonModel?.favourite?[index].id,
                            ],
                          );
                        },
                        child: Container(
                          width: Get.width * 0.93,
                          padding: const EdgeInsets.all(10),
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: AppColors.whiteColor,
                            borderRadius: BorderRadius.circular(19),
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
                                    height: Get.height * 0.22,
                                    width: Get.width * 0.93,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(15),
                                      color: AppColors.grey.withOpacity(0.2),
                                    ),
                                    clipBehavior: Clip.hardEdge,
                                    child: CachedNetworkImage(
                                      imageUrl: logic.getFavouriteSalonModel?.favourite?[index].mainImage ?? "",
                                      fit: BoxFit.cover,
                                      errorWidget: (context, url, error) {
                                        return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                      },
                                      placeholder: (context, url) {
                                        return Image.asset(AppAsset.icImagePlaceholder).paddingAll(5);
                                      },
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      logic.onClickSalonLikeButton(
                                        userId: Constant.storage.read<String>('userId') ?? "",
                                        salonId: logic.getFavouriteSalonModel?.favourite?[index].id ?? "",
                                        latitudes: latitude.toString(),
                                        longitudes: longitude.toString(),
                                      );
                                    },
                                    child: Align(
                                      alignment: Alignment.topRight,
                                      child: Image.asset(
                                        AppAsset.icLikeFilled,
                                        height: 32,
                                      ).paddingOnly(right: 7, top: 7),
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Text(
                                    logic.getFavouriteSalonModel?.favourite?[index].salonName ?? "",
                                    style: TextStyle(
                                      color: AppColors.appText,
                                      fontFamily: AppFontFamily.heeBo800,
                                      fontSize: 15.5,
                                    ),
                                  ),
                                  const Spacer(),
                                  Container(
                                    height: 30,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(17),
                                      color: AppColors.yellow1,
                                    ),
                                    padding: const EdgeInsets.symmetric(horizontal: 13),
                                    margin: const EdgeInsets.only(left: 5),
                                    child: Row(
                                      children: [
                                        Image.asset(
                                          AppAsset.icStarFilled,
                                          height: 15,
                                          width: 15,
                                          color: AppColors.yellow3,
                                        ).paddingOnly(right: 5),
                                        Text(
                                          logic.getFavouriteSalonModel?.favourite?[index].review?.toStringAsFixed(1) ?? "",
                                          style: TextStyle(
                                            color: AppColors.yellow3,
                                            fontFamily: AppFontFamily.sfProDisplayBold,
                                            fontSize: 14,
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
                                    height: 20,
                                    width: 20,
                                  ).paddingOnly(right: 8),
                                  SizedBox(
                                    width: Get.width * 0.798,
                                    child: Text(
                                      "${logic.getFavouriteSalonModel?.favourite?[index].address?.addressLine1}, ${logic.getFavouriteSalonModel?.favourite?[index].address?.landMark}, ${logic.getFavouriteSalonModel?.favourite?[index].address?.city}, ${logic.getFavouriteSalonModel?.favourite?[index].address?.country}",
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: AppColors.termsDialog,
                                        fontFamily: AppFontFamily.heeBo600,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                ],
                              ).paddingOnly(bottom: 8),
                              Row(
                                children: [
                                  Image.asset(
                                    AppAsset.icDirection,
                                    height: 20,
                                    width: 20,
                                  ).paddingOnly(right: 8),
                                  RichText(
                                    text: TextSpan(
                                      text: logic.getFavouriteSalonModel?.favourite?[index].distance == null
                                          ? ""
                                          : "${logic.getFavouriteSalonModel?.favourite?[index].distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: AppColors.appText,
                                        fontFamily: AppFontFamily.heeBo600,
                                      ),
                                      children: <TextSpan>[
                                        TextSpan(
                                          text: "txtFromLocation".tr,
                                          style: TextStyle(
                                            fontSize: 12,
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
                  ).paddingAll(15);
      },
    );
  }
}

class WishlistProductItemView extends StatelessWidget {
  const WishlistProductItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WishlistController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getFavouriteProductModel?.favourite?.isEmpty == true || logic.getFavouriteProductModel?.status == false
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      AppAsset.icNoService,
                      height: 170,
                      width: 170,
                    ),
                    Text(
                      "desNoDataFoundWishlistProduct".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                        fontSize: 17,
                        color: AppColors.primaryTextColor,
                      ),
                    )
                  ],
                ),
              )
            : GridView.builder(
                scrollDirection: Axis.vertical,
                physics: const ScrollPhysics(),
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: logic.getFavouriteProductModel?.favourite?.length ?? 0,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemBuilder: (BuildContext context, int index) {
                  return InkWell(
                    onTap: () {
                      Get.toNamed(
                        AppRoutes.productDetail,
                        arguments: [
                          logic.getFavouriteProductModel?.favourite?[index].productId,
                        ],
                      );
                    },
                    overlayColor: WidgetStateColor.transparent,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(21),
                        color: RandomColorGenerator.getRandomColor(),
                        boxShadow: Constant.boxShadow,
                        border: Border.all(
                          color: AppColors.grey.withOpacity(0.08),
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
                              CachedNetworkImage(
                                imageUrl: logic.getFavouriteProductModel?.favourite?[index].product?.mainImage ?? "",
                                fit: BoxFit.cover,
                                height: 85,
                                placeholder: (context, url) {
                                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                },
                                errorWidget: (context, url, error) {
                                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                },
                              ),
                              const Spacer(),
                              Align(
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  Constant.capitalizeFirstLetter(
                                      logic.getFavouriteProductModel?.favourite?[index].product?.productName ?? ""),
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
                                    "$currency ${logic.getFavouriteProductModel?.favourite?[index].product?.price?.toStringAsFixed(1)}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo800,
                                      fontSize: 14,
                                      color: AppColors.primaryAppColor,
                                    ),
                                  ).paddingOnly(right: 7),
                                ],
                              ).paddingOnly(left: 10, right: 7),
                              const Spacer(),
                              const Spacer(),
                            ],
                          ),
                          Positioned(
                            right: 8,
                            top: 8,
                            child: InkWell(
                              onTap: () {
                                logic.onClickLikeButton(
                                  userId: logic.getFavouriteProductModel?.favourite?[index].userId ?? "",
                                  categoryId: logic.getFavouriteProductModel?.favourite?[index].categoryId ?? "",
                                  productId: logic.getFavouriteProductModel?.favourite?[index].productId ?? "",
                                );
                              },
                              overlayColor: WidgetStateColor.transparent,
                              child: Image.asset(AppAsset.icLikeFilled, height: 30),
                            ),
                          )
                        ],
                      ),
                    ),
                  );
                },
              );
      },
    );
  }
}
