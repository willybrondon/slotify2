import 'package:get/get.dart';
import 'package:salon_2/ui/booking_information_screen/controller/booking_information_controller.dart';

class BookingInformationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BookingInformationController>(() => BookingInformationController());
  }
}
