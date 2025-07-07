import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/setting/controller/setting_controller.dart';

class ProfileScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ProfileScreenController>(() => ProfileScreenController());
    Get.lazyPut<SettingController>(() => SettingController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
  }
}
