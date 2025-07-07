import 'package:get/get.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login/sign_in_screen/controller/sign_in_controller.dart';

class SignInBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SignInController>(() => SignInController());
    Get.lazyPut<EditProfileScreenController>(() => EditProfileScreenController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
  }
}
