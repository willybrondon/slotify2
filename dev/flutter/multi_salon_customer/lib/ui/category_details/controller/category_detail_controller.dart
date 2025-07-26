import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/category_details/model/get_service_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class CategoryDetailController extends GetxController {
  List checkItem = [];
  List priceList = [];
  List serviceId = [];
  List serviceName = [];
  int selectIndex = -1;
  num totalMinute = 0;

  late List<bool> isCategorySelected = List.generate((getServiceCategory?.services?.length ?? 0), (index) => false);
  TextEditingController categoryDetailEditingController = TextEditingController();
  String? categoryId;
  String? categoryName;
  dynamic args = Get.arguments;

  //----------- API Variables -----------//
  GetServiceModel? getServiceCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    log("Enter in category detail controller");

    await getDataFromArgs();
    await onGetServiceApiCall(categoryId: categoryId ?? "");

    totalMinute = 0;
    checkItem.clear();
    serviceId.clear();
    serviceName.clear();

    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        categoryId = args[0];
      }
      if (args[1] != null) {
        categoryName = args[1];
      }
    }
  }

  onCheckBoxClick(value, int index) {
    isCategorySelected[index] = value;

    if (isCategorySelected[index]) {
      totalMinute += getServiceCategory?.services?[index].duration ?? 0;
      checkItem.add(getServiceCategory?.services?[index].name);
      serviceId.add(getServiceCategory?.services?[index].id);
      serviceName.add(getServiceCategory?.services?[index].name);

      log("Category add Total Minute :: $totalMinute");
      log("Category add Check Item :: $checkItem");
      log("Category add Service Id :: $serviceId");
      log("Category add Service Name :: $serviceName");
    } else {
      totalMinute -= getServiceCategory?.services?[index].duration ?? 0;
      checkItem.remove(getServiceCategory?.services?[index].name);
      serviceId.remove(getServiceCategory?.services?[index].id);
      serviceName.remove(getServiceCategory?.services?[index].name);

      log("Category Minus Total Minute :: $totalMinute");
      log("Category Minus Check Item :: $checkItem");
      log("Category Minus Service Id :: $serviceId");
      log("Category Minus Service Name :: $serviceName");
    }

    update([Constant.idServiceList, Constant.idBottomService]);
  }

  //------------ API Services ------------//

  onGetServiceApiCall({required String categoryId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idServiceList]);

      final queryParameters = {
        "categoryId": categoryId,
      };

      log("Category Id :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getService + queryString);

      log("Get Service Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Service Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Service StatusCode :: ${response.statusCode}");
      log("Get Service Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getServiceCategory = GetServiceModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Service Api :: $e");
      Utils.showToast(Get.context!, getServiceCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idServiceList]);
    }
  }
}
