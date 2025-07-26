import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:month_picker_dialog/month_picker_dialog.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/revenue_screen/model/get_expert_earning_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class OrderSummaryController extends GetxController with GetTickerProviderStateMixin {
  TabController? tabController;
  RxBool isLoading = false.obs;
  GetExpertEarningModel? getOrderSummaryData;
  String? selectedDate = DateFormat('yyyy-MM').format(DateTime.now());

  BookingScreenController bookingScreenController = Get.put(BookingScreenController());

  @override
  void onInit() async {
    log("object");
    tabController = TabController(length: 4, vsync: this);
    await getOrderSummary(
      expertId: Constant.storage.read<String>("expertId").toString(),
      status: "Today",
      month: selectedDate ?? '',
    );
    tabController?.addListener(() {
      onChangeTabBar(tabController!.index);
      log("Selected Index: ${tabController!.index}");
    });
    super.onInit();
  }

  String? str;
  List? parts;
  String? date;
  String? time;

  onClickMonth() {
    showMonthPicker(
      context: Get.context!,
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
          confirmWidget: Text("Confirm", style: TextStyle(color: AppColors.primaryAppColor)),
          cancelWidget: Text("Cancel", style: TextStyle(color: AppColors.primaryAppColor)),
        ),
      ),
      initialDate: DateTime.now(),
      lastDate: DateTime.now(),
    ).then((date) async {
      if (date != null) {
        selectedDate = DateFormat('yyyy-MM').format(date);
        await getOrderSummary(
          expertId: Constant.storage.read<String>("expertId").toString(),
          status: "Month",
          month: selectedDate ?? '',
        );
        log("Selected Date for Order Summary :: $selectedDate");
        update([Constant.idAttendanceDetails, Constant.idProgressView]);
      }
    });
  }

  onChangeTabBar(int index) async {
    if (index == 0) {
      await getOrderSummary(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Today",
        month: selectedDate ?? '',
      );
    }
    if (index == 1) {
      await getOrderSummary(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Yesterday",
        month: selectedDate ?? '',
      );
    }
    if (index == 2) {
      await getOrderSummary(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Week",
        month: selectedDate ?? '',
      );
    }
    if (index == 3) {
      await getOrderSummary(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Month",
        month: selectedDate ?? '',
      );
    }
    log('On Change TabBar Index :: $index');
    update([Constant.idProgressView]);
  }

  getOrderSummary({required String expertId, required String status, required String month}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idCheckOut]);

      final queryParameters = {"expertId": expertId, "type": status, "month": month};

      log("Get Order Summary Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse("${ApiConstant.BASE_URL}${ApiConstant.getExpertEarning}$queryString");
      log("Get Order Summary Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get Order Summary Code :: ${response.statusCode}");
      log("Get Order Summary Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getOrderSummaryData = GetExpertEarningModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Expert Earning Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idCheckOut]);
    }
  }
}
