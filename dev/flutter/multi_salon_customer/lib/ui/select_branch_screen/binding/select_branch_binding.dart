import 'package:get/get.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';

class SelectBranchBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SelectBranchController>(() => SelectBranchController());
  }
}
