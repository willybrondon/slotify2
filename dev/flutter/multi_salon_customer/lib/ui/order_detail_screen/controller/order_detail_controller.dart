import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/order_detail_screen/model/cancel_order_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';
import 'package:url_launcher/url_launcher.dart';

class OrderDetailController extends GetxController {
  dynamic args = Get.arguments;
  dynamic orderData;
  dynamic items;

  int? purchasedTimeProductPrice;
  num? purchasedTimeTotal;
  num? cancelOrderAmount;

  @override
  void onInit() async {
    await getDataFromArgs();
    onGetPrice();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null) {
        items = args[0];
        orderData = args[1];
      }
      log("Order Data :: $orderData");
      log("Items :: $items");
    }
  }

  onGetPrice() {
    purchasedTimeProductPrice = ((items?.purchasedTimeProductPrice?.toInt() ?? 0) * (items?.productQuantity?.toInt() ?? 0));
    purchasedTimeTotal = ((items?.purchasedTimeShippingCharges?.toInt() ?? 0) + (purchasedTimeProductPrice ?? 0));

    cancelOrderAmount = ((cancelOrderCharges ?? 0) * (purchasedTimeTotal ?? 0) / 100).round();
    log("Cancel Order Amount :: $cancelOrderAmount");

    log("purchasedTimeProductPrice :: $purchasedTimeProductPrice");
    log("purchasedTimeTotal :: $purchasedTimeTotal");

    update([Constant.idProgressView]);
  }

  String onGetDate({required String date}) {
    String dateTimeString = date;
    String dateOnly = dateTimeString.split(',')[0];
    return dateOnly;
  }

  onTrackingOrder() async {
    var url = Uri.parse("${items?.trackingLink}");
    await launchUrl(url);
  }

  onCancelOrderClick() async {
    Get.back();

    if ((cancelOrderAmount ?? 0) > (purchasedTimeTotal ?? 0)) {
      Utils.showToast(Get.context!, "Order cancellation is not allowed for this product 😕");
    } else {
      await onCancelOrderApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        orderId: orderData?.id ?? "",
        status: "Cancelled",
        itemId: items?.id ?? "",
      );

      if (cancelOrderModel?.status == true) {
        Utils.showToast(Get.context!, "Order cancelled successfully");
        Get.back();
      } else {
        Utils.showToast(Get.context!, cancelOrderModel?.message ?? "");
      }
    }
  }

  //----------- API Variables -----------//
  CancelOrderModel? cancelOrderModel;
  RxBool isLoading = false.obs;

  onCancelOrderApiCall({
    required String userId,
    required String orderId,
    required String status,
    required String itemId,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
        "orderId": orderId,
        "status": status,
        "itemId": itemId,
      };

      String queryString = Uri(queryParameters: queryParameters).query;

      log("Cancel Order Params :: $queryParameters");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.cancelOrder + queryString);
      log("Cancel Order Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Cancel Order Headers :: $headers");

      final response = await http.patch(url, headers: headers);

      log("Cancel Order StatusCode :: ${response.statusCode}");
      log("Cancel Order Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        cancelOrderModel = CancelOrderModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Cancel Order Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
