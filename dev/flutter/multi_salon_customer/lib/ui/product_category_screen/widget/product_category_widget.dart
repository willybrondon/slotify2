import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class ProductCategoryAppBarView extends StatelessWidget {
  const ProductCategoryAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtProductCategory".tr,
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

class ProductCategoryItemView extends StatelessWidget {
  const ProductCategoryItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return GridView.builder(
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          itemCount: logic.getProductCategoryModel?.data?.length ?? 0,
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
                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                          },
                          errorWidget: (context, url, error) {
                            return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
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
    );
  }
}
