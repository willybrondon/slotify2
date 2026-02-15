import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/home_screen/model/get_service_base_salon_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class SelectBranchController extends GetxController {
  List checkItem = [];
  List serviceId = [];
  double totalPrice = 0.0;
  double finalTaxRupee = 0.0;
  double withOutTaxRupee = 0.0;
  int? totalMinute;
  int selectBranch = -1;
  dynamic args = Get.arguments;

  RxBool isLoading = false.obs;
  GetServiceBaseSalonModel? getServiceBaseSalonCategory;

  HomeScreenController? homeScreenController;

  @override
  void onInit() async {
    log("message SelectBranchController");
    await getDataFromArgs();

    // Update homeScreenController serviceId if it exists (for other flows)
    try {
      homeScreenController = Get.find<HomeScreenController>();
      if (serviceId.isNotEmpty) {
        homeScreenController!.serviceId = List.from(serviceId);
        log("SelectBranch: Updated homeScreenController.serviceId = ${homeScreenController!.serviceId}");
      }
    } catch (e) {
      log("SelectBranch: HomeScreenController not found (expected when coming from category): $e");
    }

    // Fetch salons directly - avoid dependency on HomeScreenController loading state
    if (serviceId.isNotEmpty) {
      await onGetServiceBasedSalonApiCall();
    } else {
      log("SelectBranch: No serviceId provided, cannot fetch salons");
      isLoading(false);
    }

    super.onInit();
  }

  Future<void> onGetServiceBasedSalonApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idSelectBranch]);

      final url = Uri.parse(
        '${ApiConstant.BASE_URL}${ApiConstant.getServiceBasedSalon}?serviceId=${serviceId.join(",")}&latitude=${(latitude ?? 0.0) == 0.0 ? null : latitude}&longitude=${(longitude ?? 0.0) == 0.0 ? null : longitude}&city=${city ?? ""}',
      );

      log("SelectBranch: Get Service Based Salon Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("SelectBranch: StatusCode :: ${response.statusCode}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getServiceBaseSalonCategory =
            GetServiceBaseSalonModel.fromJson(jsonResponse);
      }
    } catch (e) {
      log("SelectBranch: Error call Get Service Based Salon Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idSelectBranch]);
    }
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
