// ignore_for_file: must_be_immutable

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/search_product_screen/controller/search_product_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class SearchProductScreen extends StatelessWidget {
  const SearchProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    SearchProductController searchProductController = Get.find<SearchProductController>();

    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtSearchProduct".tr,
          method: InkWell(
            overlayColor: WidgetStatePropertyAll(AppColors.transparent),
            onTap: () async {
              searchProductController.searchEditingController.clear();
              Get.back();
            },
            child: Icon(
              Icons.arrow_back,
              color: AppColors.whiteColor,
            ),
          ),
        ),
      ),
      body: GetBuilder<SearchProductController>(
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
                  hintText: "txtSearchForProduct".tr,
                  obscureText: false,
                  textInputAction: TextInputAction.done,
                  controller: logic.searchEditingController,
                  onEditingComplete: () async {
                    FocusScopeNode currentFocus = FocusScope.of(context);
                    if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                      currentFocus.focusedChild?.unfocus();
                    }
                  },
                  onChanged: (text) {
                    logic.printLatestValue(text?.trim().toString());
                    return null;
                  },
                ),
              ),
              logic.getSearchProductModel?.data?.isEmpty == true
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
                                      "desNoDataFoundSearch".tr,
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
                  : GetBuilder<SearchProductController>(
                      id: Constant.idProgressView,
                      builder: (logic) {
                        return SizedBox(
                          height: Get.height,
                          width: Get.width,
                          child: GridView.builder(
                            scrollDirection: Axis.vertical,
                            physics: const ScrollPhysics(),
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount: (logic.getSearchProductModel?.data?.length ?? 0) >= 6
                                ? 6
                                : logic.getSearchProductModel?.data?.length ?? 0,
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3,
                              childAspectRatio: 0.64,
                              crossAxisSpacing: 8,
                            ),
                            itemBuilder: (BuildContext context, int index) {
                              return AnimationConfiguration.staggeredGrid(
                                position: index,
                                duration: const Duration(milliseconds: 650),
                                columnCount: (logic.getSearchProductModel?.data?.length ?? 0) >= 6
                                    ? 6
                                    : logic.getSearchProductModel?.data?.length ?? 0,
                                child: FadeInAnimation(
                                  child: ScaleAnimation(
                                    child: InkWell(
                                      onTap: () {
                                        Get.toNamed(
                                          AppRoutes.productDetail,
                                          arguments: [
                                            logic.getSearchProductModel?.data?[index].id,
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
                                                CachedNetworkImage(
                                                  imageUrl: logic.getSearchProductModel?.data?[index].mainImage ?? "",
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
                                                Align(
                                                  alignment: Alignment.centerLeft,
                                                  child: Text(
                                                    Constant.capitalizeFirstLetter(
                                                        logic.getSearchProductModel?.data?[index].productName ?? ""),
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: TextStyle(
                                                      fontFamily: AppFontFamily.heeBo700,
                                                      fontSize: 12,
                                                      color: AppColors.appText,
                                                    ),
                                                  ).paddingOnly(left: 7, right: 5),
                                                ),
                                                const Spacer(),
                                                Row(
                                                  children: [
                                                    Image.asset(AppAsset.icRedStar, height: 12, color: AppColors.yellow3),
                                                    Text(
                                                      "${logic.getSearchProductModel?.data?[index].rating?.toStringAsFixed(1) ?? ""} | ${logic.getSearchProductModel?.data?[index].sold ?? ""} Sold",
                                                      style: TextStyle(
                                                        fontFamily: AppFontFamily.heeBo700,
                                                        fontSize: 12,
                                                        color: AppColors.ratingBlack,
                                                      ),
                                                    ).paddingOnly(left: 4),
                                                  ],
                                                ).paddingOnly(left: 7, right: 7),
                                                const Spacer(),
                                                Row(
                                                  children: [
                                                    Text(
                                                      "$currency ${logic.getSearchProductModel?.data?[index].price ?? ""}",
                                                      style: TextStyle(
                                                        fontFamily: AppFontFamily.heeBo800,
                                                        fontSize: 12,
                                                        color: AppColors.primaryAppColor,
                                                      ),
                                                    ).paddingOnly(right: 7),
                                                    logic.getSearchProductModel?.data?[index].mrp == null
                                                        ? Container()
                                                        : Text(
                                                            "$currency ${logic.getSearchProductModel?.data?[index].mrp ?? ""}",
                                                            style: TextStyle(
                                                              fontFamily: AppFontFamily.heeBo700,
                                                              fontSize: 12,
                                                              decoration: TextDecoration.lineThrough,
                                                              decorationColor: AppColors.currencyRed,
                                                              color: AppColors.currencyRed,
                                                              decorationThickness: 1.5,
                                                            ),
                                                          ),
                                                  ],
                                                ).paddingOnly(left: 10, right: 7),
                                                const Spacer(),
                                              ],
                                            ),
                                            logic.getSearchProductModel?.data?[index].isBestSeller == true
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
                                            // Positioned(
                                            //   right: 8,
                                            //   top: 8,
                                            //   child: GestureDetector(
                                            //     onTap: () {
                                            //       logic.onTrendingProductSaved(
                                            //         userId: Constant.storage.read<String>('userId') ?? "",
                                            //         categoryId: logic.getTrendingProductModel?.data?[index].category ?? "",
                                            //         productId: logic.getTrendingProductModel?.data?[index].id ?? "",
                                            //       );
                                            //     },
                                            //     child: logic.isTrendingProductSaved[index] == true
                                            //         ? Image.asset(AppAsset.icLikeFilled, height: 30)
                                            //         : Image.asset(AppAsset.icLikeOutline, height: 30),
                                            //   ),
                                            // ),
                                          ],
                                        ),
                                      ).paddingOnly(bottom: 10),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ).paddingOnly(top: 80, bottom: 10, left: 10, right: 10),
                        );
                      },
                    )
            ],
          );
        },
      ),
    );
  }
}
