import 'package:get/get.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/salon_registration_screen/controller/salon_registration_controller.dart';

class SalonRegistrationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SalonRegistrationController>(() => SalonRegistrationController());
    Get.lazyPut<ProfileScreenController>(() => ProfileScreenController());
  }
}
