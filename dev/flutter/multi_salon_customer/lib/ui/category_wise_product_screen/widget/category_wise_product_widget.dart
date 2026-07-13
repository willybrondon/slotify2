import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/product/public_product_card.dart';
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
        if (logic.isLoading.value) {
          return Shimmers.trendingProductShimmer().paddingAll(12);
        }

        final products = logic.getCategoryWiseProductModel?.data ?? [];

        if (products.isEmpty) {
          return Center(
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
                ),
              ],
            ),
          );
        }

        return ListView(
          padding: EdgeInsets.fromLTRB(
            15,
            12,
            15,
            24 + MediaQuery.of(context).padding.bottom,
          ),
          children: [
            _CategoryProductHead(
              categoryName: logic.displayCategoryName,
              categoryImage: logic.categoryImage,
              productCount: products.length,
            ),
            const SizedBox(height: 12),
            AnimationLimiter(
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: products.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.72,
                ),
                itemBuilder: (context, index) {
                  final item = products[index];
                  return AnimationConfiguration.staggeredGrid(
                    position: index,
                    duration: const Duration(milliseconds: 450),
                    columnCount: 2,
                    child: FadeInAnimation(
                      child: ScaleAnimation(
                        child: PublicProductCard(
                          imageUrl: item.mainImage ?? '',
                          name: item.productName ?? '',
                          price: item.price ?? 0,
                          mrp: item.mrp,
                          rating: item.rating?.toDouble(),
                          isFavorite:
                              logic.isCategoryWiseProductSaved[index] == true,
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
            ),
          ],
        );
      },
    );
  }
}

class _CategoryProductHead extends StatelessWidget {
  const _CategoryProductHead({
    required this.categoryName,
    this.categoryImage,
    required this.productCount,
  });

  final String categoryName;
  final String? categoryImage;
  final int productCount;

  @override
  Widget build(BuildContext context) {
    final hasImage =
        categoryImage != null && categoryImage!.trim().isNotEmpty;
    final title = 'txtCategoryProductsTitle'
        .tr
        .replaceAll('__CAT__', categoryName);
    final lead = 'txtCategoryProductsLead'
        .tr
        .replaceAll('__CAT__', categoryName)
        .replaceAll('__COUNT__', productCount.toString());

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasImage)
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey.withOpacity(0.2)),
              color: AppColors.brandGrayLight,
            ),
            clipBehavior: Clip.antiAlias,
            child: CachedNetworkImage(
              imageUrl: categoryImage!,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => _CategoryImageFallback(
                label: categoryName,
              ),
            ),
          ),
        if (hasImage) const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  fontSize: 18,
                  height: 1.25,
                  color: AppColors.blackColor,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                lead,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayRegular,
                  fontSize: 14,
                  height: 1.45,
                  color: AppColors.grey,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CategoryImageFallback extends StatelessWidget {
  const _CategoryImageFallback({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final initial =
        label.trim().isNotEmpty ? label.trim()[0].toUpperCase() : '?';
    return ColoredBox(
      color: AppColors.brandGrayLight,
      child: Center(
        child: Text(
          initial,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayBold,
            fontSize: 24,
            color: AppColors.grey,
          ),
        ),
      ),
    );
  }
}
