import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';

class LoginScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<EditProfileScreenController>(() => EditProfileScreenController());
    Get.lazyPut<BookingDetailScreenController>(() => BookingDetailScreenController());
  }
}
