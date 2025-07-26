import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class BranchScreenSalonView extends StatelessWidget {
  const BranchScreenSalonView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return RefreshIndicator(
          onRefresh: () async {
            return await logic.onGetAllSalonApiCall(
              latitude: latitude ?? 0.0,
              longitude: longitude ?? 0.0,
              userId: Constant.storage.read<String>('userId') ?? "",
            );
          },
          color: AppColors.primaryAppColor,
          child: logic.isLoading.value
              ? Shimmers.nearByBranchesWithLocationShimmer()
              : logic.getAllSalonCategory?.data?.isEmpty == true
                  ? Align(
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset(
                            AppAsset.icNoService,
                            height: 150,
                            width: 150,
                          ),
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
                    )
                  : ListView.builder(
                      itemCount: logic.getAllSalonCategory?.data?.length,
                      physics: const BouncingScrollPhysics(),
                      scrollDirection: Axis.vertical,
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: () {
                            Get.toNamed(
                              AppRoutes.branchDetail,
                              arguments: [
                                logic.getAllSalonCategory?.data?[index].id,
                              ],
                            );
                          },
                          child: Container(
                            width: Get.width * 0.93,
                            padding: const EdgeInsets.all(10),
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: AppColors.whiteColor,
                              borderRadius: BorderRadius.circular(19),
                              border: Border.all(
                                color: AppColors.textFiledBg,
                                width: 1,
                              ),
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
                                        imageUrl: logic.getAllSalonCategory?.data?[index].mainImage ?? "",
                                        fit: BoxFit.cover,
                                        errorWidget: (context, url, error) {
                                          return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                        },
                                        placeholder: (context, url) {
                                          return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                        },
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () {
                                        logic.onLikeSalon(
                                          userId: Constant.storage.read<String>('userId') ?? "",
                                          salonId: logic.getAllSalonCategory?.data?[index].id ?? "",
                                          latitude: latitude.toString(),
                                          longitude: longitude.toString(),
                                        );
                                      },
                                      child: Align(
                                        alignment: Alignment.topRight,
                                        child: logic.isSalonSaved[index] == true
                                            ? Image.asset(
                                                AppAsset.icLikeFilled,
                                                height: 32,
                                              ).paddingOnly(right: 7, top: 7)
                                            : Image.asset(
                                                AppAsset.icLikeOutline,
                                                height: 32,
                                              ).paddingOnly(right: 7, top: 7),
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    Text(
                                      logic.getAllSalonCategory?.data?[index].name ?? "",
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
                                            logic.getAllSalonCategory?.data?[index].review?.toStringAsFixed(1) ?? "",
                                            style: TextStyle(
                                              color: AppColors.yellow3,
                                              fontFamily: AppFontFamily.sfProDisplayBold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    )
                                  ],
                                ).paddingOnly(top: 10, left: 3, right: 3),
                                Row(
                                  children: [
                                    Image.asset(
                                      AppAsset.icLocation,
                                      height: 20,
                                      width: 20,
                                    ).paddingOnly(right: 8),
                                    SizedBox(
                                      width: Get.width * 0.798,
                                      child: Text(
                                        "${logic.getAllSalonCategory?.data?[index].addressDetails?.addressLine1}, ${logic.getAllSalonCategory?.data?[index].addressDetails?.landMark}, ${logic.getAllSalonCategory?.data?[index].addressDetails?.city}, ${logic.getAllSalonCategory?.data?[index].addressDetails?.country}",
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
                                    Image.asset(
                                      AppAsset.icDirection,
                                      height: 20,
                                      width: 20,
                                    ).paddingOnly(right: 8),
                                    RichText(
                                      text: TextSpan(
                                        text: logic.getAllSalonCategory?.data?[index].distance == null
                                            ? ""
                                            : "${logic.getAllSalonCategory?.data?[index].distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
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
                      },
                    ).paddingAll(15),
        );
      },
    );
  }
}
