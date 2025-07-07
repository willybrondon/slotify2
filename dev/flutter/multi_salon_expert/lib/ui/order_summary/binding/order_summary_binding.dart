import 'package:get/get.dart';
import 'package:salon_2/ui/order_summary/controller/order_summary_controller.dart';

class OrderSummaryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OrderSummaryController>(() => OrderSummaryController());
  }
}
