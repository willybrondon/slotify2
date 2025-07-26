// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/ui/attendance_screen/controller/attendance_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
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
                      fontFamily: AppFontFamily.sfProDisplayBold,
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
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          logic.selectedDate.toString(),
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
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
                      : Container(
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                          margin: const EdgeInsets.only(top: 15),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(22),
                            color: AppColors.whiteColor,
                            boxShadow: Constant.boxShadow,
                            border: Border.all(
                              color: AppColors.grey.withOpacity(0.15),
                              width: 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              Container(
                                margin: const EdgeInsets.only(top: 5, right: 10, bottom: 10),
                                alignment: Alignment.center,
                                height: 30,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "txtTotalAvailableDay".tr,
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayMedium,
                                        color: AppColors.title,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Text(
                                      logic.getAttendanceMonthModel != null && logic.getAttendanceMonthModel!.data!.isNotEmpty
                                          ? (logic.getAttendanceMonthModel!.data!.first.attendCount.toString())
                                          : "0",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayBold,
                                        color: AppColors.primaryTextColor,
                                        fontSize: 17,
                                      ),
                                    )
                                  ],
                                ),
                              ),
                              Divider(color: AppColors.greyColor.withOpacity(0.1)),
                              Container(
                                margin: const EdgeInsets.only(top: 5, right: 10, bottom: 10),
                                alignment: Alignment.center,
                                height: 30,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "txtNotAvailableDay".tr,
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayMedium,
                                        color: AppColors.title,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Text(
                                      logic.getAttendanceMonthModel != null && logic.getAttendanceMonthModel!.data!.isNotEmpty
                                          ? (logic.getAttendanceMonthModel!.data!.first.absentCount.toString())
                                          : "0",
                                      style: TextStyle(
                                          fontFamily: AppFontFamily.sfProDisplayBold,
                                          color: AppColors.primaryTextColor,
                                          fontSize: 17),
                                    )
                                  ],
                                ),
                              ),
                              Divider(color: AppColors.greyColor.withOpacity(0.1)),
                              Container(
                                margin: const EdgeInsets.only(top: 5, right: 10, bottom: 10),
                                alignment: Alignment.center,
                                height: 30,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "txtTotalDay".tr,
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayMedium,
                                        color: AppColors.title,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Text(
                                      logic.getAttendanceMonthModel != null && logic.getAttendanceMonthModel!.data!.isNotEmpty
                                          ? (logic.getAttendanceMonthModel!.data!.first.totalDays.toString())
                                          : "0",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayBold,
                                        color: AppColors.primaryTextColor,
                                        fontSize: 17,
                                      ),
                                    )
                                  ],
                                ),
                              ),
                            ],
                          ),
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
