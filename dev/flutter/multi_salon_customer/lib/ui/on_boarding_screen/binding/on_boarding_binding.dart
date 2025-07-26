import 'package:get/get.dart';
import 'package:salon_2/ui/on_boarding_screen/controller/on_boarding_controller.dart';

class OnBoardingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OnBoardingController>(() => OnBoardingController());
  }
}
