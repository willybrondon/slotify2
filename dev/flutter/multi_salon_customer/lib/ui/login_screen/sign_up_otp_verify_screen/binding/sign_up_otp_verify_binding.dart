import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/sign_up_otp_verify_screen/controller/sign_up_otp_verify_controller.dart';

class SignUpOtpVerifyBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SignUpOtpVerifyController>(() => SignUpOtpVerifyController());
  }
}
