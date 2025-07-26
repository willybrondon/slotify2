// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/setting_screen/controller/setting_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class CustomMenu extends StatelessWidget {
  String? leadingImage;
  String? title;
  String? subtitle;
  Color? textColor;
  Function()? onTap;

  CustomMenu({
    super.key,
    this.leadingImage,
    this.title,
    this.subtitle,
    this.onTap,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.grey.withOpacity(0.1),
                width: 1,
              ),
            ),
            padding: const EdgeInsets.all(8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 50,
                      width: 50,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: AppColors.profileIconBg,
                      ),
                      child: Image.asset(
                        leadingImage!,
                        height: 25,
                        width: 25,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title!,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 16.5,
                            color: AppColors.appText,
                          ),
                        ),
                        if (subtitle != null)
                          SizedBox(
                            width: Get.width * 0.62,
                            child: Text(
                              subtitle!,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                fontSize: 12.5,
                                color: AppColors.profileTitle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                title == "Notification"
                    ? GetBuilder<SettingController>(
                        id: Constant.idSwitchOn,
                        builder: (logic) {
                          return SizedBox(
                            height: 30,
                            child: Switch(
                              value: logic.isSwitchOn ?? true,
                              activeColor: AppColors.greenColor,
                              activeTrackColor: AppColors.whiteColor,
                              inactiveThumbColor: AppColors.redColor,
                              inactiveTrackColor: AppColors.whiteColor,
                              trackOutlineColor: WidgetStatePropertyAll(AppColors.grey.withOpacity(0.15)),
                              trackColor: WidgetStatePropertyAll(AppColors.switchBox),
                              onChanged: (value) {
                                logic.onSwitch(value);
                              },
                            ),
                          );
                        },
                      )
                    : Image.asset(AppAsset.icArrow, height: 23, width: 23).paddingOnly(right: 7),
              ],
            ),
          ),
        ),
        SizedBox(height: Get.height * 0.02),
      ],
    ).paddingOnly(left: 13, right: 13);
  }
}
