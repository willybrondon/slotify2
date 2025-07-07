import 'package:get/get.dart';
import 'package:salon_2/ui/search/controller/search_screen_controller.dart';

class SearchScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SearchScreenController>(() => SearchScreenController());
  }
}
