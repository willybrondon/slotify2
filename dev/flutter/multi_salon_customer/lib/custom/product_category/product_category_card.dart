import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/product_screen/model/get_product_category_model.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/product_category_localization.dart';

class ProductCategoryCard extends StatelessWidget {
  const ProductCategoryCard({
    super.key,
    required this.category,
    required this.onTap,
    this.compact = false,
  });

  final Datum category;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final label = ProductCategoryLocalization.displayName(category.name);
    final count = category.productCount ?? 0;

    return Material(
      color: AppColors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.whiteColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.grey.withOpacity(0.12)),
            boxShadow: Constant.boxShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CachedNetworkImage(
                        imageUrl: category.image ?? '',
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.profileIconBg,
                          child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(22),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.profileIconBg,
                          child: Image.asset(AppAsset.icImagePlaceholder).paddingAll(22),
                        ),
                      ),
                      if (count > 0)
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.blackColor.withOpacity(0.72),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'txtProductCountShort'.trParams({'count': '$count'}),
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo700,
                                fontSize: 10.5,
                                color: AppColors.whiteColor,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.fromLTRB(10, compact ? 8 : 10, 10, compact ? 10 : 12),
                child: Text(
                  label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo700,
                    fontSize: compact ? 12 : 13.5,
                    height: 1.2,
                    color: AppColors.primaryTextColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
