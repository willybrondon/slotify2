// ignore_for_file: prefer_null_aware_operators

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/utils.dart';

class SearchScreenController extends GetxController {
  List checkItem = [];
  List priceList = [];
  List serviceId = [];
  List serviceName = [];
  double? withTaxRupee;
  // double totalPrice = 0.0;
  // double withOutTaxRupee = 0.0;
  // double finalTaxRupee = 0.0;
  int totalMinute = 0;

  // late List<bool> isSelected = List.generate((homeScreenController.getService.length), (index) => false);
  final HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  var text = " ";
  var isListening = false;

  @override
  void onInit() async {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      homeScreenController.onGetAllServiceApiCall(city: city ?? "");
      if (homeScreenController.getAllServiceCategory?.status == false) {
        Utils.showToast(Get.context!, homeScreenController.getAllServiceCategory?.message ?? "");
      }
    });

    // withOutTaxRupee = 0.0;
    // totalPrice = 0.0;
    // finalTaxRupee = 0.0;
    totalMinute = 0;
    checkItem.clear();
    serviceId.clear();
    serviceName.clear();

    homeScreenController.searchEditingController.addListener(() {
      final newText = capitalizeFirstLetter(homeScreenController.searchEditingController.text);
      if (homeScreenController.searchEditingController.text != newText) {
        homeScreenController.searchEditingController.value = homeScreenController.searchEditingController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });

    super.onInit();
  }

  String capitalizeFirstLetter(String text) {
    if (text.isEmpty) {
      return text;
    }
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }
}
