import 'package:get/get.dart';
import 'package:salon_2/ui/hair_profile_screen/controller/hair_profile_controller.dart';

class HairProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HairProfileController>(() => HairProfileController());
  }
}
