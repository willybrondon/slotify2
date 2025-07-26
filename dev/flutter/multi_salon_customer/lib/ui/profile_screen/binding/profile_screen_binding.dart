import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/setting_screen/controller/setting_controller.dart';

class ProfileScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ProfileScreenController>(() => ProfileScreenController());
    Get.lazyPut<SettingController>(() => SettingController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
  }
}
