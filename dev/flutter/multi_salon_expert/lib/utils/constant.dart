import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class Constant {
  static const languageDefault = 'fr';
  static const countryCodeDefault = 'FR';
  /// @deprecated Use [languageDefault]
  static const languageEn = languageDefault;
  /// @deprecated Use [countryCodeDefault]
  static const countryCodeEn = countryCodeDefault;

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
    {"country": "Français", "image": AppAsset.imFrench, "id": "1"},
    {"country": "English", "image": AppAsset.imEnglish, "id": "2"},
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
