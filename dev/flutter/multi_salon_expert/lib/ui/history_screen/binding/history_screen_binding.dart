import 'package:get/get.dart';
import 'package:salon_2/ui/history_screen/controller/history_screen_controller.dart';

class HistoryScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HistoryScreenController>(() => HistoryScreenController());
  }
}
