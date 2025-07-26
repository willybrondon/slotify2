import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';

class SelectBranchController extends GetxController {
  List checkItem = [];
  List serviceId = [];
  double totalPrice = 0.0;
  double finalTaxRupee = 0.0;
  double withOutTaxRupee = 0.0;
  int? totalMinute;
  int selectBranch = -1;
  dynamic args = Get.arguments;

  HomeScreenController  homeScreenController = Get.find<HomeScreenController>();

  @override
  void onInit() async {
    log("message SelectBranchController");
    await getDataFromArgs();


    homeScreenController.onGetServiceBasedSalonApiCall(
      serviceId: serviceId.join(","),
      latitude: latitude ?? 0.0,
      longitude: longitude ?? 0.0,
      city: city ?? "",
    );

    super.onInit();
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    log("arguments  :: ${Get.arguments}");
    log("args  :: $args");

    if (args != null) {
      if (args[0] != null || args[1] != null || args[2] != null || args[3] != null || args[4] != null || args[5] != null) {
        checkItem = args[0];
        totalPrice = args[1];
        finalTaxRupee = args[2];
        totalMinute = args[3];
        serviceId = args[4];
        withOutTaxRupee = args[5];
      }
    }
  }
}
