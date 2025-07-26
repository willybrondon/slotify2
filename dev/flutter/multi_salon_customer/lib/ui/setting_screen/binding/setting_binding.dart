import 'package:get/get.dart';
import 'package:salon_2/ui/setting_screen/controller/setting_controller.dart';

class SettingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SettingController>(() => SettingController());
  }
}
