import 'package:get/get.dart';
import 'package:salon_2/ui/order_report/order_detail/model/get_booking_status_wise_model.dart';

class ViewDetailController extends GetxController {
  dynamic args = Get.arguments;
  Data? orderDetails;
  List<Reviews>? reviews;

  @override
  void onInit() {
    getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null) {
        orderDetails = args[0];
        reviews = args[1];
      }
    }
  }
}
