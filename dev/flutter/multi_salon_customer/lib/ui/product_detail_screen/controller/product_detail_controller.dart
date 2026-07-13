import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/product_detail_screen/model/add_cart_model.dart';
import 'package:salon_2/ui/product_detail_screen/model/get_product_detail_model.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
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

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.find<SplashController>();

  bool salonAcceptsStripe() {
    final globalStripe =
        splashController.settingCategory?.setting?.isStripePay == true;
    final productStripeEnabled =
        splashController.settingCategory?.setting?.isProductStripePay != false;
    return globalStripe &&
        productStripeEnabled &&
        getProductDetailModel?.product?.salon?.paymentOptions?.acceptStripe ==
            true;
  }

  int computeSubTotal() {
    final price = getProductDetailModel?.product?.price ?? 0;
    return (price * quantity).round();
  }

  @override
  void onInit() async {
    await getDataFromArgs();

    await loadProduct(productId ?? "");

    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        productId = args[0];
      }
    }
  }

  List<Attribute> get _requiredAttributes {
    final attrs = getProductDetailModel?.product?.attributes ?? [];
    return attrs
        .where((a) => (a.name?.trim().isNotEmpty ?? false) && (a.value?.isNotEmpty ?? false))
        .toList();
  }

  bool canProceedToCheckout() {
    final required = _requiredAttributes;
    if (required.isEmpty) return true;
    for (final attr in required) {
      final name = attr.name ?? '';
      if (name.isEmpty) continue;
      if (!(selectedValuesByName[name]?.isNotEmpty ?? false)) {
        return false;
      }
    }
    return true;
  }

  int computeOrderTotal() {
    final price = getProductDetailModel?.product?.price ?? 0;
    final shipping = getProductDetailModel?.product?.shippingCharges ?? 0;
    return ((price * quantity) + shipping).round();
  }

  void resetProductState() {
    quantity = 1;
    selectProductSize = -1;
    attributes.clear();
    selectedValuesByName = <String, List<String>>{};
    selectedIdsByName = <String, List<String>>{};
    addCartModel?.status = false;
    rating = null;
    roundedRating = null;
    filledStars = null;
  }

  Future<void> loadProduct(String id) async {
    if (id.isEmpty) return;
    productId = id;
    resetProductState();
    await onGetProductDetailApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      productId: id,
    );
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

  List<Map<String, dynamic>> buildAttributesArray() {
    final result = <Map<String, dynamic>>[];
    selectedValuesByName.forEach((key, values) {
      final ids = selectedIdsByName[key] ?? [];
      for (int i = 0; i < values.length; i++) {
        result.add({
          'name': key,
          'value': values[i],
          '_id': ids.length > i ? ids[i] : "",
        });
      }
    });
    return result;
  }

  onAddCartClick() async {
    if (!canProceedToCheckout()) {
      Utils.showToast(Get.context!, "desPleaseSelectProductOptions".tr);
      return;
    }

    attributes = buildAttributesArray();
    log("Selected Attribute: $attributes");

    await onAddCartProductApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      productId: productId ?? "",
      productQuantity: quantity.toString(),
      attributesArray: attributes,
    );

    if (addCartModel?.status == true) {
      Utils.showToast(Get.context!, addCartModel?.message ?? "");
    } else {
      Utils.showToast(Get.context!, addCartModel?.message ?? "desErrorProcessingPayment".tr);
    }
  }

  onContinueClick() {
    if (!canProceedToCheckout()) {
      Utils.showToast(Get.context!, "desPleaseSelectProductOptions".tr);
      return;
    }

    attributes = buildAttributesArray();
    log("Selected Attribute: $attributes");

    final finalTotal = computeOrderTotal();
    log("Without cart final total: $finalTotal");

    Get.toNamed(
      AppRoutes.selectAddress,
      arguments: [
        finalTotal.toString(),
        getProductDetailModel?.product?.id,
        quantity,
        attributes,
        true,
        getProductDetailModel?.product?.salon?.id,
        salonAcceptsStripe(),
        computeSubTotal(),
        getProductDetailModel?.product?.salon?.name ?? '',
      ],
    );
  }

  Future<void> onToggleFavourite() async {
    final categoryId = getProductDetailModel?.product?.category?.id;
    final pid = getProductDetailModel?.product?.id;
    if (categoryId == null || pid == null) return;

    await homeScreenController.onFavouriteProductCall(
      userId: Constant.storage.read<String>('userId') ?? '',
      productId: pid,
      categoryId: categoryId,
    );

    if (homeScreenController.favouriteProductModel?.status == true) {
      final isFav =
          homeScreenController.favouriteProductModel?.isFavourite == true;
      getProductDetailModel?.product?.isFavourite = isFav;
      if (isFav) {
        Utils.showToast(Get.context!, "desProductSavedSuccess".tr);
      }
      update([Constant.idProgressView]);
    } else {
      Utils.showToast(
        Get.context!,
        homeScreenController.favouriteProductModel?.message ?? "",
      );
    }
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
