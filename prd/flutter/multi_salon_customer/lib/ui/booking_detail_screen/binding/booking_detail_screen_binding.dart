import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login/sign_in_screen/controller/sign_in_controller.dart';

class BookingDetailScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BookingDetailScreenController>(() => BookingDetailScreenController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<BookingScreenController>(() => BookingScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
    Get.lazyPut<SignInController>(() => SignInController());
  }
}
