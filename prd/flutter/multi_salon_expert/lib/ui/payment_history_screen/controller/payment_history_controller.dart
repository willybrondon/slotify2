import 'dart:developer';

import 'package:get/get.dart';

class PaymentHistoryController extends GetxController {
  dynamic args = Get.arguments;
  String? settlementIds;

  getDataFromArgs() {
    if (args != null) {
      settlementIds = args;
    }
  }

  @override
  void onInit() async {
    log("Enter Payment History Controller");
    await getDataFromArgs();
    log("settlementIds :: $settlementIds");
    super.onInit();
  }
}
