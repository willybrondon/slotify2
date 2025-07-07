import 'package:get/get.dart';

class ViewAllCategoryController extends GetxController {
  String? title;
  dynamic args = Get.arguments;

  @override
  void onInit() async {
    await getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        title = args[0];
      }
    }
  }
}
