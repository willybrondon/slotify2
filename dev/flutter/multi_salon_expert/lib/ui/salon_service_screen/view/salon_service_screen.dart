import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/salon_service_screen/controller/salon_service_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class SalonServiceScreen extends StatelessWidget {
  SalonServiceScreen({super.key});

  SalonServiceController salonServiceController = Get.find<SalonServiceController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtOtherInfo".tr,
          method: InkWell(
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
      body: SingleChildScrollView(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "txtSalonDetails".tr,
                style: TextStyle(
                  fontSize: 18,
                  fontFamily: FontFamily.sfProDisplayBold,
                  color: AppColors.primaryTextColor,
                ),
              ).paddingOnly(left: 12, top: 5),
            ),
            GetBuilder<LoginScreenController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return Container(
                  width: Get.width,
                  decoration: BoxDecoration(
                    color: AppColors.whiteColor,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.greyColor.withOpacity(0.15),
                      width: 1,
                    ),
                  ),
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            logic.getExpertCategory?.data?.salonId?.name ?? "",
                            style: TextStyle(
                              color: AppColors.primaryTextColor,
                              fontFamily: FontFamily.sfProDisplayBold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ).paddingOnly(bottom: 10),
                      Row(
                        children: [
                          Image.asset(
                            AppAsset.icLocation,
                            height: 20,
                            width: 20,
                          ).paddingOnly(right: 8),
                          SizedBox(
                            width: Get.width * 0.8,
                            child: Text(
                              "${logic.getExpertCategory?.data?.salonId?.addressDetails?.addressLine1}, ${logic.getExpertCategory?.data?.salonId?.addressDetails?.landMark}, ${logic.getExpertCategory?.data?.salonId?.addressDetails?.city}, ${logic.getExpertCategory?.data?.salonId?.addressDetails?.state}, ${logic.getExpertCategory?.data?.salonId?.addressDetails?.country}",
                              style: TextStyle(
                                color: AppColors.locationText,
                                fontFamily: FontFamily.sfProDisplay,
                                fontSize: 14.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ).paddingOnly(left: 13, right: 13, top: 8, bottom: 10);
              },
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "txtServicesDetails".tr,
                style: TextStyle(
                  fontSize: 18,
                  fontFamily: FontFamily.sfProDisplayBold,
                  color: AppColors.primaryTextColor,
                ),
              ).paddingOnly(left: 12, top: 5),
            ),
            GetBuilder<LoginScreenController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return Container(
                    width: Get.width,
                    decoration: BoxDecoration(
                      color: AppColors.whiteColor,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.greyColor.withOpacity(0.15),
                        width: 1,
                      ),
                    ),
                    padding: const EdgeInsets.all(10),
                    child: AnimationLimiter(
                      child: GridView.builder(
                        scrollDirection: Axis.vertical,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: EdgeInsets.zero,
                        shrinkWrap: true,
                        itemCount: logic.getExpertCategory?.data?.serviceId?.length,
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          childAspectRatio: 0.65,
                          crossAxisSpacing: 20,
                        ),
                        itemBuilder: (BuildContext context, int index) {
                          return AnimationConfiguration.staggeredGrid(
                            position: index,
                            duration: const Duration(milliseconds: 800),
                            columnCount: logic.getExpertCategory?.data?.serviceId?.length ?? 0,
                            child: FadeInAnimation(
                              child: ScaleAnimation(
                                child: Column(
                                  children: [
                                    DottedBorder(
                                      color: AppColors.roundBorder,
                                      borderType: BorderType.RRect,
                                      radius: const Radius.circular(40),
                                      strokeWidth: 1,
                                      dashPattern: const [2.5, 2],
                                      child: Container(
                                        height: 70,
                                        width: 70,
                                        decoration: const BoxDecoration(shape: BoxShape.circle),
                                        clipBehavior: Clip.hardEdge,
                                        child: CachedNetworkImage(
                                          imageUrl: logic.getExpertCategory?.data?.serviceId?[index].image ?? "",
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) {
                                            return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                                          },
                                          errorWidget: (context, url, error) {
                                            return Icon(
                                              Icons.error_outline,
                                              color: AppColors.blackColor,
                                              size: 20,
                                            );
                                          },
                                        ),
                                      ),
                                    ).paddingOnly(bottom: 8),
                                    Text(
                                      logic.getExpertCategory?.data?.serviceId?[index].name ?? "",
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplay,
                                        fontSize: 13.5,
                                        color: AppColors.category,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    )).paddingOnly(left: 13, right: 13, top: 8, bottom: 20);
              },
            ),
          ],
        ),
      ),
    );
  }
}
