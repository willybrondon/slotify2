import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/about_app_screen/binding/about_app_binding.dart';
import 'package:salon_2/ui/about_app_screen/view/about_app_screen.dart';
import 'package:salon_2/ui/add_new_address_screen/binding/add_new_address_binding.dart';
import 'package:salon_2/ui/add_new_address_screen/view/add_new_address_screen.dart';
import 'package:salon_2/ui/best_deal_offer_screen/binding/best_deal_offer_binding.dart';
import 'package:salon_2/ui/best_deal_offer_screen/view/best_deal_offer_screen.dart';
import 'package:salon_2/ui/booking_detail_screen/binding/booking_detail_screen_binding.dart';
import 'package:salon_2/ui/booking_detail_screen/view/booking.dart';
import 'package:salon_2/ui/booking_detail_screen/widget/booking_detail_screen.dart';
import 'package:salon_2/ui/booking_information_screen/binding/booking_information_binding.dart';
import 'package:salon_2/ui/booking_information_screen/view/booking_information_screen.dart';
import 'package:salon_2/ui/booking_screen/binding/booking_screen_binding.dart';
import 'package:salon_2/ui/booking_screen/view/booking_screen.dart';
import 'package:salon_2/ui/bottom_bar_screen/binding/bottom_bar_binding.dart';
import 'package:salon_2/ui/bottom_bar_screen/view/bottom_bar_screen.dart';
import 'package:salon_2/ui/branch_detail_screen/binding/branch_detail_binding.dart';
import 'package:salon_2/ui/branch_detail_screen/view/branch_detail_screen.dart';
import 'package:salon_2/ui/branch_screen/binding/branch_screen_binding.dart';
import 'package:salon_2/ui/branch_screen/view/branch_screen.dart';
import 'package:salon_2/ui/cart_screen/binding/cart_screen_binding.dart';
import 'package:salon_2/ui/cart_screen/view/cart_screen.dart';
import 'package:salon_2/ui/category_details/binding/category_detail_binding.dart';
import 'package:salon_2/ui/category_details/view/category_detail_screen.dart';
import 'package:salon_2/ui/category_wise_product_screen/binding/category_wise_product_binding.dart';
import 'package:salon_2/ui/category_wise_product_screen/view/category_wise_product_screen.dart';
import 'package:salon_2/ui/complain_screen/binding/raise_complain_binding.dart';
import 'package:salon_2/ui/complain_screen/view/raise_complain_screen.dart';
import 'package:salon_2/ui/confirm_booking_screen/binding/confirm_booking_binding.dart';
import 'package:salon_2/ui/confirm_booking_screen/view/confirm_booking_screen.dart';
import 'package:salon_2/ui/edit_profile_screen/binding/edit_profile_binding.dart';
import 'package:salon_2/ui/edit_profile_screen/view/edit_profile_screen.dart';
import 'package:salon_2/ui/expert/expert_detail/binding/expert_detail_binding.dart';
import 'package:salon_2/ui/expert/expert_detail/view/expert_detail_screen.dart';
import 'package:salon_2/ui/expert/expert_review/binding/expert_review_binding.dart';
import 'package:salon_2/ui/expert/expert_review/view/expert_review_screen.dart';
import 'package:salon_2/ui/help_screen/binding/help_binidng.dart';
import 'package:salon_2/ui/help_screen/view/help_screen.dart';
import 'package:salon_2/ui/history_screen/binding/history_screen_binding.dart';
import 'package:salon_2/ui/history_screen/view/history_screen.dart';
import 'package:salon_2/ui/home_screen/binding/home_screen_binding.dart';
import 'package:salon_2/ui/home_screen/view/home_screen.dart';
import 'package:salon_2/ui/language_screen/binding/language_binding.dart';
import 'package:salon_2/ui/language_screen/view/language_screen.dart';
import 'package:salon_2/ui/login_screen/forgot_password_screen/binding/forgot_password_binding.dart';
import 'package:salon_2/ui/login_screen/forgot_password_screen/view/forgot_password_screen.dart';
import 'package:salon_2/ui/login_screen/login_screen/binding/login_screen_binding.dart';
import 'package:salon_2/ui/login_screen/login_screen/view/login_screen.dart';
import 'package:salon_2/ui/login_screen/reset_password_screen/binding/reset_password_binding.dart';
import 'package:salon_2/ui/login_screen/reset_password_screen/view/reset_password_screen.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/binding/sign_in_binding.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/ui/login_screen/sign_up_otp_verify_screen/binding/sign_up_otp_verify_binding.dart';
import 'package:salon_2/ui/login_screen/sign_up_otp_verify_screen/view/sign_up_otp_verify_screen.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/binding/sign_up_binding.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/view/sign_up_screen.dart';
import 'package:salon_2/ui/login_screen/verify_otp_screen/binding/verify_otp_binding.dart';
import 'package:salon_2/ui/login_screen/verify_otp_screen/view/verify_otp_screen.dart';
import 'package:salon_2/ui/new_product_screen/binding/new_product_binding.dart';
import 'package:salon_2/ui/new_product_screen/view/new_product_screen.dart';
import 'package:salon_2/ui/notification_screen/binding/notification_binding.dart';
import 'package:salon_2/ui/notification_screen/view/notification_screen.dart';
import 'package:salon_2/ui/on_boarding_screen/binding/on_boarding_binding.dart';
import 'package:salon_2/ui/on_boarding_screen/view/onboarding_screen.dart';
import 'package:salon_2/ui/order_detail_screen/binding/order_detail_binding.dart';
import 'package:salon_2/ui/order_detail_screen/view/order_detail_screen.dart';
import 'package:salon_2/ui/order_screen/binding/order_screen_binding.dart';
import 'package:salon_2/ui/order_screen/view/order_screen.dart';
import 'package:salon_2/ui/payment_screen/binding/payment_screen_binding.dart';
import 'package:salon_2/ui/payment_screen/view/payment_screen.dart';
import 'package:salon_2/ui/product_category_screen/binding/product_category_binding.dart';
import 'package:salon_2/ui/product_category_screen/view/product_category_screen.dart';
import 'package:salon_2/ui/product_detail_screen/binding/product_detail_binding.dart';
import 'package:salon_2/ui/product_detail_screen/view/product_detail_screen.dart';
import 'package:salon_2/ui/product_payment_screen/binding/product_payment_binding.dart';
import 'package:salon_2/ui/product_payment_screen/screen/product_payment_screen.dart';
import 'package:salon_2/ui/product_review_screen/binding/product_review_binding.dart';
import 'package:salon_2/ui/product_review_screen/view/product_review_screen.dart';
import 'package:salon_2/ui/product_screen/binding/product_screen_binding.dart';
import 'package:salon_2/ui/product_screen/view/product_screen.dart';
import 'package:salon_2/ui/profile_screen/binding/profile_screen_binding.dart';
import 'package:salon_2/ui/profile_screen/view/profile_screen.dart';
import 'package:salon_2/ui/re_schedule_screen/binding/re_schedule_binding.dart';
import 'package:salon_2/ui/re_schedule_screen/view/re_schedule_screen.dart';
import 'package:salon_2/ui/salon_registration_screen/binding/salon_registartion_binding.dart';
import 'package:salon_2/ui/salon_registration_screen/view/salon_registration_screen.dart';
import 'package:salon_2/ui/search_product_screen/binding/search_product_binding.dart';
import 'package:salon_2/ui/search_product_screen/view/search_product_screen.dart';
import 'package:salon_2/ui/search_screen/binding/search_binding.dart';
import 'package:salon_2/ui/search_screen/view/search_screen.dart';
import 'package:salon_2/ui/select_address_screen/binding/select_address_binding.dart';
import 'package:salon_2/ui/select_address_screen/view/select_address_screen.dart';
import 'package:salon_2/ui/select_branch_screen/binding/select_branch_binding.dart';
import 'package:salon_2/ui/select_branch_screen/view/select_branch_screen.dart';
import 'package:salon_2/ui/setting_screen/binding/setting_binding.dart';
import 'package:salon_2/ui/setting_screen/view/setting_screen.dart';
import 'package:salon_2/ui/splash_screen/binding/splash_binding.dart';
import 'package:salon_2/ui/splash_screen/view/splash_screen.dart';
import 'package:salon_2/ui/trending_product_screen/binding/trending_product_binding.dart';
import 'package:salon_2/ui/trending_product_screen/view/trending_product_screen.dart';
import 'package:salon_2/ui/view_all_category/binding/view_all_category_binding.dart';
import 'package:salon_2/ui/view_all_category/view/view_all_category.dart';
import 'package:salon_2/ui/wallet_screen/binding/wallet_screen_binding.dart';
import 'package:salon_2/ui/wallet_screen/view/wallet_screen.dart';
import 'package:salon_2/ui/wishlist_screen/binding/wishlist_binding.dart';
import 'package:salon_2/ui/wishlist_screen/view/wishlist_screen.dart';

class AppPages {
  static var list = [
    GetPage(
      name: AppRoutes.initial,
      page: () => const SplashScreen(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: AppRoutes.onBoarding,
      page: () => const OnBoardingScreen(),
      binding: OnBoardingBinding(),
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
      name: AppRoutes.categoryWiseProduct,
      page: () => const CategoryWiseProductScreen(),
      binding: CategoryWiseProductBinding(),
    ),
    GetPage(
      name: AppRoutes.newProduct,
      page: () => const NewProductScreen(),
      binding: NewProductBinding(),
    ),
    GetPage(
      name: AppRoutes.trendingProduct,
      page: () => const TrendingProductScreen(),
      binding: TrendingProductBinding(),
    ),
    GetPage(
      name: AppRoutes.branchDetail,
      page: () => const BranchDetailScreen(),
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
      name: AppRoutes.confirmBooking,
      page: () => const ConfirmBookingScreen(),
      binding: ConfirmBookingBinding(),
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
      name: AppRoutes.reSchedule,
      page: () => const ReScheduleScreen(),
      binding: ReScheduleBinding(),
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
      name: AppRoutes.searchProduct,
      page: () => const SearchProductScreen(),
      binding: SearchProductBinding(),
    ),
    GetPage(
      name: AppRoutes.product,
      page: () => const ProductScreen(),
      binding: ProductScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.productCategory,
      page: () => const ProductCategoryScreen(),
      binding: ProductCategoryBinding(),
    ),
    GetPage(
      name: AppRoutes.wishlist,
      page: () => const WishlistScreen(),
      binding: WishlistBinding(),
    ),
    GetPage(
      name: AppRoutes.bestDealOffer,
      page: () => const BestDealOfferScreen(),
      binding: BestDealOfferBinding(),
    ),
    GetPage(
      name: AppRoutes.productDetail,
      page: () => const ProductDetailScreen(),
      binding: ProductDetailBinding(),
    ),
    GetPage(
      name: AppRoutes.productReview,
      page: () => const ProductReviewScreen(),
      binding: ProductReviewBinding(),
    ),
    GetPage(
      name: AppRoutes.productPayment,
      page: () => const ProductPaymentScreen(),
      binding: ProductPaymentBinding(),
    ),
    GetPage(
      name: AppRoutes.cart,
      page: () => const CartScreen(),
      binding: CartScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.selectAddress,
      page: () => const SelectAddressScreen(),
      binding: SelectAddressBinding(),
    ),
    GetPage(
      name: AppRoutes.addNewAddress,
      page: () => const AddNewAddressScreen(),
      binding: AddNewAddressBinding(),
    ),
    GetPage(
      name: AppRoutes.payment,
      page: () => const PaymentScreen(),
      binding: PaymentScreenBinding(),
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
      name: AppRoutes.order,
      page: () => const OrderScreen(),
      binding: OrderScreenBinding(),
    ),
    GetPage(
      name: AppRoutes.orderDetail,
      page: () => const OrderDetailScreen(),
      binding: OrderDetailBinding(),
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
      page: () => const EditProfileScreen(),
      binding: EditProfileScreenBinding(),
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
  ];
}
