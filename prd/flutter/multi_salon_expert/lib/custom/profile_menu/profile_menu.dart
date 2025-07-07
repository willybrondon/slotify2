// ignore_for_file: must_be_immutable


import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class CustomMenu extends StatelessWidget {
  String? leadingImage;
  String? title;
  String? subtitle;
  Color? textColor;
  Function()? onTap;

  CustomMenu({Key? key, this.leadingImage, this.title, this.subtitle, this.onTap, this.textColor})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
            onTap: onTap,
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 45,
                      width: 45,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(
                        leadingImage!,
                        height: 25,
                        width: 25,
                        color: AppColors.primaryAppColor,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title!,
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplay,
                            fontSize: 17,
                            color: textColor,
                          ),
                        ),
                        SizedBox(
                          height: Get.height * 0.006,
                        ),
                        if (subtitle != null)
                          SizedBox(
                            width: Get.width * 0.68,
                            child: Text(
                              subtitle!,
                              style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayMedium,
                                fontSize: 13,
                                color: AppColors.subTitle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                Image.asset(AppAsset.icArrowRight, height: 20, width: 20).paddingOnly(right: 7),
              ],
            )),
        SizedBox(height: Get.height * 0.035),
      ],
    ).paddingOnly(left: 13, right: 13);
  }
}
