import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/cart_screen/model/delete_cart_product_model.dart';
import 'package:salon_2/ui/cart_screen/model/get_cart_product_model.dart';
import 'package:salon_2/ui/product_detail_screen/controller/product_detail_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';

class CartScreenController extends GetxController {
  int quantity = 1;

  List<int> quantityList = [];
  List<List<Map<String, String?>>>? attributes;
  ProductDetailController productDetailController = Get.find<ProductDetailController>();

  @override
  void onInit() async {
    await onGetCartProductApiCall();
    onGetAttributesItems();

    super.onInit();
  }

  void onGetAttributesItems() {
    final items = getCartProductModel?.data?.items ?? [];

    attributes = items
        .map(
          (item) {
            final attributesArray = item.attributesArray;
            return attributesArray?.map(
                  (attribute) {
                    return {
                      'name': attribute.name,
                      'value': attribute.value,
                      '_id': attribute.id,
                    };
                  },
                ).toList() ??
                [];
          },
        )
        .cast<List<Map<String, String?>>>()
        .toList();

    log("attributes -------------------- $attributes");
  }

  void onGetQuantity() {
    cartItemCount = getCartProductModel?.data?.items?.length ?? 0;
    log("Total Cart Item Count :: $cartItemCount");

    quantityList = List.generate((getCartProductModel?.data?.items?.length ?? 0),
        (index) => getCartProductModel?.data?.items?[index].productQuantity ?? 0);

    log("Product Wise Quantity List :: $quantityList");
  }

  void incrementQuantity(int index) async {
    quantityList[index] = quantityList[index] + 1;

    try {
      isLoading1(true);
      update([Constant.idProgressView, Constant.idIncrementQuantity, Constant.idDecrementQuantity]);

      await productDetailController.onAddCartProductApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        productId: getCartProductModel?.data?.items?[index].product?.id ?? "",
        productQuantity: "1",
        attributesArray: attributes?[index] ?? [],
      );
    } catch (e) {
      log("Error in add cart in cart list :: $e");
    } finally {
      isLoading1(false);
      update([Constant.idProgressView, Constant.idIncrementQuantity, Constant.idDecrementQuantity]);
    }

    if (productDetailController.addCartModel?.status == true) {
      await onGetCartProductApiCall();
    } else {
      Utils.showToast(Get.context!, productDetailController.addCartModel?.message ?? "");
    }

    update([Constant.idIncrementQuantity, Constant.idDecrementQuantity]);
  }

  void decrementQuantity(int index) async {
    if (quantityList[index] > 1) {
      quantityList[index] = quantityList[index] - 1;

      await onDeleteCartProductApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        productId: getCartProductModel?.data?.items?[index].product?.id ?? "",
        productQuantity: "1",
        attributesArray: attributes?[index] ?? [],
      );

      if (deleteCartProductModel?.status == true) {
        await onGetCartProductApiCall();
      } else {
        Utils.showToast(Get.context!, deleteCartProductModel?.message ?? "");
      }

      update([Constant.idIncrementQuantity, Constant.idDecrementQuantity, Constant.idProgressView]);
    }
  }

  onDeleteProduct({
    required String userId,
    required String productId,
    required String productQuantity,
    required List<Map<String, dynamic>> attributesArray,
  }) async {
    await onDeleteCartProductApiCall(
      userId: userId,
      productId: productId,
      productQuantity: productQuantity,
      attributesArray: attributesArray,
    );

    if (deleteCartProductModel?.status == true) {
      Utils.showToast(Get.context!, deleteCartProductModel?.message ?? "");
      await onGetCartProductApiCall();
    } else {
      Utils.showToast(Get.context!, deleteCartProductModel?.message ?? "");
    }
  }

  //----------- API Variables -----------//
  GetCartProductModel? getCartProductModel;
  DeleteCartProductModel? deleteCartProductModel;
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  onGetCartProductApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"userId": Constant.storage.read<String>('userId') ?? ""};

      log("Get Cart Product Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getCartProduct + queryString);
      log("Get Cart Product Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Cart Product Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Cart Product Status Code :: ${response.statusCode}");
      log("  Get Cart Product Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getCartProductModel = GetCartProductModel.fromJson(jsonResponse);

        onGetQuantity();
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Cart Product Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onDeleteCartProductApiCall({
    required String userId,
    required String productId,
    required String productQuantity,
    required List<Map<String, dynamic>> attributesArray,
  }) async {
    try {
      isLoading1(true);
      update([Constant.idProgressView, Constant.idIncrementQuantity, Constant.idDecrementQuantity]);

      final body = json.encode({
        "userId": userId,
        "productId": productId,
        "productQuantity": productQuantity,
        "attributesArray": attributesArray,
      });

      log("Delete Cart Product Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.deleteCartProduct);
      log("Delete Cart Product Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Delete Cart Product Headers :: $headers");

      final response = await http.patch(url, headers: headers, body: body);

      log("Delete Cart Product Status Code :: ${response.statusCode}");
      log("Delete Cart Product Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        deleteCartProductModel = DeleteCartProductModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Delete Cart Product Api :: $e");
    } finally {
      isLoading1(false);
      update([Constant.idProgressView, Constant.idIncrementQuantity, Constant.idDecrementQuantity]);
    }
  }
}
