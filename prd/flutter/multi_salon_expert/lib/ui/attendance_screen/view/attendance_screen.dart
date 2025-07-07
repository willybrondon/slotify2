// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/ui/attendance_screen/controller/attendance_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';

class AttendanceScreen extends StatelessWidget {
  AttendanceScreen({super.key});

  final AttendanceController attendanceController = Get.find<AttendanceController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtAttendance".tr,
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
      body: GetBuilder<AttendanceController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "txtAttendanceDetails".tr,
                    style: TextStyle(
                      fontFamily: FontFamily.sfProDisplayBold,
                      color: AppColors.primaryTextColor,
                      fontSize: 20,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => logic.onClickMonth(),
                    child: Container(
                      height: 35,
                      width: 100,
                      decoration: BoxDecoration(
                        color: AppColors.tabUnSelect,
                        borderRadius: BorderRadius.circular(40),
                      ),
                      child: Center(
                        child: Text(
                          logic.selectedDate.toString(),
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplay,
                            color: AppColors.primaryAppColor,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  )
                ],
              ),
              GetBuilder<AttendanceController>(
                id: Constant.idProgressView,
                builder: (logic) {
                  return logic.isLoading.value
                      ? Shimmers.attendanceShimmer()
                      : Column(
                          children: [
                            Container(
                              margin: const EdgeInsets.only(top: 15, right: 5, bottom: 10),
                              alignment: Alignment.center,
                              height: 30,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "txtTotalAvailableDay".tr,
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayMedium,
                                      color: AppColors.title,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    logic.getAttendanceMonthModel != null && logic.getAttendanceMonthModel!.data!.isNotEmpty
                                        ? (logic.getAttendanceMonthModel!.data!.first.attendCount.toString())
                                        : "0",
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      color: AppColors.primaryTextColor,
                                      fontSize: 17,
                                    ),
                                  )
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 0),
                              child: Divider(color: AppColors.greyColor.withOpacity(0.2)),
                            ),
                            Container(
                              margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                              alignment: Alignment.center,
                              height: 30,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "txtNotAvailableDay".tr,
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayMedium,
                                      color: AppColors.title,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    logic.getAttendanceMonthModel != null && logic.getAttendanceMonthModel!.data!.isNotEmpty
                                        ? (logic.getAttendanceMonthModel!.data!.first.absentCount.toString())
                                        : "0",
                                    style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplayBold, color: AppColors.primaryTextColor, fontSize: 17),
                                  )
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 0),
                              child: Divider(color: AppColors.greyColor.withOpacity(0.2)),
                            ),
                            Container(
                              margin: const EdgeInsets.only(top: 5, right: 5, bottom: 10),
                              alignment: Alignment.center,
                              height: 30,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "txtTotalDay".tr,
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayMedium,
                                      color: AppColors.title,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    logic.getAttendanceMonthModel != null && logic.getAttendanceMonthModel!.data!.isNotEmpty
                                        ? (logic.getAttendanceMonthModel!.data!.first.totalDays.toString())
                                        : "0",
                                    style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold,
                                      color: AppColors.primaryTextColor,
                                      fontSize: 17,
                                    ),
                                  )
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 0),
                              child: Divider(
                                color: AppColors.greyColor.withOpacity(0.2),
                              ),
                            ),
                          ],
                        );
                },
              )
            ],
          ).paddingOnly(top: 10, left: 17, right: 17);
        },
      ),
    );
  }
}
