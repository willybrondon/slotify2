import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/ui/product_screen/controller/product_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class ProductScreenView extends StatelessWidget {
  const ProductScreenView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: Get.height * 0.02),
              RefreshIndicator(
                onRefresh: () => logic.onRefresh(),
                color: AppColors.primaryAppColor,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const ProductProductCategoryView(),
                    logic.homeScreenController.getNewProductModel?.data?.isEmpty == true
                        ? const SizedBox()
                        : const ProductNewProductView(),
                    logic.homeScreenController.getTrendingProductModel?.data?.isEmpty == true
                        ? const SizedBox()
                        : const ProductTrendingProduct(),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class ProductScreenTopView extends StatelessWidget {
  const ProductScreenTopView({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              Get.toNamed(AppRoutes.searchProduct);
            },
            child: Container(
              height: 55,
              width: double.infinity,
              margin: const EdgeInsets.only(left: 16, right: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
                border: Border.all(color: AppColors.grey.withOpacity(0.2), width: 1),
              ),
              child: Row(
                children: [
                  Image.asset(
                    AppAsset.icSearch,
                    height: 23,
                    width: 23,
                  ).paddingOnly(left: 10, right: 10),
                  Text(
                    "txtSearchForProducts".tr,
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
        ),
        GestureDetector(
          onTap: () {
            Get.toNamed(AppRoutes.wishlist);
          },
          child: Image.asset(
            AppAsset.icLikeOutline1,
            height: 42,
          ).paddingOnly(right: 13),
        ),
        GestureDetector(
          onTap: () {
            Get.toNamed(AppRoutes.cart);
          },
          child: Image.asset(
            AppAsset.icCart,
            height: 42,
          ),
        ),
      ],
    ).paddingOnly(top: 40, right: 16);
  }
}

class ProductProductCategoryView extends StatelessWidget {
  const ProductProductCategoryView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ViewAll(
          title: "txtProductCategory".tr,
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(
              AppRoutes.productCategory,
            );
          },
        ).paddingOnly(bottom: 10),
        GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.productCategoryShimmer()
                : GridView.builder(
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    itemCount: (logic.getProductCategoryModel?.data?.length ?? 0) >= 6
                        ? 6
                        : logic.getProductCategoryModel?.data?.length ?? 0,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 0.8,
                      crossAxisSpacing: 10,
                    ),
                    itemBuilder: (BuildContext context, int index) {
                      return GestureDetector(
                        onTap: () {
                          Get.toNamed(
                            AppRoutes.categoryWiseProduct,
                            arguments: [
                              logic.getProductCategoryModel?.data?[index].id,
                            ],
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            color: RandomColorGenerator.getRandomColor(),
                            boxShadow: Constant.boxShadow,
                            border: Border.all(
                              color: AppColors.grey.withOpacity(0.1),
                              width: 1,
                            ),
                          ),
                          clipBehavior: Clip.hardEdge,
                          child: Column(
                            children: [
                              Expanded(
                                child: AspectRatio(
                                  aspectRatio: 1.2,
                                  child: CachedNetworkImage(
                                    imageUrl: logic.getProductCategoryModel?.data?[index].image ?? "",
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) {
                                      return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                    },
                                    errorWidget: (context, url, error) {
                                      return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                    },
                                  ),
                                ),
                              ),
                              Container(
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppColors.whiteColor,
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(14),
                                    bottomRight: Radius.circular(14),
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    logic.getProductCategoryModel?.data?[index].name ?? "",
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 12.5,
                                      color: AppColors.appText,
                                    ),
                                  ).paddingOnly(left: 7, right: 7),
                                ),
                              ),
                            ],
                          ),
                        ).paddingOnly(bottom: 8),
                      );
                    },
                  );
          },
        ),
      ],
    ).paddingOnly(left: 15, right: 15, bottom: 10);
  }
}

class ProductNewProductView extends StatelessWidget {
  const ProductNewProductView({super.key});

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
                                    Get.toNamed(
                                      AppRoutes.productDetail,
                                      arguments: [
                                        logic.getNewProductModel?.data?[index].id,
                                      ],
                                    );
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

class ProductTrendingProduct extends StatelessWidget {
  const ProductTrendingProduct({super.key});

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
                                  Get.toNamed(
                                    AppRoutes.productDetail,
                                    arguments: [
                                      logic.getTrendingProductModel?.data?[index].id,
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

/*class ProductNewProductView extends StatelessWidget {
  const ProductNewProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getNewProductModel?.data?.isEmpty == true
            ? const SizedBox()
            : Container(
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
                    logic.isLoading.value
                        ? Shimmers.newProductShimmer()
                        : GridView.builder(
                            scrollDirection: Axis.vertical,
                            physics: const ScrollPhysics(),
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount: (logic.getNewProductModel?.data?.length ?? 0) >= 3
                                ? 3
                                : logic.getNewProductModel?.data?.length ?? 0,
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
                                        Get.toNamed(
                                          AppRoutes.productDetail,
                                          arguments: [
                                            logic.getNewProductModel?.data?[index].id,
                                          ],
                                        );
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
                          ),
                  ],
                ),
              );
      },
    );
  }
}

class ProductTrendingProduct extends StatelessWidget {
  const ProductTrendingProduct({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.getTrendingProductModel?.data?.isEmpty == true
            ? const SizedBox()
            : Column(
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
                  logic.isLoading.value
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
                                      Get.toNamed(
                                        AppRoutes.productDetail,
                                        arguments: [
                                          logic.getTrendingProductModel?.data?[index].id,
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
                                              // const Spacer(),
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
                                              // const Spacer(),
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
                        ),
                ],
              ).paddingOnly(left: 15, right: 15, top: 15);
      },
    );
  }
}*/

class ProductScreenBestDealView extends StatelessWidget {
  const ProductScreenBestDealView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ViewAll(
          title: "Best Deals Offer",
          subtitle: "txtViewAll".tr,
          onTap: () {
            Get.toNamed(AppRoutes.bestDealOffer);
          },
        ).paddingOnly(top: 13),
        SizedBox(height: Get.height * 0.015),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 2,
          padding: EdgeInsets.zero,
          itemBuilder: (context, index) {
            return Container(
              height: 115,
              decoration: BoxDecoration(
                color: RandomColorGenerator.getRandomColor(),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: AppColors.grey.withOpacity(0.08),
                  width: 1,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 95,
                    width: 110,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: AppColors.whiteColor,
                    ),
                    clipBehavior: Clip.hardEdge,
                    child: Image.asset(
                      AppAsset.icArrow,
                      fit: BoxFit.cover,
                    ),
                  ),
                  SizedBox(
                    width: Get.width * 0.47,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "SESDERMA C-VIT FULL KIT FACIAL CREAM & LIPOSOMAL SERUM",
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 13,
                            color: AppColors.appText,
                          ),
                        ),
                        Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: AppColors.primaryAppColor,
                                borderRadius: BorderRadius.circular(36),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 9),
                              child: Text(
                                "\$ 120",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo800,
                                  fontSize: 12,
                                  color: AppColors.whiteColor,
                                ),
                              ),
                            ).paddingOnly(right: 12),
                            Text(
                              "\$ 400",
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo700,
                                fontSize: 12,
                                decoration: TextDecoration.lineThrough,
                                decorationColor: AppColors.greyColor2,
                                color: AppColors.currencyGrey,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Text(
                              "Validity Up To  ",
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo500,
                                fontSize: 11,
                                color: AppColors.currencyGrey,
                              ),
                            ),
                            Text(
                              "23:15:20",
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo700,
                                fontSize: 12,
                                color: AppColors.yellow,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ).paddingOnly(left: 10, bottom: 10),
                  const Spacer(),
                  Image.asset(AppAsset.icLikeOutline, height: 38),
                ],
              ).paddingOnly(left: 10, right: 10, top: 10),
            ).paddingOnly(bottom: 10);
          },
        ),
      ],
    ).paddingOnly(left: 15, right: 15);
  }
}
