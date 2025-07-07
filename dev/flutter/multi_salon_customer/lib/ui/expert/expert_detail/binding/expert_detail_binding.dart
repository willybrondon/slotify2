import 'package:get/get.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';

class ExpertDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ExpertDetailController>(() => ExpertDetailController());
    // Get.lazyPut<CategoryDetailController>(() => CategoryDetailController());
    // Get.lazyPut<BranchDetailController>(() => BranchDetailController());
    // Get.lazyPut<SelectBranchController>(() => SelectBranchController());
    // Get.lazyPut<SearchScreenController>(() => SearchScreenController());
  }
}
