import 'package:flutter/material.dart';

/// Palette Skedisy — 4 couleurs : blanc, noir, terracotta, gris clair.
/// Alignée salonportal web (`--sk-*`). Ne pas dupliquer les hex ailleurs.
class AppColors {
  // —— Brand core ——
  static const Color brandTerracotta = Color(0xFFC45C26);
  static const Color brandTerracottaHover = Color(0xFFA84D1F);
  static const Color brandTerracottaLight = Color(0xFFFDF6F0);
  static const Color brandTerracottaSoft = Color(0xFFF5E8DE);
  static const Color brandBlack = Color(0xFF111111);
  static const Color brandWhite = Color(0xFFFFFFFF);
  static const Color brandGrayLight = Color(0xFFF2F2F2);
  static const Color brandGrayMuted = Color(0xFF9A9A9A);

  static const Color shareLookPageBg = brandTerracottaLight;

  // —— Semantic (UI) ——
  static Color iconAccent = brandTerracotta;
  static Color primaryAppColor = brandBlack;
  static Color primaryTextColor = brandBlack;
  static Color appText = brandBlack;
  static Color backGround = brandWhite;
  static Color whiteColor = brandWhite;
  static Color blackColor = brandBlack;
  static Color blackColor1 = brandBlack;
  static Color buttonColor = brandBlack;
  static Color directionBox = brandBlack;
  static Color callBox = brandBlack;

  /// Créneaux réservation : fond gris clair, sélection = bordure terracotta.
  static Color slotAvailableBg = brandGrayLight;
  static Color slotUnavailableBg = brandGrayLight;
  static Color slotSelectedBorder = brandTerracotta;
  static Color slotSelectedText = brandTerracotta;

  /// Date sélectionnée dans le calendrier.
  static Color dateSelect = brandTerracottaLight;

  static Color appointmentBg = const Color(0xff2C302E);
  static Color lineColor = const Color(0xffEFEFEF);
  static Color indicatorColor = const Color(0xffD9D9D9);
  static Color yellow2 = brandTerracottaLight;
  static Color green2 = brandTerracottaLight;
  static Color profileTitle = brandGrayMuted;
  static Color currency = brandBlack;
  static Color currencyGrey = const Color(0xffA5A5A5);
  static Color yellow = brandTerracotta;
  static Color detailBg = brandGrayLight;
  static Color category = brandBlack;
  static Color categoryService = brandBlack;
  static Color currencyBg = brandGrayLight;
  static Color serviceBgBorder = const Color(0xffF0F0F0);
  static Color paymentText = const Color(0xff52556A);
  static Color switchBox = brandGrayLight;
  static Color categoryBottom = brandWhite;
  static Color roundBg = brandGrayLight;
  static Color dialogBg = brandWhite;
  static Color captionDialog = brandGrayMuted;
  static Color stepper = brandGrayMuted;
  static Color amountGrey = brandGrayMuted;
  static Color productBg = brandGrayLight;
  static Color border = const Color(0xffFAFAFA);
  static Color bgTime = brandGrayLight;
  static Color bgCircle = const Color(0xffE9EBEB);
  static Color serviceBorder = brandGrayLight;
  static Color termsDialog = brandGrayMuted;
  static Color grey = brandGrayMuted;
  static Color service = brandGrayMuted;
  static Color tabUnSelect = brandGrayLight;
  static Color email = brandGrayMuted;
  static Color roundBorder = const Color(0xffC0C0C0);
  static Color subTitle = const Color(0xff646665);
  static Color textFiledBg = brandGrayLight;
  static Color toastBg = brandGrayLight;
  static Color toastText = brandBlack;
  static Color red = brandTerracottaLight;
  static Color blue = brandGrayLight;
  static Color bottom = brandGrayLight;
  static Color bottomIcon = brandGrayMuted;
  static Color slotSelect = brandTerracottaLight;
  static Color review = brandBlack;
  static Color purple = brandTerracottaLight;
  static Color purpleText = brandBlack;
  static Color slotText = const Color(0xff484E60);
  static Color buttonDialog = brandTerracotta;
  static Color cancelReason = brandGrayMuted;
  static Color selectSize = brandGrayLight;
  static Color cancelButton = brandTerracotta;
  static Color lightRedColor = brandTerracottaLight;
  static Color redButton = brandGrayLight;
  static Color greenButton = brandGrayLight;
  static Color textSlot = const Color(0xff484E60);
  static Color greyText = brandGrayMuted;
  static Color descriptionText = brandGrayMuted;
  static Color transparent = Colors.transparent;
  static Color bgColor = brandGrayLight.withOpacity(0.5);
  static Color oceanBlue = brandGrayLight;
  static Color yellowColor = brandTerracotta;
  static Color orangeBg = brandTerracottaLight;
  static Color orange = brandTerracotta;
  static Color yellow1 = brandTerracottaLight;
  static Color yellow3 = brandTerracotta;
  static Color sellerYellow = brandTerracotta;
  static Color ratingYellow = brandTerracotta;
  static Color quantityGrey = brandGrayMuted;
  static Color sellerBg = brandTerracottaLight;
  static Color darkGrey = brandGrayMuted;
  static Color darkGrey3 = brandGrayMuted;
  static Color darkGrey5 = brandGrayMuted;
  static Color textFieldBg = brandGrayLight;
  static Color stepperGrey = brandGrayMuted;
  static Color greyColor = brandGrayMuted;
  static Color buttonText = brandGrayMuted;
  static Color greyColor2 = const Color(0xff4F4F4F);
  static Color profileIconBg = brandGrayLight;
  static Color bgStepper = brandGrayMuted;
  static Color locationText = const Color(0xff48484C);
  static Color greyColor3 = const Color(0xffCBCBCB);
  static Color greenColor = brandTerracotta;
  static Color greenBox = brandTerracottaLight;
  static Color greenBg = brandTerracottaLight;
  static Color greenText = brandTerracotta;
  static Color redBg = brandTerracottaLight;
  static Color redText = brandTerracotta;
  static Color greenColorBg = brandTerracottaLight;
  static Color paymentSheetBg = brandGrayLight;
  static Color currencyBoxBg = brandGrayLight;
  static Color currencyRed = brandTerracotta;
  static Color ratingBlack = brandBlack;
  static Color reviewBg = brandGrayLight;
  static Color orderBg = brandTerracottaLight;
  static Color brandColor = brandGrayMuted;
  static Color qtyColor = brandGrayMuted;
  static Color orderColorBg = brandGrayLight;
  static Color arrowColor = brandGrayMuted;
  static Color divider = brandGrayLight;
  static Color confirmBookingBg = brandTerracottaLight;
  static Color paymentDes = brandWhite;
  static Color paymentDes1 = brandTerracottaLight;
  static Color couponBox = brandTerracottaSoft;
  static Color dateBox = brandTerracottaLight;

  static List<Color> colorList = [
    brandTerracottaLight,
    brandGrayLight,
    brandWhite,
    brandTerracottaSoft,
    brandGrayLight,
    brandTerracottaLight,
    brandWhite,
    brandTerracottaLight,
    brandGrayLight,
  ];
}
