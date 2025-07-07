import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

class ServicePriceDialog extends StatelessWidget {
  const ServicePriceDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BookingScreenController>(
      builder: (logic) {
        return Container(
            height: (logic.getExpertServiceBaseSalonCategory?.matchedServices?.length ?? 0) <= 3 ? 335 : 375,
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(45),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  height: 58,
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(44),
                      topRight: Radius.circular(44),
                    ),
                    color: AppColors.primaryAppColor,
                  ),
                  child: Center(
                    child: Text(
                      "Services Price",
                      style: TextStyle(
                        fontFamily: FontFamily.sfProDisplay,
                        color: AppColors.whiteColor,
                        fontSize: 20,
                      ),
                    ),
                  ),
                ),
                SizedBox(
                  height: (logic.getExpertServiceBaseSalonCategory?.matchedServices?.length ?? 0) <= 3 ? 150 : 275,
                  child: ListView.builder(
                    itemCount: logic.checkItem.length,
                    physics: const AlwaysScrollableScrollPhysics(),
                    scrollDirection: Axis.vertical,
                    itemBuilder: (context, index) {
                      return Row(
                        children: [
                          DottedBorder(
                            color: AppColors.roundBorder,
                            borderType: BorderType.Circle,
                            strokeWidth: 1,
                            dashPattern: const [2.5, 2],
                            child: Container(
                              height: 40,
                              width: 40,
                              decoration: const BoxDecoration(shape: BoxShape.circle),
                              clipBehavior: Clip.hardEdge,
                              child: CachedNetworkImage(
                                imageUrl:
                                    logic.getExpertServiceBaseSalonCategory?.matchedServices?[index].matchedServiceId?.image ??
                                        "",
                                fit: BoxFit.cover,
                                placeholder: (context, url) {
                                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                },
                                errorWidget: (context, url, error) {
                                  return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                },
                              ),
                            ),
                          ).paddingOnly(right: 8),
                          SizedBox(
                            width: 150,
                            child: Text(
                              logic.getExpertServiceBaseSalonCategory?.matchedServices?[index].matchedServiceId?.name ?? "",
                              style: TextStyle(
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  color: AppColors.categoryService,
                                  fontSize: 16,
                                  overflow: TextOverflow.ellipsis),
                            ),
                          ),
                          const Spacer(),
                          Constant.storage.read<String>('expertDetail') != null
                              ? Text(
                                  "${logic.getExpertServiceBaseSalonCategory?.matchedServices?[index].matchedServiceId?.duration} ${"txtMinutes".tr}",
                                  style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      color: AppColors.currency,
                                      fontSize: 14,
                                      overflow: TextOverflow.ellipsis),
                                ).paddingOnly(right: 8)
                              : Text(
                                  "$currency ${logic.getExpertServiceBaseSalonCategory?.matchedServices?[index].price?.toStringAsFixed(2)}",
                                  style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      color: AppColors.currency,
                                      fontSize: 14,
                                      overflow: TextOverflow.ellipsis),
                                ).paddingOnly(right: 8),
                        ],
                      ).paddingOnly(bottom: 8);
                    },
                  ),
                ).paddingOnly(top: 13, left: 10)
              ],
            ));
      },
    );
  }
}
