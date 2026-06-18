// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/exit_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/widget/home_search_results_widget.dart';
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
        appBar: PreferredSize(
          preferredSize: Size.fromHeight(
            MediaQuery.of(context).padding.top + 72,
          ),
          child: const HomeScreenTopView(),
        ),
        body: GetBuilder<HomeScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 12, 15, 8),
                  child: const HomeScreenIntentHub(),
                ),
                Expanded(
                  child: GetBuilder<HomeScreenController>(
                    id: Constant.idHomeSearchResults,
                    builder: (searchLogic) {
                      final hasResults = searchLogic.publicSearchActive ||
                          searchLogic.publicSearchLoading;

                      if (!hasResults) {
                        return const SizedBox.shrink();
                      }

                      return RefreshIndicator(
                        onRefresh: () => searchLogic.onRefresh(),
                        color: AppColors.primaryAppColor,
                        child: ListView(
                          padding: EdgeInsets.only(
                            bottom:
                                MediaQuery.of(context).padding.bottom + 80,
                          ),
                          children: const [
                            HomeSearchResultsSection(),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
