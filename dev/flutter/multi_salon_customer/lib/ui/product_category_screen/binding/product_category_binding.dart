import 'package:get/get.dart';
import 'package:salon_2/ui/product_category_screen/controller/product_category_controller.dart';

class ProductCategoryBinding extends Bindings {
  @override
  dependencies() {
    Get.lazyPut<ProductCategoryController>(() => ProductCategoryController());
  }
}
