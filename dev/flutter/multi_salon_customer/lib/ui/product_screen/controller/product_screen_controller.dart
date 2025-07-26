import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/constant.dart';

class ProductScreenController extends GetxController {
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  RxBool isLoading = false.obs;

  onRefresh() async {
    try {
      isLoading = true.obs;
      update([Constant.idProgressView]);

      homeScreenController.isTrendingProductSaved = [];
      homeScreenController.isNewProductSaved = [];

      await homeScreenController.onGetTrendingProductApiCall();
      await homeScreenController.onGetNewProductApiCall();
      await homeScreenController.onGetProductCategoryApiCall();

      for (int i = 0; i < (homeScreenController.getTrendingProductModel?.data?.length ?? 0); i++) {
        homeScreenController.isTrendingProductSaved
            .add(homeScreenController.getTrendingProductModel?.data?[i].isFavourite ?? false);
      }

      for (int i = 0; i < (homeScreenController.getNewProductModel?.data?.length ?? 0); i++) {
        homeScreenController.isNewProductSaved.add(homeScreenController.getNewProductModel?.data?[i].isFavourite ?? false);
      }
    } catch (e) {
      log("Error in on refresh while products screen :: $e");
    } finally {
      isLoading = false.obs;
      update([Constant.idProgressView]);
    }
  }
}
