import 'package:get/get.dart';
import 'package:salon_2/ui/order_report/order_detail/model/get_booking_status_wise_model.dart';

class ViewDetailController extends GetxController {
  dynamic args = Get.arguments;
  Data? orderDetails;

  @override
  void onInit() {
    getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      orderDetails = args;
    }
  }

  String? str;
  List? parts;
  String? date;
  String? time;
}
