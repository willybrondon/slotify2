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
        if (logic.publicSearchCategoryId != null) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.fromLTRB(15, 0, 15, 8),
          child: PublicSalonBrowseView(
            loading: logic.publicSearchLoading,
            salons: logic.publicSearchSalons,
            statsLabel: logic.formatPublicSearchStats(),
            searchCity: logic.publicSearchCity,
            mapView: logic.publicSearchMapView,
            showFilters: logic.showPublicSearchFilters,
            minRating: logic.publicSearchMinRating,
            sort: logic.publicSearchSort,
            onToggleFilters: logic.togglePublicSearchFilters,
            onMapViewChanged: logic.setPublicSearchMapView,
            onMinRatingChanged: logic.setPublicSearchMinRating,
            onSortChanged: logic.setPublicSearchSort,
          ),
        );
      },
    );
  }
}

class PublicSalonBrowseView extends StatelessWidget {
  const PublicSalonBrowseView({
    super.key,
    required this.loading,
    required this.salons,
    required this.statsLabel,
    required this.mapView,
    required this.showFilters,
    required this.minRating,
    required this.sort,
    required this.onToggleFilters,
    required this.onMapViewChanged,
    required this.onMinRatingChanged,
    required this.onSortChanged,
    this.searchCity,
  });

  final bool loading;
  final List<PublicSearchSalon> salons;
  final String statsLabel;
  final String? searchCity;
  final bool mapView;
  final bool showFilters;
  final double minRating;
  final String sort;
  final VoidCallback onToggleFilters;
  final ValueChanged<bool> onMapViewChanged;
  final ValueChanged<double> onMinRatingChanged;
  final ValueChanged<String> onSortChanged;

  @override
  Widget build(BuildContext context) {
    final mapMarkers = salonMarkersFromData(
      salons.map((s) => s.toDatum()).toList(),
    );

    if (loading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          statsLabel,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayBold,
            fontSize: 15,
            color: AppColors.blackColor,
          ),
        ),
        if (searchCity != null && searchCity!.trim().isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              'txtSearchInCityTpl'.tr.replaceAll('__CITY__', searchCity!),
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayRegular,
                fontSize: 13,
                color: AppColors.grey,
              ),
            ),
          ),
        const SizedBox(height: 12),
        PublicSalonToolbar(
          mapView: mapView,
          onToggleFilters: onToggleFilters,
          onMapViewChanged: onMapViewChanged,
        ),
        if (showFilters) ...[
          const SizedBox(height: 10),
          PublicSalonFilterPanel(
            minRating: minRating,
            sort: sort,
            onMinRatingChanged: onMinRatingChanged,
            onSortChanged: onSortChanged,
          ),
        ],
        const SizedBox(height: 12),
        if (mapView) ...[
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
        if (salons.isEmpty)
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
          PublicSalonGrid(salons: salons),
      ],
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

class PublicSalonToolbar extends StatelessWidget {
  const PublicSalonToolbar({
    super.key,
    required this.mapView,
    required this.onToggleFilters,
    required this.onMapViewChanged,
  });

  final bool mapView;
  final VoidCallback onToggleFilters;
  final ValueChanged<bool> onMapViewChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        OutlinedButton.icon(
          onPressed: onToggleFilters,
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
        PublicSalonViewToggle(
          label: 'txtViewList'.tr,
          active: !mapView,
          onTap: () => onMapViewChanged(false),
        ),
        const SizedBox(width: 6),
        PublicSalonViewToggle(
          label: 'txtViewMap'.tr,
          active: mapView,
          onTap: () => onMapViewChanged(true),
        ),
      ],
    );
  }
}

class PublicSalonViewToggle extends StatelessWidget {
  const PublicSalonViewToggle({
    super.key,
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

class PublicSalonFilterPanel extends StatelessWidget {
  const PublicSalonFilterPanel({
    super.key,
    required this.minRating,
    required this.sort,
    required this.onMinRatingChanged,
    required this.onSortChanged,
  });

  final double minRating;
  final String sort;
  final ValueChanged<double> onMinRatingChanged;
  final ValueChanged<String> onSortChanged;

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
              PublicSalonFilterChip(
                label: 'txtFilterAll'.tr,
                active: minRating == 0,
                onTap: () => onMinRatingChanged(0),
              ),
              PublicSalonFilterChip(
                label: '4+ ★',
                active: minRating == 4,
                onTap: () => onMinRatingChanged(4),
              ),
              PublicSalonFilterChip(
                label: '4.5+ ★',
                active: minRating == 4.5,
                onTap: () => onMinRatingChanged(4.5),
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
              PublicSalonFilterChip(
                label: 'txtSortDistance'.tr,
                active: sort == 'distance',
                onTap: () => onSortChanged('distance'),
              ),
              PublicSalonFilterChip(
                label: 'txtSortRating'.tr,
                active: sort == 'rating',
                onTap: () => onSortChanged('rating'),
              ),
              PublicSalonFilterChip(
                label: 'txtSortReviews'.tr,
                active: sort == 'reviews',
                onTap: () => onSortChanged('reviews'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PublicSalonFilterChip extends StatelessWidget {
  const PublicSalonFilterChip({
    super.key,
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

class PublicSalonGrid extends StatelessWidget {
  const PublicSalonGrid({super.key, required this.salons});

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
        return PublicSalonCard(salon: salons[index]);
      },
    );
  }
}

class PublicSalonCard extends StatelessWidget {
  const PublicSalonCard({super.key, required this.salon});

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
