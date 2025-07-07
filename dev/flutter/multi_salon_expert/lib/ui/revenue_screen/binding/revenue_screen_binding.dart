import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/revenue_screen/controller/revenue_screen_controller.dart';

class RevenueScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RevenueScreenController>(() => RevenueScreenController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
  }
}
