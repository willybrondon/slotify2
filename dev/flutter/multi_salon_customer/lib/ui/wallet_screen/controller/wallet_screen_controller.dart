import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/wallet_screen/model/get_coupon_model.dart';
import 'package:salon_2/ui/wallet_screen/model/get_wallet_history_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class WalletScreenController extends GetxController {
  int selectAmountIndex = 0;
  String amount = "50";
  List directAmount = ["50", "100", "150", "200", "250", "300", "350"];
  int applyCoupon = -1;
  String? couponCode;
  List<num> priceList = [];
  num? finalAmountAfterCoupon;

  TextEditingController currencyController = TextEditingController();

  @override
  void onInit() async {
    log("Enter in wallet screen controller");

    amount = directAmount[0];
    currencyController.text = amount;

    await getCouponApiCall(
      userId: Constant.storage.read('userId'),
      type: "1",
      amount: amount,
    );

    await onGetWalletHistoryApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      month: DateFormat('yyyy-MM').format(DateTime.now()),
    );
    currencyController.text = amount;
    super.onInit();
  }

  onSelectAmount(int index) async {
    selectAmountIndex = index;
    amount = directAmount[index];
    currencyController.text = amount;

    await getCouponApiCall(
      userId: Constant.storage.read('userId'),
      type: "1",
      amount: amount,
    );

    applyCoupon = -1;
    couponCode = '';
    Constant.storage.write('couponId', "");

    log("Currency is :: $currency");
    log("Amount is :: $amount");
    log("Currency Controller :: ${currencyController.text}");

    update([Constant.idSelectAmount]);
  }

  onRechargeClick() {
    // Validate amount before proceeding
    String rechargeAmount = currencyController.text.trim();
    if (rechargeAmount.isEmpty) {
      rechargeAmount = amount; // Use the selected amount if controller is empty
    }
    
    log("Wallet Recharge - Amount: $rechargeAmount");
    log("Wallet Recharge - Selected Amount: $amount");
    log("Wallet Recharge - Controller Text: ${currencyController.text}");
    
    if (rechargeAmount.isEmpty || rechargeAmount == "0" || rechargeAmount == "0.0") {
      Utils.showToast(Get.context!, "Please select a valid amount to recharge");
      return;
    }

    // CRITICAL: Use the same flow as Profile -> Wallet -> Add Money
    // Navigate to WalletRechargeScreen first, which will then navigate to payment screen
    // This ensures the same clean state and payment method selection as the profile flow
    log("Wallet Recharge - Navigating to WalletRechargeScreen (same as Profile -> Wallet -> Add Money flow)");
    
    // Close the bottom sheet first if it's open
    Get.back();
    
    // Navigate to wallet recharge screen with the amount pre-filled
    Get.toNamed(
      AppRoutes.walletRecharge,
      arguments: rechargeAmount, // Pre-fill the amount
    )?.then(
      (value) async {
        // Refresh wallet history after returning from recharge
        await onGetWalletHistoryApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          month: DateFormat('yyyy-MM').format(DateTime.now()),
        );
        // Update UI
        update([Constant.idProgressView]);
      },
    );
  }

  //----------- API Variables -----------//
  GetWalletHistoryModel? getWalletHistoryModel;
  GetCouponModel? getCouponModel;
  RxBool isLoading = false.obs;

  onGetWalletHistoryApiCall({required String userId, required String month}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
        "month": month,
      };

      log("Get Wallet History Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getWalletHistory + queryString);
      log("Get Wallet History Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get Wallet History Status Code :: ${response.statusCode}");
      log("Get Wallet History Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getWalletHistoryModel = GetWalletHistoryModel.fromJson(jsonResponse);

        walletAmount = getWalletHistoryModel?.total ?? 0.0;
        log("Wallet Amount :: $walletAmount");
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Wallet History Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  getCouponApiCall({required String userId, required String type, required String amount}) async {
    try {
      isLoading(true);
      update([Constant.idGetCoupon, Constant.idApplyCoupon, Constant.idMoneyOffer]);

      final queryParameters = {
        "userId": userId,
        "type": type,
        "amount": amount,
      };

      log("Get Coupon Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getCoupon + queryString);
      log("Get Coupon Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Coupon Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Coupon Status Code :: ${response.statusCode}");
      log("Get Coupon Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getCouponModel = GetCouponModel.fromJson(jsonResponse);
      }

      log("Get Coupon Api Call Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Coupon Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idGetCoupon, Constant.idApplyCoupon, Constant.idMoneyOffer]);
    }
  }
}
