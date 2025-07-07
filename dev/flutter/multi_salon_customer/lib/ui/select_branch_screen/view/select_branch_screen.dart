import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class SelectBranchScreen extends StatelessWidget {
  SelectBranchScreen({super.key});

  final SelectBranchController selectBranchController = Get.put(SelectBranchController());

  @override
  Widget build(BuildContext context) {
    selectBranchController.getDataFromArgs();

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtSelectSalon".tr,
          method: InkWell(
            overlayColor: WidgetStatePropertyAll(AppColors.transparent),
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back,
              color: AppColors.whiteColor,
            ),
          ),
        ),
      ),
      body: GetBuilder<HomeScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return RefreshIndicator(
            onRefresh: () => logic.onGetServiceBasedSalonApiCall(
              serviceId: logic.serviceId.join(","),
              latitude: latitude ?? 0.0,
              longitude: longitude ?? 0.0,
            ),
            backgroundColor: AppColors.primaryAppColor,
            child: logic.isLoading.value
                ? Shimmers.nearByBranchesWithLocationShimmer()
                : logic.getServiceBaseSalonCategory?.data?.isEmpty == true
                    ? Align(
                        alignment: Alignment.center,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset(
                              AppAsset.icNoService,
                              height: 150,
                              width: 150,
                            ).paddingOnly(bottom: 15),
                            Text(
                              "txtNotSalon".tr,
                              style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayMedium,
                                fontSize: 17,
                                color: AppColors.primaryTextColor,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: logic.getServiceBaseSalonCategory?.data?.length,
                        physics: const BouncingScrollPhysics(),
                        scrollDirection: Axis.vertical,
                        itemBuilder: (context, index) {
                          return GestureDetector(
                            onTap: () {
                              Get.toNamed(AppRoutes.booking, arguments: [
                                selectBranchController.checkItem,
                                selectBranchController.totalPrice,
                                selectBranchController.finalTaxRupee,
                                selectBranchController.totalMinute,
                                selectBranchController.serviceId,
                                selectBranchController.withOutTaxRupee,
                                logic.getServiceBaseSalonCategory?.data?[index].id,
                              ]);
                            },
                            child: Container(
                              width: Get.width * 0.93,
                              padding: const EdgeInsets.all(5),
                              margin: const EdgeInsets.only(bottom: 10),
                              decoration: BoxDecoration(
                                color: AppColors.whiteColor,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: AppColors.textFiledBg,
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                children: [
                                  Container(
                                    height: Get.height * 0.22,
                                    width: Get.width * 0.93,
                                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(10)),
                                    clipBehavior: Clip.hardEdge,
                                    child: CachedNetworkImage(
                                      imageUrl: "${logic.getServiceBaseSalonCategory?.data?[index].image}",
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) {
                                        return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                      },
                                      errorWidget: (context, url, error) {
                                        return Image.asset(AppAsset.icImagePlaceholder).paddingAll(25);
                                      },
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      Text(
                                        logic.getServiceBaseSalonCategory?.data?[index].name ?? "",
                                        style: TextStyle(
                                          color: AppColors.primaryTextColor,
                                          fontFamily: FontFamily.sfProDisplayBold,
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
                                              logic.getServiceBaseSalonCategory?.data?[index].rating?.toStringAsFixed(1) ?? "",
                                              style: TextStyle(
                                                color: AppColors.yellow3,
                                                fontFamily: FontFamily.sfProDisplayBold,
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
                                          "${logic.getServiceBaseSalonCategory?.data?[index].addressDetails?.addressLine1} ${logic.getServiceBaseSalonCategory?.data?[index].addressDetails?.landMark} ${logic.getServiceBaseSalonCategory?.data?[index].addressDetails?.city} ${logic.getServiceBaseSalonCategory?.data?[index].addressDetails?.state}, ${logic.getServiceBaseSalonCategory?.data?[index].addressDetails?.country}",
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            color: AppColors.locationText,
                                            fontFamily: FontFamily.sfProDisplay,
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
                                          text: logic.getServiceBaseSalonCategory?.data?[index].distance == null
                                              ? ""
                                              : "${logic.getServiceBaseSalonCategory?.data?[index].distance?.toStringAsFixed(2)} ${"txtKMs".tr}  ",
                                          style: TextStyle(
                                            color: AppColors.locationText,
                                            fontSize: 13,
                                            fontFamily: FontFamily.sfProDisplayBold,
                                          ),
                                          children: <TextSpan>[
                                            TextSpan(
                                              text: 'txtFromLocation'.tr,
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontFamily: FontFamily.sfProDisplayMedium,
                                                color: AppColors.locationText,
                                              ),
                                            ),
                                          ],
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
      ),
    );
  }
}
