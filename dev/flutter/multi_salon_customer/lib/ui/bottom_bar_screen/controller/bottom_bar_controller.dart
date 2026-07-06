import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/view/booking.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/home_screen/view/home_screen.dart';
import 'package:salon_2/ui/notification_screen/controller/notification_controller.dart';
import 'package:salon_2/ui/notification_screen/view/notification_screen.dart';
import 'package:salon_2/ui/product_screen/view/product_screen.dart';
import 'package:salon_2/ui/profile_screen/view/profile_screen.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
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

  onClick(value) async {
    try {
      if (Get.isRegistered<SplashController>()) {
        await Get.find<SplashController>().refreshSettings();
      }
    } catch (e) {
      log("BottomBar - Settings refresh failed: $e");
    }

    // Home tab (index 0) - reload home screen data if needed
    if (value == 0) {
      try {
        HomeScreenController? homeScreenController = Get.isRegistered<HomeScreenController>()
            ? Get.find<HomeScreenController>()
            : null;

        if (homeScreenController != null) {
          // Reload data if it's null (was cleared after booking)
          if (homeScreenController.getAllCategory == null) {
            log("BottomBar - Reloading home screen category data...");
            homeScreenController.onGetAllCategoryApiCall();
          }
          if (homeScreenController.getAllSalonCategory == null) {
            log("BottomBar - Reloading home screen salon data...");
            homeScreenController.onGetAllSalonApiCall(
              latitude: latitude ?? 0.0,
              longitude: longitude ?? 0.0,
              userId: Constant.storage.read<String>('userId') ?? "",
            );
          }
          if (homeScreenController.getAllExpertCategory == null) {
            log("BottomBar - Reloading home screen expert data...");
            homeScreenController.startExpert = 0;
            homeScreenController.onGetAllExpertApiCall(
              start: homeScreenController.startExpert.toString(),
              limit: homeScreenController.limitExpert.toString(),
            );
          }
        }
      } catch (e) {
        log("BottomBar - ⚠️ Error reloading home screen data: $e");
      }
    }

    // Booking tab (index 1)
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

    // Products tab (index 2) - reload product data if needed
    if (value == 2) {
      try {
        HomeScreenController? homeScreenController = Get.isRegistered<HomeScreenController>()
            ? Get.find<HomeScreenController>()
            : null;

        if (homeScreenController != null) {
          // Reload product data if it's null (was cleared after booking)
          if (homeScreenController.getTrendingProductModel == null) {
            log("BottomBar - Reloading trending products...");
            homeScreenController.onGetTrendingProductApiCall();
          }
          if (homeScreenController.getNewProductModel == null) {
            log("BottomBar - Reloading new products...");
            homeScreenController.onGetNewProductApiCall();
          }
          if (homeScreenController.getProductCategoryModel == null) {
            log("BottomBar - Reloading product categories...");
            homeScreenController.onGetProductCategoryApiCall();
          }
        }
      } catch (e) {
        log("BottomBar - ⚠️ Error reloading product data: $e");
      }
    }

    // Notification tab (index 3) - reload notification data
    if (value == 3) {
      log("BottomBar - Reloading notifications...");
      notificationController.onGetNotificationApiCall(userId: Constant.storage.read<String>('userId') ?? "");
    }

    if (value != null) {
      selectIndex = value;
    }
    update([Constant.idBottomBar]);
  }
}
