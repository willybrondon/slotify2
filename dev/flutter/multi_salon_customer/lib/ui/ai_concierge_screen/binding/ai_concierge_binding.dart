import 'package:get/get.dart';
import 'package:salon_2/ui/ai_concierge_screen/controller/ai_concierge_controller.dart';

class AiConciergeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AiConciergeController>(() => AiConciergeController());
  }
}

