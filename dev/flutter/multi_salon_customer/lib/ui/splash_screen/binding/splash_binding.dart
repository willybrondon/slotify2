import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/search/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';

class SplashBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SplashController>(() => SplashController());
    Get.lazyPut<BottomBarController>(() => BottomBarController());
    Get.lazyPut<SelectBranchController>(() => SelectBranchController());
    Get.lazyPut<HomeScreenController>(() => HomeScreenController(),fenix:true );
    Get.lazyPut<SearchScreenController>(() => SearchScreenController());
    Get.lazyPut<LoginScreenController>(() => LoginScreenController());
    Get.lazyPut<BookingDetailScreenController>(() => BookingDetailScreenController());
    Get.lazyPut<SignInController>(() => SignInController());
    Get.lazyPut<ProfileScreenController>(() => ProfileScreenController());
  }
}
