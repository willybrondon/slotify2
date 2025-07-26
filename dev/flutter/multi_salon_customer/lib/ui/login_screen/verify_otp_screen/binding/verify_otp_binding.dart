import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/verify_otp_screen/controller/verify_otp_controller.dart';

class VerifyOtpBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<VerifyOtpController>(() => VerifyOtpController());
  }
}
