// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salomon_bottom_bar/salomon_bottom_bar.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';

class BottomBarScreen extends StatelessWidget {
  const BottomBarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: GetBuilder<BottomBarController>(
      id: Constant.idBottomBar,
      builder: (logic) {
        return Scaffold(
            backgroundColor: AppColors.backGround,
            bottomNavigationBar: Container(
              height: 68,
              decoration: BoxDecoration(boxShadow: [
                BoxShadow(
                  color: AppColors.blackColor.withOpacity(0.04),
                  offset: const Offset(
                    0.0,
                    1.0,
                  ),
                  blurRadius: 3.0,
                  spreadRadius: 2.0,
                ), //BoxShadow
                const BoxShadow(
                  color: Colors.black12,
                  offset: Offset(0.0, 0.0),
                  blurRadius: 0.0,
                  spreadRadius: 0.0,
                ),
              ]),
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
                  items: [
                    SalomonBottomBarItem(
                        icon: logic.selectIndex == 0
                            ? Image.asset(
                                AppAsset.icRevenueFilled,
                                height: 25,
                                width: 25,
                              )
                            : Image.asset(
                                AppAsset.icRevenueOutline,
                                height: 25,
                                width: 25,
                              ),
                        title: Text("txtRevenue".tr,
                            style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryAppColor, fontSize: 15)),
                        selectedColor: AppColors.primaryAppColor,
                        unselectedColor: AppColors.bottomIcon),
                    SalomonBottomBarItem(
                        icon: logic.selectIndex == 1
                            ? Image.asset(
                                AppAsset.icBookingFilled,
                                height: 25,
                                width: 25,
                              )
                            : Image.asset(
                                AppAsset.icBookingOutline,
                                height: 25,
                                width: 25,
                              ),
                        title: Text("txtBooking".tr,
                            style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryAppColor, fontSize: 15)),
                        selectedColor: AppColors.primaryAppColor,
                        unselectedColor: AppColors.bottomIcon),
                    SalomonBottomBarItem(
                        icon: logic.selectIndex == 2
                            ? Image.asset(
                                AppAsset.icSlotManageFilled,
                                height: 23,
                                width: 23,
                              )
                            : Image.asset(
                                AppAsset.icSlotManageOutline,
                                height: 23,
                                width: 23,
                              ),
                        title: Text("txtSlotManage".tr,
                            style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryAppColor, fontSize: 15)),
                        selectedColor: AppColors.primaryAppColor,
                        unselectedColor: AppColors.bottomIcon),
                    SalomonBottomBarItem(
                        icon: logic.selectIndex == 3
                            ? GestureDetector(
                                onTap: () {
                                  logic.checkScreen = true;
                                },
                                child: Image.asset(
                                  AppAsset.icOrderReportFilled,
                                  height: 25,
                                  width: 25,
                                ),
                              )
                            : Image.asset(
                                AppAsset.icOrderReportOutline,
                                height: 25,
                                width: 25,
                              ),
                        title: Text("txtOrderReport".tr,
                            style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryAppColor, fontSize: 15)),
                        selectedColor: AppColors.primaryAppColor,
                        unselectedColor: AppColors.bottomIcon),
                    SalomonBottomBarItem(
                        icon: logic.selectIndex == 4
                            ? Image.asset(
                                AppAsset.icProfileFilled,
                                height: 25,
                                width: 25,
                              )
                            : Image.asset(
                                AppAsset.icProfileOutline,
                                height: 25,
                                width: 25,
                              ),
                        title: Text("txtProfile".tr,
                            style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryAppColor, fontSize: 15)),
                        selectedColor: AppColors.primaryAppColor,
                        unselectedColor: AppColors.bottomIcon),
                  ],
                ),
              ),
            ),
            body: logic.pages[logic.selectIndex]);
      },
    ));
  }
}
