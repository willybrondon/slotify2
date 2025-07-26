import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/category_wise_product_screen/controller/category_wise_product_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class CategoryWiseProductAppBarView extends StatelessWidget {
  const CategoryWiseProductAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtProducts".tr,
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

class CategoryWiseProductItemView extends StatelessWidget {
  const CategoryWiseProductItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<CategoryWiseProductController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading.value
            ? Shimmers.trendingProductShimmer()
            : logic.getCategoryWiseProductModel?.data?.isEmpty == true
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
                          "desNoDataCategoryProduct".tr,
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
                    itemCount: logic.getCategoryWiseProductModel?.data?.length ?? 0,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 8,
                    ),
                    itemBuilder: (BuildContext context, int index) {
                      return AnimationConfiguration.staggeredGrid(
                        position: index,
                        duration: const Duration(milliseconds: 650),
                        columnCount: logic.getCategoryWiseProductModel?.data?.length ?? 0,
                        child: FadeInAnimation(
                          child: ScaleAnimation(
                            child: InkWell(
                              onTap: () {
                                Get.toNamed(
                                  AppRoutes.productDetail,
                                  arguments: [
                                    logic.getCategoryWiseProductModel?.data?[index].id,
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
                                          imageUrl: logic.getCategoryWiseProductModel?.data?[index].mainImage ?? "",
                                          height: 85,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(30);
                                          },
                                        ),
                                        const Spacer(),
                                        const Spacer(),
                                        Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(
                                            Constant.capitalizeFirstLetter(
                                                logic.getCategoryWiseProductModel?.data?[index].productName ?? ""),
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
                                              "${logic.getCategoryWiseProductModel?.data?[index].rating?.toStringAsFixed(1) ?? ""} | ${logic.getCategoryWiseProductModel?.data?[index].sold ?? ""} Sold",
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
                                              "$currency ${logic.getCategoryWiseProductModel?.data?[index].price ?? ""}",
                                              style: TextStyle(
                                                fontFamily: AppFontFamily.heeBo800,
                                                fontSize: 14,
                                                color: AppColors.primaryAppColor,
                                              ),
                                            ).paddingOnly(right: 7),
                                            logic.getCategoryWiseProductModel?.data?[index].mrp == null
                                                ? Container()
                                                : Text(
                                                    "$currency ${logic.getCategoryWiseProductModel?.data?[index].mrp ?? ""}",
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
                                    logic.getCategoryWiseProductModel?.data?[index].isBestSeller == true
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
                                          logic.onCategoryWiseProductSaved(
                                            userId: Constant.storage.read<String>('userId') ?? "",
                                            categoryId: logic.categoryId ?? "",
                                            productId: logic.getCategoryWiseProductModel?.data?[index].id ?? "",
                                          );
                                        },
                                        child: logic.isCategoryWiseProductSaved[index] == true
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
    );
  }
}
