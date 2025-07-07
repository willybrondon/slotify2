import 'package:get/get.dart';
import 'package:salon_2/ui/expert/expert_review/controller/expert_review_controller.dart';

class ExpertReviewBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ExpertReviewController>(() => ExpertReviewController());
  }
}
