import 'package:get/get.dart';
import 'package:salon_2/ui/cart_screen/controller/cart_screen_controller.dart';
import 'package:salon_2/ui/product_detail_screen/controller/product_detail_controller.dart';

class CartScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CartScreenController>(() => CartScreenController());
    Get.lazyPut<ProductDetailController>(() => ProductDetailController());
  }
}
