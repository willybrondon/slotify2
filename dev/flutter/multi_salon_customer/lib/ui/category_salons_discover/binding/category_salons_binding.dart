import 'package:get/get.dart';
import 'package:salon_2/ui/category_salons_discover/controller/category_salons_controller.dart';

class CategorySalonsBinding extends Bindings {
  @override
  void dependencies() {
    if (Get.isRegistered<CategorySalonsController>()) {
      Get.delete<CategorySalonsController>(force: true);
    }
    Get.put(CategorySalonsController());
  }
}
