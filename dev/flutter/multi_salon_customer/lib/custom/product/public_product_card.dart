import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

/// Product tile aligned with [PublicSalonCard] (square image, 0.72 grid ratio).
class PublicProductCard extends StatelessWidget {
  const PublicProductCard({
    super.key,
    required this.imageUrl,
    required this.name,
    required this.price,
    this.mrp,
    this.rating,
    this.isFavorite = false,
    this.showBestSeller = false,
    required this.onTap,
    this.onFavoriteTap,
  });

  final String imageUrl;
  final String name;
  final num price;
  final num? mrp;
  final double? rating;
  final bool isFavorite;
  final bool showBestSeller;
  final VoidCallback onTap;
  final VoidCallback? onFavoriteTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.whiteColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.grey.withOpacity(0.15)),
          boxShadow: Constant.boxShadow,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  imageUrl.trim().isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          errorWidget: (_, __, ___) => _placeholder(),
                          placeholder: (_, __) => ColoredBox(
                            color: AppColors.grey.withOpacity(0.12),
                            child: const Center(
                              child: SizedBox(
                                width: 22,
                                height: 22,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              ),
                            ),
                          ),
                        )
                      : _placeholder(),
                  if (showBestSeller)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.sellerBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'txtBestSeller'.tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo700,
                            fontSize: 9,
                            color: AppColors.sellerYellow,
                          ),
                        ),
                      ),
                    ),
                  if (onFavoriteTap != null)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: onFavoriteTap,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.whiteColor.withOpacity(0.92),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.blackColor.withOpacity(0.08),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Image.asset(
                            isFavorite
                                ? AppAsset.icLikeFilled
                                : AppAsset.icLikeOutline,
                            height: 16,
                            width: 16,
                            color: AppColors.blackColor,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 13,
                        color: AppColors.blackColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      [
                        '$currency$price',
                        if (rating != null && rating! > 0)
                          '★ ${rating!.toStringAsFixed(1)}',
                      ].join(' · '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayMedium,
                        fontSize: 11,
                        color: AppColors.iconAccent,
                      ),
                    ),
                    if (mrp != null && mrp! > price) ...[
                      const SizedBox(height: 2),
                      Text(
                        '$currency$mrp',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayRegular,
                          fontSize: 10,
                          decoration: TextDecoration.lineThrough,
                          color: AppColors.grey,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return ColoredBox(
      color: AppColors.grey.withOpacity(0.12),
      child: Center(
        child: Image.asset(
          AppAsset.icImagePlaceholder,
          width: 36,
          height: 36,
          color: AppColors.grey.withOpacity(0.5),
        ),
      ),
    );
  }
}
