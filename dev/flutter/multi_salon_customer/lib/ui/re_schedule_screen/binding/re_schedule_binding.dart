import 'package:get/get.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/re_schedule_screen/controller/re_schedule_controller.dart';

class ReScheduleBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ReScheduleController>(() => ReScheduleController());
    Get.lazyPut<BookingScreenController>(() => BookingScreenController());
  }
}
