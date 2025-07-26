import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login_screen/forgot_password_screen/controller/forgot_password_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/controller/sign_up_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';

class BookingScreenBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BookingScreenController>(() => BookingScreenController());
    Get.lazyPut<BookingDetailScreenController>(() => BookingDetailScreenController());
    Get.lazyPut<HomeScreenController>(() => HomeScreenController());
    Get.lazyPut<BranchDetailController>(() => BranchDetailController());
    Get.lazyPut<SelectBranchController>(() => SelectBranchController());
    Get.lazyPut<SignInController>(() => SignInController());
    Get.lazyPut<ExpertDetailController>(() => ExpertDetailController());
    Get.lazyPut<ForgotPasswordController>(() => ForgotPasswordController());
    Get.lazyPut<SignUpController>(() => SignUpController());
    Get.lazyPut<SplashController>(() => SplashController());
    Get.lazyPut<SearchScreenController>(() => SearchScreenController());
    Get.lazyPut<WalletScreenController>(() => WalletScreenController());
  }
}
