import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/random_color_generator/random_color_generator.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class BestDealOfferAppBarView extends StatelessWidget {
  const BestDealOfferAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "Best Deal Offers",
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

class BestDealOfferItemView extends StatelessWidget {
  const BestDealOfferItemView({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: 8,
      padding: EdgeInsets.zero,
      itemBuilder: (context, index) {
        return Container(
          height: 115,
          decoration: BoxDecoration(
            color: RandomColorGenerator.getRandomColor(),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: AppColors.grey.withOpacity(0.08),
              width: 1,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 95,
                width: 110,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: AppColors.whiteColor,
                ),
                clipBehavior: Clip.hardEdge,
                child: Image.asset(
                  AppAsset.icArrow,
                  fit: BoxFit.cover,
                ),
              ),
              SizedBox(
                width: Get.width * 0.47,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "SESDERMA C-VIT FULL KIT FACIAL CREAM & LIPOSOMAL SERUM",
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 13,
                        color: AppColors.appText,
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.primaryAppColor,
                            borderRadius: BorderRadius.circular(36),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 9),
                          child: Text(
                            "\$ 120",
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo800,
                              fontSize: 12,
                              color: AppColors.whiteColor,
                            ),
                          ),
                        ).paddingOnly(right: 12),
                        Text(
                          "\$ 400",
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 12,
                            decoration: TextDecoration.lineThrough,
                            decorationColor: AppColors.greyColor2,
                            color: AppColors.currencyGrey,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Text(
                          "Validity Up To  ",
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo500,
                            fontSize: 11,
                            color: AppColors.currencyGrey,
                          ),
                        ),
                        Text(
                          "23:15:20",
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 12,
                            color: AppColors.yellow,
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ).paddingOnly(left: 10, bottom: 10),
              const Spacer(),
              Image.asset(AppAsset.icLikeOutline, height: 38),
            ],
          ).paddingOnly(left: 10, right: 10, top: 10),
        ).paddingOnly(bottom: 10);
      },
    );
  }
}
