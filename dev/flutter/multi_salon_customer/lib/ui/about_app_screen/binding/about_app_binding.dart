import 'package:get/get.dart';
import 'package:salon_2/ui/about_app_screen/controller/about_app_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';

class AboutAppBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AboutAppController>(() => AboutAppController());
    // Ensure SplashController is available for settings data
    if (!Get.isRegistered<SplashController>()) {
      Get.put<SplashController>(SplashController());
    }
  }
}
