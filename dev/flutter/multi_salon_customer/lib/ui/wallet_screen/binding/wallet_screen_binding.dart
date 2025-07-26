import 'package:get/get.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';

class WalletScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WalletScreenController>(() => WalletScreenController());
  }
}
