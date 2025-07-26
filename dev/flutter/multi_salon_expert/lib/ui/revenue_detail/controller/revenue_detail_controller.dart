import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/history_screen/controller/history_screen_controller.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';
import 'package:salon_2/ui/wallet_screen/model/create_withdraw_request_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class RevenueDetailController extends GetxController {
  final formKey = GlobalKey<FormState>();
  String selectedMonth = DateFormat('yyyy-MM').format(DateTime.now());

  List<dynamic>? paymentMethods;
  List<String>? paymentDetails;
  List<String>? formattedPaymentDetails;

  TextEditingController amountController = TextEditingController();

  PaymentMethodController addBankDetailController = Get.find<PaymentMethodController>();
  HistoryScreenController historyScreenController = Get.find<HistoryScreenController>();

  @override
  void onInit() async {
    await addBankDetailController.onGetPaymentDetailsApiCall();
    await historyScreenController.onGetWalletHistoryApiCall(
      expertId: Constant.storage.read<String>('expertId') ?? "",
      month: selectedMonth,
    );
    super.onInit();
  }

  onWithdrawalClick(BuildContext context) async {
    FocusScopeNode currentFocus = FocusScope.of(context);
    if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
      currentFocus.focusedChild?.unfocus();
    }

    double walletAmount = double.tryParse(earning ?? "") ?? 0.0;
    log("Wallet amount: $walletAmount");

    if (formKey.currentState!.validate()) {
      double withdrawalAmount = double.tryParse(amountController.text) ?? 0.0;

      if (withdrawalAmount < 1) {
        Utils.showToast(Get.context!, "Minimum withdraw amount is 1");
      } else if (withdrawalAmount > walletAmount) {
        Utils.showToast(Get.context!, "You can not withdraw more than your current wallet amount");
      } else {
        for (int i = 0; i < (formattedPaymentDetails?.length ?? 0); i++) {
          if (formattedPaymentDetails?[i].split(":").last.isBlank == true) {
            Utils.showToast(Get.context!, "Please fill up details first");
          } else {
            await onCreateWithdrawRequestApiCall(
              expertId: Constant.storage.read('expertId'),
              amount: amountController.text,
              paymentGateway: addBankDetailController.paymentMethodName ?? "",
              paymentDetails: formattedPaymentDetails ?? [],
            );

            if (createWithdrawRequestModel?.status == true) {
              Utils.showToast(Get.context!, createWithdrawRequestModel?.message ?? "");
              Get.back();
            } else {
              Utils.showToast(Get.context!, createWithdrawRequestModel?.message ?? "");
            }
          }
        }
      }
    }
  }

  /// =================== API Calling =================== ///

  CreateWithdrawRequestModel? createWithdrawRequestModel;
  bool isLoading = false;

  onCreateWithdrawRequestApiCall({
    required String expertId,
    required String amount,
    required String paymentGateway,
    required List paymentDetails,
  }) async {
    try {
      isLoading = true;
      update([Constant.idProgressView]);

      final body = json.encode({
        "expertId": expertId,
        "amount": amount,
        "paymentGateway": paymentGateway,
        "paymentDetails": paymentDetails,
      });

      log("Create Withdraw Request Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.createWithdrawRequest);
      log("Create Withdraw Request Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Create Withdraw Request Headers :: $headers");

      final response = await http.post(url, headers: headers, body: body);

      log("Create Withdraw Request Status Code :: ${response.statusCode}");
      log("Create Withdraw Request Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        createWithdrawRequestModel = CreateWithdrawRequestModel.fromJson(jsonResponse);
      }
      log("Create Withdraw Request Api Called Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Create Withdraw Request Api :: $e");
    } finally {
      isLoading = false;
      update([Constant.idProgressView]);
    }
  }
}
