import 'package:get/get.dart';
import 'package:salon_2/ui/add_new_address_screen/controller/add_new_address_controller.dart';

class AddNewAddressBinding extends Bindings {
  @override
  dependencies() {
    Get.lazyPut<AddNewAddressController>(() => AddNewAddressController());
  }
}
