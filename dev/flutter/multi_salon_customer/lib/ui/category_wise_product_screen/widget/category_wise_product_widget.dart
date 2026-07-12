import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/product/product_marketplace_card.dart';
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
    return GetBuilder<CategoryWiseProductController>(
      builder: (logic) {
        return AppBarCustom(
          title: logic.displayCategoryName.isNotEmpty
              ? logic.displayCategoryName
              : "txtProducts".tr,
          method: AppBarCustom.backButton(),
        );
      },
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
                : AnimationLimiter(
                    child: GridView.builder(
                      scrollDirection: Axis.vertical,
                      physics: const ScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      shrinkWrap: true,
                      itemCount:
                          logic.getCategoryWiseProductModel?.data?.length ?? 0,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.62,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                      ),
                      itemBuilder: (BuildContext context, int index) {
                        final item =
                            logic.getCategoryWiseProductModel!.data![index];
                        return AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 450),
                          columnCount: 2,
                          child: FadeInAnimation(
                            child: ScaleAnimation(
                              child: ProductMarketplaceCard(
                                imageUrl: item.mainImage ?? '',
                                name: item.productName ?? '',
                                price: item.price ?? 0,
                                mrp: item.mrp,
                                rating: item.rating?.toDouble(),
                                sold: item.sold?.toInt(),
                                isFavorite:
                                    logic.isCategoryWiseProductSaved[index] ==
                                        true,
                                showBestSeller: item.isBestSeller == true,
                                onTap: () {
                                  Get.toNamed(
                                    AppRoutes.productDetail,
                                    arguments: [item.id],
                                  );
                                },
                                onFavoriteTap: () {
                                  logic.onCategoryWiseProductSaved(
                                    userId: Constant.storage
                                            .read<String>('userId') ??
                                        '',
                                    categoryId: logic.categoryId ?? '',
                                    productId: item.id ?? '',
                                  );
                                },
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  );
      },
    );
  }
}
