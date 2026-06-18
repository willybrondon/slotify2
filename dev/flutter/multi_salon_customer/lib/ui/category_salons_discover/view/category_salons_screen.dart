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
              title: logic.categoryName,
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
                if (logic.categoryImage != null &&
                    logic.categoryImage!.trim().isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: CachedNetworkImage(
                        imageUrl: logic.categoryImage!,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const SizedBox.shrink(),
                      ),
                    ),
                  ),
                if (logic.categoryImage != null &&
                    logic.categoryImage!.trim().isNotEmpty)
                  const SizedBox(height: 12),
                Text(
                  'txtCategorySalonsTitle'
                      .tr
                      .replaceAll('__CAT__', logic.categoryName),
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayBold,
                    fontSize: 20,
                    color: AppColors.blackColor,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: logic.searchController,
                  onChanged: logic.onSearchChanged,
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
