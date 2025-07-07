import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/about_app/binding/about_app_binding.dart';
import 'package:salon_2/ui/about_app/view/about_app_screen.dart';
import 'package:salon_2/ui/booking_detail_screen/binding/booking_detail_screen_binding.dart';
import 'package:salon_2/ui/booking_detail_screen/view/booking.dart';
import 'package:salon_2/ui/booking_detail_screen/widget/booking_detail_screen.dart';
import 'package:salon_2/ui/booking_information_screen/binding/booking_information_binding.dart';
import 'package:salon_2/ui/booking_information_screen/view/booking_information_screen.dart';
import 'package:salon_2/ui/booking_screen/binding/booking_screen_binding.dart';
import 'package:salon_2/ui/booking_screen/view/booking_screen.dart';
import 'package:salon_2/ui/bottom_bar/binding/bottom_bar_binding.dart';
import 'package:salon_2/ui/bottom_bar/view/bottom_bar_screen.dart';
import 'package:salon_2/ui/branch_detail_screen/binding/branch_detail_binding.dart';
import 'package:salon_2/ui/branch_detail_screen/view/branch_detail_screen.dart';
import 'package:salon_2/ui/branch_screen/binding/branch_screen_binding.dart';
import 'package:salon_2/ui/branch_screen/view/branch_screen.dart';
import 'package:salon_2/ui/category_details/binding/category_detail_binding.dart';
import 'package:salon_2/ui/category_details/view/category_detail_screen.dart';
import 'package:salon_2/ui/complain_screen/binding/raise_complain_binding.dart';
import 'package:salon_2/ui/complain_screen/view/raise_complain_screen.dart';
import 'package:salon_2/ui/edit_profile/binding/edit_profile_binding.dart';
import 'package:salon_2/ui/edit_profile/view/edit_profile_screen.dart';
import 'package:salon_2/ui/expert/expert_detail/binding/expert_detail_binding.dart';
import 'package:salon_2/ui/expert/expert_detail/view/expert_detail_screen.dart';
import 'package:salon_2/ui/expert/expert_review/binding/expert_review_binding.dart';
import 'package:salon_2/ui/expert/expert_review/view/expert_review_screen.dart';
import 'package:salon_2/ui/help_screen/binding/help_binidng.dart';
import 'package:salon_2/ui/help_screen/view/help_screen.dart';
import 'package:salon_2/ui/home_screen/binding/home_screen_binding.dart';
import 'package:salon_2/ui/home_screen/view/home_screen.dart';
import 'package:salon_2/ui/language/binding/language_binding.dart';
import 'package:salon_2/ui/language/view/language_screen.dart';
import 'package:salon_2/ui/login/forgot_password_screen/binding/forgot_password_binding.dart';
import 'package:salon_2/ui/login/forgot_password_screen/view/forgot_password_screen.dart';
import 'package:salon_2/ui/login/login_screen/binding/login_screen_binding.dart';
import 'package:salon_2/ui/login/login_screen/view/login_screen.dart';
import 'package:salon_2/ui/login/reset_password_screen/binding/reset_password_binding.dart';
import 'package:salon_2/ui/login/reset_password_screen/view/reset_password_screen.dart';
import 'package:salon_2/ui/login/sign_in_screen/binding/sign_in_binding.dart';
import 'package:salon_2/ui/login/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/ui/login/sign_up_otp_verify_screen/binding/sign_up_otp_verify_binding.dart';
import 'package:salon_2/ui/login/sign_up_otp_verify_screen/view/sign_up_otp_verify_screen.dart';
import 'package:salon_2/ui/login/sign_up_screen/binding/sign_up_binding.dart';
import 'package:salon_2/ui/login/sign_up_screen/view/sign_up_screen.dart';
import 'package:salon_2/ui/login/verify_otp_screen/binding/verify_otp_binding.dart';
import 'package:salon_2/ui/login/verify_otp_screen/view/verify_otp_screen.dart';
import 'package:salon_2/ui/notification/binding/notification_binding.dart';
import 'package:salon_2/ui/notification/view/notification_screen.dart';
import 'package:salon_2/ui/profile/binding/profile_screen_binding.dart';
import 'package:salon_2/ui/profile/view/profile_screen.dart';
import 'package:salon_2/ui/salon_registration_screen/binding/salon_registartion_binding.dart';
import 'package:salon_2/ui/salon_registration_screen/view/salon_registration_screen.dart';
import 'package:salon_2/ui/search/binding/search_binding.dart';
import 'package:salon_2/ui/search/view/search_screen.dart';
import 'package:salon_2/ui/select_branch_screen/binding/select_branch_binding.dart';
import 'package:salon_2/ui/select_branch_screen/view/select_branch_screen.dart';
import 'package:salon_2/ui/setting/binding/setting_binding.dart';
import 'package:salon_2/ui/setting/view/setting_screen.dart';
import 'package:salon_2/ui/splash_screen/binding/splash_binding.dart';
import 'package:salon_2/ui/splash_screen/view/splash_screen.dart';
import 'package:salon_2/ui/view_all_category/binding/view_all_category_binding.dart';
import 'package:salon_2/ui/view_all_category/view/view_all_category.dart';

class AppPages {
  static var list = [
    GetPage(
      name: AppRoutes.initial,
      page: () => const SplashScreen(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: AppRoutes.bottom,
      page: () => const BottomBarScreen(),
      binding: BottomBarBinding(),
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => HomeScreen(),
      binding: HomeScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.search,
      page: () => SearchScreen(),
      binding: SearchScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.category,
      page: () => ViewAllCategoryScreen(),
      binding: ViewAllCategoryBinding(),
    ),
    GetPage(
      name: AppRoutes.branchDetail,
      page: () => BranchDetailScreen(),
      binding: BranchDetailBinding(),
    ),
    GetPage(
      name: AppRoutes.branch,
      page: () => BranchScreen(),
      binding: BranchScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.selectBranch,
      page: () => SelectBranchScreen(),
      binding: SelectBranchBinding(),
    ),
    GetPage(
      name: AppRoutes.categoryDetail,
      page: () => CategoryDetailScreen(),
      binding: CategoryDetailBinding(),
    ),
    GetPage(
      name: AppRoutes.booking,
      page: () => BookingScreen(),
      binding: BookingScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.bookingInformation,
      page: () => BookingInformationScreen(),
      binding: BookingInformationBinding(),
    ),
    GetPage(
      name: AppRoutes.expertDetail,
      page: () => ExpertDetailScreen(),
      binding: ExpertDetailBinding(),
    ),
    GetPage(
      name: AppRoutes.expertReview,
      page: () => const ExpertReviewScreen(),
      binding: ExpertReviewBinding(),
    ),
    GetPage(
      name: AppRoutes.signIn,
      page: () => SignInScreen(),
      binding: SignInBinding(),
    ),
    GetPage(
      name: AppRoutes.signUp,
      page: () => SignUpScreen(),
      binding: SignUpBinding(),
    ),
    GetPage(
      name: AppRoutes.forgotPassword,
      page: () => ForgotPasswordScreen(),
      binding: ForgotPasswordBinding(),
    ),
    GetPage(
      name: AppRoutes.verifyOtp,
      page: () => VerifyOtpScreen(),
      binding: VerifyOtpBinding(),
    ),
    GetPage(
      name: AppRoutes.resetPassword,
      page: () => const ResetPasswordScreen(),
      binding: ResetPasswordBinding(),
    ),
    GetPage(
      name: AppRoutes.signUpVerifyOtp,
      page: () => SignUpVerifyOtpScreen(),
      binding: SignUpOtpVerifyBinding(),
    ),
    GetPage(
      name: AppRoutes.salonRegistration,
      page: () => const SalonRegistrationScreen(),
      binding: SalonRegistrationBinding(),
    ),
    GetPage(
      name: AppRoutes.login,
      page: () => LoginScreen(),
      binding: LoginScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.bookingDetail,
      page: () => Booking(),
      binding: BookingDetailScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.bookingAppointment,
      page: () => BookingDetailScreen(),
      binding: BookingDetailScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.notification,
      page: () => NotificationScreen(),
      binding: NotificationBinding(),
    ),
    GetPage(
      name: AppRoutes.profile,
      page: () => const ProfileScreen(),
      binding: ProfileScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.aboutApp,
      page: () => const AboutAppScreen(),
      binding: AboutAppBinding(),
    ),
    GetPage(
      name: AppRoutes.help,
      page: () => HelpScreen(),
      binding: HelpBinding(),
    ),
    GetPage(
      name: AppRoutes.raiseComplain,
      page: () => const RaiseComplainScreen(),
      binding: RaiseComplainBinding(),
    ),
    GetPage(
      name: AppRoutes.editProfile,
      page: () => EditProfileScreen(),
      binding: EditProfileScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.setting,
      page: () => SettingScreen(),
      binding: SettingBinding(),
    ),
    GetPage(
      name: AppRoutes.language,
      page: () => const LanguageScreen(),
      binding: LanguageBinding(),
    ),
  ];
}
