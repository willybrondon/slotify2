import 'package:get/get.dart';
import 'package:salon_2/ui/attendance_screen/controller/attendance_controller.dart';

class AttendanceBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AttendanceController>(() => AttendanceController());
  }
}
