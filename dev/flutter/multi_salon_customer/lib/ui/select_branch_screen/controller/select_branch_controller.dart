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

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  void onInit() async {
    log("message SelectBranchController");
    await getDataFromArgs();

    // Update homeScreenController serviceId to match our serviceId
    if (serviceId.isNotEmpty) {
      homeScreenController.serviceId = List.from(serviceId);
      log("SelectBranch: Updated homeScreenController.serviceId = ${homeScreenController.serviceId}");
    }

    // Call API to get salons for the service
    if (serviceId.isNotEmpty) {
      homeScreenController.onGetServiceBasedSalonApiCall(
        serviceId: serviceId.join(","),
        latitude: latitude ?? 0.0,
        longitude: longitude ?? 0.0,
        city: city ?? "",
      );
    } else {
      log("SelectBranch: No serviceId provided, cannot fetch salons");
    }

    super.onInit();
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    log("arguments  :: ${Get.arguments}");
    log("args  :: $args");

    if (args != null && args is List && args.length >= 6) {
      checkItem = args[0] ?? [];
      totalPrice = args[1] ?? 0.0;
      finalTaxRupee = args[2] ?? 0.0;
      totalMinute = args[3] ?? 0;
      // Ensure serviceId is a List
      if (args[4] != null) {
        serviceId = args[4] is List ? args[4] : [args[4].toString()];
      } else {
        serviceId = [];
      }
      withOutTaxRupee = args[5] ?? 0.0;

      log("SelectBranch: checkItem = $checkItem");
      log("SelectBranch: serviceId = $serviceId");
    } else {
      // Handle case when coming from AI concierge (might have different structure)
      if (args != null && args is List && args.length > 0) {
        checkItem = args[0] ?? [];
        totalPrice = args.length > 1 ? (args[1] ?? 0.0) : 0.0;
        finalTaxRupee = args.length > 2 ? (args[2] ?? 0.0) : 0.0;
        totalMinute = args.length > 3 ? (args[3] ?? 0) : 0;
        if (args.length > 4 && args[4] != null) {
          serviceId = args[4] is List ? args[4] : [args[4].toString()];
        } else {
          serviceId = [];
        }
        withOutTaxRupee = args.length > 5 ? (args[5] ?? 0.0) : 0.0;

        log("SelectBranch (AI Concierge): checkItem = $checkItem");
        log("SelectBranch (AI Concierge): serviceId = $serviceId");
      }
    }
  }
}
