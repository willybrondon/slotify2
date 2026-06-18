import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/salon_map/salon_map_marker_data.dart';
import 'package:salon_2/custom/salon_map/salon_map_view.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/home_screen/model/public_search_salon_model.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class HomeSearchResultsSection extends StatelessWidget {
  const HomeSearchResultsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idHomeSearchResults,
      builder: (logic) {
        if (!logic.publicSearchActive && !logic.publicSearchLoading) {
          return const SizedBox.shrink();
        }

        final mapMarkers = salonMarkersFromData(
          logic.publicSearchSalons.map((s) => s.toDatum()).toList(),
        );

        return Padding(
          padding: const EdgeInsets.fromLTRB(15, 8, 15, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (logic.publicSearchLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                )
              else ...[
                if (logic.publicSearchCategoryName != null &&
                    logic.publicSearchCategoryName!.trim().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      'txtCategorySalonsTitle'
                          .tr
                          .replaceAll('__CAT__', logic.publicSearchCategoryName!),
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 17,
                        color: AppColors.blackColor,
                      ),
                    ),
                  ),
                Text(
                  logic.formatPublicSearchStats(),
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayBold,
                    fontSize: 15,
                    color: AppColors.blackColor,
                  ),
                ),
                if (logic.publicSearchCity != null &&
                    logic.publicSearchCity!.trim().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      'txtSearchInCityTpl'
                          .tr
                          .replaceAll('__CITY__', logic.publicSearchCity!),
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayRegular,
                        fontSize: 13,
                        color: AppColors.grey,
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                _Toolbar(logic: logic),
                if (logic.showPublicSearchFilters) ...[
                  const SizedBox(height: 10),
                  _FilterPanel(logic: logic),
                ],
                const SizedBox(height: 12),
                if (logic.publicSearchMapView) ...[
                  SizedBox(
                    height: 280,
                    child: SalonMapView(
                      markers: mapMarkers,
                      userLatitude: latitude,
                      userLongitude: longitude,
                      onSalonTap: (m) => _openSalon(m.id),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                if (logic.publicSearchSalons.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: Center(
                      child: Text(
                        'desNoDataFoundSearch'.tr,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 15,
                          color: AppColors.grey,
                        ),
                      ),
                    ),
                  )
                else
                  _SalonGrid(salons: logic.publicSearchSalons),
              ],
            ],
          ),
        );
      },
    );
  }

  void _openSalon(String id) {
    Get.toNamed(AppRoutes.branchDetail, arguments: [
      id,
      city,
      latitude,
      longitude,
    ]);
  }
}

class _Toolbar extends StatelessWidget {
  const _Toolbar({required this.logic});

  final HomeScreenController logic;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        OutlinedButton.icon(
          onPressed: logic.togglePublicSearchFilters,
          icon: const Icon(Icons.tune, size: 18),
          label: Text('txtFilter'.tr),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.blackColor,
            side: BorderSide(color: AppColors.grey.withOpacity(0.35)),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            textStyle: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayMedium,
              fontSize: 13,
            ),
          ),
        ),
        const Spacer(),
        _ViewToggle(
          label: 'txtViewList'.tr,
          active: !logic.publicSearchMapView,
          onTap: () => logic.setPublicSearchMapView(false),
        ),
        const SizedBox(width: 6),
        _ViewToggle(
          label: 'txtViewMap'.tr,
          active: logic.publicSearchMapView,
          onTap: () => logic.setPublicSearchMapView(true),
        ),
      ],
    );
  }
}

class _ViewToggle extends StatelessWidget {
  const _ViewToggle({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.blackColor : AppColors.whiteColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active
                ? AppColors.blackColor
                : AppColors.grey.withOpacity(0.35),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayMedium,
            fontSize: 12,
            color: active ? AppColors.whiteColor : AppColors.blackColor,
          ),
        ),
      ),
    );
  }
}

class _FilterPanel extends StatelessWidget {
  const _FilterPanel({required this.logic});

  final HomeScreenController logic;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.grey.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'txtFilterRating'.tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              fontSize: 11,
              color: AppColors.grey,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _FilterChip(
                label: 'txtFilterAll'.tr,
                active: logic.publicSearchMinRating == 0,
                onTap: () => logic.setPublicSearchMinRating(0),
              ),
              _FilterChip(
                label: '4+ ★',
                active: logic.publicSearchMinRating == 4,
                onTap: () => logic.setPublicSearchMinRating(4),
              ),
              _FilterChip(
                label: '4.5+ ★',
                active: logic.publicSearchMinRating == 4.5,
                onTap: () => logic.setPublicSearchMinRating(4.5),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'txtFilterSort'.tr,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayBold,
              fontSize: 11,
              color: AppColors.grey,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _FilterChip(
                label: 'txtSortDistance'.tr,
                active: logic.publicSearchSort == 'distance',
                onTap: () => logic.setPublicSearchSort('distance'),
              ),
              _FilterChip(
                label: 'txtSortRating'.tr,
                active: logic.publicSearchSort == 'rating',
                onTap: () => logic.setPublicSearchSort('rating'),
              ),
              _FilterChip(
                label: 'txtSortReviews'.tr,
                active: logic.publicSearchSort == 'reviews',
                onTap: () => logic.setPublicSearchSort('reviews'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: active ? AppColors.primaryAppColor : AppColors.whiteColor,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: active
                ? AppColors.primaryAppColor
                : AppColors.grey.withOpacity(0.35),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayMedium,
            fontSize: 12,
            color: active ? AppColors.whiteColor : AppColors.blackColor,
          ),
        ),
      ),
    );
  }
}

class _SalonGrid extends StatelessWidget {
  const _SalonGrid({required this.salons});

  final List<PublicSearchSalon> salons;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemCount: salons.length,
      itemBuilder: (context, index) {
        return _SalonCard(salon: salons[index]);
      },
    );
  }
}

class _SalonCard extends StatelessWidget {
  const _SalonCard({required this.salon});

  final PublicSearchSalon salon;

  @override
  Widget build(BuildContext context) {
    final priceLabel = 'txtPriceFrom'.tr;
    const currency = '€';

    return InkWell(
      onTap: () {
        Get.toNamed(AppRoutes.branchDetail, arguments: [
          salon.id,
          city,
          latitude,
          longitude,
        ]);
      },
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
              child: salon.mainImage != null && salon.mainImage!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: salon.mainImage!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorWidget: (_, __, ___) => _placeholder(),
                      placeholder: (_, __) => ColoredBox(
                        color: AppColors.grey.withOpacity(0.12),
                        child: const Center(
                          child: SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                      ),
                    )
                  : _placeholder(),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      salon.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 13,
                        color: AppColors.blackColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (salon.minPrice != null || salon.review > 0)
                      Text(
                        [
                          if (salon.minPrice != null)
                            '$priceLabel $currency${salon.minPrice}',
                          if (salon.review > 0)
                            '★ ${salon.review.toStringAsFixed(1)} (${salon.reviewCount})',
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 11,
                          color: AppColors.iconAccent,
                        ),
                      ),
                    if (salon.address != null && salon.address!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        salon.address!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayRegular,
                          fontSize: 11,
                          color: AppColors.grey,
                          height: 1.3,
                        ),
                      ),
                    ],
                    if (salon.distance != null) ...[
                      const Spacer(),
                      Text(
                        '${salon.distance!.toStringAsFixed(1)} ${'txtKMs'.tr}',
                        style: TextStyle(
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                          fontSize: 11,
                          color: AppColors.primaryAppColor,
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
          AppAsset.icServicePlaceholder,
          width: 40,
          height: 40,
          color: AppColors.grey.withOpacity(0.5),
        ),
      ),
    );
  }
}
