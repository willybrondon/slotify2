import 'package:get/get_navigation/src/routes/get_route.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/about_app/binding/about_app_binding.dart';
import 'package:salon_2/ui/about_app/view/about_app_screen.dart';
import 'package:salon_2/ui/attendance_screen/binding/attendance_binidng.dart';
import 'package:salon_2/ui/attendance_screen/view/attendance_screen.dart';
import 'package:salon_2/ui/booking_information_screen/binding/booking_information_binding.dart';
import 'package:salon_2/ui/booking_information_screen/view/booking_information_screen.dart';
import 'package:salon_2/ui/booking_screen/binding/booking_screen_binding.dart';
import 'package:salon_2/ui/booking_screen/view/booking_screen.dart';
import 'package:salon_2/ui/bottom_bar/binding/bottom_bar_binding.dart';
import 'package:salon_2/ui/bottom_bar/view/bottom_bar.dart';
import 'package:salon_2/ui/complain_screen/binding/raise_complain_binding.dart';
import 'package:salon_2/ui/complain_screen/view/raise_complain_screen.dart';
import 'package:salon_2/ui/edit_profile/binding/edit_profile_binding.dart';
import 'package:salon_2/ui/edit_profile/view/edit_profile_screen.dart';
import 'package:salon_2/ui/help_screen/binding/help_binidng.dart';
import 'package:salon_2/ui/help_screen/view/help_screen.dart';
import 'package:salon_2/ui/history_screen/binding/history_screen_binding.dart';
import 'package:salon_2/ui/history_screen/view/history_screen.dart';
import 'package:salon_2/ui/language_screen/binding/language_binding.dart';
import 'package:salon_2/ui/language_screen/view/language_screen.dart';
import 'package:salon_2/ui/login_screen/binding/login_screen_binding.dart';
import 'package:salon_2/ui/login_screen/view/login_screen.dart';
import 'package:salon_2/ui/order_report/order_detail/binding/order_report_binding.dart';
import 'package:salon_2/ui/order_report/order_detail/view/order_report_screen.dart';
import 'package:salon_2/ui/order_report/view_detail/binding/view_detail_binding.dart';
import 'package:salon_2/ui/order_report/view_detail/view/view_detail_screen.dart';
import 'package:salon_2/ui/order_summary/binding/order_summary_binding.dart';
import 'package:salon_2/ui/order_summary/view/order_summary.dart';
import 'package:salon_2/ui/payment_method/binding/payment_method_binding.dart';
import 'package:salon_2/ui/payment_method/view/payment_method_view.dart';
import 'package:salon_2/ui/profile_screen/binding/profile_screen_binding.dart';
import 'package:salon_2/ui/profile_screen/view/profile_screen.dart';
import 'package:salon_2/ui/revenue_detail/binding/revenue_detail_binding.dart';
import 'package:salon_2/ui/revenue_detail/view/revenue_detail_screen.dart';
import 'package:salon_2/ui/revenue_screen/binding/revenue_screen_binding.dart';
import 'package:salon_2/ui/revenue_screen/view/revenue_screen.dart';
import 'package:salon_2/ui/salon_service_screen/binding/salon_service_binding.dart';
import 'package:salon_2/ui/salon_service_screen/view/salon_service_screen.dart';
import 'package:salon_2/ui/setting_screen/binding/setting_binding.dart';
import 'package:salon_2/ui/setting_screen/view/setting_screen.dart';
import 'package:salon_2/ui/splash_screen/binding/splash_screen_binding.dart';
import 'package:salon_2/ui/splash_screen/view/splash_screen.dart';
import 'package:salon_2/ui/wallet_screen/binding/wallet_binding.dart';
import 'package:salon_2/ui/wallet_screen/view/wallet_screen.dart';

class AppPages {
  static var list = [
    GetPage(
      name: AppRoutes.initial,
      page: () => const SplashScreen(),
      binding: SplashScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.login,
      page: () => LoginScreen(),
      binding: LoginScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.bottom,
      page: () => const BottomBarScreen(),
      binding: BottomBarBinding(),
    ),
    GetPage(
      name: AppRoutes.revenue,
      page: () => const RevenueScreen(),
      binding: RevenueScreenBinding(),
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
      name: AppRoutes.orderReport,
      page: () => const OrderReportScreen(),
      binding: OrderReportBinding(),
    ),
    GetPage(
      name: AppRoutes.viewDetail,
      page: () => ViewDetailScreen(),
      binding: ViewDetailBinding(),
    ),
    GetPage(
      name: AppRoutes.profile,
      page: () => const ProfileScreen(),
      binding: ProfileScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.wallet,
      page: () => const WalletScreen(),
      binding: WalletScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.history,
      page: () => const HistoryScreen(),
      binding: HistoryScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.revenueDetail,
      page: () => const RevenueDetailScreen(),
      binding: RevenueDetailBinding(),
    ),
    GetPage(
      name: AppRoutes.orderSummary,
      page: () => OrderSummary(),
      binding: OrderSummaryBinding(),
    ),
    GetPage(
      name: AppRoutes.attendance,
      page: () => AttendanceScreen(),
      binding: AttendanceBinding(),
    ),
    GetPage(
      name: AppRoutes.setting,
      page: () => const SettingScreen(),
      binding: SettingBinding(),
    ),
    GetPage(
      name: AppRoutes.language,
      page: () => const LanguageScreen(),
      binding: LanguageBinding(),
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
      binding: EditProfileBinding(),
    ),
    GetPage(
      name: AppRoutes.paymentMethod,
      page: () => const PaymentMethodScreen(),
      binding: PaymentMethodBinding(),
    ),
    GetPage(
      name: AppRoutes.salonService,
      page: () => SalonServiceScreen(),
      binding: SalonServiceBinding(),
    ),
  ];
}
