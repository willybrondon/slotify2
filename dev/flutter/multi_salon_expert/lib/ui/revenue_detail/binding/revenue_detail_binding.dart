import 'package:get/get.dart';
import 'package:salon_2/ui/revenue_detail/controller/revenue_detail_controller.dart';

class RevenueDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RevenueDetailController>(() => RevenueDetailController());
  }
}
