import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/guest_login_screen/controller/guest_login_controller.dart';

class GuestLoginBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GuestLoginController>(() => GuestLoginController());
  }
}
