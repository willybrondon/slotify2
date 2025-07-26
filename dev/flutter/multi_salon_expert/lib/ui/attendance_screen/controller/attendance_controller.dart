import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:month_picker_dialog/month_picker_dialog.dart';
import 'package:salon_2/ui/attendance_screen/model/attendance_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class AttendanceController extends GetxController {
  String? selectedDate = DateFormat('yyyy-MM').format(DateTime.now());
  RxBool isLoading = false.obs;
  GetAttendanceMonthModel? getAttendanceMonthModel;

  @override
  void onInit() {
    getAttendanceMonthWise(expertId: Constant.storage.read<String>("expertId").toString(), month: selectedDate ?? '');
    update([Constant.idAttendanceDetails, Constant.idProgressView]);

    super.onInit();
  }

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
        await getAttendanceMonthWise(expertId: Constant.storage.read<String>("expertId").toString(), month: selectedDate ?? '');
        log("Selected Date for Attendance :: $selectedDate");
        update([Constant.idAttendanceDetails, Constant.idProgressView]);
      }
    });
  }

  getAttendanceMonthWise({required String expertId, required String month}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"expertId": expertId, "month": month};

      log("Get Attendance Month Wise Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getAttendance + queryString);
      log("Get Attendance Month Wise Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get Attendance Month Wise Code :: ${response.statusCode}");
      log("Get Attendance Month Wise Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        log("Get Attendance Month Wise jsonResponse :: $jsonResponse");
        getAttendanceMonthModel = GetAttendanceMonthModel.fromJson(jsonResponse);
        log("Get Attendance Month Wise SuccessFully..!");
      }
    } on AppException catch (exception) {
      isLoading(false);
      update([Constant.idProgressView]);

      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      isLoading(false);
      update([Constant.idProgressView]);

      log("Error call Get Attendance Month Wise Api :: $e");
      Utils.showToast(Get.context!, 'Something went wrong!!');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
