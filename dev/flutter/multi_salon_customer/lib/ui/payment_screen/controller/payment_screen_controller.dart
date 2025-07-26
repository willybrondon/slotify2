import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/payment_screen/method/flutter_wave/flutter_wave_service.dart';
import 'package:salon_2/ui/payment_screen/method/razor_pay/razor_pay_service.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/payment_screen/model/deposit_to_wallet_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';

class PaymentScreenController extends GetxController {
  dynamic args = Get.arguments;

  bool? isWalletAdd;
  bool? isCreateOrder;
  String? totalAmount;
  String? selectedPayment;

  @override
  void onInit() async {
    await getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null || args[2] != null) {
        isWalletAdd = args[0];
        totalAmount = args[1];
        isCreateOrder = args[2];
      }
      selectedPayment = isWalletAdd == true ? "Razorpay" : "wallet";
      log("Is Wallet Add :: $isWalletAdd");
      log("Is Create Order :: $isCreateOrder");
      log("Total Amount :: $totalAmount");
    }
    update([Constant.idSelectPaymentMethod]);
  }

  onSelectPaymentMethod(String value) {
    selectedPayment = value;

    log("Current Index payment :: $selectedPayment");
    update([Constant.idSelectPaymentMethod]);
  }

  onClickPayNow() async {
    if (selectedPayment == "Razorpay") {
      log("it's Razorpay ");
      RazorPayService().init(
        totalAmountWithOutTax: int.parse(totalAmount ?? ""),
        razorKey: razorPayId ?? "",
      );
      1.seconds.delay;
      isLoading(false);

      RazorPayService().razorPayCheckout();
    } else if (selectedPayment == "Stripe") {
      log("it's Stripe");
      isLoading(true);
      update([Constant.idProgressView]);

      // await StripeService().init(
      //   totalAmountWithOutTax: int.parse(totalAmount ?? ""),
      //   stripePaymentPublishKey: stripePublishableKey ?? "",
      //   stripeURL: Constant.stripeUrl,
      //   stripePaymentKey: stripeSecretKey ?? "",
      // );

      await StripeService().init(isTest: true);

      log("Called stripe Init");

      // int intAmount = int.parse(totalAmount ?? "0");

      1.seconds.delay;
      StripeService()
          .stripePay(
              // amount: int.parse(totalAmount ?? ""),
              // amount: (intAmount * 100).toInt(),
              // callback: () {},
              )
          .then((value) {
        isLoading(false);
        update([Constant.idProgressView]);
      }).catchError((e) {
        isLoading(false);
        update([Constant.idProgressView]);

        Utils.showToast(Get.context!, e.toString());
      });
    } else if (selectedPayment == "flutterWave") {
      FlutterWaveService().init(
        flutterWavePublishKey: flutterWaveKey ?? "",
        totalAmountWithOutTax: totalAmount ?? "",
      );

      1.seconds.delay;
      isLoading(false);

      FlutterWaveService().handlePaymentInitialization();
    }
  }

  //----------- API Variables -----------//
  DepositToWalletModel? depositToWalletModel;
  RxBool isLoading = false.obs;

  onDepositToWalletApiCall({required String userId, required String amount, required String paymentGateway}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
        "amount": amount,
        "paymentGateway": paymentGateway,
      };

      log("Deposit To Wallet Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.depositToWallet + queryString);
      log("Deposit To Wallet Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers);

      log("Deposit To Wallet Status Code :: ${response.statusCode}");
      log("Deposit To Wallet Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        depositToWalletModel = DepositToWalletModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Deposit To Wallet Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
