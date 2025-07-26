// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class CustomMenu extends StatelessWidget {
  String? leadingImage;
  String? title;
  String? subtitle;
  String? fontFamily;
  double? fontSize;
  double? imageHeight;
  double? imageWidth;
  Color? textColor;
  Function()? onTap;

  CustomMenu({
    super.key,
    this.leadingImage,
    this.title,
    this.subtitle,
    this.fontSize,
    this.imageHeight,
    this.imageWidth,
    this.fontFamily,
    this.onTap,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
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
                        height: 27,
                        width: 27,
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
                            fontSize: 16,
                            color: AppColors.appText,
                          ),
                        ),
                        SizedBox(
                          height: Get.height * 0.006,
                        ),
                        if (subtitle != null)
                          SizedBox(
                            width: Get.width * 0.64,
                            child: Text(
                              subtitle!,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayMedium,
                                fontSize: 13,
                                color: AppColors.subTitle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                Image.asset(AppAsset.icArrow, height: 23, width: 23).paddingOnly(right: 7),
              ],
            ),
          ),
        ),
        SizedBox(height: Get.height * 0.02),
      ],
    );
  }
}
