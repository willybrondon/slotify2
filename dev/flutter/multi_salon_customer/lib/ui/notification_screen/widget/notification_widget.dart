import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class NotificationTopView extends StatelessWidget {
  const NotificationTopView({super.key});

  @override
  Widget build(BuildContext context) {
    double statusBarHeight = MediaQuery.of(context).padding.top;

    return Container(
      padding: EdgeInsets.only(top: statusBarHeight),
      height: 100 + statusBarHeight,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.primaryAppColor,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.whiteColor),
            clipBehavior: Clip.hardEdge,
            child: Image.asset(AppAsset.icNotifications).paddingAll(11),
          ).paddingOnly(left: 15, right: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "txtWelcomeBack".tr,
                style: TextStyle(fontFamily: AppFontFamily.sfProDisplay, fontSize: 18, color: AppColors.whiteColor),
              ),
              Text(
                "txtLongTime".tr,
                style: TextStyle(fontFamily: AppFontFamily.sfProDisplayRegular, fontSize: 13, color: AppColors.whiteColor),
              ),
            ],
          ),
        ],
      ).paddingOnly(bottom: 13),
    );
  }
}
