import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/ui/category_salons_discover/controller/category_salons_controller.dart';
import 'package:salon_2/ui/home_screen/widget/home_search_results_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class CategorySalonsScreen extends StatelessWidget {
  const CategorySalonsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<CategorySalonsController>(
      id: Constant.idCategorySalons,
      builder: (logic) {
        return Scaffold(
          backgroundColor: AppColors.backGround,
          appBar: AppBar(
            automaticallyImplyLeading: false,
            flexibleSpace: AppBarCustom(
              title: logic.categoryName.isNotEmpty
                  ? logic.categoryName
                  : 'txtCategory'.tr,
              method: InkWell(
                overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                onTap: Get.back,
                child: Icon(Icons.arrow_back, color: AppColors.blackColor),
              ),
            ),
          ),
          body: RefreshIndicator(
            color: AppColors.primaryAppColor,
            onRefresh: logic.loadSalons,
            child: ListView(
              padding: EdgeInsets.fromLTRB(
                15,
                12,
                15,
                24 + MediaQuery.of(context).padding.bottom,
              ),
              children: [
                _CategoryDiscoverHead(
                  categoryName: logic.categoryName,
                  categoryImage: logic.categoryImage,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: logic.searchController,
                  onSubmitted: (_) => logic.loadSalons(),
                  decoration: InputDecoration(
                    hintText: 'txtIntentSearchSalonHint'.tr,
                    prefixIcon: Icon(Icons.search, color: AppColors.iconAccent),
                    filled: true,
                    fillColor: AppColors.whiteColor,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.grey.withOpacity(0.25),
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.grey.withOpacity(0.25),
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                PublicSalonBrowseView(
                  loading: logic.loading,
                  salons: logic.salons,
                  statsLabel: logic.formatStats(),
                  searchCity: logic.searchCity,
                  mapView: logic.mapView,
                  showFilters: logic.showFilters,
                  minRating: logic.minRating,
                  sort: logic.sort,
                  onToggleFilters: logic.toggleFilters,
                  onMapViewChanged: logic.setMapView,
                  onMinRatingChanged: logic.setMinRating,
                  onSortChanged: logic.setSort,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _CategoryDiscoverHead extends StatelessWidget {
  const _CategoryDiscoverHead({
    required this.categoryName,
    this.categoryImage,
  });

  final String categoryName;
  final String? categoryImage;

  @override
  Widget build(BuildContext context) {
    final hasImage = categoryImage != null && categoryImage!.trim().isNotEmpty;
    final title = 'txtCategorySalonsTitle'
        .tr
        .replaceAll('__CAT__', categoryName);
    final lead = 'txtCategorySalonsLead'
        .tr
        .replaceAll('__CAT__', categoryName);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasImage)
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey.withOpacity(0.2)),
              color: AppColors.brandGrayLight,
            ),
            clipBehavior: Clip.antiAlias,
            child: CachedNetworkImage(
              imageUrl: categoryImage!,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => _CategoryImageFallback(
                label: categoryName,
              ),
            ),
          ),
        if (hasImage) const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayBold,
                  fontSize: 18,
                  height: 1.25,
                  color: AppColors.blackColor,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                lead,
                style: TextStyle(
                  fontFamily: AppFontFamily.sfProDisplayRegular,
                  fontSize: 14,
                  height: 1.45,
                  color: AppColors.grey,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CategoryImageFallback extends StatelessWidget {
  const _CategoryImageFallback({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final initial =
        label.trim().isNotEmpty ? label.trim()[0].toUpperCase() : '?';
    return ColoredBox(
      color: AppColors.brandGrayLight,
      child: Center(
        child: Text(
          initial,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplayBold,
            fontSize: 24,
            color: AppColors.grey,
          ),
        ),
      ),
    );
  }
}
