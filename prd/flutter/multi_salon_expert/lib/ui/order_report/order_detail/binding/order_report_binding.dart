import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/order_report/order_detail/controller/order_report_controller.dart';

class OrderReportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OrderReportController>(() => OrderReportController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
  }
}
