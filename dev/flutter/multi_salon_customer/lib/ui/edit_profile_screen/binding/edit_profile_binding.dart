import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';

class EditProfileScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<EditProfileScreenController>(() => EditProfileScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
  }
}
