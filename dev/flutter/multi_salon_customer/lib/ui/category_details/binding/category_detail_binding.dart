import 'package:get/get.dart';
import 'package:salon_2/ui/category_details/controller/category_detail_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';

class CategoryDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CategoryDetailController>(() => CategoryDetailController());
    Get.lazyPut<SearchScreenController>(() => SearchScreenController());
    Get.lazyPut<SignInController>(() => SignInController());
  }
}
