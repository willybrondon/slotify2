import 'package:get/get.dart';
import 'package:salon_2/ui/payment_history_screen/controller/payment_history_controller.dart';

class PaymentHistoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PaymentHistoryController>(() => PaymentHistoryController());
  }
}
