import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/search_product_screen/model/get_search_product_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class SearchProductController extends GetxController {
  TextEditingController searchEditingController = TextEditingController();

  @override
  void onInit() async {
    await onGetSearchProductApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      searchString: "",
    );
    super.onInit();
  }

  void printLatestValue(String? text) async {
    await onGetSearchProductApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      searchString: text ?? "",
    );
  }

  //----------- API Variables -----------//
  GetSearchProductModel? getSearchProductModel;
  RxBool isLoading = false.obs;

  onGetSearchProductApiCall({required String userId, required String searchString}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"userId": userId, "searchString": searchString};

      log("Get Search Product Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getSearchProduct + queryString);

      log("Get Search Product Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Search Product Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Search Product StatusCode :: ${response.statusCode}");
      log("Get Search Product Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getSearchProductModel = GetSearchProductModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Search Product Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idSearchService, Constant.idServiceList]);
    }
  }
}
