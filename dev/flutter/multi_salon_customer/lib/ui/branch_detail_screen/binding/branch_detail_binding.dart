import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';

class BranchDetailBinding extends Bindings {
  @override
  void dependencies() {
    if (Get.isRegistered<BranchDetailController>()) {
      Get.delete<BranchDetailController>(force: true);
    }
    Get.put(BranchDetailController());
  }
}
