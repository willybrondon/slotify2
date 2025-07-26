import 'package:get/get.dart';
import 'package:salon_2/ui/new_product_screen/controller/new_product_controller.dart';

class NewProductBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<NewProductController>(() => NewProductController());
  }
}
