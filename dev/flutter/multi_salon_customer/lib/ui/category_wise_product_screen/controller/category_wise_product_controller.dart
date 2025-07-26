import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/category_wise_product_screen/model/get_category_wise_product_model.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';

class CategoryWiseProductController extends GetxController {
  dynamic args = Get.arguments;
  String? categoryId;
  List<bool> isCategoryWiseProductSaved = [];

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();

  @override
  void onInit() async {
    await getDataFromArgs();
    await onGetCategoryWiseProductApiCall(categoryId: categoryId ?? "");

    for (int i = 0; i < (getCategoryWiseProductModel?.data?.length ?? 0); i++) {
      isCategoryWiseProductSaved.add(getCategoryWiseProductModel?.data?[i].isFavorite ?? false);
    }

    log("isCategoryWiseProductSaved :: $isCategoryWiseProductSaved");

    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        categoryId = args[0];
      }
      log("Category ID :: $categoryId");
    }
  }

  onCategoryWiseProductSaved({
    required String userId,
    required String productId,
    required String categoryId,
  }) async {
    await homeScreenController.onFavouriteProductCall(
      userId: userId,
      productId: productId,
      categoryId: categoryId,
    );

    if (homeScreenController.favouriteProductModel?.status == true) {
      if (homeScreenController.favouriteProductModel?.isFavourite == true) {
        Utils.showToast(Get.context!, "Product saved successfully");

        int? index = getCategoryWiseProductModel?.data?.indexWhere((element) => element.id == productId);
        if (index != null) {
          isCategoryWiseProductSaved[index] = true;
        }
      } else {
        int? index = getCategoryWiseProductModel?.data?.indexWhere((element) => element.id == productId);
        if (index != null) {
          isCategoryWiseProductSaved[index] = false;
        }
      }
    } else {
      Utils.showToast(Get.context!, homeScreenController.favouriteProductModel?.message ?? "");
    }

    update([Constant.idProductSaved, Constant.idProgressView]);
  }

  //----------- API Variables -----------//
  GetCategoryWiseProductModel? getCategoryWiseProductModel;
  RxBool isLoading = false.obs;

  onGetCategoryWiseProductApiCall({required String categoryId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"categoryId": categoryId};

      String queryString = Uri(queryParameters: queryParameters).query;

      log("Get Category Wise Product Params :: $queryParameters");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getCategoryWiseProduct + queryString);

      log("Get Category Wise Product Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Category Wise Product Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Category Wise Product StatusCode :: ${response.statusCode}");
      log("Get Category Wise Product Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getCategoryWiseProductModel = GetCategoryWiseProductModel.fromJson(jsonResponse);
      }

      log("Get Category Wise Product Api Called Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Category Wise Product Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
