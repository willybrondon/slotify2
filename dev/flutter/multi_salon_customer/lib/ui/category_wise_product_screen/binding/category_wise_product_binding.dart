import 'package:get/get.dart';
import 'package:salon_2/ui/category_wise_product_screen/controller/category_wise_product_controller.dart';

class CategoryWiseProductBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CategoryWiseProductController>(() => CategoryWiseProductController());
  }
}
