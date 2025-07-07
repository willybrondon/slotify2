// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

class AboutBranchScreen extends StatelessWidget {
  AboutBranchScreen({super.key});

  BranchDetailController branchDetailController = Get.find<BranchDetailController>();

  @override
  Widget build(BuildContext context) {
    int index = 0;

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GetBuilder<BranchDetailController>(
              id: Constant.idProgressView,
              builder: (logic) {
                return logic.getSalonDetailCategory?.salon?.about?.isEmpty == true
                    ? const SizedBox()
                    : Text(
                        logic.getSalonDetailCategory?.salon?.about ?? "",
                        style: TextStyle(
                          color: AppColors.service,
                          fontFamily: FontFamily.sfProDisplayRegular,
                          fontSize: 13.5,
                        ),
                      ).paddingOnly(bottom: 13);
              },
            ),
            Text(
              "txtWorkingHours".tr,
              style: TextStyle(
                  fontFamily: FontFamily.sfProDisplayBold, color: AppColors.locationText, fontSize: 18,),
            ),
            for (index = 0;
                index < (branchDetailController.getSalonDetailCategory?.salon?.salonTime?.length ?? 0);
                index++)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    branchDetailController.getSalonDetailCategory?.salon?.salonTime?[index].day ?? "",
                    style: TextStyle(
                      fontSize: 16,
                      fontFamily: FontFamily.sfProDisplayMedium,
                      color: AppColors.service,
                    ),
                  ).paddingOnly(top: 15),
                  Text(
                    "${branchDetailController.getSalonDetailCategory?.salon?.salonTime?[index].openTime} - ${branchDetailController.getSalonDetailCategory?.salon?.salonTime?[index].closedTime}",
                    style: TextStyle(
                      fontSize: 15,
                      fontFamily: FontFamily.sfProDisplay,
                      color: AppColors.primaryAppColor,
                    ),
                  ).paddingOnly(top: 15)
                ],
              )
          ],
        ).paddingOnly(left: 15, right: 15),
      ),
    );
  }
}
