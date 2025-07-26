import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/order_screen/model/get_order_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class OrderScreenController extends GetxController {
  @override
  void onInit() async {
    await onGetOrderApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      status: "All",
      start: "0",
      limit: "20",
    );
    super.onInit();
  }

  String onGetDate({required String date}) {
    String dateTimeString = date;
    String dateOnly = dateTimeString.split(',')[0];
    return dateOnly;
  }

  onRefresh() async {
    await onGetOrderApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      status: "All",
      start: "0",
      limit: "20",
    );
  }

  //----------- API Variables -----------//
  GetOrderModel? getOrderModel;
  RxBool isLoading = false.obs;

  onGetOrderApiCall({
    required String userId,
    required String status,
    required String start,
    required String limit,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
        "status": status,
        "start": start,
        "limit": limit,
      };

      log("Get Order Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getOrder + queryString);
      log("Get Order Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get Order Status Code :: ${response.statusCode}");
      log("Get Order Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getOrderModel = GetOrderModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Order Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
