// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/exit_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/widget/home_screen_widget.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({super.key});

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  Widget build(BuildContext context) {
    log("Latitude :: $latitude");
    log("Longitude :: $longitude");

    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
            backgroundColor: AppColors.transparent,
            shadowColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            child: const ExitDialog(),
          ),
        );
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        appBar: const PreferredSize(
          preferredSize: Size.fromHeight(200),
          child: HomeScreenTopView(),
        ),
        body: GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return RefreshIndicator(
              onRefresh: () {
                return logic.onRefresh();
              },
              color: AppColors.primaryAppColor,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: Get.height * 0.02),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const HomeScreenCategoryView().paddingOnly(left: 15, right: 15),
                        const HomeScreenNearSalonView().paddingOnly(left: 15, right: 15),
                        logic.getNewProductModel?.data?.isEmpty == true
                            ? const SizedBox()
                            : const HomeScreenNewProductView()
                                .paddingOnly(top: Constant.storage.read<bool>('isLogIn') ?? false ? 15 : 0),
                        logic.getTrendingProductModel?.data?.isEmpty == true
                            ? const SizedBox()
                            : const HomeScreenTrendingProduct(),
                        const HomeScreenTopExpertView().paddingOnly(left: 15, right: 15),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
