import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/utils/constant.dart';

class SalonServiceController extends GetxController {
  LoginScreenController loginScreenController = Get.put(LoginScreenController());

  @override
  void onInit() {
    loginScreenController.onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());
    earning = loginScreenController.getExpertCategory?.data?.earning?.toStringAsFixed(2);
    super.onInit();
  }
}
