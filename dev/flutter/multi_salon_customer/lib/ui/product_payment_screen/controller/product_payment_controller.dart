import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/bottom_sheet/payment_bottom_sheet.dart';
import 'package:salon_2/custom/dialog/order_confirm_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/product_payment_screen/model/create_order_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class ProductPaymentController extends GetxController {
  dynamic args = Get.arguments;
  String selectedPayment = "wallet";

  String? totalAmount;
  String? productId;
  int? quantity;
  List<Map<String, dynamic>>? attributes;
  bool? withoutCart;

  @override
  void onInit() async {
    await getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null || args[2] != null || args[3] != null || args[4] != null) {
        totalAmount = args[0];
        productId = args[1];
        quantity = args[2];
        attributes = args[3];
        withoutCart = args[4];
      }
      log("Total Amount :: $totalAmount");
      log("Product Id :: $productId");
      log("Quantity :: $quantity");
      log("Attributes :: $attributes");
      log("WithoutCart :: $withoutCart");
    }
    // update([Constant.idSelectPaymentMethod,Constant.idProgressView]);
  }

  onSelectPaymentMethod(String value) {
    selectedPayment = value;

    log("Current Index payment :: $selectedPayment");
    update([Constant.idSelectPaymentMethod]);
  }

  onClickPayNowWhenOrder(BuildContext context) async {
    if (selectedPayment == "wallet") {
      if (double.parse(totalAmount ?? "") > double.parse(walletAmount.toString())) {
        showModalBottomSheet(
          isScrollControlled: true,
          context: context,
          builder: (BuildContext context) {
            return const PaymentBottomSheet(isRecharge: false);
          },
        );
      } else {
        log("it's wallet ");

        num finalTotal = double.parse(totalAmount ?? "");

        await onCreateOrderApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          finalTotal: finalTotal.toInt(),
          paymentGateway: "wallet",
          type: withoutCart == true ? "withoutcart" : "fromcart",
          productId: productId ?? "",
          productQuantity: quantity ?? 1,
          attributesArray: attributes ?? [],
        );

        if (createOrderModel?.status == true) {
          Get.close(3);

          Get.dialog(
            barrierColor: AppColors.blackColor.withOpacity(0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              child: OrderConfirmDialog(
                items: createOrderModel?.data?.items?.first ?? Items(),
                orderData: createOrderModel?.data ?? OrderData(),
              ),
            ),
          );
        } else {
          Utils.showToast(Get.context!, createOrderModel?.message ?? "");
        }
      }
    }
  }

  //----------- API Variables -----------//
  CreateOrderModel? createOrderModel;
  RxBool isLoading = false.obs;

  onCreateOrderApiCall({
    required String userId,
    required int finalTotal,
    required String paymentGateway,
    required String type,
    required String productId,
    required int productQuantity,
    required List<Map<String, dynamic>> attributesArray,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = withoutCart == true
          ? json.encode({
              "userId": userId,
              "finalTotal": finalTotal,
              "paymentGateway": paymentGateway,
              "type": type,
              "productId": productId,
              "productQuantity": productQuantity,
              "attributesArray": attributesArray,
            })
          : json.encode({
              "userId": userId,
              "finalTotal": finalTotal,
              "paymentGateway": paymentGateway,
              "type": type,
            });

      log("Create Order Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.createOrder);

      log("Create Order Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Create Order Status Code :: ${response.statusCode}");
      log("Create Order Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        createOrderModel = CreateOrderModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Create Order Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
