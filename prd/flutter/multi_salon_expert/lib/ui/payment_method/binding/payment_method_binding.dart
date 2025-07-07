import 'package:get/get.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';

class PaymentMethodBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PaymentMethodController>(() => PaymentMethodController());
    Get.lazyPut<EditProfileController>(() => EditProfileController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
  }
}
