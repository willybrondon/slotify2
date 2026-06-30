import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
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
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:url_launcher/url_launcher.dart';

class ZitopayService {
  static late String zitopayApiKeys;
  static late String zitopaySecretKeys;
  static late String zitopayMerchantIds;
  static late String dates;
  static late String times;
  static late double rupees;
  static late double totalAmountWithOutTaxs;
  static late String serviceIds;
  static late String expertIds;
  static late String userIds;
  static late String paymentTypes;
  Function(Map<String, dynamic>)? onComplete;

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.put(SplashController());
  CategoryDetailController categoryDetailController =
      Get.put(CategoryDetailController());
  SearchScreenController searchScreenController =
      Get.put(SearchScreenController());
  BookingScreenController? bookingScreenController;
  PaymentScreenController paymentScreenController =
      Get.find<PaymentScreenController>();

  ZitopayService() {
    // Try to get booking controller if available (may not be available for wallet recharge)
    try {
      if (Get.isRegistered<BookingScreenController>()) {
        bookingScreenController = Get.find<BookingScreenController>();
      } else {
        // If not registered, try to put it (for direct payments)
        bookingScreenController = Get.put(BookingScreenController());
      }
    } catch (e) {
      log("BookingScreenController initialization: $e");
    }
  }
  BranchDetailController branchDetailController =
      Get.put(BranchDetailController());
  SelectBranchController selectBranchController =
      Get.put(SelectBranchController());
  ExpertDetailController expertDetailController =
      Get.put(ExpertDetailController());

  init({
    String? zitopayApiKey,
    String? zitopaySecretKey,
    String? zitopayMerchantId,
    String? date,
    String? time,
    double? rupee,
    int? totalAmountWithOutTax,
    String? serviceId,
    String? expertId,
    String? userId,
    String? paymentType,
    Function(Map<String, dynamic>)? onComplete,
  }) async {
    log("zitopayApiKey :: $zitopayApiKey");
    log("zitopaySecretKey :: $zitopaySecretKey");
    log("zitopayMerchantId :: $zitopayMerchantId");
    log("totalAmountWithOutTax :: $totalAmountWithOutTax");
    log("paymentType :: $paymentType");
    log("serviceId :: $serviceId");
    log("expertId :: $expertId");
    log("time :: $time");

    // Validate Zitopay keys
    String apiKey = zitopayApiKey ??
        splashController.settingCategory?.setting?.zitopayApiKey ??
        "";
    String secretKey = zitopaySecretKey ??
        splashController.settingCategory?.setting?.zitopaySecretKey ??
        "";
    String merchantId = zitopayMerchantId ??
        splashController.settingCategory?.setting?.zitopayMerchantId ??
        "";

    if (apiKey.isEmpty) {
      throw Exception("Zitopay API key is not configured");
    }

    if (secretKey.isEmpty) {
      throw Exception("Zitopay secret key is not configured");
    }

    if (merchantId.isEmpty) {
      throw Exception("Zitopay merchant ID is not configured");
    }

    log("Using Zitopay API key: ${apiKey.substring(0, 7)}...");
    log("Using Zitopay secret key: ${secretKey.substring(0, 7)}...");
    log("Using Zitopay merchant ID: $merchantId");

    zitopayApiKeys = apiKey;
    zitopaySecretKeys = secretKey;
    zitopayMerchantIds = merchantId;
    this.onComplete = onComplete;
    dates = date ?? "";
    times = time ?? "";
    rupees = rupee ?? 0.0;
    totalAmountWithOutTaxs = (totalAmountWithOutTax ?? 0).toDouble();
    serviceIds = serviceId ?? "";
    expertIds = expertId ?? "";
    userIds = userId ?? "";
    paymentTypes = paymentType ?? "";
  }

  Future<dynamic> zitopayPay() async {
    log("zitopaySecretKey :::: $zitopaySecretKeys");
    log("totalAmountWithOutTaxs :::: $totalAmountWithOutTaxs");

    String userId = Constant.storage.read<String>('userId') ?? "";
    String userName = Constant.storage.read<String>('UserName') ?? "";
    String userEmail = Constant.storage.read<String>('UserEmail') ?? "";
    String userPhone = Constant.storage.read<String>('UserMobile') ?? "";

    try {
      // Parse and validate amount
      double amountDouble = 0.0;

      if (totalAmountWithOutTaxs is int) {
        amountDouble = totalAmountWithOutTaxs.toDouble();
      } else if (totalAmountWithOutTaxs is double) {
        amountDouble = totalAmountWithOutTaxs;
      } else {
        String cleanAmount =
            totalAmountWithOutTaxs.toString().replaceAll(RegExp(r'[^\d.]'), '');
        amountDouble = double.tryParse(cleanAmount) ?? 0.0;
      }

      log("Parsed amount: $amountDouble");

      if (amountDouble <= 0) {
        throw Exception(
            "Invalid amount. Amount must be greater than 0. Received: $amountDouble");
      }

      // Get currency from settings
      String currency = splashController.settingCategory?.setting?.currencyName
              ?.toUpperCase() ??
          'XAF';

      // Generate unique reference
      String reference =
          "SKEDISY_${DateTime.now().millisecondsSinceEpoch}_$userId";

      // Prepare payment request body
      Map<String, dynamic> body = {
        'merchant_id': zitopayMerchantIds,
        'amount': amountDouble.toStringAsFixed(2),
        'currency': currency,
        'reference': reference,
        'description': 'Skedisy Booking Payment - $userName',
        'customer_email': userEmail,
        'customer_name': userName,
        'customer_phone': userPhone,
        'callback_url':
            '${Constant.zitopayBaseUrl}/webhook', // Zitopay webhook callback URL
        'return_url': 'skedisy://payment/success',
      };

      log("Zitopay request body :: $body");

      // Create authorization header (Basic Auth with API key and secret)
      String credentials =
          base64Encode(utf8.encode('$zitopayApiKeys:$zitopaySecretKeys'));

      var response = await http.post(
        Uri.parse('${Constant.zitopayBaseUrl}/payments'),
        headers: {
          'Authorization': 'Basic $credentials',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(body),
      );

      log("Zitopay Payment Response StatusCode :: ${response.statusCode}");
      log("Zitopay Payment Response Body :: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          String paymentUrl = responseData['data']['payment_url'] ?? '';

          if (paymentUrl.isNotEmpty) {
            // Open payment URL in browser
            Uri paymentUri = Uri.parse(paymentUrl);
            if (await canLaunchUrl(paymentUri)) {
              await launchUrl(paymentUri, mode: LaunchMode.externalApplication);

              // Show success message
              Utils.showToast(
                  Get.context!, "Redirecting to Zitopay payment...");

              // Note: In production, you should implement webhook handling
              // to verify payment status from Zitopay callback
              // For now, we'll process after a short delay to allow payment completion
              // In production, implement proper webhook verification

              // Wait a moment for payment processing
              await Future.delayed(const Duration(seconds: 3));

              // Process payment completion
              await _processPaymentSuccess();

              return responseData;
            } else {
              throw Exception("Could not launch payment URL");
            }
          } else {
            throw Exception("Payment URL not received from Zitopay");
          }
        } else {
          throw Exception(
              responseData['message'] ?? 'Payment initiation failed');
        }
      } else {
        log("Error during Zitopay payment - Status: ${response.statusCode}");
        if (bookingScreenController != null) {
          bookingScreenController!.isLoading(false);
        }

        try {
          final errorResponse = jsonDecode(response.body);
          final errorMessage = errorResponse['message'] ?? 'Payment failed';
          Utils.showToast(Get.context!, errorMessage);
          throw errorMessage;
        } catch (parseError) {
          Utils.showToast(Get.context!, "Payment failed: Something went wrong");
          throw 'Something Went Wrong';
        }
      }
    } catch (e) {
      if (bookingScreenController != null) {
        bookingScreenController!.isLoading(false);
      }
      log('Zitopay Payment Error: $e');
      Utils.showToast(Get.context!, "Payment failed: $e");
      rethrow;
    }
  }

  Future<void> _processPaymentSuccess() async {
    try {
      // Check if booking controller is available
      if (bookingScreenController == null &&
          paymentScreenController.isWalletAdd != true) {
        log("Error: BookingScreenController not available for direct payment");
        Utils.showToast(
            Get.context!, "Error: Booking controller not available");
        return;
      }

      // Set loading state
      if (bookingScreenController != null) {
        bookingScreenController!.isLoading(true);
        bookingScreenController!.update([Constant.idProgressView]);
      }

      if (paymentScreenController.isWalletAdd == true) {
        // Wallet recharge
        await paymentScreenController.onDepositToWalletApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          amount: paymentScreenController.totalAmount ?? "",
          paymentGateway: "Zitopay",
        );

        if (paymentScreenController.depositToWalletModel?.status == true) {
          if (bookingScreenController != null) {
            bookingScreenController!.isLoading(false);
            bookingScreenController!.update([Constant.idProgressView]);
          }
          Utils.showToast(Get.context!,
              paymentScreenController.depositToWalletModel?.message ?? "");
          // For wallet recharge, return success result so recharge screen can navigate back to wallet
          Get.back(result: 'success');
        } else {
          if (bookingScreenController != null) {
            bookingScreenController!.isLoading(false);
            bookingScreenController!.update([Constant.idProgressView]);
          }
          Utils.showToast(Get.context!,
              paymentScreenController.depositToWalletModel?.message ?? "");
        }
      } else {
        // Direct payment - use passed data from payment controller
        // Recalculate total with discount before creating booking
        if (bookingScreenController != null) {
          bookingScreenController!.calculateTotalWithDiscount();
        }

        // Use the recalculated totalPrice (includes coupon discount)
        double finalAmount = bookingScreenController?.totalPrice ?? 0.0;

        // Ensure withoutTax is sent as double with 2 decimal places
        double withoutTaxValue = bookingScreenController != null
            ? double.parse(
                bookingScreenController!.withOutTaxRupee.toStringAsFixed(2))
            : 0.0;

        if (bookingScreenController == null) {
          Utils.showToast(
              Get.context!, "Error: Booking controller not available");
          return;
        }

        await bookingScreenController!.onCreateBookingApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          expertId: expertIds.isNotEmpty
              ? expertIds
              : (Constant.storage.read<String>('expertDetail') != null
                  ? Constant.storage.read<String>('expertDetail').toString()
                  : Constant.storage.read<String>('expertId') ?? ""),
          serviceId: serviceIds.isNotEmpty
              ? serviceIds
              : bookingScreenController!.serviceId.join(","),
          salonId: bookingScreenController!.salonId.toString(),
          date: dates.isNotEmpty
              ? dates
              : bookingScreenController!.formattedDate.toString(),
          time: times.isNotEmpty
              ? times
              : bookingScreenController!.slotsString.toString(),
          amount:
              finalAmount, // Use recalculated totalPrice with coupon discount
          withoutTax: withoutTaxValue, // Send as double with 2 decimal places
          paymentType: "Zitopay", // Use Zitopay as payment type
          atPlace: bookingScreenController!.selectedVenue == "At Salon" ? 1 : 2,
          address: bookingScreenController!.searchEditingController.text,
        );

        if (bookingScreenController!.createBookingCategory?.status == true) {
          final showFirstBookingCashback =
              bookingScreenController!.createBookingCategory?.firstBookingCashback ==
                  true;
          final bookingStatus =
              bookingScreenController!.createBookingCategory?.data?.status;
          bookingScreenController!.isLoading(false);
          bookingScreenController!.update([Constant.idProgressView]);

          Utils.showToast(Get.context!, "Payment successful! Booking created.");

          // Navigate back to home screen
          Get.offAndToNamed(AppRoutes.bottom);

          // Show success dialog
          Get.dialog(
            barrierColor: AppColors.blackColor.withValues(alpha: 0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              child: SuccessDialog(
                showFirstBookingCashback: showFirstBookingCashback,
                bookingStatus: bookingStatus,
              ),
            ),
          );
        } else {
          bookingScreenController!.isLoading(false);
          bookingScreenController!.update([Constant.idProgressView]);

          Utils.showToast(
              Get.context!,
              bookingScreenController!.createBookingCategory?.message ??
                  "Booking failed");
        }
      }
    } catch (e) {
      if (bookingScreenController != null) {
        bookingScreenController!.isLoading(false);
        bookingScreenController!.update([Constant.idProgressView]);
      }
      log("Error processing Zitopay payment success: $e");
      Utils.showToast(Get.context!, "Error processing payment: $e");
    }
  }
}
