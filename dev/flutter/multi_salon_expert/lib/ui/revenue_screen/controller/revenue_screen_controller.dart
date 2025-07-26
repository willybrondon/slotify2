import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/ui/revenue_screen/model/expert_attendance_model.dart';
import 'package:salon_2/ui/revenue_screen/model/get_expert_earning_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class RevenueScreenController extends GetxController {
  int selectedIndex = 0;
  int? index;
  String selectedDate = DateFormat('yyyy-MM').format(DateTime.now());

  //----------- API Variables -----------//
  GetExpertEarningModel? getExpertEarningCategory;
  ExpertAttendanceModel? expertAttendanceCategory;
  RxBool isLoading = false.obs;
  bool? isCheck;

  @override
  void onInit() async {
    await onGetExpertEarningCategory(
      expertId: Constant.storage.read<String>("expertId").toString(),
      status: "Today",
      month: selectedDate,
    );

    update([Constant.idRevenueTabBar, Constant.idMyEarnings, Constant.idProgressView]);
    super.onInit();
  }

  onSelectBooking(int index) async {
    selectedIndex = index;

    if (selectedIndex == 0) {
      await onGetExpertEarningCategory(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Today",
        month: selectedDate,
      );
    }
    if (selectedIndex == 1) {
      await onGetExpertEarningCategory(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Yesterday",
        month: selectedDate,
      );
    }
    if (selectedIndex == 2) {
      await onGetExpertEarningCategory(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Week",
        month: selectedDate,
      );
    }
    if (selectedIndex == 3) {
      await onGetExpertEarningCategory(
        expertId: Constant.storage.read<String>("expertId").toString(),
        status: "Month",
        month: selectedDate,
      );
    }

    update([Constant.idRevenueTabBar, Constant.idMyEarnings, Constant.idProgressView]);
  }

  onExpertAttendanceApiCall({required String expertId, required String action}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      update([Constant.idProgressView]);
      final queryParameters = {
        "expertId": expertId,
        "action": action,
      };

      log("Expert Attendance Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.expertAttendance + queryString);
      log("Expert Attendance Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers);

      log("Expert Attendance Status Code :: ${response.statusCode}");
      log("Expert Attendance Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        expertAttendanceCategory = ExpertAttendanceModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Expert Attendance Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onGetExpertEarningCategory({required String expertId, required String status, required String month}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"expertId": expertId, "type": status, "month": month};

      log("Get Expert Earning Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse("${ApiConstant.BASE_URL}${ApiConstant.getExpertEarning}$queryString");
      log("Get Expert Earning Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get Expert Earning Status Code :: ${response.statusCode}");
      log("Get Expert Earning Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getExpertEarningCategory = GetExpertEarningModel.fromJson(jsonResponse);
      }
      log("Get Expert Earning Api Call SuccessFully..!");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Expert Earning Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
