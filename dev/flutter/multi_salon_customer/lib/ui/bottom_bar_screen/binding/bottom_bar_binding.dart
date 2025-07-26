import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/notification_screen/controller/notification_controller.dart';
import 'package:salon_2/ui/product_screen/controller/product_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/setting_screen/controller/setting_controller.dart';

class BottomBarBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BottomBarController>(() => BottomBarController());
    Get.lazyPut<HomeScreenController>(() => HomeScreenController());
    Get.lazyPut<BookingDetailScreenController>(() => BookingDetailScreenController());
    Get.lazyPut<NotificationController>(() => NotificationController());
    Get.lazyPut<ProfileScreenController>(() => ProfileScreenController());
    Get.lazyPut<ProductScreenController>(() => ProductScreenController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<SettingController>(() => SettingController());
    Get.lazyPut<SearchScreenController>(() => SearchScreenController());
  }
}
