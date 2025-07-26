// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/bottom_bar/salomon_bottom_bar.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class BottomBarScreen extends StatelessWidget {
  const BottomBarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BottomBarController>(
      id: Constant.idBottomBar,
      builder: (logic) {
        return Scaffold(
          backgroundColor: AppColors.backGround,
          bottomNavigationBar: Container(
            height: 68,
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: AppColors.blackColor.withOpacity(0.04),
                  offset: const Offset(
                    1.0,
                    1.0,
                  ),
                  blurRadius: 3.0,
                  spreadRadius: 2.0,
                ),
                const BoxShadow(
                  color: Colors.black12,
                  offset: Offset(0.0, 0.0),
                  blurRadius: 0.0,
                  spreadRadius: 0.0,
                ),
              ],
            ),
            child: OverflowBox(
              maxHeight: double.infinity,
              maxWidth: double.infinity,
              child: SalomonBottomBar(
                currentIndex: logic.selectIndex,
                onTap: (value) async {
                  logic.onClick(value);
                },
                backgroundColor: AppColors.whiteColor,
                curve: Curves.easeInOut,
                selectedColorOpacity: 1,
                margin: const EdgeInsets.all(10),
                items: [
                  bottomBarItemView(
                    index: 0,
                    selectIndex: logic.selectIndex,
                    selectedImage: AppAsset.icHomeFilled,
                    unSelectedImage: AppAsset.icHome,
                  ),
                  bottomBarItemView(
                    index: 1,
                    selectIndex: logic.selectIndex,
                    selectedImage: AppAsset.icBookingFilled,
                    unSelectedImage: AppAsset.icBooking,
                  ),
                  bottomBarItemView(
                    index: 2,
                    selectIndex: logic.selectIndex,
                    selectedImage: AppAsset.icProductFilled,
                    unSelectedImage: AppAsset.icProduct,
                  ),
                  bottomBarItemView(
                    index: 3,
                    selectIndex: logic.selectIndex,
                    selectedImage: AppAsset.icNotificationFilled,
                    unSelectedImage: AppAsset.icNotification,
                  ),
                  bottomBarItemView(
                    index: 4,
                    selectIndex: logic.selectIndex,
                    selectedImage: AppAsset.icProfileFilled,
                    unSelectedImage: AppAsset.icProfileOutline,
                  ),
                ],
              ),
            ),
          ),
          body: logic.pages[logic.selectIndex],
        );
      },
    );
  }
}

SalomonBottomBarItem bottomBarItemView({
  required final int index,
  required final int selectIndex,
  required final String selectedImage,
  required final String unSelectedImage,
}) {
  return SalomonBottomBarItem(
    icon: selectIndex == index
        ? Image.asset(selectedImage, height: 25, width: 25)
        : Image.asset(unSelectedImage, height: 25, width: 25),
    selectedColor: AppColors.primaryAppColor,
  );
}
