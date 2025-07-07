import 'dart:convert';
import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'package:month_picker_dialog/month_picker_dialog.dart';
import 'package:salon_2/ui/revenue_detail/model/payment_history_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class RevenueDetailController extends GetxController {
  String? selectedDate = DateFormat('yyyy-MM').format(DateTime.now());

  String selectedDates = '';
  String dateCount = '';
  String range = '';
  String rangeCount = '';
  String startDateFormatted = '';
  String endDateFormatted = '';

  //----------- API Variables -----------//
  PaymentHistoryModel? paymentHistoryCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    await onPaymentHistoryApiCall(
      expertId: Constant.storage.read<String>("expertId").toString(),
      startDate: 'ALL',
      endDate: 'ALL',
    );
    super.onInit();
  }

  onClickMonth() {
    showMonthPicker(
      context: Get.context!,
      backgroundColor: AppColors.whiteColor,
      headerColor: AppColors.primaryAppColor,
      roundedCornersRadius: 16,
      unselectedMonthTextColor: AppColors.primaryAppColor,
      selectedMonthBackgroundColor: AppColors.primaryAppColor,
      confirmWidget:
          Text("Confirm", style: TextStyle(color: AppColors.primaryAppColor)),
      cancelWidget: Text("Cancel", style: TextStyle(color: AppColors.primaryAppColor)),
      initialDate: DateTime.now(),
    ).then((date) async {
      if (date != null) {
        selectedDate = DateFormat('yyyy-MM').format(date);
        await onPaymentHistoryApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(),
          startDate: startDateFormatted,
          endDate: endDateFormatted,
        );

        log("Selected Date For Revenue Detail :: $selectedDate");
        update();
      }
    });
  }

  onPaymentHistoryApiCall(
      {required String expertId,
      required String startDate,
      required String endDate}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "expertId": expertId,
        "startDate": startDate,
        "endDate": endDate,
      };

      log("Payment History Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          "${ApiConstant.BASE_URL}${ApiConstant.paymentHistory}$queryString");
      log("Payment History Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Payment History Status Code :: ${response.statusCode}");
      log("Payment History Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        paymentHistoryCategory = PaymentHistoryModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Payment History Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
