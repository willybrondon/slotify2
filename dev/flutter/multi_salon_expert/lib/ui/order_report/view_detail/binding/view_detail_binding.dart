import 'package:get/get.dart';
import 'package:salon_2/ui/order_report/view_detail/controller/view_detail_controller.dart';

class ViewDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ViewDetailController>(() => ViewDetailController());
  }
}
