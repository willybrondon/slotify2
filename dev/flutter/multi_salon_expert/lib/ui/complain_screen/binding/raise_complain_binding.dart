import 'package:get/get.dart';
import 'package:salon_2/ui/complain_screen/controller/raise_complain_controller.dart';

class RaiseComplainBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RaiseComplainController>(() => RaiseComplainController());
  }
}
