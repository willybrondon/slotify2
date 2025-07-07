import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/slot_manager_screen/controller/slot_manager_controller.dart';

class SlotManagerBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SlotManagerController>(() => SlotManagerController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
  }
}
