import 'package:get/get.dart';
import 'package:salon_2/ui/category_salons_discover/controller/category_salons_controller.dart';

class CategorySalonsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CategorySalonsController>(() => CategorySalonsController());
  }
}
