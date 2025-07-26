import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/order_detail/order_detail_title.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/product_review_screen/controller/product_review_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class ProductReviewAppBarView extends StatelessWidget {
  const ProductReviewAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtProductReview".tr,
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

class ProductReviewImageView extends StatelessWidget {
  const ProductReviewImageView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductReviewController>(
      builder: (logic) {
        return Container(
          height: 200,
          width: Get.width,
          color: AppColors.reviewBg,
          child: CachedNetworkImage(
            imageUrl: logic.mainImage ?? "",
            fit: BoxFit.cover,
            placeholder: (context, url) {
              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(30);
            },
            errorWidget: (context, url, error) {
              return Image.asset(AppAsset.icImagePlaceholder).paddingAll(30);
            },
          ),
        );
      },
    );
  }
}

class ProductReviewDataView extends StatelessWidget {
  const ProductReviewDataView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductReviewController>(
      builder: (logic) {
        return Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              Constant.capitalizeFirstLetter(logic.productName ?? ""),
              style: TextStyle(
                fontFamily: AppFontFamily.heeBo700,
                fontSize: 13,
                color: AppColors.appText,
              ),
            ).paddingOnly(top: 7, bottom: 7),
            Container(
              decoration: BoxDecoration(
                color: AppColors.orangeBg,
                borderRadius: BorderRadius.circular(6),
              ),
              padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 9),
              child: Text(
                logic.brand ?? "",
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo600,
                  fontSize: 10,
                  color: AppColors.orange,
                ),
              ),
            ),
            Image.asset(AppAsset.icLine).paddingOnly(bottom: 10, top: 10),
            OrderDetailTitle(
              title: Constant.capitalizeFirstLetter(logic.productName ?? ""),
              subTitle: "$currency${logic.itemsPurchasedTimeProductPrice ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleColor: AppColors.currencyGrey,
              titleFontSize: 15,
              subTitleColor: AppColors.blackColor1,
              subTitleFontFamily: AppFontFamily.heeBo700,
              widget: Text(
                "x${logic.productQuantity ?? ""}",
                style: TextStyle(
                  color: AppColors.blackColor,
                  fontFamily: AppFontFamily.heeBo600,
                  fontSize: 15,
                ),
              ).paddingOnly(left: 5),
            ),
            OrderDetailTitle(
              title: "txtSubTotal".tr,
              subTitle: "$currency${logic.purchasedTimeProductPrice ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleFontSize: 15,
              subTitleColor: AppColors.blackColor1,
              subTitleFontFamily: AppFontFamily.heeBo600,
            ),
            OrderDetailTitle(
              title: "txtShipping".tr,
              subTitle: "$currency${logic.purchasedTimeShippingCharges ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleFontSize: 15,
              subTitleColor: AppColors.blackColor1,
            ),
            OrderDetailTitle(
              title: "txtTotal".tr,
              subTitle: "$currency${logic.purchasedTimeTotal ?? ""}",
              titleFontFamily: AppFontFamily.heeBo600,
              titleFontSize: 20,
              subTitleColor: AppColors.blackColor1,
              subTitleFontFamily: AppFontFamily.heeBo700,
              subTitleFontSize: 20,
            ),
            Image.asset(AppAsset.icLine)
          ],
        ).paddingSymmetric(horizontal: 13, vertical: 13);
      },
    );
  }
}

class ProductReviewGiveRatingView extends StatelessWidget {
  const ProductReviewGiveRatingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        height: 48,
        width: 178,
        decoration: BoxDecoration(
          color: AppColors.yellow2,
          borderRadius: BorderRadius.circular(12),
        ),
        child: GetBuilder<ProductReviewController>(
          id: Constant.idSelectedStar,
          builder: (logic) {
            return ListView.builder(
              itemCount: 5,
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () {
                    logic.onSelectedStar(index);
                  },
                  child: Image.asset(
                    index <= logic.selectedStarIndex ? AppAsset.icStarFilled : AppAsset.icStarOutline,
                    height: 25,
                    width: 25,
                  ).paddingOnly(left: 8),
                );
              },
            );
          },
        ),
      ).paddingOnly(left: 12),
    );
  }
}

class ProductReviewGiveReviewView extends StatelessWidget {
  const ProductReviewGiveReviewView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductReviewController>(
      builder: (logic) {
        return Container(
          height: 168,
          width: Get.width,
          margin: const EdgeInsets.only(left: 12, right: 12, top: 12),
          decoration: BoxDecoration(
            color: AppColors.whiteColor,
            borderRadius: BorderRadius.circular(8),
            boxShadow: Constant.boxShadow,
            border: Border.all(
              width: 1,
              color: AppColors.grey.withOpacity(0.1),
            ),
          ),
          child: TextField(
            minLines: 1,
            maxLines: 3,
            controller: logic.reviewEditingController,
            decoration: InputDecoration(
              hintText: 'txtEnterYourReview'.tr,
              border: InputBorder.none,
              hintStyle: TextStyle(
                color: AppColors.darkGrey5,
                fontSize: 14,
                fontFamily: AppFontFamily.sfProDisplayMedium,
              ),
            ),
          ).paddingOnly(left: 10),
        );
      },
    );
  }
}

class ProductReviewButtonView extends StatelessWidget {
  const ProductReviewButtonView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ProductReviewController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return GestureDetector(
          onTap: () {
            logic.onSubmitClick();
          },
          child: Container(
            height: 52,
            margin: const EdgeInsets.symmetric(vertical: 15, horizontal: 15),
            decoration: BoxDecoration(
              color: AppColors.primaryAppColor,
              borderRadius: BorderRadius.circular(45),
            ),
            child: Center(
              child: Text(
                "txtSubmit".tr,
                style: TextStyle(
                  color: AppColors.whiteColor,
                  fontFamily: AppFontFamily.heeBo700,
                  fontSize: 17,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
