import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
// import 'package:salon_2/ui/payment_screen/method/flutter_wave/flutter_wave_service.dart'; // Commented out - not used for wallet recharge
// import 'package:salon_2/ui/payment_screen/method/razor_pay/razor_pay_service.dart'; // Commented out - not used for wallet recharge
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
  Map<String, dynamic>?
      bookingData; // Additional booking data for direct payments

  @override
  void onInit() async {
    await getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    log("Payment Screen - Args received: $args");

    if (args != null) {
      log("Payment Screen - Args length: ${args.length}");

      if (args.length >= 4) {
        isWalletAdd = args[0];
        totalAmount = args[1];
        isCreateOrder = args[2];
        selectedPayment = args[3];
        if (args.length > 4) {
          bookingData = args[4]; // Additional booking data
        }
      } else if (args.length >= 3) {
        // Handle wallet recharge case with 3 arguments
        isWalletAdd = args[0];
        totalAmount = args[1];
        isCreateOrder = args[2];
        selectedPayment = null; // Will be set to default below
        log("Payment Screen - Wallet recharge detected with 3 arguments");
      }

      // Set default payment method if not specified
      selectedPayment ??= isWalletAdd == true ? "Stripe" : "wallet"; // Changed from "Razorpay" to "Stripe" for wallet recharge

      log("Payment Screen - Is Wallet Add :: $isWalletAdd");
      log("Payment Screen - Is Create Order :: $isCreateOrder");
      log("Payment Screen - Total Amount :: '$totalAmount'");
      log("Payment Screen - Selected Payment :: '$selectedPayment'");
      log("Payment Screen - Booking Data :: $bookingData");

      // Validate total amount
      if (totalAmount == null || totalAmount!.isEmpty) {
        log("Payment Screen - WARNING: Total amount is null or empty!");
      } else {
        log("Payment Screen - Total amount is valid: '$totalAmount'");
      }
    } else {
      log("Payment Screen - WARNING: No arguments received!");
    }
    update([Constant.idSelectPaymentMethod]);
  }

  onSelectPaymentMethod(String value) {
    selectedPayment = value;

    log("Current Index payment :: $selectedPayment");
    update([Constant.idSelectPaymentMethod]);
  }

  onClickPayNow() async {
    // if (selectedPayment == "Razorpay") {
    //   log("it's Razorpay ");
    //   RazorPayService().init(
    //     totalAmountWithOutTax: int.parse(totalAmount ?? ""),
    //     razorKey: razorPayId ?? "",
    //   );
    //   1.seconds.delay;
    //   isLoading(false);

    //   RazorPayService().razorPayCheckout();
    // } else 
    if (selectedPayment == "Stripe") {
      log("it's Stripe");
      isLoading(true);
      update([Constant.idProgressView]);

      try {
        // Parse amount properly
        int parsedAmount = 0;
        if (totalAmount != null && totalAmount!.isNotEmpty) {
          // Remove any currency symbols and parse
          String cleanAmount = totalAmount!.replaceAll(RegExp(r'[^\d.]'), '');
          double amountDouble = double.tryParse(cleanAmount) ?? 0.0;
          parsedAmount = amountDouble.toInt();
        }

        log("Parsed amount for Stripe: $parsedAmount");

        // For wallet recharge
        if (isWalletAdd == true) {
          await StripeService().init(
            totalAmountWithOutTax: parsedAmount,
            stripePaymentPublishKey: stripePublishableKey ?? "",
            stripeURL: Constant.stripeUrl,
            stripePaymentKey: stripeSecretKey ?? "",
            isTest: true,
            paymentType: "wallet_recharge",
          );
        } else {
          // For direct payment - use passed booking data instead of accessing booking controller
          await StripeService().init(
            totalAmountWithOutTax: parsedAmount,
            stripePaymentPublishKey: stripePublishableKey ?? "",
            stripeURL: Constant.stripeUrl,
            stripePaymentKey: stripeSecretKey ?? "",
            isTest: true,
            paymentType: "direct_payment",
            serviceId: bookingData?['serviceId'] ?? "",
            expertId: bookingData?['expertId'] ?? "",
            date: bookingData?['date'] ?? "",
            time: bookingData?['time'] ?? "",
            rupee: (bookingData?['amount'] ?? 0.0).toDouble(),
            userId: Constant.storage.read<String>('userId') ?? "",
          );
        }

        log("Called stripe Init");

        1.seconds.delay;
        await StripeService().stripePay().then((value) {
          isLoading(false);
          update([Constant.idProgressView]);
        }).catchError((e) {
          isLoading(false);
          update([Constant.idProgressView]);
          log("Stripe payment error: $e");
          Utils.showToast(Get.context!, "Payment failed: ${e.toString()}");
        });
      } catch (e) {
        isLoading(false);
        update([Constant.idProgressView]);
        log("Stripe initialization error: $e");
        Utils.showToast(
            Get.context!, "Payment initialization failed: ${e.toString()}");
      }
    }
    // else if (selectedPayment == "flutterWave") {
    //   FlutterWaveService().init(
    //     flutterWavePublishKey: flutterWaveKey ?? "",
    //     totalAmountWithOutTax: totalAmount ?? "",
    //   );

    //   1.seconds.delay;
    //   isLoading(false);

    //   FlutterWaveService().handlePaymentInitialization();
    // }
  }

  //----------- API Variables -----------//
  DepositToWalletModel? depositToWalletModel;
  RxBool isLoading = false.obs;

  onDepositToWalletApiCall(
      {required String userId,
      required String amount,
      required String paymentGateway}) async {
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

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.depositToWallet + queryString);
      log("Deposit To Wallet Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

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
