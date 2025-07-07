import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/ui/language/controller/language_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';

class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: AppColors.backGround,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "txtLanguage".tr,
            method1: [
              GetBuilder<LanguageController>(
                id: Constant.idChangeLanguage,
                builder: (logic) {
                  return GestureDetector(
                    onTap: () {
                      logic.onLanguageSave();
                    },
                    child: Image.asset(
                      AppAsset.icCheck,
                      height: 18,
                      width: 18,
                    ),
                  );
                },
              ).paddingOnly(right: 15)
            ],
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
        body: ListView.builder(
          shrinkWrap: true,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          itemCount: Constant.countryList.length,
          itemBuilder: (context, index) {
            return GetBuilder<LanguageController>(
              id: Constant.idChangeLanguage,
              builder: (logic) {
                return InkWell(
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                  onTap: () {
                    logic.onChangeLanguage(languages[index], index);
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            height: 46,
                            width: 46,
                            padding: const EdgeInsets.all(1.5),
                            decoration: BoxDecoration(
                                shape: BoxShape.circle, border: Border.all(width: 1, color: AppColors.primaryAppColor)),
                            clipBehavior: Clip.hardEdge,
                            child: Image.asset(Constant.countryList[index]["image"]),
                          ).paddingOnly(right: 8),
                          Text(
                            Constant.countryList[index]["country"],
                            style:
                                TextStyle(fontSize: 16, color: AppColors.blackColor, fontFamily: FontFamily.sfProDisplayMedium),
                          ),
                        ],
                      ),
                      logic.checkedValue != index
                          ? GestureDetector(
                              onTap: () {
                                logic.onChangeLanguage(languages[index], index);
                              },
                              child: Container(
                                height: 22,
                                width: 22,
                                decoration:
                                    BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.greyColor2)),
                              ),
                            )
                          : GestureDetector(
                              onTap: () {
                                logic.onChangeLanguage(languages[index], index);
                              },
                              child: Container(
                                height: 22,
                                width: 22,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.primaryAppColor),
                                child: logic.checkedValue == index
                                    ? const Icon(
                                        Icons.check,
                                        size: 16,
                                        color: Colors.white,
                                      )
                                    : const SizedBox(),
                              ),
                            ),
                    ],
                  ).paddingOnly(bottom: 15),
                );
              },
            );
          },
        ));
  }
}
