import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
// import 'package:salon_2/ui/payment_screen/method/flutter_wave/flutter_wave_service.dart'; // Commented out - not used for wallet recharge
// import 'package:salon_2/ui/payment_screen/method/razor_pay/razor_pay_service.dart'; // Commented out - not used for wallet recharge
import 'package:flutter/material.dart';
import 'package:salon_2/custom/dialog/success_dialog.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/notification_screen/controller/notification_controller.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/category_details/controller/category_detail_controller.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/payment_screen/method/mtn_momo/mtn_momo_service.dart';
import 'package:salon_2/ui/payment_screen/model/deposit_to_wallet_model.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/app_colors.dart';

import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

class PaymentScreenController extends GetxController {
  dynamic args = Get.arguments;

  bool? isWalletAdd;
  bool? isCreateOrder;
  String? totalAmount;
  String? selectedPayment;
  Map<String, dynamic>?
      bookingData; // Additional booking data for direct payments

  // Loading state management
  RxBool isLoading = false.obs;

  // Flag to track if screen is closed (to prevent updates after navigation)
  bool isScreenClosed = false;

  // MTN MoMo phone number controller
  TextEditingController mtnMomoPhoneController = TextEditingController();
  bool useRegisteredPhoneForMtnMomo = true; // Default to using registered phone

  // Booking controller reference for creating bookings
  BookingScreenController? bookingScreenController;

  @override
  void onInit() async {
    log("═══════════════════════════════════════════════════════════");
    log("Payment Screen - onInit() START");
    log("═══════════════════════════════════════════════════════════");

    // ROLLBACK: Don't force initialize selectedPayment to null here
    // Let getDataFromArgs() handle it properly to preserve profile flow
    isWalletAdd = false;
    log("Payment Screen - Initialized: isWalletAdd = false");

    // Initialize MTN MoMo phone controller with registered phone number
    String registeredPhone = Constant.storage.read<String>('UserMobile') ?? "";
    mtnMomoPhoneController.text = registeredPhone;
    useRegisteredPhoneForMtnMomo = true;

    // Ensure SplashController is initialized and settings are loaded
    try {
      final splashController = Get.find<SplashController>();
      if (splashController.settingCategory == null) {
        log("Payment Screen - Settings not loaded, loading now...");
        await splashController.onSettingApiCall();
      }
    } catch (e) {
      log("Payment Screen - SplashController not found, initializing...");
      try {
        final splashController = Get.put(SplashController());
        await splashController.onSettingApiCall();
      } catch (e2) {
        log("Payment Screen - Failed to initialize SplashController: $e2");
      }
    }

    await getDataFromArgs();

    log("Payment Screen - onInit() after getDataFromArgs()");
    log("   - isWalletAdd: $isWalletAdd");
    log("   - selectedPayment: $selectedPayment");

    // CRITICAL FIX: For wallet recharge, ALWAYS force selectedPayment to null
    // This prevents "cash on service" or any booking payment method from appearing
    // Even if user selected "cash on service" in booking, wallet recharge must show Stripe/MTN MoMo
    if (isWalletAdd == true) {
      log("✅ Payment Screen - Confirmed wallet recharge in onInit()");
      
      // CRITICAL: Force selectedPayment to null for wallet recharge, regardless of previous selection
      // This is especially important when recharging from booking flow where user may have selected "cashAfterService"
      if (selectedPayment != null && selectedPayment != "") {
        log("⚠️ Payment Screen - CRITICAL FIX: Clearing selectedPayment '$selectedPayment' for wallet recharge");
        log("⚠️ Payment Screen - This prevents booking payment method (e.g., 'cashAfterService') from appearing during wallet recharge");
        selectedPayment = null;
        update([Constant.idSelectPaymentMethod]);
      }
      // Force to null one more time to be absolutely sure (even if it was already null)
      selectedPayment = null;
      log("✅ Payment Screen - Wallet recharge: selectedPayment is '$selectedPayment' (forced null)");

      // CRITICAL: For wallet recharge, DO NOT initialize BookingScreenController
      // This prevents reading selectedPayment from booking controller
      bookingScreenController = null;
      log("✅ Payment Screen - Skipping BookingScreenController initialization for wallet recharge");
    } else {
      log("Payment Screen - This is NOT a wallet recharge, proceeding with booking flow");
    }

    // Initialize booking controller and sync coupon data for booking payments ONLY
    // DO NOT initialize for wallet recharge to prevent interference
    if (isWalletAdd == false && isCreateOrder == true) {
      log("Payment Screen - Initializing BookingScreenController for booking payment");
      try {
        bookingScreenController = Get.find<BookingScreenController>();
        log("Payment Screen - Found BookingScreenController, selectedPayment in booking controller: ${bookingScreenController?.selectedPayment}");

        // Sync coupon data from bookingData if available
        if (bookingData != null) {
          if (bookingData!['selectedCouponId'] != null) {
            bookingScreenController!.selectedCouponId =
                bookingData!['selectedCouponId'];
          }
          if (bookingData!['manualCouponCode'] != null) {
            bookingScreenController!.manualCouponCode =
                bookingData!['manualCouponCode'];
            bookingScreenController!.couponCodeController.text =
                bookingData!['manualCouponCode'];
          }
          if (bookingData!['couponDiscountAmount'] != null) {
            bookingScreenController!.couponDiscountAmount =
                (bookingData!['couponDiscountAmount'] as num).toDouble();
          }
          if (bookingData!['withOutTaxRupee'] != null) {
            bookingScreenController!.withOutTaxRupee =
                (bookingData!['withOutTaxRupee'] as num).toDouble();
          }
          if (bookingData!['tax'] != null) {
            bookingScreenController!.tax = bookingData!['tax'] as int?;
          }
        }

        // Recalculate total with discount
        bookingScreenController!.calculateTotalWithDiscount();
        // Update total amount if it changed
        if (bookingScreenController!.totalPrice.toString() != totalAmount) {
          totalAmount = bookingScreenController!.totalPrice.toString();
        }

        // NOTE: This block only runs for booking payments (isWalletAdd == false)
        // For wallet recharge, booking controller is not initialized (see line 111)
        // So we don't need to check isWalletAdd here - it's already false

        // Fetch coupons if not already fetched (for payment screen)
        if (bookingScreenController!.getCouponModel == null &&
            bookingScreenController!.withOutTaxRupee > 0) {
          String userId = Constant.storage.read<String>('userId') ?? "";
          bookingScreenController!.getCouponApiCall(
            userId: userId,
            type: "2", // Type 2 for booking
            amount: bookingScreenController!.withOutTaxRupee.toInt().toString(),
          );
        }

        log("Initialized booking controller and synced coupon data for payment screen");
        // Update UI to show coupon section
        update([Constant.idSelectPaymentMethod]);
      } catch (e) {
        log("Error initializing booking controller or syncing coupon data: $e");
        // Still update UI even if there's an error
        update([Constant.idSelectPaymentMethod]);
      }
    }
    super.onInit();
  }

  @override
  void onClose() {
    // Mark screen as closed to prevent any further updates
    isScreenClosed = true;

    // Clear all loading states when screen is closed
    log("Payment Screen - onClose called, clearing loading states");
    isLoading.value = false;

    // Dispose MTN MoMo phone controller
    mtnMomoPhoneController.dispose();
    update([Constant.idProgressView]);

    // Clear booking controller loading state if it exists
    if (bookingScreenController != null) {
      try {
        bookingScreenController!.isLoading(false);
        bookingScreenController!.update([Constant.idProgressView]);
        log("Payment Screen - Cleared booking controller loading state on close");
      } catch (e) {
        log("Payment Screen - Error clearing booking controller loading state: $e");
      }
    }

    super.onClose();
  }

  // Helper method to check if screen is still active before updating UI
  bool get isScreenActive => !isScreenClosed;

  getDataFromArgs() {
    log("═══════════════════════════════════════════════════════════");
    log("Payment Screen - getDataFromArgs() START");
    log("═══════════════════════════════════════════════════════════");
    log("Payment Screen - Args received: $args");
    log("Payment Screen - Args type: ${args.runtimeType}");

    // CRITICAL: Initialize isWalletAdd to false by default to prevent null issues
    // CRITICAL: Initialize selectedPayment to null FIRST to prevent any pre-existing values
    isWalletAdd = false;
    selectedPayment = null;
    log("Payment Screen - Initialized defaults: isWalletAdd = false, selectedPayment = null");

    if (args != null) {
      log("Payment Screen - Args length: ${args.length}");

      // Log each argument individually
      for (int i = 0; i < args.length; i++) {
        log("Payment Screen - Args[$i]: ${args[i]} (type: ${args[i].runtimeType})");
      }

      // First, check if this is a wallet recharge by examining args[0]
      // This must be done BEFORE any assignments to ensure correct detection
      bool isWalletRechargeArg = false;
      if (args.length >= 3) {
        // Check if first argument indicates wallet recharge
        log("Payment Screen - Checking args[0] for wallet recharge: ${args[0]} (type: ${args[0].runtimeType})");
        if (args[0] == true || args[0] == "true" || args[0] == 1) {
          isWalletRechargeArg = true;
          log("✅ Payment Screen - Detected wallet recharge from args[0]: ${args[0]}");
        } else {
          log("❌ Payment Screen - NOT a wallet recharge, args[0] is: ${args[0]}");
        }
      }

      if (args.length >= 4) {
        log("Payment Screen - Processing 4+ arguments");
        // Explicitly check for wallet recharge first
        if (isWalletRechargeArg) {
          isWalletAdd = true;
          // For wallet recharge, explicitly set selectedPayment to null
          // This ensures we don't accidentally use a previous payment method
          selectedPayment = null;
          log("✅ Payment Screen - Wallet recharge detected with 4 arguments");
          log("   - isWalletAdd set to: $isWalletAdd");
          log("   - selectedPayment set to: $selectedPayment");
        } else {
          isWalletAdd = args[0] as bool? ?? false;
          selectedPayment = args[3] as String?;
          log("Payment Screen - Booking payment detected with 4 arguments");
          log("   - isWalletAdd set to: $isWalletAdd");
          log("   - selectedPayment set to: $selectedPayment");
        }
        totalAmount = args[1] as String?;
        isCreateOrder = args[2] as bool? ?? false;
        if (args.length > 4) {
          bookingData =
              args[4] as Map<String, dynamic>?; // Additional booking data
        }
      } else if (args.length >= 3) {
        log("Payment Screen - Processing 3 arguments");
        // Handle wallet recharge case with 3 or 4 arguments
        if (isWalletRechargeArg) {
          isWalletAdd = true;
          selectedPayment = null; // Explicitly null for wallet recharge
          log("✅ Payment Screen - Wallet recharge confirmed with 3 arguments");
          log("   - isWalletAdd set to: $isWalletAdd");
          log("   - selectedPayment set to: $selectedPayment");
        } else {
          isWalletAdd = args[0] as bool? ?? false;
          selectedPayment = null; // Will be set to default below
          log("Payment Screen - Booking payment with 3 arguments");
          log("   - isWalletAdd set to: $isWalletAdd");
          log("   - selectedPayment set to: $selectedPayment");
        }
        totalAmount = args[1] as String?;
        isCreateOrder = args[2] as bool? ?? false;
      }

      // Double-check: Ensure isWalletAdd is explicitly true for wallet recharge
      // This is a safety check in case the above logic missed it
      if (args.length >= 3 &&
          (args[0] == true || args[0] == "true" || args[0] == 1)) {
        log("Payment Screen - Double-checking wallet recharge condition...");
        isWalletAdd = true;
        // CRITICAL FIX: For wallet recharge from booking, ALWAYS force selectedPayment to null
        // This prevents "cash on service" or any booking payment method from appearing
        // The user selected "cash on service" in booking, but for wallet recharge we need Stripe/MTN MoMo
        if (selectedPayment != null && selectedPayment != "") {
          log("⚠️ Payment Screen - CRITICAL FIX: Clearing selectedPayment '$selectedPayment' for wallet recharge from booking");
          log("⚠️ Payment Screen - This prevents booking payment method (e.g., 'cashAfterService') from appearing during wallet recharge");
          selectedPayment = null;
        }
        // Force to null one more time to be absolutely sure
        selectedPayment = null;
        log("✅ Payment Screen - Final confirmation: This is a wallet recharge");
        log("   - isWalletAdd: $isWalletAdd");
        log("   - selectedPayment: $selectedPayment (forced null for wallet recharge)");
      }

      // Set default payment method if not specified
      // For wallet recharge, leave as null to show only Stripe and MTN MoMo
      // For booking, default to wallet
      if (selectedPayment == null && isWalletAdd != true) {
        selectedPayment = "wallet";
        log("Payment Screen - Set default selectedPayment to 'wallet' for booking");
      }
      // For wallet recharge, keep selectedPayment as null to show only Stripe and MTN MoMo

      log("Payment Screen - Final values after getDataFromArgs():");
      log("   - isWalletAdd: $isWalletAdd (type: ${isWalletAdd.runtimeType})");
      log("   - selectedPayment: $selectedPayment");
      log("   - totalAmount: $totalAmount");
      log("   - isCreateOrder: $isCreateOrder");
    } else {
      log("⚠️ Payment Screen - Args is null!");
    }
    log("═══════════════════════════════════════════════════════════");
    log("Payment Screen - getDataFromArgs() END");
    log("═══════════════════════════════════════════════════════════");
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

    // CRITICAL FIX: For wallet recharge, ALWAYS force selectedPayment to null
    // This prevents "cash on service" or any booking payment method from appearing
    // Even if user selected "cash on service" in booking, wallet recharge must show Stripe/MTN MoMo
    if (isWalletAdd == true) {
      // CRITICAL: Force selectedPayment to null for wallet recharge, regardless of previous selection
      // This is especially important when recharging from booking flow where user may have selected "cashAfterService"
      if (selectedPayment != null && selectedPayment != "") {
        log("⚠️ Payment Screen - CRITICAL FIX: Final check - Clearing selectedPayment '$selectedPayment' for wallet recharge");
        log("⚠️ Payment Screen - This prevents booking payment method (e.g., 'cashAfterService') from appearing during wallet recharge");
        selectedPayment = null;
      }
      // Force to null one more time to be absolutely sure
      selectedPayment = null;
      log("✅ Payment Screen - Final check: Wallet recharge confirmed, selectedPayment is: $selectedPayment (forced null)");
      log("✅ Payment Screen - Only Stripe and MTN MoMo will be shown for wallet recharge");
    }

    // Update UI immediately after parsing arguments
    update([Constant.idSelectPaymentMethod]);
  }

  onSelectPaymentMethod(String value) {
    // CRITICAL: For wallet recharge, only allow Stripe or MTN MoMo
    if (isWalletAdd == true) {
      if (value != "Stripe" && value != "MTN MoMo") {
        log("⚠️ Payment Screen - WARNING: Attempted to select '$value' for wallet recharge, but only Stripe and MTN MoMo are allowed!");
        log("⚠️ Payment Screen - Ignoring invalid payment method selection");
        return;
      }
      log("✅ Payment Screen - Wallet recharge: Selected payment method: $value");
    }

    selectedPayment = value;
    log("Payment Screen - Current selected payment: $selectedPayment");
    log("Payment Screen - isWalletAdd: $isWalletAdd");
    update([Constant.idSelectPaymentMethod]);
  }

  onClickPayNow() async {
    // CRITICAL: Ensure isLoading is false at the start to prevent stuck loading state
    // This fixes the issue where payment screen gets stuck on "payment is load.."
    if (isLoading.value == true) {
      log("⚠️ Payment Screen - WARNING: isLoading was already true, clearing it first");
      isLoading.value = false;
      update([Constant.idProgressView]);
    }

    // Validate that a payment method is selected for wallet recharge
    if (isWalletAdd == true &&
        (selectedPayment == null || selectedPayment!.isEmpty)) {
      Utils.showToast(Get.context!, "Please select a payment method");
      return;
    }

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
          // Get updated amount from booking controller (includes coupon discount)
          double paymentAmount = (bookingData?['amount'] ?? 0.0).toDouble();
          if (bookingScreenController != null) {
            // Recalculate to get latest total with coupon
            bookingScreenController!.calculateTotalWithDiscount();
            paymentAmount = bookingScreenController!.totalPrice;
            parsedAmount = paymentAmount.toInt();
          }

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
            rupee: paymentAmount, // Use updated amount with coupon discount
            userId: Constant.storage.read<String>('userId') ?? "",
          );
        }

        log("Called stripe Init");

        // CRITICAL: Add timeout protection to prevent stuck loading state
        // This fixes the issue where payment screen gets stuck on "payment is load.."
        await StripeService().stripePay().timeout(
          const Duration(seconds: 30),
          onTimeout: () {
            log("⚠️ Payment Screen - Stripe payment timeout after 30 seconds");
            if (isScreenActive) {
              isLoading(false);
              update([Constant.idProgressView]);
              Utils.showToast(Get.context!, "Payment timeout. Please try again.");
            }
            throw TimeoutException("Stripe payment timeout");
          },
        ).then((value) {
          // Only update if screen is still active
          if (isScreenActive) {
            isLoading(false);
            update([Constant.idProgressView]);
          }
        }).catchError((e) {
          log("Stripe payment error: $e");
          // Only update if screen is still active
          if (isScreenActive) {
            isLoading(false);
            update([Constant.idProgressView]);
            if (e is! TimeoutException) {
              Utils.showToast(Get.context!, "Payment failed: ${e.toString()}");
            }
          }
        });
      } catch (e) {
        // Only update if screen is still active
        if (isScreenActive) {
          isLoading(false);
          update([Constant.idProgressView]);
          Utils.showToast(
              Get.context!, "Payment initialization failed: ${e.toString()}");
        }
        log("Stripe initialization error: $e");
      }
    } else if (selectedPayment == "MTN MoMo") {
      log("it's MTN MoMo");
      isLoading(true);
      update([Constant.idProgressView]);

      try {
        // Get MTN MoMo settings from splash controller
        SplashController splashController = Get.find<SplashController>();
        bool isMtnMomoEnabled =
            splashController.settingCategory?.setting?.isMtnMomo ?? false;
        String? mtnMomoSubscriptionKey =
            splashController.settingCategory?.setting?.mtnMomoSubscriptionKey;
        String? mtnMomoApiUserId =
            splashController.settingCategory?.setting?.mtnMomoApiUserId;
        String? mtnMomoApiKey =
            splashController.settingCategory?.setting?.mtnMomoApiKey;
        String? mtnMomoEnvironment =
            splashController.settingCategory?.setting?.mtnMomoEnvironment;
        // Legacy fields (kept for backward compatibility)
        String? mtnMomoPrimaryKey =
            splashController.settingCategory?.setting?.mtnMomoPrimaryKey;
        String? mtnMomoSecondaryKey =
            splashController.settingCategory?.setting?.mtnMomoSecondaryKey;

        // Check if MTN MoMo is enabled and configured
        if (!isMtnMomoEnabled) {
          isLoading(false);
          update([Constant.idProgressView]);
          Utils.showToast(Get.context!,
              "MTN MoMo payment is not enabled. Please select another payment method.");
          return;
        }

        // Validate required MTN MoMo credentials (matching salon portal)
        if (mtnMomoSubscriptionKey == null || mtnMomoSubscriptionKey.isEmpty) {
          isLoading(false);
          update([Constant.idProgressView]);
          Utils.showToast(Get.context!,
              "MTN MoMo Subscription Key is required. Please contact support.");
          return;
        }

        if (mtnMomoApiUserId == null || mtnMomoApiUserId.isEmpty) {
          isLoading(false);
          update([Constant.idProgressView]);
          Utils.showToast(Get.context!,
              "MTN MoMo API User ID is required. Please contact support.");
          return;
        }

        if (mtnMomoApiKey == null || mtnMomoApiKey.isEmpty) {
          isLoading(false);
          update([Constant.idProgressView]);
          Utils.showToast(Get.context!,
              "MTN MoMo API Key is required. Please contact support.");
          return;
        }

        // Parse amount properly
        int parsedAmount = 0;
        if (totalAmount != null && totalAmount!.isNotEmpty) {
          String cleanAmount = totalAmount!.replaceAll(RegExp(r'[^\d.]'), '');
          double amountDouble = double.tryParse(cleanAmount) ?? 0.0;
          parsedAmount = amountDouble.toInt();
        }

        log("Parsed amount for MTN MoMo: $parsedAmount");

        // Get phone number for MTN MoMo payment
        String? mtnMomoPhone = null;
        if (!useRegisteredPhoneForMtnMomo &&
            mtnMomoPhoneController.text.trim().isNotEmpty) {
          mtnMomoPhone = mtnMomoPhoneController.text.trim();
        }

        // For wallet recharge
        if (isWalletAdd == true) {
          await MtnMomoService().init(
            mtnMomoSubscriptionKeyParam: mtnMomoSubscriptionKey ?? "",
            mtnMomoEnvironmentParam: mtnMomoEnvironment ?? "sandbox",
            totalAmountWithOutTax: parsedAmount,
            paymentType: "wallet_recharge",
            phoneNumber:
                mtnMomoPhone, // Pass phone number (null will use registered number)
            // Legacy fields (for backward compatibility)
            mtnMomoPrimaryKeyParam: mtnMomoPrimaryKey ?? "",
            mtnMomoSecondaryKeyParam: mtnMomoSecondaryKey ?? "",
          );
        } else {
          // For direct payment
          double paymentAmount = (bookingData?['amount'] ?? 0.0).toDouble();
          if (bookingScreenController != null) {
            bookingScreenController!.calculateTotalWithDiscount();
            paymentAmount = bookingScreenController!.totalPrice;
            parsedAmount = paymentAmount.toInt();
          }

          await MtnMomoService().init(
            mtnMomoSubscriptionKeyParam: mtnMomoSubscriptionKey ?? "",
            mtnMomoEnvironmentParam: mtnMomoEnvironment ?? "sandbox",
            totalAmountWithOutTax: parsedAmount,
            paymentType: "direct_payment",
            serviceId: bookingData?['serviceId'] ?? "",
            expertId: bookingData?['expertId'] ?? "",
            phoneNumber:
                mtnMomoPhone, // Pass phone number (null will use registered number)
            // Legacy fields (for backward compatibility)
            mtnMomoPrimaryKeyParam: mtnMomoPrimaryKey ?? "",
            mtnMomoSecondaryKeyParam: mtnMomoSecondaryKey ?? "",
            date: bookingData?['date'] ?? "",
            time: bookingData?['time'] ?? "",
            rupee: paymentAmount,
            userId: Constant.storage.read<String>('userId') ?? "",
          );
        }

        log("Called MTN MoMo Init");

        // CRITICAL: Add timeout protection to prevent stuck loading state
        // This fixes the issue where payment screen gets stuck on "payment is load.."
        await MtnMomoService().mtnMomoPay().timeout(
          const Duration(seconds: 30),
          onTimeout: () {
            log("⚠️ Payment Screen - MTN MoMo payment timeout after 30 seconds");
            if (isScreenActive) {
              isLoading(false);
              update([Constant.idProgressView]);
              Utils.showToast(Get.context!, "Payment timeout. Please try again.");
            }
            throw TimeoutException("MTN MoMo payment timeout");
          },
        ).then((value) {
          if (isScreenActive) {
            isLoading(false);
            update([Constant.idProgressView]);
          }
        }).catchError((e) {
          log("MTN MoMo payment error: $e");
          if (isScreenActive) {
            isLoading(false);
            update([Constant.idProgressView]);
            if (e is! TimeoutException) {
              Utils.showToast(Get.context!, "Payment failed: ${e.toString()}");
            }
          }
        });
      } catch (e) {
        if (isScreenActive) {
          isLoading(false);
          update([Constant.idProgressView]);
          Utils.showToast(
              Get.context!, "Payment initialization failed: ${e.toString()}");
        }
        log("MTN MoMo initialization error: $e");
      }
    } else if (selectedPayment == "cashAfterService") {
      log("it's Cash After Service");
      // For Cash After Service, proceed directly to booking creation
      if (isWalletAdd == false && bookingData != null) {
        // This is a direct service payment, not wallet recharge
        // The booking should be created directly without going through wallet
        log("Processing Cash After Service payment for direct booking");

        isLoading(true);
        update([Constant.idProgressView]);

        try {
          // Get booking controller
          if (bookingScreenController == null) {
            bookingScreenController = Get.find<BookingScreenController>();
          }

          // Ensure coupon data is properly set - use controller's current state (already synced in onInit)
          // Sync from bookingData to ensure all coupon data is up to date
          if (bookingData != null) {
            // Sync coupon ID and code if available in bookingData
            if (bookingData!['selectedCouponId'] != null) {
              bookingScreenController!.selectedCouponId =
                  bookingData!['selectedCouponId'];
              log("Cash Payment - Synced selectedCouponId: ${bookingScreenController!.selectedCouponId}");
            }
            if (bookingData!['manualCouponCode'] != null) {
              bookingScreenController!.manualCouponCode =
                  bookingData!['manualCouponCode'];
              bookingScreenController!.couponCodeController.text =
                  bookingData!['manualCouponCode'];
              log("Cash Payment - Synced manualCouponCode: ${bookingScreenController!.manualCouponCode}");
            }
            // Always sync couponDiscountAmount from bookingData to ensure discount is applied
            if (bookingData!['couponDiscountAmount'] != null) {
              bookingScreenController!.couponDiscountAmount =
                  (bookingData!['couponDiscountAmount'] as num).toDouble();
              log("Cash Payment - Synced couponDiscountAmount from bookingData: ${bookingScreenController!.couponDiscountAmount}");
            }

            // Always sync withOutTaxRupee and tax from bookingData as these are base amounts
            if (bookingData!['withOutTaxRupee'] != null) {
              bookingScreenController!.withOutTaxRupee =
                  (bookingData!['withOutTaxRupee'] as num).toDouble();
              log("Cash Payment - Synced withOutTaxRupee: ${bookingScreenController!.withOutTaxRupee}");
            }
            if (bookingData!['tax'] != null) {
              bookingScreenController!.tax = bookingData!['tax'] as int?;
              log("Cash Payment - Synced tax: ${bookingScreenController!.tax}");
            }
            // Sync finalTaxRupee if available (will be recalculated anyway, but good to have)
            if (bookingData!['finalTaxRupee'] != null) {
              bookingScreenController!.finalTaxRupee =
                  (bookingData!['finalTaxRupee'] as num).toDouble();
              log("Cash Payment - Synced finalTaxRupee: ${bookingScreenController!.finalTaxRupee}");
            }
          }

          // Recalculate amount with discount before creating booking
          log("Cash Payment - Before calculateTotalWithDiscount:");
          log("  - withOutTaxRupee: ${bookingScreenController!.withOutTaxRupee}");
          log("  - couponDiscountAmount: ${bookingScreenController!.couponDiscountAmount}");
          log("  - tax: ${bookingScreenController!.tax}");
          log("  - totalPrice (before): ${bookingScreenController!.totalPrice}");

          bookingScreenController!.calculateTotalWithDiscount();

          log("Cash Payment - After calculateTotalWithDiscount:");
          log("  - totalPrice (after): ${bookingScreenController!.totalPrice}");
          log("  - finalTaxRupee: ${bookingScreenController!.finalTaxRupee}");

          // Ensure withoutTax is sent as double with 2 decimal places
          double withoutTaxValue = double.parse(
              bookingScreenController!.withOutTaxRupee.toStringAsFixed(2));

          // If manual coupon code is used but no ID found, try to find it in the list
          // First, try finding it in the current list
          if (bookingScreenController!.selectedCouponId == null &&
              bookingScreenController!.manualCouponCode != null) {
            log("Cash Payment - Looking for coupon ID for manual code: ${bookingScreenController!.manualCouponCode}");

            // Ensure coupon list is fetched if not available
            if (bookingScreenController!.getCouponModel == null &&
                bookingScreenController!.withOutTaxRupee > 0) {
              log("Cash Payment - Coupon list not available, fetching...");
              String userId = Constant.storage.read<String>('userId') ?? "";
              await bookingScreenController!.getCouponApiCall(
                userId: userId,
                type: "2", // Type 2 for booking
                amount:
                    bookingScreenController!.withOutTaxRupee.toInt().toString(),
              );
            }

            if (bookingScreenController!.getCouponModel?.data != null) {
              for (var coupon
                  in bookingScreenController!.getCouponModel!.data!) {
                if (coupon.code?.toUpperCase() ==
                    bookingScreenController!.manualCouponCode!.toUpperCase()) {
                  bookingScreenController!.selectedCouponId = coupon.id;
                  log("Cash Payment - ✅ Found coupon ID for manual code in list: ${coupon.id}");
                  break;
                }
              }
            }

            // If still not found, try refetching coupons to see if it's available
            if (bookingScreenController!.selectedCouponId == null &&
                bookingScreenController!.withOutTaxRupee > 0) {
              log("Cash Payment - Coupon ID not found in current list, refetching coupons...");
              String userId = Constant.storage.read<String>('userId') ?? "";
              await bookingScreenController!.getCouponApiCall(
                userId: userId,
                type: "2", // Type 2 for booking
                amount:
                    bookingScreenController!.withOutTaxRupee.toInt().toString(),
              );

              // Try finding it again after refetch
              if (bookingScreenController!.getCouponModel?.data != null) {
                for (var coupon
                    in bookingScreenController!.getCouponModel!.data!) {
                  if (coupon.code?.toUpperCase() ==
                      bookingScreenController!.manualCouponCode!
                          .toUpperCase()) {
                    bookingScreenController!.selectedCouponId = coupon.id;
                    log("Cash Payment - ✅ Found coupon ID for manual code after refetch: ${coupon.id}");
                    break;
                  }
                }
              }
            }

            // CRITICAL FIX: If still not found and discount is applied, cannot proceed
            if (bookingScreenController!.selectedCouponId == null) {
              if (bookingScreenController!.couponDiscountAmount > 0) {
                log("Cash Payment - ❌ ERROR: Coupon discount applied but coupon ID not found!");
                log("Cash Payment - ❌ Cannot proceed - backend will reject due to amount mismatch");

                if (isScreenActive) {
                  isLoading(false);
                  update([Constant.idProgressView]);
                  Utils.showToast(Get.context!,
                      "Coupon validation failed. Please remove the coupon and try again.");
                }
                return;
              } else {
                log("Cash Payment - ⚠️  WARNING: Coupon code provided but no discount applied and ID not found");
                // If no discount, it's safe to proceed without coupon ID
              }
            }
          }

          // CRITICAL FIX: Validate coupon data before proceeding
          if (bookingScreenController!.couponDiscountAmount > 0) {
            if (bookingScreenController!.selectedCouponId == null ||
                bookingScreenController!.selectedCouponId!.isEmpty) {
              log("Cash Payment - ❌ ERROR: Discount applied but no coupon ID available");
              if (isScreenActive) {
                isLoading(false);
                update([Constant.idProgressView]);
                Utils.showToast(
                    Get.context!, "Coupon validation error. Please try again.");
              }
              return;
            }
            log("Cash Payment - ✅ Coupon validated: ID=${bookingScreenController!.selectedCouponId}, Discount=${bookingScreenController!.couponDiscountAmount}");
          }

          // Sync all booking data to booking controller to ensure onCreateBookingApiCall has correct state
          // This is important because onCreateBookingApiCall recalculates the total internally
          if (bookingData != null) {
            // Sync service and salon IDs (needed for booking controller state)
            if (bookingData!['serviceId'] != null) {
              String serviceIdStr = bookingData!['serviceId'].toString();
              bookingScreenController!.serviceId = serviceIdStr.split(",");
              log("Cash Payment - Synced serviceId: ${bookingScreenController!.serviceId}");
            }
            if (bookingData!['salonId'] != null) {
              bookingScreenController!.salonId =
                  bookingData!['salonId'].toString();
              log("Cash Payment - Synced salonId: ${bookingScreenController!.salonId}");
            }
            if (bookingData!['date'] != null) {
              bookingScreenController!.formattedDate =
                  bookingData!['date'].toString();
              log("Cash Payment - Synced formattedDate: ${bookingScreenController!.formattedDate}");
            }
            if (bookingData!['time'] != null) {
              bookingScreenController!.slotsString =
                  bookingData!['time'].toString();
              log("Cash Payment - Synced slotsString: ${bookingScreenController!.slotsString}");
            }
            if (bookingData!['totalMinute'] != null) {
              bookingScreenController!.totalMinute =
                  (bookingData!['totalMinute'] as num).toInt();
              log("Cash Payment - Synced totalMinute: ${bookingScreenController!.totalMinute}");
            }
          }

          log("Cash Payment - Final state before API call:");
          log("  - selectedCouponId: ${bookingScreenController!.selectedCouponId}");
          log("  - manualCouponCode: ${bookingScreenController!.manualCouponCode}");
          log("  - couponDiscountAmount: ${bookingScreenController!.couponDiscountAmount}");
          log("  - withOutTaxRupee: ${bookingScreenController!.withOutTaxRupee}");
          log("  - tax: ${bookingScreenController!.tax}");
          log("  - finalTaxRupee: ${bookingScreenController!.finalTaxRupee}");
          log("  - totalPrice: ${bookingScreenController!.totalPrice}");

          // CRITICAL FIX: Validate required fields before API call
          if (bookingData!['expertId'] == null ||
              bookingData!['expertId'].toString().isEmpty) {
            log("Cash Payment - ❌ ERROR: expertId is missing");
            if (isScreenActive) {
              isLoading(false);
              update([Constant.idProgressView]);
              Utils.showToast(Get.context!,
                  "Booking data is incomplete. Please try again.");
            }
            return;
          }

          if (bookingData!['serviceId'] == null ||
              bookingData!['serviceId'].toString().isEmpty) {
            log("Cash Payment - ❌ ERROR: serviceId is missing");
            if (isScreenActive) {
              isLoading(false);
              update([Constant.idProgressView]);
              Utils.showToast(Get.context!,
                  "Booking data is incomplete. Please try again.");
            }
            return;
          }

          if (bookingData!['salonId'] == null ||
              bookingData!['salonId'].toString().isEmpty) {
            log("Cash Payment - ❌ ERROR: salonId is missing");
            if (isScreenActive) {
              isLoading(false);
              update([Constant.idProgressView]);
              Utils.showToast(Get.context!,
                  "Booking data is incomplete. Please try again.");
            }
            return;
          }

          // CRITICAL FIX: Ensure coupon ID is found BEFORE calling onCreateBookingApiCall
          // This matches the wallet payment flow which works correctly
          // If discount is applied, we MUST have a coupon ID, otherwise backend will reject
          if (bookingScreenController!.couponDiscountAmount > 0) {
            // Final attempt to find coupon ID if still missing
            if (bookingScreenController!.selectedCouponId == null ||
                bookingScreenController!.selectedCouponId!.isEmpty) {
              log("Cash Payment - ⚠️ CRITICAL: Discount applied (${bookingScreenController!.couponDiscountAmount}) but coupon ID still missing!");
              log("Cash Payment - Making final attempt to find coupon ID...");

              // Try one more time to find in list
              if (bookingScreenController!.manualCouponCode != null) {
                // First check existing list
                if (bookingScreenController!.getCouponModel?.data != null) {
                  for (var coupon
                      in bookingScreenController!.getCouponModel!.data!) {
                    if (coupon.code?.toUpperCase() ==
                        bookingScreenController!.manualCouponCode!
                            .toUpperCase()) {
                      bookingScreenController!.selectedCouponId = coupon.id;
                      log("Cash Payment - ✅ Found coupon ID in existing list: ${coupon.id}");
                      break;
                    }
                  }
                }

                // If still not found and list is null, try fetching
                if ((bookingScreenController!.selectedCouponId == null ||
                        bookingScreenController!.selectedCouponId!.isEmpty) &&
                    bookingScreenController!.getCouponModel == null &&
                    bookingScreenController!.withOutTaxRupee > 0) {
                  log("Cash Payment - Coupon list not available, fetching...");
                  String userId = Constant.storage.read<String>('userId') ?? "";
                  if (userId.isNotEmpty) {
                    await bookingScreenController!.getCouponApiCall(
                      userId: userId,
                      type: "2",
                      amount: bookingScreenController!.withOutTaxRupee
                          .toInt()
                          .toString(),
                    );

                    // Try finding again after fetch
                    if (bookingScreenController!.getCouponModel?.data != null) {
                      for (var coupon
                          in bookingScreenController!.getCouponModel!.data!) {
                        if (coupon.code?.toUpperCase() ==
                            bookingScreenController!.manualCouponCode!
                                .toUpperCase()) {
                          bookingScreenController!.selectedCouponId = coupon.id;
                          log("Cash Payment - ✅ Found coupon ID after fetch: ${coupon.id}");
                          break;
                        }
                      }
                    }
                  }
                }
              }

              // If still not found, this will cause "book failed" - prevent it
              if (bookingScreenController!.selectedCouponId == null ||
                  bookingScreenController!.selectedCouponId!.isEmpty) {
                log("Cash Payment - ❌ ERROR: Cannot proceed - discount applied but coupon ID not found!");
                log("Cash Payment - ❌ Backend will reject with 'book failed - Amount mismatch'");
                log("Cash Payment - ❌ Frontend sends: ${bookingScreenController!.totalPrice} (with discount)");
                log("Cash Payment - ❌ Backend expects: ${bookingScreenController!.totalPrice + bookingScreenController!.couponDiscountAmount} (without discount, no couponId)");

                if (isScreenActive) {
                  isLoading(false);
                  update([Constant.idProgressView]);

                  // Reset coupon to prevent booking failure
                  bookingScreenController!.resetCoupon();
                  bookingScreenController!.calculateTotalWithDiscount();

                  Utils.showToast(Get.context!,
                      "Coupon validation failed. The coupon may have expired or is no longer valid. Please remove it and try again.");
                }
                return; // Don't proceed with booking - it will fail anyway
              }
            }

            log("Cash Payment - ✅ Coupon ID validated before API call: ${bookingScreenController!.selectedCouponId}");
            log("Cash Payment - ✅ Discount amount: ${bookingScreenController!.couponDiscountAmount}");
            log("Cash Payment - ✅ Total price (with discount): ${bookingScreenController!.totalPrice}");
          }

          // Ensure amount is properly formatted to 2 decimal places to match backend expectation
          // Backend does: parseFloat(totalAmount).toFixed(2) for comparison
          double finalAmount = double.parse(
              bookingScreenController!.totalPrice.toStringAsFixed(2));

          // Log final values for debugging
          log("Cash Payment - Final values before API call:");
          log("  - finalAmount: $finalAmount (${finalAmount.toStringAsFixed(2)})");
          log("  - withoutTaxValue: $withoutTaxValue (${withoutTaxValue.toStringAsFixed(2)})");
          log("  - selectedCouponId: ${bookingScreenController!.selectedCouponId}");
          log("  - couponDiscountAmount: ${bookingScreenController!.couponDiscountAmount}");
          log("  - totalPrice: ${bookingScreenController!.totalPrice}");

          // Set loading state
          bookingScreenController!.isLoading(true);
          bookingScreenController!.update([Constant.idProgressView]);

          await bookingScreenController!.onCreateBookingApiCall(
            userId: Constant.storage.read<String>('userId') ?? "",
            expertId: bookingData!['expertId'] ?? "",
            serviceId: bookingData!['serviceId'] ?? "",
            salonId: bookingData!['salonId'] ?? "",
            date: bookingData!['date'] ?? "",
            time: bookingData!['time'] ?? "",
            amount: finalAmount, // Matches backend calculation exactly
            withoutTax: withoutTaxValue, // Base amount before discount
            paymentType: "cashAfterService",
            atPlace: bookingData!['atPlace'] ?? 1,
            address: bookingData!['address'] ?? "",
          );

          // Check if screen is still active before updating UI
          if (!isScreenActive) {
            log("Payment Screen - Screen closed, skipping UI updates");
            return;
          }

          // Clear loading state
          bookingScreenController!.isLoading(false);
          bookingScreenController!.update([Constant.idProgressView]);

          if (bookingScreenController!.createBookingCategory?.status == true) {
            log("Cash Payment - ✅ Booking created successfully!");

            // Clear prices only (data from navigation arguments will be set when user navigates to booking screen again)
            bookingScreenController!.finalTaxRupee = 0.0;
            bookingScreenController!.withOutTaxRupee = 0.0;
            bookingScreenController!.totalPrice = 0.0;
            bookingScreenController!.resetCoupon();

            // CRITICAL FIX: Reset booking flow state only (not data from navigation arguments)
            // Navigation arguments (salonId, serviceId, checkItem, totalPrice, etc.) will be set via getDataFromArgs() when user navigates to booking screen again
            bookingScreenController!.currentStep = 0;
            bookingScreenController!.stepCount = 0;
            bookingScreenController!.selectExpert = -1;
            bookingScreenController!.expertDetail = null;
            bookingScreenController!.selectedExpertDataList.clear();
            bookingScreenController!.selectedVenue = "";
            bookingScreenController!.slotsString = null;
            bookingScreenController!.selectedSlot = '';
            bookingScreenController!.selectedSlotsList.clear();
            bookingScreenController!.morningSlots.clear();
            bookingScreenController!.afternoonSlots.clear();
            bookingScreenController!.eveningSlots.clear();
            bookingScreenController!.disabledSlotsMap.clear();
            bookingScreenController!.searchEditingController.clear();
            bookingScreenController!.getBookingModel = null;
            bookingScreenController!.getExpertServiceBaseSalonCategory = null;
            bookingScreenController!.checkValue = false;
            bookingScreenController!.hasMorningSlots = true;
            bookingScreenController!.hasAfternoonSlots = true;
            bookingScreenController!.date =
                DateFormat('yyyy-MM-dd').format(DateTime.now());
            bookingScreenController!.formattedDate =
                DateFormat('yyyy-MM-dd').format(DateTime.now());
            bookingScreenController!.salonName = null;
            bookingScreenController!.salonAddress = null;
            bookingScreenController!.getSalonDetailCategory = null;

            // CRITICAL FIX: Clear all controller data like PRD does (to fix salon detail null, expert button state, etc.)
            // Get controllers (use Get.isRegistered to check if they exist)
            HomeScreenController? homeScreenControllerCash =
                Get.isRegistered<HomeScreenController>()
                    ? Get.find<HomeScreenController>()
                    : null;

            BranchDetailController? branchDetailControllerCash =
                Get.isRegistered<BranchDetailController>()
                    ? Get.find<BranchDetailController>()
                    : null;

            CategoryDetailController? categoryDetailControllerCash =
                Get.isRegistered<CategoryDetailController>()
                    ? Get.find<CategoryDetailController>()
                    : null;

            SearchScreenController? searchScreenControllerCash =
                Get.isRegistered<SearchScreenController>()
                    ? Get.find<SearchScreenController>()
                    : null;

            SelectBranchController? selectBranchControllerCash =
                Get.isRegistered<SelectBranchController>()
                    ? Get.find<SelectBranchController>()
                    : null;

            // Clear HomeScreenController data (like PRD)
            if (homeScreenControllerCash != null) {
              homeScreenControllerCash.withOutTaxRupee = 0.0;
              homeScreenControllerCash.totalPrice = 0.0;
              homeScreenControllerCash.finalTaxRupee = 0.0;
              homeScreenControllerCash.totalMinute = 0;
              homeScreenControllerCash.checkItem.clear();
              homeScreenControllerCash.serviceId.clear();
              homeScreenControllerCash.serviceName.clear();

              // CRITICAL: Clear expert-related data (this fixes the button showing as selected)
              homeScreenControllerCash.withOutTaxRupeeExpert = 0.0;
              homeScreenControllerCash.totalPriceExpert = 0.0;
              homeScreenControllerCash.finalTaxRupeeExpert = 0.0;
              homeScreenControllerCash.totalMinuteExpert = 0;
              homeScreenControllerCash.checkItemExpert.clear();
              homeScreenControllerCash.serviceIdExpert.clear();
              homeScreenControllerCash.serviceNameExpert.clear();
            }

            // Clear SearchScreenController data
            if (searchScreenControllerCash != null) {
              searchScreenControllerCash.totalMinute = 0;
              searchScreenControllerCash.checkItem.clear();
              searchScreenControllerCash.serviceId.clear();
              searchScreenControllerCash.serviceName.clear();
            }

            // Clear CategoryDetailController data
            if (categoryDetailControllerCash != null) {
              categoryDetailControllerCash.totalMinute = 0;
              categoryDetailControllerCash.checkItem.clear();
              categoryDetailControllerCash.serviceId.clear();
              categoryDetailControllerCash.serviceName.clear();
            }

            // Clear BranchDetailController data
            if (branchDetailControllerCash != null) {
              branchDetailControllerCash.withOutTaxRupee = 0.0;
              branchDetailControllerCash.totalPrice = 0.0;
              branchDetailControllerCash.finalTaxRupee = 0.0;
              branchDetailControllerCash.totalMinute = 0;
              branchDetailControllerCash.checkItem.clear();
              branchDetailControllerCash.serviceId.clear();
            }

            // Clear SelectBranchController
            if (selectBranchControllerCash != null) {
              selectBranchControllerCash.selectBranch = -1;
            }

            // Remove expertDetail from storage (like PRD) - this ensures fresh expert selection on next booking
            Constant.storage.remove("expertDetail");

            // Navigate back to home screen - use offAndToNamed to preserve controllers (like PRD)
            Get.offAndToNamed(AppRoutes.bottom);

            // Delete controllers after clearing (like PRD) - this ensures fresh data on next visit
            Future.delayed(Duration(seconds: 1), () {
              try {
                if (Get.isRegistered<CategoryDetailController>()) {
                  Get.delete<CategoryDetailController>();
                }
                if (Get.isRegistered<BranchDetailController>()) {
                  Get.delete<BranchDetailController>();
                }
                if (Get.isRegistered<SelectBranchController>()) {
                  Get.delete<SelectBranchController>();
                }
                if (Get.isRegistered<ViewAllCategoryController>()) {
                  Get.delete<ViewAllCategoryController>();
                }
                if (Get.isRegistered<ExpertDetailController>()) {
                  Get.delete<ExpertDetailController>();
                }
                if (Get.isRegistered<BookingScreenController>()) {
                  Get.delete<BookingScreenController>();
                }
                log("Cash Payment - ✅ Controllers deleted for fresh recreation");
              } catch (e) {
                log("Cash Payment - ⚠️ Error deleting controllers: $e");
              }
            });

            // Show success dialog IMMEDIATELY (don't wait for data reload)
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Dialog(
                backgroundColor: AppColors.transparent,
                child: SuccessDialog(),
              ),
            );

            // CRITICAL FIX: Reload data in background AFTER showing dialog (non-blocking)
            // This ensures categories, salons, and experts are displayed when user returns to home
            // Using Future without await so it doesn't block the dialog
            Future.microtask(() async {
              try {
                HomeScreenController? homeScreenController =
                    Get.isRegistered<HomeScreenController>()
                        ? Get.find<HomeScreenController>()
                        : null;

                if (homeScreenController != null) {
                  log("Cash Payment - Reloading home screen data...");

                  // Reload data (don't set to null to avoid showing empty screens)
                  // Reset expert pagination before reload
                  homeScreenController.startExpert = 0;

                  // Reload data - this will update existing data rather than clearing it
                  await homeScreenController.onGetAllCategoryApiCall();
                  await homeScreenController.onGetAllSalonApiCall(
                    latitude: latitude ?? 0.0,
                    longitude: longitude ?? 0.0,
                    userId: Constant.storage.read<String>('userId') ?? "",
                  );
                  await homeScreenController.onGetAllExpertApiCall(
                    start: homeScreenController.startExpert.toString(),
                    limit: homeScreenController.limitExpert.toString(),
                  );

                  log("Cash Payment - ✅ Home screen data reloaded successfully");
                } else {
                  log("Cash Payment - ⚠️ HomeScreenController not found, data will load on next screen init");
                }

                // CRITICAL FIX: Reload notification data after successful booking
                // This ensures new notifications (including booking confirmation) appear in the app
                try {
                  NotificationController? notificationController =
                      Get.isRegistered<NotificationController>()
                          ? Get.find<NotificationController>()
                          : null;

                  if (notificationController != null) {
                    log("Cash Payment - Reloading notification data...");
                    await notificationController.onGetNotificationApiCall(
                      userId: Constant.storage.read<String>('userId') ?? "",
                    );
                    log("Cash Payment - ✅ Notification data reloaded successfully");
                  } else {
                    log("Cash Payment - ⚠️ NotificationController not found, data will load on next screen init");
                  }
                } catch (e) {
                  log("Cash Payment - ⚠️ Error reloading notification data: $e");
                  // Don't block success dialog if reload fails
                }

                // CRITICAL FIX: Reload booking detail data after successful booking
                // This ensures the new booking appears in the booking list
                try {
                  BookingDetailScreenController? bookingDetailController =
                      Get.isRegistered<BookingDetailScreenController>()
                          ? Get.find<BookingDetailScreenController>()
                          : null;

                  if (bookingDetailController != null) {
                    log("Cash Payment - Reloading booking detail data...");
                    // Reset pagination and reload pending bookings (where new booking will appear)
                    bookingDetailController.startPending = 0;
                    bookingDetailController.getPending = [];
                    await bookingDetailController.onGetAllBookingApiCall(
                      userId: Constant.storage.read<String>('userId') ?? "",
                      status: "pending",
                      start: bookingDetailController.startPending.toString(),
                      limit: bookingDetailController.limitPending.toString(),
                      search: bookingDetailController
                          .bookingDetailScreenEditingController.text
                          .trim(),
                    );
                    log("Cash Payment - ✅ Booking detail data reloaded successfully");
                  } else {
                    log("Cash Payment - ⚠️ BookingDetailScreenController not found, data will load on next screen init");
                  }
                } catch (e) {
                  log("Cash Payment - ⚠️ Error reloading booking detail data: $e");
                  // Don't block success dialog if reload fails
                }
              } catch (e) {
                log("Cash Payment - ⚠️ Error reloading data: $e");
                // Don't block success dialog if reload fails
              }
            });
          } else {
            // Booking failed - show specific error message and handle coupon errors
            String errorMessage =
                bookingScreenController!.createBookingCategory?.message ??
                    "Booking failed";

            log("Cash Payment - ❌ Booking failed: $errorMessage");

            // Check if error is related to coupon, amount, or discount
            String lowerErrorMessage = errorMessage.toLowerCase();
            if (lowerErrorMessage.contains("coupon") ||
                lowerErrorMessage.contains("discount") ||
                lowerErrorMessage.contains("amount") ||
                lowerErrorMessage.contains("invalid")) {
              log("Cash Payment - ⚠️  Coupon/amount-related error detected. Resetting coupon...");
              bookingScreenController!.resetCoupon();
              // Recalculate without coupon
              bookingScreenController!.calculateTotalWithDiscount();
              log("Cash Payment - Recalculated total without coupon: ${bookingScreenController!.totalPrice}");
            }

            Utils.showToast(Get.context!, errorMessage);
          }
        } catch (e) {
          log("Error creating booking for cash after service: $e");

          // Check if screen is still active before showing error
          if (isScreenActive) {
            Utils.showToast(
                Get.context!, "Error creating booking: ${e.toString()}");
            // Ensure loading is cleared on error
            if (bookingScreenController != null) {
              bookingScreenController!.isLoading(false);
              bookingScreenController!.update([Constant.idProgressView]);
            }
          }
        } finally {
          // Only update if screen is still active
          if (isScreenActive) {
            isLoading(false);
            update([Constant.idProgressView]);
          }
        }
      }
    } else if (selectedPayment == "wallet") {
      log("it's My Wallet");
      // For wallet payment, create booking directly
      if (isWalletAdd == false && isCreateOrder == true) {
        isLoading(true);
        update([Constant.idProgressView]);

        try {
          // Get booking controller if not already available
          if (bookingScreenController == null) {
            bookingScreenController = Get.find<BookingScreenController>();
          }

          // Recalculate amount with discount before creating booking
          bookingScreenController!.calculateTotalWithDiscount();

          // Ensure withoutTax is sent as double with 2 decimal places
          double withoutTaxValue = double.parse(
              bookingScreenController!.withOutTaxRupee.toStringAsFixed(2));

          // Ensure amount is properly formatted to 2 decimal places to match backend expectation
          double finalAmount = double.parse(
              bookingScreenController!.totalPrice.toStringAsFixed(2));

          // Check wallet balance
          double walletBalance = double.parse(walletAmount?.toString() ?? "0");

          if (finalAmount > walletBalance) {
            Utils.showToast(Get.context!,
                "Insufficient wallet balance. Please recharge your wallet.");
            isLoading(false);
            update([Constant.idProgressView]);
            return;
          }

          // Set loading state
          bookingScreenController!.isLoading(true);
          bookingScreenController!.update([Constant.idProgressView]);

          // Use bookingData if available, otherwise use booking controller data
          String expertId = bookingData?['expertId'] ??
              (Constant.storage.read<String>('expertDetail') != null
                  ? Constant.storage.read<String>('expertDetail').toString()
                  : Constant.storage.read<String>('expertId').toString());

          await bookingScreenController!.onCreateBookingApiCall(
            userId: Constant.storage.read<String>('userId') ?? "",
            expertId: expertId,
            serviceId: bookingData?['serviceId'] ??
                bookingScreenController!.serviceId.join(","),
            salonId: bookingData?['salonId'] ??
                bookingScreenController!.salonId.toString(),
            date: bookingData?['date'] ??
                bookingScreenController!.formattedDate.toString(),
            time: bookingData?['time'] ??
                bookingScreenController!.slotsString.toString(),
            amount:
                finalAmount, // Use properly formatted amount with coupon discount
            withoutTax: withoutTaxValue,
            paymentType: "",
            atPlace: bookingData?['atPlace'] ??
                (bookingScreenController!.selectedVenue == "At Salon" ? 1 : 2),
            address: bookingData?['address'] ??
                bookingScreenController!.searchEditingController.text,
          );

          // Check if screen is still active before updating UI
          if (!isScreenActive) {
            log("Payment Screen - Screen closed, skipping UI updates (wallet)");
            return;
          }

          // Clear loading state
          bookingScreenController!.isLoading(false);
          bookingScreenController!.update([Constant.idProgressView]);

          if (bookingScreenController!.createBookingCategory?.status == true) {
            log("Wallet Payment - ✅ Booking created successfully!");

            // Clear prices only (data from navigation arguments will be set when user navigates to booking screen again)
            bookingScreenController!.finalTaxRupee = 0.0;
            bookingScreenController!.withOutTaxRupee = 0.0;
            bookingScreenController!.totalPrice = 0.0;
            bookingScreenController!.resetCoupon();

            // CRITICAL FIX: Reset booking flow state only (not data from navigation arguments)
            // Navigation arguments (salonId, serviceId, checkItem, totalPrice, etc.) will be set via getDataFromArgs() when user navigates to booking screen again
            bookingScreenController!.currentStep = 0;
            bookingScreenController!.stepCount = 0;
            bookingScreenController!.selectExpert = -1;
            bookingScreenController!.expertDetail = null;
            bookingScreenController!.selectedExpertDataList.clear();
            bookingScreenController!.selectedVenue = "";
            bookingScreenController!.slotsString = null;
            bookingScreenController!.selectedSlot = '';
            bookingScreenController!.selectedSlotsList.clear();
            bookingScreenController!.morningSlots.clear();
            bookingScreenController!.afternoonSlots.clear();
            bookingScreenController!.eveningSlots.clear();
            bookingScreenController!.disabledSlotsMap.clear();
            bookingScreenController!.searchEditingController.clear();
            bookingScreenController!.getBookingModel = null;
            bookingScreenController!.getExpertServiceBaseSalonCategory = null;
            bookingScreenController!.checkValue = false;
            bookingScreenController!.hasMorningSlots = true;
            bookingScreenController!.hasAfternoonSlots = true;
            bookingScreenController!.date =
                DateFormat('yyyy-MM-dd').format(DateTime.now());
            bookingScreenController!.formattedDate =
                DateFormat('yyyy-MM-dd').format(DateTime.now());
            bookingScreenController!.salonName = null;
            bookingScreenController!.salonAddress = null;
            bookingScreenController!.getSalonDetailCategory = null;

            // CRITICAL FIX: Clear all controller data like PRD does (to fix salon detail null, expert button state, etc.)
            // Get controllers (use Get.isRegistered to check if they exist)
            HomeScreenController? homeScreenControllerWallet =
                Get.isRegistered<HomeScreenController>()
                    ? Get.find<HomeScreenController>()
                    : null;

            BranchDetailController? branchDetailControllerWallet =
                Get.isRegistered<BranchDetailController>()
                    ? Get.find<BranchDetailController>()
                    : null;

            CategoryDetailController? categoryDetailControllerWallet =
                Get.isRegistered<CategoryDetailController>()
                    ? Get.find<CategoryDetailController>()
                    : null;

            SearchScreenController? searchScreenControllerWallet =
                Get.isRegistered<SearchScreenController>()
                    ? Get.find<SearchScreenController>()
                    : null;

            SelectBranchController? selectBranchControllerWallet =
                Get.isRegistered<SelectBranchController>()
                    ? Get.find<SelectBranchController>()
                    : null;

            // Clear HomeScreenController data (like PRD)
            if (homeScreenControllerWallet != null) {
              homeScreenControllerWallet.withOutTaxRupee = 0.0;
              homeScreenControllerWallet.totalPrice = 0.0;
              homeScreenControllerWallet.finalTaxRupee = 0.0;
              homeScreenControllerWallet.totalMinute = 0;
              homeScreenControllerWallet.checkItem.clear();
              homeScreenControllerWallet.serviceId.clear();
              homeScreenControllerWallet.serviceName.clear();

              // CRITICAL: Clear expert-related data (this fixes the button showing as selected)
              homeScreenControllerWallet.withOutTaxRupeeExpert = 0.0;
              homeScreenControllerWallet.totalPriceExpert = 0.0;
              homeScreenControllerWallet.finalTaxRupeeExpert = 0.0;
              homeScreenControllerWallet.totalMinuteExpert = 0;
              homeScreenControllerWallet.checkItemExpert.clear();
              homeScreenControllerWallet.serviceIdExpert.clear();
              homeScreenControllerWallet.serviceNameExpert.clear();
            }

            // Clear SearchScreenController data
            if (searchScreenControllerWallet != null) {
              searchScreenControllerWallet.totalMinute = 0;
              searchScreenControllerWallet.checkItem.clear();
              searchScreenControllerWallet.serviceId.clear();
              searchScreenControllerWallet.serviceName.clear();
            }

            // Clear CategoryDetailController data
            if (categoryDetailControllerWallet != null) {
              categoryDetailControllerWallet.totalMinute = 0;
              categoryDetailControllerWallet.checkItem.clear();
              categoryDetailControllerWallet.serviceId.clear();
              categoryDetailControllerWallet.serviceName.clear();
            }

            // Clear BranchDetailController data
            if (branchDetailControllerWallet != null) {
              branchDetailControllerWallet.withOutTaxRupee = 0.0;
              branchDetailControllerWallet.totalPrice = 0.0;
              branchDetailControllerWallet.finalTaxRupee = 0.0;
              branchDetailControllerWallet.totalMinute = 0;
              branchDetailControllerWallet.checkItem.clear();
              branchDetailControllerWallet.serviceId.clear();
            }

            // Clear SelectBranchController
            if (selectBranchControllerWallet != null) {
              selectBranchControllerWallet.selectBranch = -1;
            }

            // Remove expertDetail from storage (like PRD) - this ensures fresh expert selection on next booking
            Constant.storage.remove("expertDetail");

            // Navigate back to home screen - use offAndToNamed to preserve controllers (like PRD)
            Get.offAndToNamed(AppRoutes.bottom);

            // Delete controllers after clearing (like PRD) - this ensures fresh data on next visit
            Future.delayed(Duration(seconds: 1), () {
              try {
                if (Get.isRegistered<CategoryDetailController>()) {
                  Get.delete<CategoryDetailController>();
                }
                if (Get.isRegistered<BranchDetailController>()) {
                  Get.delete<BranchDetailController>();
                }
                if (Get.isRegistered<SelectBranchController>()) {
                  Get.delete<SelectBranchController>();
                }
                if (Get.isRegistered<ViewAllCategoryController>()) {
                  Get.delete<ViewAllCategoryController>();
                }
                if (Get.isRegistered<ExpertDetailController>()) {
                  Get.delete<ExpertDetailController>();
                }
                if (Get.isRegistered<BookingScreenController>()) {
                  Get.delete<BookingScreenController>();
                }
                log("Wallet Payment - ✅ Controllers deleted for fresh recreation");
              } catch (e) {
                log("Wallet Payment - ⚠️ Error deleting controllers: $e");
              }
            });

            // Show success dialog IMMEDIATELY (don't wait for data reload)
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Dialog(
                backgroundColor: AppColors.transparent,
                child: SuccessDialog(),
              ),
            );

            // CRITICAL FIX: Reload data in background AFTER showing dialog (non-blocking)
            // This ensures categories, salons, and experts are displayed when user returns to home
            // Using Future without await so it doesn't block the dialog
            Future.microtask(() async {
              try {
                HomeScreenController? homeScreenController =
                    Get.isRegistered<HomeScreenController>()
                        ? Get.find<HomeScreenController>()
                        : null;

                if (homeScreenController != null) {
                  log("Wallet Payment - Reloading home screen data...");

                  // Reload data (don't set to null to avoid showing empty screens)
                  // Reset expert pagination before reload
                  homeScreenController.startExpert = 0;

                  // Reload data - this will update existing data rather than clearing it
                  await homeScreenController.onGetAllCategoryApiCall();
                  await homeScreenController.onGetAllSalonApiCall(
                    latitude: latitude ?? 0.0,
                    longitude: longitude ?? 0.0,
                    userId: Constant.storage.read<String>('userId') ?? "",
                  );
                  await homeScreenController.onGetAllExpertApiCall(
                    start: homeScreenController.startExpert.toString(),
                    limit: homeScreenController.limitExpert.toString(),
                  );

                  log("Wallet Payment - ✅ Home screen data reloaded successfully");
                } else {
                  log("Wallet Payment - ⚠️ HomeScreenController not found, data will load on next screen init");
                }

                // CRITICAL FIX: Reload notification data after successful booking
                // This ensures new notifications (including booking confirmation) appear in the app
                try {
                  NotificationController? notificationController =
                      Get.isRegistered<NotificationController>()
                          ? Get.find<NotificationController>()
                          : null;

                  if (notificationController != null) {
                    log("Wallet Payment - Reloading notification data...");
                    await notificationController.onGetNotificationApiCall(
                      userId: Constant.storage.read<String>('userId') ?? "",
                    );
                    log("Wallet Payment - ✅ Notification data reloaded successfully");
                  } else {
                    log("Wallet Payment - ⚠️ NotificationController not found, data will load on next screen init");
                  }
                } catch (e) {
                  log("Wallet Payment - ⚠️ Error reloading notification data: $e");
                  // Don't block success dialog if reload fails
                }

                // CRITICAL FIX: Reload booking detail data after successful booking
                // This ensures the new booking appears in the booking list
                try {
                  BookingDetailScreenController? bookingDetailController =
                      Get.isRegistered<BookingDetailScreenController>()
                          ? Get.find<BookingDetailScreenController>()
                          : null;

                  if (bookingDetailController != null) {
                    log("Wallet Payment - Reloading booking detail data...");
                    // Reset pagination and reload pending bookings (where new booking will appear)
                    bookingDetailController.startPending = 0;
                    bookingDetailController.getPending = [];
                    await bookingDetailController.onGetAllBookingApiCall(
                      userId: Constant.storage.read<String>('userId') ?? "",
                      status: "pending",
                      start: bookingDetailController.startPending.toString(),
                      limit: bookingDetailController.limitPending.toString(),
                      search: bookingDetailController
                          .bookingDetailScreenEditingController.text
                          .trim(),
                    );
                    log("Wallet Payment - ✅ Booking detail data reloaded successfully");
                  } else {
                    log("Wallet Payment - ⚠️ BookingDetailScreenController not found, data will load on next screen init");
                  }
                } catch (e) {
                  log("Wallet Payment - ⚠️ Error reloading booking detail data: $e");
                  // Don't block success dialog if reload fails
                }
              } catch (e) {
                log("Wallet Payment - ⚠️ Error reloading data: $e");
                // Don't block success dialog if reload fails
              }
            });
          } else {
            Utils.showToast(
                Get.context!,
                bookingScreenController!.createBookingCategory?.message ??
                    "Booking failed");
          }
        } catch (e) {
          log("Error creating booking for wallet payment: $e");

          // Check if screen is still active before showing error
          if (isScreenActive) {
            Utils.showToast(
                Get.context!, "Error creating booking: ${e.toString()}");
            // Ensure loading is cleared on error
            if (bookingScreenController != null) {
              bookingScreenController!.isLoading(false);
              bookingScreenController!.update([Constant.idProgressView]);
            }
          }
        } finally {
          // Only update if screen is still active
          if (isScreenActive) {
            isLoading(false);
            update([Constant.idProgressView]);
          }
        }
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
      if (isScreenActive) {
        Utils.showToast(Get.context!, exception.message);
      }
    } catch (e) {
      log("Error call Deposit To Wallet Api :: $e");
    } finally {
      // Only update if screen is still active
      if (isScreenActive) {
        isLoading(false);
        update([Constant.idProgressView]);
      }
    }
  }
}
