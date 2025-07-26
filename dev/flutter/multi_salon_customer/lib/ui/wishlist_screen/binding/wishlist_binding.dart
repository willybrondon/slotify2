import 'package:get/get.dart';
import 'package:salon_2/ui/wishlist_screen/controller/wishlist_controller.dart';

class WishlistBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WishlistController>(() => WishlistController());
  }
}
