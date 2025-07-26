import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:month_picker_dialog/month_picker_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/history_screen/model/get_wallet_history_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';

class HistoryScreenController extends GetxController {
  String selectedMonth = DateFormat('yyyy-MM').format(DateTime.now());

  @override
  void onInit() async {
    await onGetWalletHistoryApiCall(
      expertId: Constant.storage.read<String>('expertId') ?? "",
      month: selectedMonth,
    );
    super.onInit();
  }

  onClickMonth() {
    showMonthPicker(
      context: Get.context!,
      initialDate: DateTime.now(),
      lastDate: DateTime.now(),
      monthPickerDialogSettings: MonthPickerDialogSettings(
        dateButtonsSettings: PickerDateButtonsSettings(
          currentMonthTextColor: AppColors.primaryAppColor,
          unselectedMonthsTextColor: AppColors.primaryAppColor,
          selectedMonthBackgroundColor: AppColors.primaryAppColor,
        ),
        headerSettings: PickerHeaderSettings(
          headerBackgroundColor: AppColors.primaryAppColor,
        ),
        dialogSettings: PickerDialogSettings(
          dialogBackgroundColor: AppColors.whiteColor,
          dialogRoundedCornersRadius: 16,
        ),
        actionBarSettings: PickerActionBarSettings(
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
      ),
    ).then(
      (date) async {
        if (date != null) {
          selectedMonth = DateFormat('yyyy-MM').format(date);

          await onGetWalletHistoryApiCall(
            expertId: Constant.storage.read<String>('expertId') ?? "",
            month: selectedMonth,
          );

          log("Selected Month for History :: $selectedMonth");
          update([Constant.idSelectMonth]);
        }
      },
    );
  }

  //----------- API Variables -----------//
  GetWalletHistoryModel? getWalletHistoryModel;
  RxBool isLoading = false.obs;

  onGetWalletHistoryApiCall({required String expertId, required String month}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "expertId": expertId,
        "month": month,
      };

      log("Get Wallet History Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getWalletHistory + queryString);
      log("Get Wallet History Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get Wallet History Status Code :: ${response.statusCode}");
      log("Get Wallet History Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getWalletHistoryModel = GetWalletHistoryModel.fromJson(jsonResponse);

        earning = getWalletHistoryModel?.total.toString() ?? "0.0";
        log("Wallet Amount :: $earning");
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Wallet History Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
