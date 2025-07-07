import 'package:get/get.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';

class BookingScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BookingScreenController>(() => BookingScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
  }
}
