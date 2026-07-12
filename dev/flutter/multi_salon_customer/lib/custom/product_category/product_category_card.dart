import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/product_screen/model/get_product_category_model.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/product_category_localization.dart';

/// Compact category chip — small icon + label (marketplace style).
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

  static const double _iconSize = 48;

  @override
  Widget build(BuildContext context) {
    final label = ProductCategoryLocalization.displayName(category.name);
    final count = category.productCount ?? 0;

    return Material(
      color: AppColors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.whiteColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.grey.withOpacity(0.1)),
            boxShadow: [
              BoxShadow(
                color: AppColors.blackColor.withOpacity(0.04),
                offset: const Offset(0, 2),
                blurRadius: 8,
              ),
            ],
          ),
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 6 : 8,
            vertical: compact ? 10 : 12,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    height: _iconSize,
                    width: _iconSize,
                    decoration: BoxDecoration(
                      color: AppColors.profileIconBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.grey.withOpacity(0.08),
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: CachedNetworkImage(
                      imageUrl: category.image ?? '',
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Center(
                        child: Image.asset(
                          AppAsset.icImagePlaceholder,
                          height: 22,
                          width: 22,
                        ),
                      ),
                      errorWidget: (context, url, error) => Center(
                        child: Image.asset(
                          AppAsset.icImagePlaceholder,
                          height: 22,
                          width: 22,
                        ),
                      ),
                    ),
                  ),
                  if (count > 0)
                    Positioned(
                      top: -4,
                      right: -4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 5,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryAppColor,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: AppColors.whiteColor,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          '$count',
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 9,
                            color: AppColors.whiteColor,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              SizedBox(height: compact ? 6 : 8),
              Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo600,
                  fontSize: compact ? 11 : 12,
                  height: 1.2,
                  color: AppColors.primaryTextColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
