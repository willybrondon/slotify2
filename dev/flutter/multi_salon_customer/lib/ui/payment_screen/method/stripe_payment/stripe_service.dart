import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/custom/dialog/success_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/category_details/controller/category_detail_controller.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/payment_screen/controller/payment_screen_controller.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_pay_model.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class StripeService {
  static late String stripeURLs;
  static late String stripePaymentKeys;
  static late num discountAmounts;
  static late num discountPercentages;
  static late bool isTests;
  static late String dates;
  static late String times;
  static late double rupees;
  static late double totalAmountWithOutTaxs;
  static late String serviceIds;
  static late String expertIds;
  static late String userIds;
  static late String paymentTypes;
  static late String salonIds;
  static late double withoutTaxAmount;
  static late String merchantDisplayName;
  Function(Map<String, dynamic>)? onComplete;

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.put(SplashController());
  CategoryDetailController categoryDetailController =
      Get.put(CategoryDetailController());
  SearchScreenController searchScreenController =
      Get.put(SearchScreenController());
  BookingScreenController bookingScreenController =
      Get.put(BookingScreenController());
  PaymentScreenController paymentScreenController =
      Get.put(PaymentScreenController());
  BranchDetailController branchDetailController =
      Get.put(BranchDetailController());
  SelectBranchController selectBranchController =
      Get.put(SelectBranchController());
  ExpertDetailController expertDetailController =
      Get.put(ExpertDetailController());

  init({
    String? stripePaymentPublishKey,
    String? stripeURL,
    String? stripePaymentKey,
    bool? isTest,
    num? discountAmount,
    num? discountPercentage,
    String? date,
    String? time,
    double? rupee,
    int? totalAmountWithOutTax,
    String? serviceId,
    String? expertId,
    String? userId,
    String? salonId,
    double? withoutTax,
    String? salonName,
    String? paymentType,
    Function(Map<String, dynamic>)? onComplete,
  }) async {
    log("stripePaymentPublishKey :: $stripePaymentPublishKey");
    log("stripePaymentKey :: $stripePaymentKey");
    log("totalAmountWithOutTax :: $totalAmountWithOutTax");
    log("paymentType :: $paymentType");
    log("serviceId :: $serviceId");
    log("expertId :: $expertId");
    log("time :: $time");

    // Validate Stripe keys
    String publishableKey = stripePaymentPublishKey ??
        splashController.settingCategory?.setting?.stripePublishableKey ??
        "";
    String secretKey = stripePaymentKey ??
        splashController.settingCategory?.setting?.stripeSecretKey ??
        "";

    if (publishableKey.isEmpty) {
      throw Exception("Stripe publishable key is not configured");
    }

    final isWalletRecharge = paymentType == "wallet_recharge";
    if (isWalletRecharge && secretKey.isEmpty) {
      throw Exception("Stripe secret key is not configured");
    }

    Stripe.publishableKey = publishableKey;
    Stripe.merchantIdentifier = 'merchant.flutter.stripe.test';

    await Stripe.instance.applySettings().catchError((e) {
      log("Stripe settings error: $e");
      Utils.showToast(
          Get.context!, "Stripe configuration error: ${e.toString()}");
      throw e.toString();
    });

    stripeURLs = stripeURL ?? "";
    stripePaymentKeys = secretKey;
    isTests = isTest ?? true;
    discountAmounts = discountAmount ?? 0.0;
    discountPercentages = discountPercentage ?? 0.0;
    this.onComplete = onComplete;
    dates = date ?? "";
    times = time ?? "";
    rupees = rupee ?? 0.0;
    totalAmountWithOutTaxs = (totalAmountWithOutTax ?? 0).toDouble();
    serviceIds = serviceId ?? "";
    expertIds = expertId ?? "";
    userIds = userId ?? "";
    salonIds = salonId ?? bookingScreenController.salonId?.toString() ?? "";
    withoutTaxAmount = withoutTax ?? totalAmountWithOutTaxs;
    merchantDisplayName = (salonName?.trim().isNotEmpty == true)
        ? salonName!.trim()
        : Constant.appName;
    paymentTypes = paymentType ?? "";
  }

  Future<Map<String, dynamic>?> _createConnectPaymentIntent({
    required double amount,
    required double withoutTax,
  }) async {
    if (salonIds.isEmpty) {
      throw Exception("Salon is required for card payment.");
    }

    final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.stripePaymentIntent);
    final response = await http.post(
      url,
      headers: {
        "key": ApiConstant.SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "salonId": salonIds,
        "amount": amount,
        "withoutTax": withoutTax,
        "userId": userIds,
        "expertId": expertIds,
      }),
    );

    log("Connect PI status :: ${response.statusCode}");
    log("Connect PI body :: ${response.body}");

    if (response.statusCode != 200) {
      throw Exception("Unable to start card payment.");
    }

    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse["status"] != true) {
      throw Exception(jsonResponse["message"]?.toString() ?? "Stripe error");
    }
    return jsonResponse as Map<String, dynamic>;
  }

  Future<dynamic> stripePay() async {
    log("stripePaymentKey :::: $stripePaymentKeys");
    log("totalAmountWithOutTaxs :::: $totalAmountWithOutTaxs");

    String userId = Constant.storage.read<String>('userId') ?? "";
    String userName = Constant.storage.read<String>('UserName') ?? "";
    String userEmail = Constant.storage.read<String>('UserEmail') ?? "";

    try {
      // Parse and validate amount more robustly
      double amountDouble = 0.0;

      // Handle different amount formats
      if (totalAmountWithOutTaxs is int) {
        amountDouble = totalAmountWithOutTaxs.toDouble();
      } else if (totalAmountWithOutTaxs is double) {
        amountDouble = totalAmountWithOutTaxs;
      } else {
        // Remove any currency symbols and parse
        String cleanAmount =
            totalAmountWithOutTaxs.toString().replaceAll(RegExp(r'[^\d.]'), '');
        amountDouble = double.tryParse(cleanAmount) ?? 0.0;
      }

      log("Parsed amount: $amountDouble");

      // Validate amount
      if (amountDouble <= 0) {
        throw Exception(
            "Invalid amount. Amount must be greater than 0. Received: $amountDouble");
      }

      // Convert to cents for Stripe (ensure it's a whole number)
      int stripeAmount = (amountDouble * 100).round();
      log("stripeAmount in cents :: $stripeAmount");

      // Get currency from settings
      // Supported currencies: USD ($), EUR (€), XAF (xaf - CFA Franc for Cameroon)
      String currency = splashController.settingCategory?.setting?.currencyName
              ?.toLowerCase() ??
          'usd';
      log("Currency :: $currency");

      // Validate currency
      if (currency.isEmpty) {
        currency = 'usd'; // Default to USD if not set
      }
      
      // Note: XAF (CFA Franc) uses "xaf" as both currency code and symbol
      // Stripe may not support XAF directly - consider alternative payment methods for XAF

      String clientSecret;
      if (paymentTypes == "wallet_recharge") {
        // Platform (admin) Stripe — wallet top-up only, not salon bookings
        Map<String, dynamic> body = {
          'amount': stripeAmount.toString(),
          'currency': currency,
          'description': 'Name: $userName - Email: $userEmail',
          'automatic_payment_methods[enabled]': 'true',
        };

        var response = await http.post(Uri.parse(Constant.stripeUrl),
            body: body,
            headers: {
              "Authorization": "Bearer $stripePaymentKeys",
              "Content-Type": 'application/x-www-form-urlencoded'
            });

        log("Stripe Payment Response StatusCode :: ${response.statusCode}");
        if (response.statusCode != 200) {
          throw Exception("Payment failed");
        }
        StripePayModel res = StripePayModel.fromJson(jsonDecode(response.body));
        clientSecret = res.clientSecret ?? "";
      } else {
        // Salon Stripe Connect — PaymentIntent on the connected account
        final connectResponse = await _createConnectPaymentIntent(
          amount: rupees > 0 ? rupees : amountDouble,
          withoutTax: withoutTaxAmount > 0 ? withoutTaxAmount : amountDouble,
        );
        clientSecret = connectResponse?["clientSecret"]?.toString() ?? "";
        final pk = connectResponse?["publishableKey"]?.toString();
        final connectSalonName = connectResponse?["salonName"]?.toString();
        if (connectSalonName != null && connectSalonName.isNotEmpty) {
          merchantDisplayName = connectSalonName;
        }
        if (pk != null && pk.isNotEmpty) {
          Stripe.publishableKey = pk;
          await Stripe.instance.applySettings();
        }
      }

      if (clientSecret.isEmpty) {
        throw Exception("Payment intent creation failed - no client secret received");
      }

      bookingScreenController.isLoading(true);

      String? strSelectString;
      List? partsSelectedString;
      String? selectTime;

      strSelectString = bookingScreenController.selectedSlot;
      if (strSelectString.isNotEmpty) {
        partsSelectedString = strSelectString.split(' ');
        selectTime = partsSelectedString[0];
      }

      log("selectTime :: $selectTime");
      log("clientSecret :: $clientSecret");

      try {
        SetupPaymentSheetParameters setupPaymentSheetParameters =
            SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          appearance: PaymentSheetAppearance(
              colors: PaymentSheetAppearanceColors(
                  primary: AppColors.primaryAppColor)),
          applePay: PaymentSheetApplePay(
              merchantCountryCode: Constant.stripeMerchantCountryCode),
          googlePay: PaymentSheetGooglePay(
              merchantCountryCode: Constant.stripeMerchantCountryCode,
              testEnv: isTests),
          merchantDisplayName: merchantDisplayName,
          customerId: userId.toString(),
          billingDetails: BillingDetails(name: userName, email: userEmail),
        );

        await Stripe.instance
            .initPaymentSheet(
                paymentSheetParameters: setupPaymentSheetParameters)
            .then(
          (value) async {
            await Stripe.instance.presentPaymentSheet().then(
              (value) async {
                log("Present Stripe Payment Sheet Confirm");

                log("Payment Type :: $paymentTypes");
                log("Service Id :: $serviceIds");
                log("Expert Id :: $expertIds");
                log("Time :: $times");

                if (paymentScreenController.isWalletAdd == true) {
                  await paymentScreenController.onDepositToWalletApiCall(
                    userId: Constant.storage.read<String>('userId') ?? "",
                    amount: paymentScreenController.totalAmount ?? "",
                    paymentGateway: "Stripe",
                  );

                  if (paymentScreenController.depositToWalletModel?.status ==
                      true) {
                    Utils.showToast(
                        Get.context!,
                        paymentScreenController.depositToWalletModel?.message ??
                            "");
                    Get.back(result: 'success');
                  } else {
                    Utils.showToast(
                        Get.context!,
                        paymentScreenController.depositToWalletModel?.message ??
                            "");
                  }
                } else {
                  bookingScreenController.calculateTotalWithDiscount();
                  double finalAmount = bookingScreenController.totalPrice;
                  double withoutTaxValue = double.parse(
                      bookingScreenController.withOutTaxRupee
                          .toStringAsFixed(2));

                  await bookingScreenController.onCreateBookingApiCall(
                    userId: Constant.storage.read<String>('userId') ?? "",
                    expertId: expertIds.isNotEmpty
                        ? expertIds
                        : (Constant.storage.read<String>('expertDetail') != null
                            ? Constant.storage
                                .read<String>('expertDetail')
                                .toString()
                            : Constant.storage
                                .read<String>('expertId')
                                .toString()),
                    serviceId: serviceIds.isNotEmpty
                        ? serviceIds
                        : bookingScreenController.serviceId.join(","),
                    salonId: salonIds.isNotEmpty
                        ? salonIds
                        : bookingScreenController.salonId.toString(),
                    date: dates.isNotEmpty
                        ? dates
                        : bookingScreenController.formattedDate.toString(),
                    time: times.isNotEmpty
                        ? times
                        : bookingScreenController.slotsString.toString(),
                    amount: finalAmount,
                    withoutTax: withoutTaxValue,
                    paymentType: "Stripe",
                    atPlace: bookingScreenController.selectedVenue == "At Salon"
                        ? 1
                        : 2,
                    address:
                        bookingScreenController.searchEditingController.text,
                  );

                  if (bookingScreenController.createBookingCategory?.status ==
                      true) {
                    Utils.showToast(
                        Get.context!, "Payment successful! Booking created.");
                    final showFirstBookingCashback =
                        bookingScreenController
                                .createBookingCategory?.firstBookingCashback ==
                            true;
                    final bookingStatus = bookingScreenController
                        .createBookingCategory?.data?.status;

                    Get.offAndToNamed(AppRoutes.bottom);

                    Get.dialog(
                      barrierColor:
                          AppColors.blackColor.withValues(alpha: 0.8),
                      Dialog(
                        backgroundColor: AppColors.transparent,
                        child: SuccessDialog(
                          showFirstBookingCashback: showFirstBookingCashback,
                          bookingStatus: bookingStatus,
                        ),
                      ),
                    );
                  } else {
                    Utils.showToast(
                        Get.context!,
                        bookingScreenController.createBookingCategory?.message ??
                            "Booking failed");
                  }
                }
              },
            ).catchError(
              (e) {
                log("Error in Stripe Payment Method :: $e");
                if (e is StripeException) {
                  Utils.showToast(Get.context!,
                      "Payment failed: ${e.error.localizedMessage}");
                } else {
                  Utils.showToast(Get.context!, "Payment failed: $e");
                }
              },
            );

            log("Stripe Payment Method Complete");
          },
        );
      } catch (e) {
        if (e is StripeException) {
          log('Stripe Exception :: ${e.error.localizedMessage}');
          Utils.showToast(
              Get.context!, "Payment failed: ${e.error.localizedMessage}");
        } else {
          log('Stripe Payment Method Unexpected Error :: $e');
          Utils.showToast(Get.context!, "Payment failed: $e");
        }
      }
      return {"clientSecret": clientSecret};
    } catch (e) {
      bookingScreenController.isLoading(false);
      if (e is StripeException) {
        log('Stripe Error: ${e.error.localizedMessage}');
        Utils.showToast(
            Get.context!, "Payment failed: ${e.error.localizedMessage}");
      } else {
        log('Unexpected error: $e');
        Utils.showToast(Get.context!, "Payment failed: $e");
      }
      rethrow;
    }
  }
}
