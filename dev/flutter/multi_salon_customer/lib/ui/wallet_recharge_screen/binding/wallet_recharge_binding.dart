import 'package:get/get.dart';
import 'package:salon_2/ui/wallet_recharge_screen/controller/wallet_recharge_controller.dart';

class WalletRechargeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WalletRechargeController>(() => WalletRechargeController());
  }
}

