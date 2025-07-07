import 'package:get/get.dart';
import 'package:salon_2/ui/help_screen/controller/help_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_screen_controller.dart';

class HelpBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HelpController>(() => HelpController());
    Get.lazyPut<SplashScreenController>(() => SplashScreenController());
  }
}
