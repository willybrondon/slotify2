import 'package:get/get.dart';
import 'package:salon_2/ui/confirm_booking_screen/controller/confirm_booking_controller.dart';

class ConfirmBookingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ConfirmBookingController>(() => ConfirmBookingController());
  }
}
