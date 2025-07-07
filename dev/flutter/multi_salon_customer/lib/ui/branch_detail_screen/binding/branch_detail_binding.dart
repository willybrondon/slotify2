import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';

class BranchDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BranchDetailController>(() => BranchDetailController());
  }
}
