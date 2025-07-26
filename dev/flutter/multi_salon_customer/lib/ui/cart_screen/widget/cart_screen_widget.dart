import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/cart_screen/controller/cart_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class CartAppBarView extends StatelessWidget {
  const CartAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtMyCart".tr,
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

class CartItemView extends StatelessWidget {
  const CartItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<CartScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? Shimmers.cartProductShimmer()
            : logic.getCartProductModel?.data?.items?.isEmpty == true || logic.getCartProductModel?.data == null
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
                          "desNoDataCart".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                            fontSize: 17,
                            color: AppColors.primaryTextColor,
                          ),
                        )
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: logic.getCartProductModel?.data?.items?.length ?? 0,
                    itemBuilder: (context, index) {
                      return Container(
                        height: 145,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(14),
                          color: AppColors.whiteColor,
                          border: Border.all(
                            color: AppColors.grey.withOpacity(0.15),
                            width: 1,
                          ),
                          boxShadow: Constant.boxShadow,
                        ),
                        padding: const EdgeInsets.all(13),
                        child: Row(
                          children: [
                            Column(
                              children: [
                                Container(
                                  height: 72,
                                  width: 72,
                                  color: AppColors.grey.withOpacity(0.04),
                                  child: CachedNetworkImage(
                                    imageUrl: logic.getCartProductModel?.data?.items?[index].product?.mainImage ?? "",
                                    height: 60,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) {
                                      return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                    },
                                    errorWidget: (context, url, error) {
                                      return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                    },
                                  ),
                                ),
                                GetBuilder<CartScreenController>(
                                  id: Constant.idIncrementQuantity,
                                  builder: (logic) {
                                    return Container(
                                      height: 35,
                                      width: 105,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(7),
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
                                          InkWell(
                                            onTap: () {
                                              logic.decrementQuantity(index);
                                            },
                                            overlayColor: WidgetStateColor.transparent,
                                            child: SizedBox(
                                              height: 20,
                                              child: Image.asset(
                                                AppAsset.icMinus,
                                                color: AppColors.quantityGrey,
                                              ).paddingAll(2.5),
                                            ),
                                          ),
                                          Text(
                                            '${logic.quantityList[index]}',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontFamily: AppFontFamily.heeBo500,
                                              color: AppColors.appText,
                                            ),
                                          ),
                                          InkWell(
                                            onTap: () {
                                              logic.incrementQuantity(index);
                                            },
                                            overlayColor: WidgetStateColor.transparent,
                                            child: SizedBox(
                                              height: 20,
                                              child: Image.asset(
                                                AppAsset.icPlus,
                                                color: AppColors.quantityGrey,
                                              ).paddingAll(2.5),
                                            ),
                                          ),
                                        ],
                                      ).paddingOnly(left: 7, right: 7),
                                    ).paddingOnly(top: 10);
                                  },
                                ),
                              ],
                            ),
                            SizedBox(
                              width: Get.width * 0.51,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    Constant.capitalizeFirstLetter(
                                        logic.getCartProductModel?.data?.items?[index].product?.productName ?? ""),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.heeBo700,
                                      fontSize: 15,
                                      color: AppColors.appText,
                                    ),
                                  ),
                                  Wrap(
                                    children: logic.getCartProductModel?.data?.items?[index].attributesArray?.map(
                                          (attributes) {
                                            if (attributes.value?.isNotEmpty == true) {
                                              return Row(
                                                children: [
                                                  Text(
                                                    "${attributes.name ?? " "}: ",
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily.heeBo600,
                                                      fontSize: 12,
                                                      color: AppColors.currencyGrey,
                                                    ),
                                                  ),
                                                  Text(
                                                    attributes.value ?? "",
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily.heeBo600,
                                                      fontSize: 12,
                                                      color: AppColors.appText,
                                                    ),
                                                  ),
                                                ],
                                              );
                                            } else {
                                              return const SizedBox();
                                            }
                                          },
                                        ).toList() ??
                                        [],
                                  ).paddingOnly(right: 13).paddingOnly(top: 8),
                                  const Spacer(),
                                  Row(
                                    children: [
                                      Text(
                                        "$currency ${logic.getCartProductModel?.data?.items?[index].purchasedTimeProductPrice}",
                                        style: TextStyle(
                                          fontFamily: AppFontFamily.heeBo800,
                                          fontSize: 16,
                                          color: AppColors.primaryAppColor,
                                        ),
                                      ),
                                    ],
                                  ).paddingOnly(bottom: 5),
                                ],
                              ),
                            ).paddingOnly(left: 10),
                            const Spacer(),
                            GestureDetector(
                              onTap: () {
                                logic.onDeleteProduct(
                                  userId: Constant.storage.read<String>('userId') ?? "",
                                  productId: logic.getCartProductModel?.data?.items?[index].product?.id ?? "",
                                  productQuantity: logic.quantityList[index].toString(),
                                  attributesArray: logic.attributes?[index] ?? [],
                                );
                              },
                              child: Image.asset(
                                AppAsset.icDelete,
                                height: 27,
                              ),
                            )
                          ],
                        ),
                      ).paddingOnly(left: 13, right: 13, top: 13);
                    },
                  ).paddingOnly(bottom: 10);
      },
    );
  }
}

class CartBottomView extends StatelessWidget {
  const CartBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<CartScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? const SizedBox()
            : logic.getCartProductModel?.data?.items?.isEmpty == true || logic.getCartProductModel?.data == null
                ? const SizedBox()
                : Container(
                    height: 156,
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "txtProductPriceDetails".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo800,
                            fontSize: 16,
                            color: AppColors.appText,
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "txtTotalAmount".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo500,
                                fontSize: 16,
                                color: AppColors.amountGrey,
                              ),
                            ),
                            Text(
                              "$currency ${logic.getCartProductModel?.data?.total?.toStringAsFixed(1)}",
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo800,
                                fontSize: 17,
                                color: AppColors.appText,
                              ),
                            ),
                          ],
                        ).paddingOnly(top: 8, bottom: 10),
                        GestureDetector(
                          onTap: () {
                            Get.toNamed(
                              AppRoutes.selectAddress,
                              arguments: [
                                logic.getCartProductModel?.data?.total?.toStringAsFixed(1),
                                "",
                                0,
                                logic.attributes,
                                false,
                              ],
                            );
                          },
                          child: Container(
                            height: 52,
                            width: Get.width,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(44),
                              color: AppColors.primaryAppColor,
                            ),
                            child: Center(
                              child: Text(
                                "txtNext".tr,
                                style: TextStyle(
                                  color: AppColors.whiteColor,
                                  fontFamily: AppFontFamily.heeBo700,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
      },
    );
  }
}
