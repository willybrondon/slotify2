import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class SkedisyOtpPinTheme {
  const SkedisyOtpPinTheme._();

  static PinTheme defaultTheme({double cellSize = 48}) {
    return PinTheme(
      width: cellSize,
      height: cellSize + 4,
      textStyle: TextStyle(
        fontSize: 20,
        color: AppColors.brandBlack,
        fontWeight: FontWeight.w600,
        fontFamily: AppFontFamily.sfProDisplayBold,
      ),
      decoration: BoxDecoration(
        color: AppColors.brandGrayLight,
        border: Border.all(color: AppColors.lineColor),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  static PinTheme focusedTheme({double cellSize = 48}) {
    return PinTheme(
      width: cellSize,
      height: cellSize + 4,
      textStyle: TextStyle(
        fontSize: 20,
        color: AppColors.brandBlack,
        fontWeight: FontWeight.w600,
        fontFamily: AppFontFamily.sfProDisplayBold,
      ),
      decoration: BoxDecoration(
        color: AppColors.brandWhite,
        border: Border.all(color: AppColors.brandTerracotta, width: 1.5),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}
