import 'package:get/get.dart';
import 'package:salon_2/ui/order_screen/controller/order_screen_controller.dart';

class OrderScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OrderScreenController>(() => OrderScreenController());
  }
}
