import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/product_review_screen/model/post_product_review_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class ProductReviewController extends GetxController {
  dynamic args = Get.arguments;
  int selectedStarIndex = -1;

  String? brand;
  String? productName;
  String? mainImage;
  String? productId;
  num? itemsPurchasedTimeProductPrice;
  int? purchasedTimeProductPrice;
  num? purchasedTimeShippingCharges;
  num? purchasedTimeTotal;
  num? productQuantity;

  TextEditingController reviewEditingController = TextEditingController();

  @override
  void onInit() async {
    await getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null ||
          args[1] != null ||
          args[2] != null ||
          args[3] != null ||
          args[4] != null ||
          args[5] != null ||
          args[6] != null ||
          args[7] != null || args[8] != null) {
        brand = args[0];
        productName = args[1];
        mainImage = args[2];
        productId = args[3];
        itemsPurchasedTimeProductPrice = args[4];
        purchasedTimeProductPrice = args[5];
        purchasedTimeShippingCharges = args[6];
        purchasedTimeTotal = args[7];
        productQuantity = args[8];
      }
      log("Brand :: $brand");
      log("Product Name :: $productName");
      log("Main Image :: $mainImage");
      log("Product ID :: $productId");
      log("Items Purchased Time Product Price :: $itemsPurchasedTimeProductPrice");
      log("Purchased Time Product Price :: $purchasedTimeProductPrice");
      log("Purchased Time Shipping Charges :: $purchasedTimeShippingCharges");
      log("Purchased Time Total :: $purchasedTimeTotal");
      log("Product Quantity :: $productQuantity");
    }
    update([Constant.idProgressView]);
  }

  onSelectedStar(int index) {
    selectedStarIndex = index;
    update([Constant.idSelectedStar]);
  }

  onSubmitClick() async {
    if (selectedStarIndex == -1) {
      Utils.showToast(Get.context!, "Please select a star to submit review.");
    } else {
      await onPostProductReviewApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        productId: productId ?? "",
        rating: selectedStarIndex + 1,
        review: reviewEditingController.text,
      );

      if (postProductReviewModel?.status == true) {
        Utils.showToast(Get.context!, postProductReviewModel?.message ?? "");
        Get.back();
      } else {
        Utils.showToast(Get.context!, postProductReviewModel?.message ?? "");
      }
    }
  }

  //----------- API Variables -----------//
  PostProductReviewModel? postProductReviewModel;
  RxBool isLoading = false.obs;

  onPostProductReviewApiCall({
    required String userId,
    required String productId,
    required int rating,
    required String review,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({
        "userId": userId,
        "productId": productId,
        "rating": rating,
        "review": review,
      });

      log("Post Product Review Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.postProductReview);
      log("Post Product Review Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Post Product Review Status Code :: ${response.statusCode}");
      log("Post Product Review Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        postProductReviewModel = PostProductReviewModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Post Product Review Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
