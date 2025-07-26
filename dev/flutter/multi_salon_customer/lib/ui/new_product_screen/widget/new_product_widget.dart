import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class NewProductAppBarView extends StatelessWidget {
  const NewProductAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtNewProducts".tr,
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

class NewProductItemView extends StatelessWidget {
  const NewProductItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return GridView.builder(
          scrollDirection: Axis.vertical,
          physics: const ScrollPhysics(),
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          itemCount: logic.getNewProductModel?.data?.length ?? 0,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 0.75,
            crossAxisSpacing: 10,
          ),
          itemBuilder: (BuildContext context, int index) {
            return AnimationConfiguration.staggeredGrid(
              position: index,
              duration: const Duration(milliseconds: 700),
              columnCount: logic.getNewProductModel?.data?.length ?? 0,
              child: FadeInAnimation(
                child: ScaleAnimation(
                  child: GestureDetector(
                    onTap: () {
                      Get.toNamed(
                        AppRoutes.productDetail,
                        arguments: [
                          logic.getNewProductModel?.data?[index].id,
                        ],
                      );
                    },
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
