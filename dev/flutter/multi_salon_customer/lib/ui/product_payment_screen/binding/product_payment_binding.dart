import 'package:get/get.dart';
import 'package:salon_2/ui/product_payment_screen/controller/product_payment_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';

class ProductPaymentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ProductPaymentController>(() => ProductPaymentController());
    Get.lazyPut<WalletScreenController>(() => WalletScreenController());
  }
}
