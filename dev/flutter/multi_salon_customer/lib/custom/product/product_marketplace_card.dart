import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

/// Clean product tile for category / search grids (white card, no random bg).
class ProductMarketplaceCard extends StatelessWidget {
  const ProductMarketplaceCard({
    super.key,
    required this.imageUrl,
    required this.name,
    required this.price,
    this.mrp,
    this.rating,
    this.sold,
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
  final int? sold;
  final bool isFavorite;
  final bool showBestSeller;
  final VoidCallback onTap;
  final VoidCallback? onFavoriteTap;

  @override
  Widget build(BuildContext context) {
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 1,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(14),
                      ),
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.profileIconBg,
                          child: Image.asset(AppAsset.icImagePlaceholder)
                              .paddingAll(28),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.profileIconBg,
                          child: Image.asset(AppAsset.icImagePlaceholder)
                              .paddingAll(28),
                        ),
                      ),
                    ),
                    if (showBestSeller)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryAppColor,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            "txtBestSeller".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo700,
                              fontSize: 9,
                              color: AppColors.whiteColor,
                            ),
                          ),
                        ),
                      ),
                    if (onFavoriteTap != null)
                      Positioned(
                        top: 6,
                        right: 6,
                        child: GestureDetector(
                          onTap: onFavoriteTap,
                          child: Container(
                            height: 30,
                            width: 30,
                            decoration: BoxDecoration(
                              color: AppColors.whiteColor.withOpacity(0.92),
                              shape: BoxShape.circle,
                              boxShadow: Constant.boxShadow,
                            ),
                            alignment: Alignment.center,
                            child: Image.asset(
                              isFavorite
                                  ? AppAsset.icLikeFilled
                                  : AppAsset.icLikeOutline,
                              height: 16,
                              width: 16,
                              color: isFavorite
                                  ? AppColors.primaryAppColor
                                  : AppColors.appText,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      Constant.capitalizeFirstLetter(name),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 13,
                        height: 1.25,
                        color: AppColors.appText,
                      ),
                    ),
                    if (rating != null || sold != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (rating != null) ...[
                            Icon(
                              Icons.star_rounded,
                              size: 13,
                              color: AppColors.yellow3,
                            ),
                            Text(
                              rating!.toStringAsFixed(1),
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo600,
                                fontSize: 11,
                                color: AppColors.ratingBlack,
                              ),
                            ),
                          ],
                          if (sold != null) ...[
                            const SizedBox(width: 4),
                            Text(
                              '| $sold ${"txtSold".tr}',
                              style: TextStyle(
                                fontFamily: AppFontFamily.heeBo500,
                                fontSize: 10.5,
                                color: AppColors.email,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          '$currency $price',
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo800,
                            fontSize: 14,
                            color: AppColors.primaryAppColor,
                          ),
                        ),
                        if (mrp != null && mrp! > price) ...[
                          const SizedBox(width: 6),
                          Text(
                            '$currency $mrp',
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo600,
                              fontSize: 11,
                              decoration: TextDecoration.lineThrough,
                              color: AppColors.currencyRed,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
