import 'package:get/get.dart';
import 'package:salon_2/ui/select_address_screen/controller/select_address_controller.dart';

class SelectAddressBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SelectAddressController>(() => SelectAddressController());
  }
}
