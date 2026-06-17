import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/salon_map/salon_map_marker_data.dart';
import 'package:salon_2/custom/salon_map/salon_map_view.dart';
import 'package:salon_2/custom/salon_map/salon_view_mode_toggle.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/home_screen/model/get_all_salon_model.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class BranchScreenSalonView extends StatefulWidget {
  const BranchScreenSalonView({super.key});

  @override
  State<BranchScreenSalonView> createState() => _BranchScreenSalonViewState();
}

class _BranchScreenSalonViewState extends State<BranchScreenSalonView> {
  bool _mapView = false;

  @override
  void initState() {
    super.initState();
    final args = Get.arguments;
    if (args is Map && args['openMap'] == true) {
      _mapView = true;
    }
  }

  void _openSalon(Datum salon) {
    Get.toNamed(
      AppRoutes.branchDetail,
      arguments: [salon.id, city, latitude, longitude],
    );
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        if (logic.isLoading.value) {
          return Shimmers.nearByBranchesWithLocationShimmer();
        }

        final salons = logic.getAllSalonCategory?.data ?? [];
        if (salons.isEmpty) {
          return Align(
            alignment: Alignment.center,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(AppAsset.icNoService, height: 150, width: 150),
                Text(
                  "txtNotSalon".tr,
                  style: TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayMedium,
                    fontSize: 17,
                    color: AppColors.primaryTextColor,
                  ),
                ),
              ],
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SalonViewModeToggle(
              isMapView: _mapView,
              onChanged: (map) => setState(() => _mapView = map),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  await logic.onGetAllSalonApiCall(
                    latitude: latitude ?? 0.0,
                    longitude: longitude ?? 0.0,
                    userId: Constant.storage.read<String>('userId') ?? "",
                  );
                },
                color: AppColors.primaryAppColor,
                child: _mapView
                    ? Padding(
                        padding: const EdgeInsets.fromLTRB(15, 4, 15, 15),
                        child: SalonMapView(
                          markers: salonMarkersFromData(salons),
                          userLatitude: latitude,
                          userLongitude: longitude,
                          onSalonTap: (m) => _openSalon(m.salon),
                        ),
                      )
                    : ListView.builder(
                        itemCount: salons.length,
                        physics: const AlwaysScrollableScrollPhysics(
                          parent: BouncingScrollPhysics(),
                        ),
                        itemBuilder: (context, index) {
                          return _SalonListCard(
                            logic: logic,
                            index: index,
                            salon: salons[index],
                            onTap: () => _openSalon(salons[index]),
                          );
                        },
                      ).paddingAll(15),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _SalonListCard extends StatelessWidget {
  const _SalonListCard({
    required this.logic,
    required this.index,
    required this.salon,
    required this.onTap,
  });

  final HomeScreenController logic;
  final int index;
  final Datum salon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: Get.width * 0.93,
        padding: const EdgeInsets.all(10),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: AppColors.whiteColor,
          borderRadius: BorderRadius.circular(19),
          border: Border.all(color: AppColors.textFiledBg, width: 1),
        ),
        child: Column(
          children: [
            Stack(
              children: [
                Container(
                  height: Get.height * 0.22,
                  width: Get.width * 0.93,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    color: AppColors.grey.withOpacity(0.2),
                  ),
                  clipBehavior: Clip.hardEdge,
                  child: CachedNetworkImage(
                    imageUrl: salon.mainImage ?? "",
                    fit: BoxFit.cover,
                    errorWidget: (context, url, error) {
                      return Image.asset(AppAsset.icImagePlaceholder)
                          .paddingAll(25);
                    },
                    placeholder: (context, url) {
                      return Image.asset(AppAsset.icImagePlaceholder)
                          .paddingAll(25);
                    },
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    logic.onLikeSalon(
                      userId: Constant.storage.read<String>('userId') ?? "",
                      salonId: salon.id ?? "",
                      latitude: latitude.toString(),
                      longitude: longitude.toString(),
                    );
                  },
                  child: Align(
                    alignment: Alignment.topRight,
                    child: logic.isSalonSaved[index] == true
                        ? Image.asset(AppAsset.icLikeFilled, height: 32)
                            .paddingOnly(right: 7, top: 7)
                        : Image.asset(AppAsset.icLikeOutline, height: 32)
                            .paddingOnly(right: 7, top: 7),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Text(
                  salon.name ?? "",
                  style: TextStyle(
                    color: AppColors.appText,
                    fontFamily: AppFontFamily.heeBo800,
                    fontSize: 15.5,
                  ),
                ),
                const Spacer(),
                Container(
                  height: 30,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(17),
                    color: AppColors.yellow1,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 13),
                  margin: const EdgeInsets.only(left: 5),
                  child: Row(
                    children: [
                      Image.asset(
                        AppAsset.icStarFilled,
                        height: 15,
                        width: 15,
                        color: AppColors.yellow3,
                      ).paddingOnly(right: 5),
                      Text(
                        salon.review?.toStringAsFixed(1) ?? "",
                        style: TextStyle(
                          color: AppColors.yellow3,
                          fontFamily: AppFontFamily.sfProDisplayBold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ).paddingOnly(top: 10, left: 3, right: 3),
            Row(
              children: [
                Image.asset(AppAsset.icLocation, height: 20, width: 20)
                    .paddingOnly(right: 8),
                SizedBox(
                  width: Get.width * 0.798,
                  child: Text(
                    "${salon.addressDetails?.addressLine1}, ${salon.addressDetails?.landMark}, ${salon.addressDetails?.city}, ${salon.addressDetails?.country}",
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: AppColors.termsDialog,
                      fontFamily: AppFontFamily.heeBo600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ).paddingOnly(bottom: 8),
            Row(
              children: [
                Image.asset(AppAsset.icDirection, height: 20, width: 20)
                    .paddingOnly(right: 8),
                RichText(
                  text: TextSpan(
                    text: salon.distance == null
                        ? ""
                        : "${salon.distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.appText,
                      fontFamily: AppFontFamily.heeBo600,
                    ),
                    children: <TextSpan>[
                      TextSpan(
                        text: "txtFromLocation".tr,
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: AppFontFamily.heeBo600,
                          color: AppColors.termsDialog,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Container(
                  height: 25,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    color: AppColors.greenColorBg,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  margin: const EdgeInsets.only(left: 5),
                  child: Center(
                    child: Text(
                      "Open",
                      style: TextStyle(
                        color: AppColors.greenColor,
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
