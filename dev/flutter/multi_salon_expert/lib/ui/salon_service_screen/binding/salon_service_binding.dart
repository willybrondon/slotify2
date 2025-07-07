import 'package:get/get.dart';
import 'package:salon_2/ui/salon_service_screen/controller/salon_service_controller.dart';

class SalonServiceBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SalonServiceController>(() => SalonServiceController());
  }
}
