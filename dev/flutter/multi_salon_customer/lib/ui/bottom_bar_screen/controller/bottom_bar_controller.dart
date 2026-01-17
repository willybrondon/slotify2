import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/view/booking.dart';
import 'package:salon_2/ui/home_screen/view/home_screen.dart';
import 'package:salon_2/ui/notification_screen/controller/notification_controller.dart';
import 'package:salon_2/ui/notification_screen/view/notification_screen.dart';
import 'package:salon_2/ui/product_screen/view/product_screen.dart';
import 'package:salon_2/ui/profile_screen/view/profile_screen.dart';
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
    const ProductScreen(),
    NotificationScreen(),
    const ProfileScreen(),
  ];

  onClick(value) {
    if (value == 1) {
      // Reset booking detail controller state
      bookingDetailScreenController.startPending = 0;
      bookingDetailScreenController.getPending = [];
      bookingDetailScreenController.bookingDetailScreenEditingController.clear();
      
      // Always set tab to pending (index 0) and reload data
      log("BottomBar - Navigating to bookings tab, forcing pending bookings reload...");
      bookingDetailScreenController.tabController?.index = 0;
      
      // Force reload pending bookings regardless of previous tab index
      Future.microtask(() async {
        await bookingDetailScreenController.onGetAllBookingApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          status: "pending",
          start: bookingDetailScreenController.startPending.toString(),
          limit: bookingDetailScreenController.limitPending.toString(),
          search: bookingDetailScreenController.bookingDetailScreenEditingController.text.trim(),
        );
        log("BottomBar - ✅ Pending bookings reloaded");
      });
    }

    value == 2 ? notificationController.onGetNotificationApiCall(userId: Constant.storage.read<String>('userId') ?? "") : null;

    if (value != null) {
      selectIndex = value;
    }
    update([Constant.idBottomBar]);
  }
}
