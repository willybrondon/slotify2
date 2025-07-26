import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/order_report/order_detail/model/get_booking_status_wise_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';

class OrderReportController extends GetxController with GetTickerProviderStateMixin {
  TabController? tabController;
  int? index;
  GetBookingStatusWiseModel? getBookingStatusWiseCategory;
  RxBool isLoading = false.obs;

  @override
  Future<void> onInit() async {
    tabController = TabController(length: 4, vsync: this);
    await onGetBookingStatusWiseApiCall(
        expertId: Constant.storage.read<String>("expertId").toString(), status: "ALL", type: "Today");
    tabController?.addListener(() {
      isLoading(true);
      update([Constant.idProgressView]);

      index = tabController!.index;

      onChangeTabBar(tabController!.index);
      log("Selected Index: ${tabController!.index}");
    });
    super.onInit();
  }

  onChangeTabBar(int index) async {
    isLoading(true);
    update([Constant.idProgressView]);
    if (index == 0) {
      await onGetBookingStatusWiseApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(), status: "ALL", type: "Today");
    }
    if (index == 1) {
      await onGetBookingStatusWiseApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(), status: "ALL", type: "Yesterday");
    }
    if (index == 2) {
      await onGetBookingStatusWiseApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(), status: "ALL", type: "Week");
    }
    if (index == 3) {
      await onGetBookingStatusWiseApiCall(
          expertId: Constant.storage.read<String>("expertId").toString(), status: "ALL", type: "Month");
    }
    update([Constant.idOrderReportTabView]);
  }

  onGetBookingStatusWiseApiCall(
      {required String expertId, required String status, required String type}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "expertId": expertId,
        "status": status,
        "type": type,
      };

      log("Get Status Wise Booking Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.bookingTypeStatusWise + queryString);

      log("Get Status Wise Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Status Wise Booking Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Status Wise Booking StatusCode :: ${response.statusCode}");
      log("Get Status Wise Booking Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getBookingStatusWiseCategory = GetBookingStatusWiseModel.fromJson(jsonResponse);
      }
      log("Get Status Wise Booking Api Called SuccessFully");
    } on AppException {
      isLoading(false);
      update([Constant.idProgressView]);
    } catch (e) {
      isLoading(false);
      update([Constant.idProgressView]);

      log("Error call Get Status Wise Booking Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
