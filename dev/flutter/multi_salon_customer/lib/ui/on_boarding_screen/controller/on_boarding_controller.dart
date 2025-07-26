import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/constant.dart';

class OnBoardingController extends GetxController {
  PageController pageController = PageController(initialPage: 0);
  int currentPage = 0;

  List title = [
    'All Men Care Product Available Here',
    'All Female Care Product Available Here',
    'Beauty Made Simple Wellness Made Essential',
  ];

  List subTitle = [
    'All Men Care Product Available Here',
    'All Female Care Product Available Here',
    'Beauty Made Simple Wellness Made Essential',
  ];

  List image = [
    AppAsset.imImage1,
    AppAsset.imImage2,
    AppAsset.imImage3,
  ];

  onPageScroll({required int currentPage}) {
    if (currentPage < 2) {
      pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      Constant.storage.write("isOnBoarding", true);
      Get.offAllNamed(AppRoutes.bottom);
    }
    update([Constant.idOnBoarding]);
  }

  onPageChanged({required int page}) {
    currentPage = page;
    update([Constant.idOnBoarding]);
  }
}
