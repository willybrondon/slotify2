import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/bottom_sheet/payment_bottom_sheet.dart';
import 'package:salon_2/custom/dialog/order_confirm_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/product_payment_screen/method/product_stripe_service.dart';
import 'package:salon_2/ui/product_payment_screen/model/create_order_model.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
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
  String? salonId;
  bool salonAcceptsStripe = false;
  int? subTotal;
  String? salonName;

  SplashController splashController = Get.find<SplashController>();

  @override
  void onInit() async {
    await getDataFromArgs();
    _applyDefaultPaymentMethod();
    super.onInit();
  }

  void _applyDefaultPaymentMethod() {
    if (showSalonStripe) {
      selectedPayment = "Stripe";
    } else if (showWallet) {
      selectedPayment = "wallet";
    }
  }

  bool get showWallet =>
      splashController.settingCategory?.setting?.isWalletPay == true;

  bool get showSalonStripe =>
      salonAcceptsStripe &&
      splashController.settingCategory?.setting?.isStripePay == true &&
      splashController.settingCategory?.setting?.isProductStripePay != false;

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null ||
          args[1] != null ||
          args[2] != null ||
          args[3] != null ||
          args[4] != null) {
        totalAmount = args[0];
        productId = args[1];
        quantity = args[2];
        attributes = args[3];
        withoutCart = args[4];
      }
      if (args.length > 5 && args[5] != null) {
        salonId = args[5]?.toString();
      }
      if (args.length > 6 && args[6] != null) {
        salonAcceptsStripe = args[6] == true;
      }
      if (args.length > 7 && args[7] != null) {
        subTotal = int.tryParse(args[7].toString());
      }
      if (args.length > 8 && args[8] != null) {
        salonName = args[8]?.toString();
      }
      log("Total Amount :: $totalAmount");
      log("Product Id :: $productId");
      log("Salon Id :: $salonId");
      log("Salon Accepts Stripe :: $salonAcceptsStripe");
    }
  }

  int get parsedTotal =>
      int.tryParse(totalAmount ?? '') ??
      double.tryParse(totalAmount ?? '')?.round() ??
      0;

  int get parsedSubTotal => subTotal ?? parsedTotal;

  onSelectPaymentMethod(String value) {
    selectedPayment = value;
    log("Current Index payment :: $selectedPayment");
    update([Constant.idSelectPaymentMethod]);
  }

  Future<void> onClickPayNowWhenOrder(BuildContext context) async {
    if (parsedTotal <= 0) {
      Utils.showToast(Get.context!, "desErrorProcessingPayment".tr);
      return;
    }

    if (selectedPayment == "Stripe") {
      if (!showSalonStripe || salonId == null || salonId!.isEmpty) {
        Utils.showToast(Get.context!, "desSalonStripeUnavailable".tr);
        return;
      }

      isLoading(true);
      update([Constant.idProgressView]);

      final success = await ProductStripeService().payAndCreateOrder(
        context: context,
        salonId: salonId!,
        productId: productId ?? '',
        finalTotal: parsedTotal,
        subTotal: parsedSubTotal,
        quantity: quantity ?? 1,
        attributes: attributes ?? [],
        withoutCart: withoutCart == true,
        salonName: salonName ?? '',
        createOrder: ({required String paymentGateway}) =>
            _finalizeOrder(paymentGateway: paymentGateway),
      );

      isLoading(false);
      update([Constant.idProgressView]);

      if (success) {
        _showOrderSuccess();
      }
      return;
    }

    if (selectedPayment == "wallet") {
      if (!showWallet) {
        Utils.showToast(Get.context!, "desWalletPaymentUnavailable".tr);
        return;
      }

      if (double.parse(parsedTotal.toString()) >
          double.parse(walletAmount.toString())) {
        showModalBottomSheet(
          isScrollControlled: true,
          context: context,
          builder: (BuildContext context) {
            return const PaymentBottomSheet(isRecharge: false);
          },
        );
        return;
      }

      await _finalizeOrder(paymentGateway: "wallet");
      if (createOrderModel?.status == true) {
        _showOrderSuccess();
      } else {
        Utils.showToast(Get.context!, createOrderModel?.message ?? "");
      }
    }
  }

  Future<bool> _finalizeOrder({required String paymentGateway}) async {
    await onCreateOrderApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      finalTotal: parsedTotal,
      paymentGateway: paymentGateway,
      type: withoutCart == true ? "withoutcart" : "fromcart",
      productId: productId ?? "",
      productQuantity: quantity ?? 1,
      attributesArray: attributes ?? [],
    );
    return createOrderModel?.status == true;
  }

  void _showOrderSuccess() {
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
  }

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
      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

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
