import 'package:get/get.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_controller.dart';

class WalletBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WalletController>(() => WalletController());
  }
}
