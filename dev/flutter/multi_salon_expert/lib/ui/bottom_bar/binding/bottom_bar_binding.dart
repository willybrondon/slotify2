import 'package:get/get.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/order_report/order_detail/controller/order_report_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/revenue_screen/controller/revenue_screen_controller.dart';
import 'package:salon_2/ui/slot_manager_screen/controller/slot_manager_controller.dart';

class BottomBarBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
    Get.lazyPut<RevenueScreenController>(() => RevenueScreenController());
    Get.lazyPut<BookingScreenController>(() => BookingScreenController());
    Get.lazyPut<SlotManagerController>(() => SlotManagerController());
    Get.lazyPut<OrderReportController>(() => OrderReportController());
    Get.lazyPut<ProfileScreenController>(() => ProfileScreenController());
  }
}
