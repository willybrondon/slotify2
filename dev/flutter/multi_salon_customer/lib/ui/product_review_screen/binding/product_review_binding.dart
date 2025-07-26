import 'package:get/get.dart';
import 'package:salon_2/ui/product_review_screen/controller/product_review_controller.dart';

class ProductReviewBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ProductReviewController>(() => ProductReviewController());
  }
}
