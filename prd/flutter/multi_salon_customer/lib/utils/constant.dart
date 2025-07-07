import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class Constant {
  final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();
  SplashController splashController = Get.find<SplashController>();

  /// <<===================>> ****** App Configs ****** <<===================>>

  static String appName = 'txtSalon'.tr;
  static const languageEn = "en";
  static const countryCodeEn = "US";

  /// ===================>> STRIPE
  static const stripeUrl = "https://api.stripe.com/v1/payment_intents";
  static const stripeMerchantCountryCode = 'IN';
  // static const stripeCureencyCode = 'INR';

  /// ===================>> Razorpay

  // static const razorPayCurrencyCode = 'INR';
  static const flutterWavePublishKey = 'FLWPUBK_TEST-cdc51a4df113a91fe33a914eaf8d1c75-X';

  /// In-App Purchase
  // static const String productIdiOS = "Add your Product ID here for iOS";

  /// 'Your Plan ID (Product ID iOS)';
  // static const String productIdAndroid = "android.test.purchased";

  // ----- RATE APP ----- //
  static String appStoreId = ' ';

  // ----- GET STORAGE ----- //
  static final storage = GetStorage();

  /// =================== Shimmers =================== ///
  static Color baseColor = AppColors.stepperGrey.withOpacity(0.6);
  static Color highlightColor = Colors.grey.withOpacity(0.2);
  static Duration period = const Duration(milliseconds: 500);

  /// <<===================>> ****** Widget Id's for refresh in GetX ****** <<===================>>

  static var idSubCategory = 'idSubCategory';
  static var idServiceList = 'idServiceList';
  static var idBottomService = 'idBottomService';
  static var idConfirm = 'idConfirm';
  static var idSelectBranch = 'idSelectBranch';
  static var idStep1 = 'idStep1';
  static var idStep2 = 'idStep2';
  static var idStep3 = 'idStep3';
  static var idCurrentStep = 'idCurrentStep';
  static var idSelectLanguage = 'idSelectLanguage';
  static var idChangeLanguage = 'idChangeLanguage';
  static var idEditProfile = 'idEditProfile';
  static var idBottomBar = 'idBottomBar';
  static var idSpecialist = 'idSpecialist';
  static var idDatePick = 'idDatePick';
  static var idTimePick = 'idTimePick';
  static var idBooking = 'idBooking';
  static var idUpdate = 'idUpdate';
  static var idUpdateButton = 'idUpdateButton';
  static var idUpdateSlots = 'idUpdateSlots';
  static var idUpdateSlots0 = 'idUpdateSlots0';
  static var idVerification = 'idVerification';
  static var idChangeNumber = 'idChangeNumber';
  static var idCheckMobile = 'idCheckMobile';
  static var idBookingAndLogin = 'idBookingAndLogin';
  static var idProgressView = 'idProgressView';
  static var idRemember = 'idRemember';
  static var idExpertDetail = 'idExpertDetail';
  static var idUserReview = 'idUserReview';
  static var idSearchService = 'idSearchService';
  static var idHomeService = 'idHomeService';
  static var idOnChangeTabBar = 'idOnChangeTabBar';
  static var idChangeTab = 'idChangeTab';
  static var idErrorText = 'idErrorText';
  static var idFirstNameError = 'idFirstNameError';
  static var idLastNameError = 'idLastNameError';
  static var idTabView = 'idTabView';
  static var idSelectedStar = 'idSelectedStar';
  static var idTimer = 'idTimer';
  static var idSpeakMic = 'idSpeakMic';
  static var idChangeGender = 'idChangeGender';
  static var idPickSalonImage = 'idPickSalonImage';
  static var idGetCountry = 'idGetCountry';

  //-----------------------------

  List<Step> stepper() {
    return [
      Step(
          isActive: bookingScreenController.currentStep >= 0,
          state: bookingScreenController.currentStep > 0 ? StepState.complete : StepState.indexed,
          label: Text(
            "txtStaff".tr,
            style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 16, color: AppColors.primaryTextColor),
          ),
          title: const SizedBox(),
          content: SizedBox(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                "txtChooseYourExpert".tr,
                style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 16, color: AppColors.primaryTextColor),
              ),
              SizedBox(height: Get.height * 0.02),
            ]),
          )),
      Step(
          state: bookingScreenController.currentStep > 1 ? StepState.complete : StepState.indexed,
          isActive: bookingScreenController.currentStep >= 1,
          label: Text(
            "txtDateTime".tr,
            style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 16, color: AppColors.primaryTextColor),
          ),
          title: const SizedBox(),
          content: Container(
            color: AppColors.yellowColor,
          )),
      Step(
          state: bookingScreenController.currentStep > 2 ? StepState.complete : StepState.indexed,
          isActive: bookingScreenController.currentStep >= 2,
          label: Text(
            "txtPayment".tr,
            style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 16, color: AppColors.primaryTextColor),
          ),
          title: const SizedBox(),
          content: Container(
            color: AppColors.buttonColor,
          ))
    ];
  }

  // static const PAYMENT_METHOD_inAppPurchase = 'inAppPurchase';
  static const paymentMethodStripe = 'stripe';
  static const paymentMethodRazorPay = 'razorpay';

  static List countryList = [
    {"country": "Arabic (العربية)", "image": AppAsset.imPakistan, "id": "1"},
    {"country": "Bengali (বাংলা)", "image": AppAsset.imIndia, "id": "2"},
    {"country": "Chinese Simplified (中国人)", "image": AppAsset.imChinese, "id": "3"},
    {"country": "English (English)", "image": AppAsset.imEnglish, "id": "4"},
    {"country": "French (français)", "image": AppAsset.imFrench, "id": "5"},
    {"country": "German (Deutsche)", "image": AppAsset.imGerman, "id": "6"},
    {"country": "Hindi (हिंदी)", "image": AppAsset.imIndia, "id": "7"},
    {"country": "Italian (italiana)", "image": AppAsset.imItalian, "id": "8"},
    {"country": "Indonesian (bahasa indo)", "image": AppAsset.imIndonesian, "id": "9"},
    {"country": "Korean (한국인)", "image": AppAsset.imKorean, "id": "10"},
    {"country": "Portuguese (português)", "image": AppAsset.imPortuguese, "id": "11"},
    {"country": "Russian (русский)", "image": AppAsset.imRussian, "id": "12"},
    {"country": "Spanish (Español)", "image": AppAsset.imSpanish, "id": "13"},
    {"country": "Swahili (Kiswahili)", "image": AppAsset.imSwahili, "id": "14"},
    {"country": "Turkish (Türk)", "image": AppAsset.imTurkish, "id": "15"},
    {"country": "Telugu (తెలుగు)", "image": AppAsset.imIndia, "id": "16"},
    {"country": "Tamil (தமிழ்)", "image": AppAsset.imIndia, "id": "17"},
    {"country": "(اردو) Urdu", "image": AppAsset.imPakistan, "id": "18"},
  ];

  static List<BoxShadow>? boxShadow = [
    BoxShadow(
      color: AppColors.blackColor.withOpacity(0.02),
      offset: const Offset(
        0.0,
        1.0,
      ),
      blurRadius: 5.0,
      spreadRadius: 2.0,
    ), //BoxShadow
    const BoxShadow(
      color: Colors.black12,
      offset: Offset(0.0, 0.0),
      blurRadius: 0.0,
      spreadRadius: 0.0,
    ),
  ];
}
