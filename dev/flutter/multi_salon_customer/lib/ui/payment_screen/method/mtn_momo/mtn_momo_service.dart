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
  static late String mtnMomoSubscriptionKey; // Subscription Key (Primary or Secondary from subscription)
  static late String mtnMomoApiUserId; // API User ID (UUID created when creating API User)
  static late String mtnMomoApiKey; // API Key (generated for API User)
  static late String mtnMomoEnvironment;
  // Legacy fields (kept for backward compatibility)
  static String? mtnMomoPrimaryKey;
  static String? mtnMomoSecondaryKey;
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
    log("mtnMomoSubscriptionKey :: $mtnMomoSubscriptionKeyParam");
    log("mtnMomoEnvironment :: $mtnMomoEnvironmentParam");
    log("totalAmountWithOutTax :: $totalAmountWithOutTax");
    log("paymentType :: $paymentType");
    log("serviceId :: $serviceId");
    log("expertId :: $expertId");
    log("time :: $time");

    // Get MTN MoMo credentials from settings (matching salon portal implementation)
    String subscriptionKey = mtnMomoSubscriptionKeyParam ??
        splashController.settingCategory?.setting?.mtnMomoSubscriptionKey ??
        "";
    String apiUserId = splashController.settingCategory?.setting?.mtnMomoApiUserId ?? "";
    String apiKey = splashController.settingCategory?.setting?.mtnMomoApiKey ?? "";
    String environment = mtnMomoEnvironmentParam ??
        splashController.settingCategory?.setting?.mtnMomoEnvironment ??
        "sandbox";

    // Validate required MTN MoMo credentials
    if (subscriptionKey.isEmpty) {
      throw Exception("MTN MoMo Subscription Key is not configured. Please add it in Admin Settings.");
    }

    if (apiUserId.isEmpty) {
      throw Exception("MTN MoMo API User ID is not configured. Please add it in Admin Settings.");
    }

    if (apiKey.isEmpty) {
      throw Exception("MTN MoMo API Key is not configured. Please add it in Admin Settings.");
    }

    log("Using MTN MoMo Subscription Key: ${subscriptionKey.substring(0, 7)}...");
    log("Using MTN MoMo API User ID: ${apiUserId.substring(0, 8)}...");
    log("Using MTN MoMo environment: $environment");

    mtnMomoSubscriptionKey = subscriptionKey;
    mtnMomoApiUserId = apiUserId;
    mtnMomoApiKey = apiKey;
    mtnMomoEnvironment = environment;
    // Keep legacy fields for backward compatibility
    mtnMomoPrimaryKey = mtnMomoPrimaryKeyParam ?? splashController.settingCategory?.setting?.mtnMomoPrimaryKey;
    mtnMomoSecondaryKey = mtnMomoSecondaryKeyParam ?? splashController.settingCategory?.setting?.mtnMomoSecondaryKey;
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

      // MTN MoMo Authentication Flow (matching salon portal implementation):
      // According to MTN MoMo API documentation:
      // 1. Subscription Key = Primary or Secondary Key from subscription (Ocp-Apim-Subscription-Key header)
      // 2. API User ID = UUID created when creating API User
      // 3. API Key = Generated for API User
      // 4. To get token, use Basic Auth with base64(API_USER_ID:API_KEY)
      // 5. Subscription Key goes in Ocp-Apim-Subscription-Key header
      
      // Set environment value - MTN MoMo expects "sandbox" or "production" (lowercase)
      String targetEnvironment = mtnMomoEnvironment.toLowerCase();
      if (targetEnvironment != "sandbox" && targetEnvironment != "production") {
        log("WARNING: Invalid environment '$mtnMomoEnvironment'. Defaulting to 'sandbox'");
        targetEnvironment = "sandbox";
      }
      
      // Use Basic Auth with API User ID and API Key (matching salon portal)
      String tokenCredentials = base64Encode(utf8.encode('$mtnMomoApiUserId:$mtnMomoApiKey'));
      
      Map<String, String> tokenHeaders = {
        'Authorization': 'Basic $tokenCredentials', // Basic Auth: base64(API_USER_ID:API_KEY)
        'Ocp-Apim-Subscription-Key': mtnMomoSubscriptionKey, // Subscription Key from subscription
        'X-Target-Environment': targetEnvironment,
        'Content-Type': 'application/json',
      };
      
      log("MTN MoMo Token Request - Environment: $targetEnvironment");
      log("MTN MoMo Token Request - Using Subscription Key: ${mtnMomoSubscriptionKey.substring(0, 7)}...");
      log("MTN MoMo Token Request - Using API User ID: ${mtnMomoApiUserId.substring(0, 8)}...");
      
      var tokenResponse = await http.post(
        Uri.parse('$baseUrl/collection/token/'),
        headers: tokenHeaders,
      );

      log("MTN MoMo Token Response StatusCode :: ${tokenResponse.statusCode}");
      log("MTN MoMo Token Response Body :: ${tokenResponse.body}");

      if (tokenResponse.statusCode != 200) {
        String errorDetails = "";
        try {
          final errorData = jsonDecode(tokenResponse.body);
          errorDetails = errorData['message'] ?? errorData['error'] ?? errorData.toString();
        } catch (e) {
          errorDetails = tokenResponse.body.isNotEmpty ? tokenResponse.body : "No error details provided";
        }
        
        String errorMessage = "Failed to get MTN MoMo access token. Status: ${tokenResponse.statusCode}";
        if (errorDetails.isNotEmpty) {
          errorMessage += "\nError: $errorDetails";
        }
        
        // Provide helpful guidance based on status code
        if (tokenResponse.statusCode == 401) {
          errorMessage += "\n\nPossible causes:";
          errorMessage += "\n1. Invalid Primary Key or Secondary Key";
          errorMessage += "\n2. Missing or incorrect Subscription Key (Ocp-Apim-Subscription-Key)";
          errorMessage += "\n3. API User not created in MTN MoMo Developer Portal";
          errorMessage += "\n4. Wrong environment (sandbox vs production)";
          errorMessage += "\n\nPlease verify your MTN MoMo credentials in Admin Settings.";
        }
        
        throw Exception(errorMessage);
      }

      final tokenData = jsonDecode(tokenResponse.body);
      String accessToken = tokenData['access_token'] ?? '';

      if (accessToken.isEmpty) {
        throw Exception("Access token not received from MTN MoMo");
      }

      log("MTN MoMo Access Token received");

      // Step 2: Request to pay using access token
      // Generate UUID format reference for X-Reference-Id (matching salon portal)
      String uuidReference = "${DateTime.now().millisecondsSinceEpoch}_${userId}_${DateTime.now().microsecondsSinceEpoch}";
      String externalId = "CUSTOMER_${DateTime.now().millisecondsSinceEpoch}_$userId";
      
      // Currency handling (matching salon portal)
      // Sandbox: Only supports EUR
      // Production: Supports XAF for Cameroon
      String paymentCurrency;
      double paymentAmount = amountDouble;
      
      if (targetEnvironment == "production") {
        paymentCurrency = "XAF";
        // Convert to XAF if needed (matching salon portal logic)
        if (currency.toUpperCase() != "XAF") {
          // Conversion rates (approximate)
          double rate = 655.0; // Default: EUR to XAF
          if (currency.toUpperCase() == "USD") rate = 600.0;
          if (currency.toUpperCase() == "GBP") rate = 750.0;
          paymentAmount = paymentAmount * rate;
          log("[Production] Converted $amountDouble $currency to ${paymentAmount.toStringAsFixed(2)} XAF");
        }
        // Format amount as whole number for XAF
        paymentAmount = paymentAmount.roundToDouble();
      } else {
        // Sandbox: Only supports EUR
        paymentCurrency = "EUR";
        // Convert to EUR if needed (matching salon portal logic)
        if (currency.toUpperCase() != "EUR") {
          // Conversion rates (approximate)
          double rate = 0.0015; // Default: XAF to EUR
          if (currency.toUpperCase() == "USD") rate = 0.92;
          if (currency.toUpperCase() == "GBP") rate = 1.15;
          paymentAmount = paymentAmount * rate;
          log("[Sandbox] Converted $amountDouble $currency to ${paymentAmount.toStringAsFixed(2)} EUR");
        }
        // Format amount with 2 decimal places for EUR
        paymentAmount = double.parse(paymentAmount.toStringAsFixed(2));
      }

      // Clean phone number (remove non-digits)
      String cleanPhone = userPhone.replaceAll(RegExp(r'[^\d]'), '');
      
      // Validate phone number format (should start with country code)
      if (cleanPhone.length < 9) {
        throw Exception("Invalid phone number format. Please include country code (e.g., 237 for Cameroon)");
      }

      // Prepare payment request body (matching salon portal format)
      Map<String, dynamic> body = {
        'amount': targetEnvironment == "production" 
            ? paymentAmount.toStringAsFixed(0) // Whole number for XAF
            : paymentAmount.toStringAsFixed(2), // 2 decimal places for EUR
        'currency': paymentCurrency,
        'externalId': externalId,
        'payer': {
          'partyIdType': 'MSISDN',
          'partyId': cleanPhone,
        },
        'payerMessage': paymentScreenController.isWalletAdd == true 
            ? 'Wallet recharge for $userName'
            : 'Payment for Skedisy Booking - $userName',
        'payeeNote': paymentScreenController.isWalletAdd == true 
            ? 'Customer Wallet Recharge'
            : 'Skedisy Booking Payment',
      };

      log("MTN MoMo request body :: $body");

      // Reuse targetEnvironment from above
      
      Map<String, String> paymentHeaders = {
        'Authorization': 'Bearer $accessToken',
        'Ocp-Apim-Subscription-Key': mtnMomoSubscriptionKey, // Subscription Key from subscription
        'X-Target-Environment': targetEnvironment,
        'X-Reference-Id': uuidReference, // UUID format reference
        'X-Callback-Url': 'https://skedisy.com/user/handleMTNMomoPaymentCallback', // Callback URL
        'Content-Type': 'application/json',
      };
      
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
        
        // Check payment status using uuidReference
        await _checkPaymentStatus(uuidReference);
        
        return {"status": "success", "reference": uuidReference};
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

      // Get access token using API User ID and API Key (matching salon portal)
      String tokenCredentials = base64Encode(utf8.encode('$mtnMomoApiUserId:$mtnMomoApiKey'));
      
      // Set environment value - MTN MoMo expects "sandbox" or "production" (lowercase)
      String targetEnvironment = mtnMomoEnvironment.toLowerCase();
      if (targetEnvironment != "sandbox" && targetEnvironment != "production") {
        targetEnvironment = "sandbox";
      }
      
      Map<String, String> tokenHeaders = {
        'Authorization': 'Basic $tokenCredentials', // Basic Auth: base64(API_USER_ID:API_KEY)
        'Ocp-Apim-Subscription-Key': mtnMomoSubscriptionKey, // Subscription Key from subscription
        'X-Target-Environment': targetEnvironment,
      };
      
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

      // Reuse targetEnvironment from above
      
      Map<String, String> statusHeaders = {
        'Authorization': 'Bearer $accessToken',
        'Ocp-Apim-Subscription-Key': mtnMomoSubscriptionKey, // Subscription Key from subscription
        'X-Target-Environment': targetEnvironment,
      };
      
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

