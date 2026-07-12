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

  onClick(value, {int? bookingTabIndex}) async {
    if (value == 2) {
      slotManagerController.currentIndex = false;
      slotManagerController.selectedAndBookSlot();
      slotManagerController.allSlots.clear();
      slotManagerController.selectedSlotsList.clear();

      slotManagerController.formattedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
    }

    selectIndex = value;

    if (value == 1) {
      await bookingScreenController.openBookingTab(bookingTabIndex ?? 0);
    }

    if (value == 2) {
      await slotManagerController.onGetBookingApiCall(
        selectedDate: DateFormat('yyyy-MM-dd').format(DateTime.now()),
        expertId: Constant.storage.read<String>("expertId").toString(),
        salonId: Constant.storage.read<String>("salonId").toString(),
      );
    }

    if (value == 3) {
      final tabIndex = orderReportController.tabController?.index ?? 0;
      await orderReportController.onChangeTabBar(tabIndex);
    }

    update([Constant.idBottomBar, Constant.idRevenuePending]);
  }
}
