import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/product_detail_screen/model/add_cart_model.dart';
import 'package:salon_2/ui/product_detail_screen/model/get_product_detail_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class ProductDetailController extends GetxController {
  dynamic args = Get.arguments;

  int selectProductSize = -1;
  int quantity = 1;
  String? productId;

  num? rating;
  int? roundedRating;
  int? filledStars;

  Map<String, List<String>> selectedValuesByName = <String, List<String>>{};
  Map<String, List<String>> selectedIdsByName = <String, List<String>>{};
  List<Map<String, dynamic>> attributes = [];

  @override
  void onInit() async {
    await getDataFromArgs();

    await onGetProductDetailApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      productId: productId ?? "",
    );

    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        productId = args[0];
      }
    }
  }

  void onAttributeSelect(String value, String type, String id) {
    if (selectedValuesByName[type]?.contains(value) ?? false) {
      selectedValuesByName[type]?.remove(value);
      selectedIdsByName[type]?.remove(id);
    } else {
      selectedValuesByName[type] = <String>[value];
      selectedIdsByName[type] = <String>[id];
    }

    update([Constant.idSelectProductSize, Constant.idProgressView]);
  }

  bool isAnyAttributeSelected() {
    return selectedValuesByName.values.any((selectedValues) => selectedValues.isNotEmpty);
  }

  void incrementQuantity() {
    quantity++;
    log("Quantity: $quantity");
    update([Constant.idIncrementQuantity, Constant.idDecrementQuantity]);
  }

  void decrementQuantity() {
    if (quantity > 1) {
      quantity--;
      log("Quantity: $quantity");
      update([Constant.idIncrementQuantity, Constant.idDecrementQuantity]);
    }
  }

  onAddCartClick() async {
    attributes.clear();

    selectedValuesByName.forEach((key, values) {
      List<String> ids = selectedIdsByName[key] ?? [];

      for (int i = 0; i < values.length; i++) {
        Map<String, dynamic> attribute = {
          'name': key,
          'value': values[i],
          '_id': ids.isNotEmpty ? ids[i] : "",
        };
        attributes.add(attribute);
      }
    });

    log("Selected Attribute: $attributes");

    if (attributes.isNotEmpty) {
      await onAddCartProductApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        productId: productId ?? "",
        productQuantity: quantity.toString(),
        attributesArray: attributes,
      );

      Utils.showToast(Get.context!, addCartModel?.message ?? "");
    }
  }

  onContinueClick() {
    attributes.clear();

    selectedValuesByName.forEach((key, values) {
      List<String> ids = selectedIdsByName[key] ?? [];

      for (int i = 0; i < values.length; i++) {
        Map<String, dynamic> attribute = {
          'name': key,
          'value': values[i],
          '_id': ids.isNotEmpty ? ids[i] : "",
        };
        attributes.add(attribute);
      }
    });

    log("Selected Attribute: $attributes");

    num finalTotal = (getProductDetailModel?.product?.price ?? 0) + (getProductDetailModel?.product?.shippingCharges ?? 0);
    log("WithOut cart final total: $finalTotal");

    Get.toNamed(
      AppRoutes.selectAddress,
      arguments: [
        finalTotal.toStringAsFixed(1),
        getProductDetailModel?.product?.id,
        quantity,
        attributes,
        true,
      ],
    );
  }

  onBackFromCart() {
    addCartModel?.status = false;
    attributes.clear();
    selectedValuesByName = <String, List<String>>{};
    selectedIdsByName = <String, List<String>>{};

    update([Constant.idSelectProductSize]);
  }

  //----------- API Variables -----------//
  GetProductDetailModel? getProductDetailModel;
  AddCartModel? addCartModel;
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  onGetProductDetailApiCall({required String userId, required String productId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idSelectProductSize]);

      final queryParameters = {"userId": userId, "productId": productId};

      log("Get Product Detail Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getProductDetail + queryString);
      log("Get Product Detail Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Product Detail Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Product Detail Status Code :: ${response.statusCode}");
      log("Get Product Detail Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getProductDetailModel = GetProductDetailModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Product Detail Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idSelectProductSize]);
    }
  }

  onAddCartProductApiCall({
    required String userId,
    required String productId,
    required String productQuantity,
    required List<Map<String, dynamic>> attributesArray,
  }) async {
    try {
      isLoading1(true);
      update([Constant.idProgressView, Constant.idSelectProductSize]);

      final body = json.encode({
        "userId": userId,
        "productId": productId,
        "productQuantity": productQuantity,
        "attributesArray": attributesArray,
      });

      log("Add Cart Product Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.addCartProduct);
      log("Add Cart Product Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Add Cart Product Headers :: $headers");

      final response = await http.post(url, headers: headers, body: body);

      log("Add Cart Product Status Code :: ${response.statusCode}");
      log("Add Cart Product Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        addCartModel = AddCartModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Add Cart Product Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading1(false);
      update([Constant.idProgressView, Constant.idSelectProductSize]);
    }
  }
}
