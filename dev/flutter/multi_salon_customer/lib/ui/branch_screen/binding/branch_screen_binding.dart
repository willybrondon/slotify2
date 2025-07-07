import 'package:get/get.dart';
import 'package:salon_2/ui/branch_screen/controller/branch_screen_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';

class BranchScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BranchScreenController>(() => BranchScreenController());
    Get.lazyPut<HomeScreenController>(() => HomeScreenController());
  }
}
