import 'package:get/get.dart';
import 'package:salon_2/ui/about_app/controller/about_app_controller.dart';

class AboutAppBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AboutAppController>(() => AboutAppController());
  }
}
