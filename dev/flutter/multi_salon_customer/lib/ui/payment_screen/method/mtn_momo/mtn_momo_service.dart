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

class MtnMomoService {
  static late String mtnMomoPrimaryKey;
  static late String mtnMomoSecondaryKey;
  static late String mtnMomoSubscriptionKey;
  static late String mtnMomoEnvironment;
  static late String mtnMomoApiKey; // Generated from Primary/Secondary Key
  static late String mtnMomoApiSecret; // Generated from Primary/Secondary Key
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

  MtnMomoService() {
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
    String? mtnMomoPrimaryKeyParam,
    String? mtnMomoSecondaryKeyParam,
    String? mtnMomoSubscriptionKeyParam,
    String? mtnMomoEnvironmentParam,
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
    log("mtnMomoPrimaryKey :: $mtnMomoPrimaryKeyParam");
    log("mtnMomoSecondaryKey :: $mtnMomoSecondaryKeyParam");
    log("mtnMomoSubscriptionKey :: $mtnMomoSubscriptionKeyParam");
    log("mtnMomoEnvironment :: $mtnMomoEnvironmentParam");
    log("totalAmountWithOutTax :: $totalAmountWithOutTax");
    log("paymentType :: $paymentType");
    log("serviceId :: $serviceId");
    log("expertId :: $expertId");
    log("time :: $time");

    // Validate MTN MoMo keys
    String primaryKey = mtnMomoPrimaryKeyParam ??
        splashController.settingCategory?.setting?.mtnMomoPrimaryKey ??
        "";
    String secondaryKey = mtnMomoSecondaryKeyParam ??
        splashController.settingCategory?.setting?.mtnMomoSecondaryKey ??
        "";
    String subscriptionKey = mtnMomoSubscriptionKeyParam ??
        splashController.settingCategory?.setting?.mtnMomoSubscriptionKey ??
        "";
    String environment = mtnMomoEnvironmentParam ??
        splashController.settingCategory?.setting?.mtnMomoEnvironment ??
        "sandbox";

    if (primaryKey.isEmpty) {
      throw Exception("MTN MoMo Primary Key is not configured");
    }

    if (secondaryKey.isEmpty) {
      throw Exception("MTN MoMo Secondary Key is not configured");
    }

    // Subscription Key is optional - can be empty if not required by your MTN MoMo setup
    if (subscriptionKey.isEmpty) {
      log("MTN MoMo Subscription Key is not provided - proceeding without it");
    }

    log("Using MTN MoMo Primary Key: ${primaryKey.substring(0, 7)}...");
    log("Using MTN MoMo environment: $environment");

    mtnMomoPrimaryKey = primaryKey;
    mtnMomoSecondaryKey = secondaryKey;
    mtnMomoSubscriptionKey = subscriptionKey;
    mtnMomoEnvironment = environment;
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

  Future<dynamic> mtnMomoPay() async {
    log("mtnMomoPrimaryKey :::: $mtnMomoPrimaryKey");
    log("mtnMomoSecondaryKey :::: $mtnMomoSecondaryKey");
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

      // Determine base URL based on environment
      String baseUrl = mtnMomoEnvironment == "production"
          ? "https://api.momodeveloper.mtn.com"
          : Constant.mtnMomoBaseUrl;

      // Step 1: Create API User (if not exists) using Primary Key and Secondary Key
      // Step 2: Create API Key for the user
      // Step 3: Get access token using API Key and API Secret
      
      // First, create/get API Key using Primary Key and Secondary Key
      String primarySecondaryCredentials = base64Encode(utf8.encode('$mtnMomoPrimaryKey:$mtnMomoSecondaryKey'));
      
      // Create API Key (this will return API Key and API Secret)
      Map<String, String> apiKeyHeaders = {
        'Authorization': 'Basic $primarySecondaryCredentials',
        'X-Target-Environment': mtnMomoEnvironment,
      };
      
      // Only add Subscription Key if provided
      if (mtnMomoSubscriptionKey.isNotEmpty) {
        apiKeyHeaders['Ocp-Apim-Subscription-Key'] = mtnMomoSubscriptionKey;
      }
      
      var apiKeyResponse = await http.post(
        Uri.parse('$baseUrl/v1_0/apiuser/$mtnMomoPrimaryKey/apikey'),
        headers: apiKeyHeaders,
      );

      log("MTN MoMo API Key Response StatusCode :: ${apiKeyResponse.statusCode}");
      log("MTN MoMo API Key Response Body :: ${apiKeyResponse.body}");

      if (apiKeyResponse.statusCode != 201 && apiKeyResponse.statusCode != 200) {
        // If API Key creation fails, try to get existing one
        log("API Key creation failed, trying to get existing API Key");
      } else {
        final apiKeyData = jsonDecode(apiKeyResponse.body);
        mtnMomoApiKey = apiKeyData['apiKey'] ?? mtnMomoPrimaryKey; // Fallback to Primary Key if not returned
        // Note: API Secret is not returned, we need to use Primary/Secondary for token
      }

      // Step 2: Get access token using Primary Key and Secondary Key
      // MTN MoMo uses Primary Key and Secondary Key directly for token generation
      String tokenCredentials = base64Encode(utf8.encode('$mtnMomoPrimaryKey:$mtnMomoSecondaryKey'));
      
      Map<String, String> tokenHeaders = {
        'Authorization': 'Basic $tokenCredentials',
      };
      
      // Only add Subscription Key if provided
      if (mtnMomoSubscriptionKey.isNotEmpty) {
        tokenHeaders['Ocp-Apim-Subscription-Key'] = mtnMomoSubscriptionKey;
      }
      
      var tokenResponse = await http.post(
        Uri.parse('$baseUrl/collection/token/'),
        headers: tokenHeaders,
      );

      log("MTN MoMo Token Response StatusCode :: ${tokenResponse.statusCode}");
      log("MTN MoMo Token Response Body :: ${tokenResponse.body}");

      if (tokenResponse.statusCode != 200) {
        throw Exception("Failed to get MTN MoMo access token. Status: ${tokenResponse.statusCode}");
      }

      final tokenData = jsonDecode(tokenResponse.body);
      String accessToken = tokenData['access_token'] ?? '';

      if (accessToken.isEmpty) {
        throw Exception("Access token not received from MTN MoMo");
      }

      log("MTN MoMo Access Token received");

      // Step 2: Request to pay using access token
      String reference = "SKEDISY_${DateTime.now().millisecondsSinceEpoch}_$userId";

      // Prepare payment request body
      Map<String, dynamic> body = {
        'amount': amountDouble.toStringAsFixed(2),
        'currency': currency,
        'externalId': reference,
        'payer': {
          'partyIdType': 'MSISDN',
          'partyId': userPhone.replaceAll(RegExp(r'[^\d]'), ''), // Remove non-digits, keep only phone number
        },
        'payerMessage': 'Payment for Skedisy Booking - $userName',
        'payeeNote': 'Skedisy Booking Payment',
      };

      log("MTN MoMo request body :: $body");

      Map<String, String> paymentHeaders = {
        'Authorization': 'Bearer $accessToken',
        'X-Target-Environment': mtnMomoEnvironment,
        'X-Reference-Id': reference,
        'X-Callback-Url': 'https://skedisy.com/payment/mtn-momo/callback', // Your webhook URL
        'Content-Type': 'application/json',
      };
      
      // Only add Subscription Key if provided
      if (mtnMomoSubscriptionKey.isNotEmpty) {
        paymentHeaders['Ocp-Apim-Subscription-Key'] = mtnMomoSubscriptionKey;
      }
      
      var response = await http.post(
        Uri.parse('$baseUrl/collection/v1_0/requesttopay'),
        headers: paymentHeaders,
        body: jsonEncode(body),
      );

      log("MTN MoMo Payment Response StatusCode :: ${response.statusCode}");
      log("MTN MoMo Payment Response Body :: ${response.body}");

      if (response.statusCode == 202) {
        // 202 Accepted means payment request was created successfully
        // Payment status will be confirmed via webhook callback
        
        Utils.showToast(Get.context!, "Payment request sent. Please approve on your phone.");
        
        // Wait a moment for payment processing
        await Future.delayed(const Duration(seconds: 3));
        
        // Check payment status
        await _checkPaymentStatus(reference);
        
        return {"status": "success", "reference": reference};
      } else {
        log("Error during MTN MoMo payment - Status: ${response.statusCode}");
        if (bookingScreenController != null) {
          bookingScreenController!.isLoading(false);
        }

        try {
          final errorResponse = jsonDecode(response.body);
          final errorMessage =
              errorResponse['message'] ?? 'Payment failed';
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
      log('MTN MoMo Payment Error: $e');
      Utils.showToast(Get.context!, "Payment failed: $e");
      rethrow;
    }
  }

  Future<void> _checkPaymentStatus(String reference) async {
    try {
      String baseUrl = mtnMomoEnvironment == "production"
          ? "https://api.momodeveloper.mtn.com"
          : Constant.mtnMomoBaseUrl;

      // Get access token first
      String tokenCredentials = base64Encode(utf8.encode('$mtnMomoApiKey:$mtnMomoApiSecret'));
      
      Map<String, String> tokenHeaders = {
        'Authorization': 'Basic $tokenCredentials',
      };
      
      // Only add Subscription Key if provided
      if (mtnMomoSubscriptionKey.isNotEmpty) {
        tokenHeaders['Ocp-Apim-Subscription-Key'] = mtnMomoSubscriptionKey;
      }
      
      var tokenResponse = await http.post(
        Uri.parse('$baseUrl/collection/token/'),
        headers: tokenHeaders,
      );

      if (tokenResponse.statusCode != 200) {
        log("Failed to get access token for status check");
        return;
      }

      final tokenData = jsonDecode(tokenResponse.body);
      String accessToken = tokenData['access_token'] ?? '';

      if (accessToken.isEmpty) {
        log("Access token not received for status check");
        return;
      }

      Map<String, String> statusHeaders = {
        'Authorization': 'Bearer $accessToken',
        'X-Target-Environment': mtnMomoEnvironment,
      };
      
      // Only add Subscription Key if provided
      if (mtnMomoSubscriptionKey.isNotEmpty) {
        statusHeaders['Ocp-Apim-Subscription-Key'] = mtnMomoSubscriptionKey;
      }
      
      var response = await http.get(
        Uri.parse('$baseUrl/collection/v1_0/requesttopay/$reference'),
        headers: statusHeaders,
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        String status = responseData['status'] ?? '';
        
        if (status == 'SUCCESSFUL') {
          await _processPaymentSuccess();
        } else if (status == 'FAILED' || status == 'CANCELLED') {
          Utils.showToast(Get.context!, "Payment $status");
          if (bookingScreenController != null) {
            bookingScreenController!.isLoading(false);
            bookingScreenController!.update([Constant.idProgressView]);
          }
        } else {
          // PENDING - wait and check again
          await Future.delayed(const Duration(seconds: 2));
          await _checkPaymentStatus(reference);
        }
      }
    } catch (e) {
      log("Error checking MTN MoMo payment status: $e");
    }
  }

  Future<void> _processPaymentSuccess() async {
    try {
      // Check if booking controller is available
      if (bookingScreenController == null && paymentScreenController.isWalletAdd != true) {
        log("Error: BookingScreenController not available for direct payment");
        Utils.showToast(Get.context!, "Error: Booking controller not available");
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
          paymentGateway: "MTN MoMo",
        );

        if (paymentScreenController.depositToWalletModel?.status == true) {
          if (bookingScreenController != null) {
            bookingScreenController!.isLoading(false);
            bookingScreenController!.update([Constant.idProgressView]);
          }
          Utils.showToast(
              Get.context!,
              paymentScreenController.depositToWalletModel?.message ?? "");
          Get.back();
        } else {
          if (bookingScreenController != null) {
            bookingScreenController!.isLoading(false);
            bookingScreenController!.update([Constant.idProgressView]);
          }
          Utils.showToast(
              Get.context!,
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
          Utils.showToast(Get.context!, "Error: Booking controller not available");
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
          amount: finalAmount, // Use recalculated totalPrice with coupon discount
          withoutTax: withoutTaxValue, // Send as double with 2 decimal places
          paymentType: "MTN MoMo", // Use MTN MoMo as payment type
          atPlace: bookingScreenController!.selectedVenue == "At Salon" ? 1 : 2,
          address: bookingScreenController!.searchEditingController.text,
        );

        if (bookingScreenController!.createBookingCategory?.status == true) {
          bookingScreenController!.isLoading(false);
          bookingScreenController!.update([Constant.idProgressView]);
          
          Utils.showToast(
              Get.context!, "Payment successful! Booking created.");

          // Navigate back to home screen
          Get.offAndToNamed(AppRoutes.bottom);

          // Show success dialog
          Get.dialog(
            barrierColor: AppColors.blackColor.withValues(alpha: 0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              child: SuccessDialog(),
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
      log("Error processing MTN MoMo payment success: $e");
      Utils.showToast(Get.context!, "Error processing payment: $e");
    }
  }
}

