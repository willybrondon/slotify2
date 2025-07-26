import 'package:get/get.dart';
import 'package:salon_2/ui/history_screen/controller/history_screen_controller.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';
import 'package:salon_2/ui/revenue_detail/controller/revenue_detail_controller.dart';

class RevenueDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RevenueDetailController>(() => RevenueDetailController());
    Get.lazyPut<PaymentMethodController>(() => PaymentMethodController());
    Get.lazyPut<HistoryScreenController>(() => HistoryScreenController());
  }
}
