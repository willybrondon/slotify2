import 'dart:developer';

import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/booking_screen/view/booking_screen.dart';
import 'package:salon_2/ui/order_report/order_detail/controller/order_report_controller.dart';
import 'package:salon_2/ui/order_report/order_detail/view/order_report_screen.dart';
import 'package:salon_2/ui/profile_screen/view/profile_screen.dart';
import 'package:salon_2/ui/revenue_screen/view/revenue_screen.dart';
import 'package:salon_2/ui/slot_manager_screen/controller/slot_manager_controller.dart';
import 'package:salon_2/ui/slot_manager_screen/view/slot_manager_screen.dart';
import 'package:salon_2/utils/constant.dart';

class BottomBarController extends GetxController {
  BookingScreenController bookingScreenController = Get.find<BookingScreenController>();
  OrderReportController orderReportController = Get.find<OrderReportController>();
  SlotManagerController slotManagerController = Get.find<SlotManagerController>();
  bool checkScreen = false;
  int selectIndex = 0;

  final pages = [
    const RevenueScreen(),
    BookingScreen(),
    SlotManagerScreen(),
    const OrderReportScreen(),
    const ProfileScreen(),
  ];

  onClick(value) async {
    if (value == 2) {
      slotManagerController.currentIndex = false;
      slotManagerController.selectedAndBookSlot();
      slotManagerController.allSlots.clear();
      slotManagerController.selectedSlotsList.clear();

      slotManagerController.formattedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
    }

    if (value == 1) {
      bookingScreenController.startPending = 0;
      bookingScreenController.getPending = [];

      if (bookingScreenController.tabController?.index == 0) {
        log("Enter in bottom condition if");
        bookingScreenController.onStatusWiseBookingApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "pending",
          start: bookingScreenController.startPending.toString(),
          limit: bookingScreenController.limitPending.toString(),
        );
      } else {
        log("Enter in bottom condition else");
        Get.find<BookingScreenController>().tabController?.index = 0;
      }
    }

    selectIndex = value;

    value == 2
        ? slotManagerController.onGetBookingApiCall(
            selectedDate: DateFormat('yyyy-MM-dd').format(DateTime.now()),
            expertId: Constant.storage.read<String>("expertId").toString(),
            salonId: Constant.storage.read<String>("salonId").toString(),
          )
        : null;

    value == 3
        ? orderReportController.onGetBookingStatusWiseApiCall(
            expertId: Constant.storage.read<String>("expertId").toString(), status: "ALL", type: "Today")
        : null;
    update([Constant.idBottomBar, Constant.idRevenuePending]);
  }
}
