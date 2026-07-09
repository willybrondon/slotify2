import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/product_category/product_category_card.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';

class ProductCategoryAppBarView extends StatelessWidget {
  const ProductCategoryAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtProductCategory".tr,
      method: AppBarCustom.backButton(),
    );
  }
}

class ProductCategoryItemView extends StatelessWidget {
  const ProductCategoryItemView({super.key});

  void _openCategory(HomeScreenController logic, int index) {
    final category = logic.getProductCategoryModel?.data?[index];
    if (category?.id == null) return;

    Get.toNamed(
      AppRoutes.categoryWiseProduct,
      arguments: [
        category!.id,
        category.name,
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        final categories = logic.getProductCategoryModel?.data ?? [];
        final isLoading = logic.isLoading.value;

        if (isLoading) {
          return Shimmers.productCategoryShimmer();
        }

        if (categories.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(AppAsset.icNoService, height: 140, width: 140),
                const SizedBox(height: 16),
                Text(
                  "desNoProductCategory".tr,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayMedium,
                    fontSize: 16,
                    color: AppColors.primaryTextColor,
                  ),
                ),
              ],
            ),
          );
        }

        return CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 18),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primaryAppColor.withOpacity(0.12),
                      AppColors.whiteColor,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.grey.withOpacity(0.12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "txtProductCategoryLead".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo800,
                        fontSize: 18,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      "txtProductCategorySubtitle".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo400,
                        fontSize: 13.5,
                        height: 1.35,
                        color: AppColors.email,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.82,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final category = categories[index];
                  return ProductCategoryCard(
                    category: category,
                    onTap: () => _openCategory(logic, index),
                  );
                },
                childCount: categories.length,
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
          ],
        );
      },
    );
  }
}
