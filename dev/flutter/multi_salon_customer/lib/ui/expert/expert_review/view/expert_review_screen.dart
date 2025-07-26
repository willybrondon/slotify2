import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class ExpertReviewScreen extends StatelessWidget {
  const ExpertReviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtReviews".tr,
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
      body: GetBuilder<ExpertDetailController>(
        id: Constant.idUserReview,
        builder: (logic) {
          return AnimationLimiter(
            child: ListView.separated(
              itemCount: logic.getReviewCategory!.data!.length,
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              itemBuilder: (context, index) {
                return AnimationConfiguration.staggeredGrid(
                  position: index,
                  duration: const Duration(milliseconds: 800),
                  columnCount: logic.getReviewCategory!.data!.length,
                  child: SlideAnimation(
                    child: FadeInAnimation(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12), color: AppColors.whiteColor, boxShadow: Constant.boxShadow),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "${logic.getReviewCategory!.data![index].userId?.fname} ${logic.getReviewCategory!.data![index].userId?.lname}",
                                  style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      fontSize: 16.5,
                                      color: AppColors.primaryTextColor),
                                ),
                                Container(
                                  width: Get.width * 0.14,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(6), color: AppColors.oceanBlue.withOpacity(0.30)),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Image.asset(
                                        logic.getReviewCategory!.data![index].rating!.toInt() >= 4
                                            ? AppAsset.icGreenStar
                                            : AppAsset.icRedStar,
                                        height: 15,
                                        width: 15,
                                      ),
                                      SizedBox(width: Get.width * 0.02),
                                      Text(logic.getReviewCategory!.data![index].rating.toString(),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              fontFamily: AppFontFamily.sfProDisplayBold,
                                              fontSize: 15,
                                              color: AppColors.blackColor)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(logic.getReviewCategory!.data![index].review.toString(),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayMedium, fontSize: 14, color: AppColors.grey)),
                                Padding(
                                  padding: const EdgeInsets.only(top: 12),
                                  child: Text(logic.date.toString(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                          fontFamily: AppFontFamily.sfProDisplayMedium, fontSize: 13, color: AppColors.grey)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return SizedBox(height: Get.height * 0.02);
              },
            ),
          );
        },
      ),
    );
  }
}
