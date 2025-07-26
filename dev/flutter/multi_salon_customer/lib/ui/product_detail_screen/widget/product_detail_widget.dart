import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/ui/product_detail_screen/controller/product_detail_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class ProviderDetailAppBarView extends StatelessWidget {
  const ProviderDetailAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GetBuilder<ProductDetailController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Container(
              height: Get.height * 0.35,
              width: Get.width,
              decoration: BoxDecoration(
                color: AppColors.currencyGrey.withOpacity(0.5),
              ),
              child: CachedNetworkImage(
                imageUrl: logic.getProductDetailModel?.product?.mainImage ?? "",
                fit: BoxFit.cover,
                placeholder: (context, url) {
                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                },
                errorWidget: (context, url, error) {
                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                },
              ),
            );
          },
        ),
        GestureDetector(
          onTap: () {
            Get.back();
          },
          child: Image.asset(
            AppAsset.icBack,
            height: 35,
          ).paddingOnly(top: 30, left: 15),
        ),
        Align(
          alignment: Alignment.topRight,
          child: GetBuilder<ProductDetailController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return logic.getProductDetailModel?.product?.isFavourite == true
                  ? Image.asset(
                      AppAsset.icLikeFilled,
                      height: 35,
                    ).paddingOnly(top: 30, right: 15)
                  : Image.asset(
                      AppAsset.icLikeOutline,
                      height: 35,
                    ).paddingOnly(top: 30, right: 15);
            },
          ),
        ),
      ],
    );
  }
}

class ProductDetailWidget extends StatelessWidget {
  const ProductDetailWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      child: Column(
        children: [
          ProductDetailNameView(),
          ProductDetailSelectSizeView(),
          ProductDetailProductQuantityView(),
          ProductDetailDescriptionView(),
          ProductDetailRatingView(),
          ProductDetailPopularProductView(),
        ],
      ),
    );
  }
}

class ProductDetailNameView extends StatelessWidget {
  const ProductDetailNameView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        logic.rating = logic.getProductDetailModel?.product?.rating ?? 0.0;
        logic.roundedRating = logic.rating?.round();
        logic.filledStars = logic.roundedRating?.clamp(0, 5);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              Constant.capitalizeFirstLetter(logic.getProductDetailModel?.product?.productName ?? ""),
              style: TextStyle(
                fontFamily: AppFontFamily.heeBo700,
                fontSize: 19,
                color: AppColors.appText,
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: AppColors.orangeBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.orange.withOpacity(0.04), width: 1),
              ),
              padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 9),
              child: Text(
                logic.getProductDetailModel?.product?.brand?.toUpperCase() ?? "",
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo600,
                  fontSize: 14,
                  color: AppColors.orange,
                ),
              ),
            ).paddingOnly(top: 7, bottom: 10),
            Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryAppColor,
                    borderRadius: BorderRadius.circular(36),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 10),
                  child: Text(
                    "$currency ${logic.getProductDetailModel?.product?.price ?? ""}",
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo800,
                      fontSize: 14,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ),
                Text(
                  "$currency ${logic.getProductDetailModel?.product?.mrp ?? ""}",
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo700,
                    fontSize: 14,
                    decoration: TextDecoration.lineThrough,
                    decorationColor: AppColors.currencyGrey,
                    decorationThickness: 1.5,
                    color: AppColors.currencyGrey,
                  ),
                ).paddingOnly(right: 8, left: 13),
                Text(
                  "( ${"txtIncludeAllTax".tr} )",
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo500,
                    fontSize: 12.5,
                    color: AppColors.primaryTextColor,
                  ),
                ),
              ],
            ),
            Row(
              children: [
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
                const SizedBox(width: 8),
                Text(
                  "(${logic.getProductDetailModel?.product?.rating?.toStringAsFixed(1) ?? " "} Ratings)",
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo600,
                    fontSize: 14,
                    color: AppColors.appText,
                  ),
                ),
              ],
            ).paddingOnly(top: 10),
            Divider(color: AppColors.grey.withOpacity(0.2)).paddingOnly(top: 10, bottom: 10),
          ],
        ).paddingOnly(left: 15, right: 15, top: 15);
      },
    );
  }
}

class ProductDetailSelectSizeView extends StatelessWidget {
  const ProductDetailSelectSizeView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductDetailController>(
      id: Constant.idSelectProductSize,
      builder: (logic) {
        return Wrap(
          children: logic.getProductDetailModel?.product?.attributes?.map(
                (attributes) {
                  if (attributes.name?.isNotEmpty == true) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ViewAll(
                          title: "Select Product ${attributes.name!.capitalizeFirst.toString()}",
                          subtitle: "",
                          fontSize: 14,
                          fontFamily: AppFontFamily.heeBo700,
                          textColor: AppColors.appText,
                          onTap: () {},
                        ),
                        Wrap(
                          children: attributes.value!.map(
                            (value) {
                              return FilterChip(
                                padding: const EdgeInsets.symmetric(vertical: 3, horizontal: 4),
                                onSelected: (selected) {
                                  logic.onAttributeSelect(value, attributes.name.toString(), attributes.id.toString());

                                  log("Selected :: $selected Value :: $value Attribute Name :: ${attributes.name} Attribute Id :: ${attributes.id}");
                                  log("Selected Values By Type :: ${logic.selectedValuesByName}");
                                },
                                backgroundColor: logic.selectedValuesByName.containsKey(attributes.name) &&
                                        logic.selectedValuesByName[attributes.name]!.contains(value)
                                    ? AppColors.primaryAppColor
                                    : AppColors.whiteColor,
                                side: BorderSide(
                                  width: 0,
                                  color: logic.selectedValuesByName.containsKey(attributes.name) &&
                                          logic.selectedValuesByName[attributes.name]!.contains(value)
                                      ? AppColors.primaryAppColor
                                      : AppColors.whiteColor,
                                ),
                                label: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                  child: Text(
                                    value,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 13,
                                      color: logic.selectedValuesByName.containsKey(attributes.name) &&
                                              logic.selectedValuesByName[attributes.name]!.contains(value)
                                          ? AppColors.whiteColor
                                          : AppColors.greyText,
                                    ),
                                  ),
                                ),
                              ).paddingOnly(right: 7);
                            },
                          ).toList(),
                        ),
                      ],
                    ).paddingOnly(bottom: 10);
                  } else {
                    return const SizedBox();
                  }
                },
              ).toList() ??
              [],
        ).paddingOnly(left: 15, right: 15);
      },
    );
  }
}

class ProductDetailProductQuantityView extends StatelessWidget {
  const ProductDetailProductQuantityView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ViewAll(
          title: "txtProductQuantity".tr,
          subtitle: "",
          textColor: AppColors.appText,
          fontSize: 14,
          fontFamily: AppFontFamily.heeBo700,
          onTap: () {},
        ),
        GetBuilder<ProductDetailController>(
          id: Constant.idIncrementQuantity,
          builder: (logic) {
            return Container(
              height: 48,
              width: 125,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
                border: Border.all(
                  color: AppColors.grey.withOpacity(0.1),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () {
                      logic.decrementQuantity();
                    },
                    child: Container(
                      height: 35,
                      width: 35,
                      decoration: BoxDecoration(
                        color: AppColors.primaryAppColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Image.asset(AppAsset.icMinus).paddingAll(5.5),
                    ),
                  ),
                  Text(
                    '${logic.quantity}',
                    style: TextStyle(
                      fontSize: 17,
                      fontFamily: AppFontFamily.heeBo500,
                      color: AppColors.greyText,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      logic.incrementQuantity();
                    },
                    child: Container(
                      height: 35,
                      width: 35,
                      decoration: BoxDecoration(
                        color: AppColors.primaryAppColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Image.asset(AppAsset.icPlus).paddingAll(5.5),
                    ),
                  ),
                ],
              ).paddingOnly(left: 5, right: 5),
            ).paddingOnly(top: 10);
          },
        ),
      ],
    ).paddingOnly(left: 15, right: 15);
  }
}

class ProductDetailDescriptionView extends StatelessWidget {
  const ProductDetailDescriptionView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ViewAll(
              title: "txtDescription".tr,
              subtitle: "",
              textColor: AppColors.appText,
              fontSize: 14,
              fontFamily: AppFontFamily.heeBo700,
              onTap: () {},
            ),
            Text(
              logic.getProductDetailModel?.product?.description ?? "",
              style: TextStyle(
                fontSize: 12,
                fontFamily: AppFontFamily.heeBo400,
                color: AppColors.descriptionText,
              ),
            ),
          ],
        ).paddingOnly(left: 15, right: 15, top: 15);
      },
    );
  }
}

class ProductDetailRatingView extends StatelessWidget {
  const ProductDetailRatingView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ViewAll(
              title: "txtProductReview".tr,
              subtitle: "",
              textColor: AppColors.appText,
              fontSize: 14,
              fontFamily: AppFontFamily.heeBo700,
              onTap: () {},
            ).paddingOnly(left: 15),
            Container(
              color: AppColors.productBg,
              padding: const EdgeInsets.only(top: 5, bottom: 5),
              child: logic.getProductDetailModel?.reviews?.isEmpty == true
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
                            "desNoReviewFound".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              fontSize: 17,
                              color: AppColors.primaryTextColor,
                            ),
                          )
                        ],
                      ).paddingOnly(top: 15, bottom: 15),
                    )
                  : Row(
                      children: [
                        Container(
                          height: 28,
                          width: 28,
                          decoration: BoxDecoration(color: AppColors.brandColor, shape: BoxShape.circle),
                          child: CachedNetworkImage(
                            imageUrl: logic.getProductDetailModel?.reviews?.first.userId?.image ?? "",
                            fit: BoxFit.cover,
                            placeholder: (context, url) {
                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(2);
                            },
                            errorWidget: (context, url, error) {
                              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(2);
                            },
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "${logic.getProductDetailModel?.reviews?.first.userId?.fname.toString() ?? " "} ${logic.getProductDetailModel?.reviews?.first.userId?.lname.toString() ?? ""}",
                              style: TextStyle(
                                fontSize: 12.5,
                                fontFamily: AppFontFamily.heeBo500,
                                color: AppColors.textSlot,
                              ),
                            ).paddingOnly(left: 7, right: 15),
                            SizedBox(
                              width: Get.width * 0.75,
                              child: Text(
                                Constant.capitalizeFirstLetter(
                                    logic.getProductDetailModel?.reviews?.first.review.toString() ?? ""),
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontFamily: AppFontFamily.heeBo400,
                                  color: AppColors.descriptionText,
                                ),
                              ).paddingOnly(left: 7, right: 15),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Image.asset(AppAsset.icRedStar, height: 10, color: AppColors.yellow3),
                        Text(
                          logic.getProductDetailModel?.reviews?.first.rating?.toStringAsFixed(1) ?? "",
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 10,
                            color: AppColors.primaryAppColor,
                          ),
                        ).paddingOnly(left: 2, top: 2),
                      ],
                    ).paddingOnly(left: 15, right: 15),
            ).paddingOnly(top: 7),
          ],
        ).paddingOnly(top: 15);
      },
    );
  }
}

class ProductDetailPopularProductView extends StatelessWidget {
  const ProductDetailPopularProductView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ViewAll(
              title: "txtOurMostPopularProduct".tr,
              subtitle: "",
              textColor: AppColors.appText,
              fontSize: 14,
              fontFamily: AppFontFamily.heeBo700,
              onTap: () {},
            ).paddingOnly(bottom: 10),
            GridView.builder(
              scrollDirection: Axis.vertical,
              physics: const ScrollPhysics(),
              padding: EdgeInsets.zero,
              shrinkWrap: true,
              itemCount: logic.getProductDetailModel?.popularProducts?.length ?? 0,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 0.75,
                crossAxisSpacing: 10,
              ),
              itemBuilder: (BuildContext context, int index) {
                return GestureDetector(
                  onTap: () {
                    logic.onGetProductDetailApiCall(
                      userId: Constant.storage.read<String>('userId') ?? "",
                      productId: logic.getProductDetailModel?.popularProducts?[index].id ?? "",
                    );
                  },
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
                            CachedNetworkImage(
                              imageUrl: logic.getProductDetailModel?.popularProducts?[index].mainImage ?? "",
                              fit: BoxFit.cover,
                              height: 85,
                              placeholder: (context, url) {
                                return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                              },
                              errorWidget: (context, url, error) {
                                return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                              },
                            ),
                            const Spacer(),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                Constant.capitalizeFirstLetter(
                                    logic.getProductDetailModel?.popularProducts?[index].productName ?? ""),
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
                                  "$currency ${logic.getProductDetailModel?.popularProducts?[index].price}",
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.heeBo800,
                                    fontSize: 14,
                                    color: AppColors.primaryAppColor,
                                  ),
                                ).paddingOnly(right: 7),
                                Text(
                                  "$currency ${logic.getProductDetailModel?.popularProducts?[index].mrp}",
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
                            ).paddingOnly(left: 12, right: 12, bottom: 12),
                          ],
                        ),
                        logic.getProductDetailModel?.popularProducts?[index].isFavorite == true
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
                          right: 10,
                          top: 6,
                          child: Row(
                            children: [
                              Image.asset(AppAsset.icRedStar, height: 10, color: AppColors.yellow3),
                              Text(
                                logic.getProductDetailModel?.popularProducts?[index].rating?.toStringAsFixed(1) ?? "",
                                style: TextStyle(
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 10,
                                  color: AppColors.primaryAppColor,
                                ),
                              ).paddingOnly(left: 2, top: 2),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).paddingOnly(bottom: 10),
                );
              },
            ),
          ],
        ).paddingOnly(top: 15, left: 15, right: 15);
      },
    );
  }
}

class ProductDetailBottomView extends StatelessWidget {
  const ProductDetailBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 90,
      width: Get.width,
      decoration: BoxDecoration(
        color: AppColors.productBg,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(25),
          topRight: Radius.circular(25),
        ),
        border: Border.all(
          color: AppColors.grey.withOpacity(0.15),
          width: 1,
        ),
      ),
      padding: const EdgeInsets.only(left: 18, right: 18, top: 17, bottom: 17),
      child: GetBuilder<ProductDetailController>(
        id: Constant.idSelectProductSize,
        builder: (logic) {
          return Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    logic.addCartModel?.status == true
                        ? Get.toNamed(AppRoutes.cart)?.then(
                            (value) {
                              logic.onBackFromCart();
                            },
                          )
                        : logic.onAddCartClick();
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(44),
                      color: logic.isAnyAttributeSelected() ? AppColors.primaryAppColor : AppColors.grey.withOpacity(0.4),
                    ),
                    child: Center(
                      child: Text(
                        logic.addCartModel?.status == true ? "txtGoToCart".tr : "txtAddToCart".tr,
                        style: TextStyle(
                          color: logic.isAnyAttributeSelected() ? AppColors.whiteColor : AppColors.grey,
                          fontFamily: AppFontFamily.heeBo700,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    logic.onContinueClick();
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(44),
                      color: logic.isAnyAttributeSelected() ? AppColors.primaryAppColor : AppColors.grey.withOpacity(0.4),
                    ),
                    child: Center(
                      child: Text(
                        "txtContinue".tr,
                        style: TextStyle(
                          color: logic.isAnyAttributeSelected() ? AppColors.whiteColor : AppColors.grey,
                          fontFamily: AppFontFamily.heeBo700,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
