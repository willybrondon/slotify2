import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:month_picker_dialog/month_picker_dialog.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class HistoryScreenController extends GetxController {
  String selectedMonth = DateFormat('yyyy-MM').format(DateTime.now());
  WalletScreenController walletScreenController = Get.find<WalletScreenController>();

  onClickMonth() {
    showMonthPicker(
      context: Get.context!,
      initialDate: DateTime.now(),
      lastDate: DateTime.now(),
      monthPickerDialogSettings: MonthPickerDialogSettings(
        actionBarSettings: PickerActionBarSettings(
          // currentMonthTextColor: AppColors.primaryAppColor,
          // unselectedMonthsTextColor: AppColors.primaryAppColor,
          // selectedMonthBackgroundColor: AppColors.primaryAppColor,
          confirmWidget: Text(
            "Confirm",
            style: TextStyle(
              fontSize: 11,
              color: AppColors.primaryAppColor,
              fontFamily: AppFontFamily.heeBo600,
            ),
          ),
          cancelWidget: Text(
            "Cancel",
            style: TextStyle(
              fontSize: 11,
              color: AppColors.primaryAppColor,
              fontFamily: AppFontFamily.heeBo600,
            ),
          ),
        ),
        headerSettings: PickerHeaderSettings(
          headerBackgroundColor: AppColors.primaryAppColor,
        ),
        dialogSettings: PickerDialogSettings(
          dialogBackgroundColor: AppColors.whiteColor,
          dialogRoundedCornersRadius: 16,
        ),
      ),

    ).then(
      (date) async {
        if (date != null) {
          selectedMonth = DateFormat('yyyy-MM').format(date);

          await walletScreenController.onGetWalletHistoryApiCall(
            userId: Constant.storage.read<String>('userId') ?? "",
            month: selectedMonth,
          );

          log("Selected Month for History :: $selectedMonth");
          update([Constant.idSelectMonth]);
        }
      },
    );
  }
}
