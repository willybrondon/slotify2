import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/expert/expert_detail/model/get_review_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class ExpertDetailController extends GetxController {
  // List checkItem = [];
  // List serviceId = [];
  // List serviceName = [];
  // double totalPrice = 0.0;
  // int totalMinute = 0;
  // double? withTaxRupee;
  // double withOutTaxRupee = 0.0;
  // double finalTaxRupee = 0.0;

  String? id;
  int? index;
  num? review;

  num? rating;
  int? roundedRating;
  int? filledStars;

  //----------- API Variables -----------//
  GetReviewModel? getReviewCategory;
  RxBool isLoading = false.obs;

  //------ Split Time Variables ------//
  String? str;
  List? parts;
  String? date;
  String? time;

  dynamic args = Get.arguments;

  @override
  void onInit() async {
    await getDataFromArgs();

    // await onGetExpertApiCall();
    onGetReviewApiCall();

    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null || args[2] != null) {
        id = args[0];
        index = args[1];
        review = args[2];
      }
    }
  }

  //------------ API Services ------------//

  onGetReviewApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idUserReview]);

      final queryParameters = {"expertId": id};

      log("Get Review Params :: $queryParameters");
      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getReview + queryString);

      log("Get Review Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Review Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Review StatusCode :: ${response.statusCode}");
      log("Get Review Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getReviewCategory = GetReviewModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Review Api :: $e");
      Utils.showToast(Get.context!, getReviewCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idUserReview]);
    }
  }
}
