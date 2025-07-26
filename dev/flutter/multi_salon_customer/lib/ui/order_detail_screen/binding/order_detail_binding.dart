import 'package:get/get.dart';
import 'package:salon_2/ui/order_detail_screen/controller/order_detail_controller.dart';

class OrderDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OrderDetailController>(() => OrderDetailController());
  }
}
