import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/reset_password_screen/controller/reset_password_controller.dart';

class ResetPasswordBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ResetPasswordController>(() => ResetPasswordController());
  }
}
