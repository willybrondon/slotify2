import 'package:get/get.dart';
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';

class ViewAllCategoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ViewAllCategoryController>(() => ViewAllCategoryController());
  }
}
