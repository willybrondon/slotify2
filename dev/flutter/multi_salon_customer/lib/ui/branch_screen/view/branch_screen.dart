// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/branch_screen/widget/branch_screen_widget.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class BranchScreen extends StatelessWidget {
  BranchScreen({super.key});

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvoked: (bool didPop) {
        homeScreenController.onGetAllSalonApiCall(
          latitude: latitude ?? 0.0,
          longitude: longitude ?? 0.0,
          userId: Constant.storage.read<String>('userId') ?? "",
        );
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: GetBuilder<HomeScreenController>(
            id: Constant.idProgressView,
            builder: (logic) {
              return AppBarCustom(
                title: "txtNearbyBranches".tr,
                method: InkWell(
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                  onTap: () {
                    Get.back();
                    logic.onGetAllSalonApiCall(
                      latitude: latitude ?? 0.0,
                      longitude: longitude ?? 0.0,
                      userId: Constant.storage.read<String>('userId') ?? "",
                    );
                  },
                  child: Icon(
                    Icons.arrow_back,
                    color: AppColors.whiteColor,
                  ),
                ),
                method1: [
                  ((latitude ?? 0.0) != 0.0 && (longitude ?? 0.0) != 0.0)
                      ? const SizedBox()
                      : GetBuilder<HomeScreenController>(
                          id: Constant.idProgressView,
                          builder: (logic) {
                            return InkWell(
                              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                              onTap: () async {
                                await logic.getLocation();
                              },
                              child: Image.asset(
                                AppAsset.icNearBy,
                                color: AppColors.whiteColor,
                                height: 25,
                                width: 25,
                              ).paddingOnly(right: 13),
                            );
                          },
                        )
                ],
              );
            },
          ),
        ),
        body: const BranchScreenSalonView(),
      ),
    );
  }
}
