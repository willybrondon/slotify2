import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/product_detail_screen/controller/product_detail_controller.dart';

class ProductDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ProductDetailController>(() => ProductDetailController());
    Get.lazyPut<SignInController>(() => SignInController());
  }
}
