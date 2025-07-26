import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class Constant {
  static const languageEn = "en";
  static const countryCodeEn = "US";

  /// Add App Store Id
  static String appStoreId = ' ';

  /// =================== Shimmers =================== ///
  static Color baseColor = AppColors.stepperGrey.withOpacity(0.6);
  static Color highlightColor = Colors.grey.withOpacity(0.2);
  static Duration period = const Duration(milliseconds: 500);

  /// <<===================>> ****** Widget Id's for refresh in GetX ****** <<===================>>

  static var idBottomBar = 'idBottomBar';
  static var idRevenuePending = 'idRevenuePending';
  static var idRevenueTabBar = 'idRevenueTabBar';
  static var idPaymentReceive = 'idPaymentReceive';
  static var idCheckIn = 'idCheckIn';
  static var idCheckOut = 'idCheckOut';
  static var idChangeLanguage = 'idChangeLanguage';
  static var idPasswordVisible = 'idPasswordVisible';
  static var idProgressView = 'idProgressView';
  static var idCheckInUpdate = 'idCheckInUpdate';
  static var idOnChangeTabBar = 'idOnChangeTabBar';
  static var idMyEarnings = 'idOnChangeTabBar';
  static var idOrderReportTabView = 'idOrderReportTabView';
  static var idFullDayNotAvailable = 'idFullDayNotAvailable';
  static var idUpdateSlots = 'idUpdateSlots';
  static var idUpdateSlots0 = 'idUpdateSlots0';
  static var idSelectPayment = 'idSelectPayment';
  static var idAttendanceDetails = 'idAttendanceDetails';
  static var idSwitchOn = 'idSwitchOn';
  static var idGetWithdrawMethods = 'idGetWithdrawMethods';
  static var idChangePaymentMethod = 'idChangePaymentMethod';
  static var idSwitchWithdrawMethod = 'idSwitchWithdrawMethod';
  static var idSelectMonth = 'idSelectMonth';

  // ----- GET STORAGE ----- //
  static final storage = GetStorage();

  //-----------------------------
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
