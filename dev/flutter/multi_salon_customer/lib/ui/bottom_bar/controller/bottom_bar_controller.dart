import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/view/booking.dart';
import 'package:salon_2/ui/home_screen/view/home_screen.dart';
import 'package:salon_2/ui/notification/controller/notification_controller.dart';
import 'package:salon_2/ui/notification/view/notification_screen.dart';
import 'package:salon_2/ui/profile/view/profile_screen.dart';
import 'package:salon_2/utils/constant.dart';

class BottomBarController extends GetxController {
  bool checkScreen = false;
  int selectIndex = 0;

  BookingDetailScreenController bookingDetailScreenController = Get.put(BookingDetailScreenController());
  NotificationController notificationController = Get.put(NotificationController());

  @override
  void onInit() {
    super.onInit();
    log("Bottom bar init called");
  }

  final pages = [
    HomeScreen(),
    Booking(),
    NotificationScreen(),
    const ProfileScreen(),
  ];

  onClick(value) {
    if (value == 1) {
      bookingDetailScreenController.startPending = 0;
      bookingDetailScreenController.getPending = [];
      bookingDetailScreenController.bookingDetailScreenEditingController.clear();

      if (bookingDetailScreenController.tabController?.index == 0) {
        log("Enter in bottom condition if");
        bookingDetailScreenController.onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          status: "pending",
          start: bookingDetailScreenController.startPending.toString(),
          limit: bookingDetailScreenController.limitPending.toString(),
        );
      } else {
        log("Enter in bottom condition else");
        Get.find<BookingDetailScreenController>().tabController?.index = 0;
      }
    }

    value == 2 ? notificationController.onGetNotificationApiCall(userId: Constant.storage.read<String>('UserId') ?? "") : null;

    if (value != null) {
      selectIndex = value;
    }
    update([Constant.idBottomBar]);
  }
}
