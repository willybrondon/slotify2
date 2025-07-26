import 'package:get/get.dart';
import 'package:salon_2/ui/trending_product_screen/controller/trending_product_controller.dart';

class TrendingProductBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TrendingProductController>(() => TrendingProductController());
  }
}
