import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/payment_screen/method/mtn_momo/mtn_momo_service.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class WalletRechargeController extends GetxController {
  // Amount input
  TextEditingController amountController = TextEditingController();
  String selectedAmount = "";
  List<String> quickAmounts = ["50", "100", "150", "200", "250", "300", "500"];
  
  // Payment method
  String? selectedPaymentMethod;
  
  // MTN MoMo phone number
  TextEditingController phoneNumberController = TextEditingController();
  bool useRegisteredPhone = true;
  
  // Errors
  bool amountError = false;
  bool phoneError = false;
  
  // Processing state
  bool isProcessing = false;

  // Settings loading state (for payment methods list)
  bool isSettingsLoading = false;
  
  // Get settings
  SplashController? splashController;
  
  @override
  void onInit() {
    super.onInit();
    try {
      // Check if amount was passed as argument (from insufficient wallet flow)
      dynamic args = Get.arguments;
      if (args != null) {
        if (args is String) {
          // Single argument: amount as string
          String prefillAmount = args;
          if (prefillAmount.isNotEmpty && double.tryParse(prefillAmount) != null) {
            amountController.text = prefillAmount;
            selectedAmount = prefillAmount;
            log("WalletRechargeController - Pre-filled amount from arguments: $prefillAmount");
          }
        } else if (args is List && args.isNotEmpty) {
          // List argument: first element is amount
          String prefillAmount = args[0].toString();
          if (prefillAmount.isNotEmpty && double.tryParse(prefillAmount) != null) {
            amountController.text = prefillAmount;
            selectedAmount = prefillAmount;
            log("WalletRechargeController - Pre-filled amount from arguments: $prefillAmount");
          }
        }
      }
      
      // Get registered phone number
      String registeredPhone = Constant.storage.read<String>('UserMobile') ?? "";
      phoneNumberController.text = registeredPhone;
      
      // Get splash controller
      try {
        splashController = Get.find<SplashController>();
      } catch (e) {
        log("SplashController not found: $e");
        // Try to put it if not found
        try {
          splashController = Get.put(SplashController());
        } catch (e2) {
          log("Failed to initialize SplashController: $e2");
        }
      }

      // Ensure settings are loaded (otherwise payment methods will look empty)
      if (splashController?.settingCategory == null) {
        isSettingsLoading = true;
        update();
        Future.microtask(() async {
          try {
            await splashController?.onSettingApiCall();
          } catch (e) {
            log("Error loading settings in WalletRechargeController: $e");
          } finally {
            isSettingsLoading = false;
            update();
          }
        });
      }
    } catch (e) {
      log("Error in WalletRechargeController onInit: $e");
    }
  }
  
  @override
  void onClose() {
    amountController.dispose();
    phoneNumberController.dispose();
    super.onClose();
  }
  
  // Get available payment methods
  List<Map<String, String>> getAvailablePaymentMethods() {
    List<Map<String, String>> methods = [];
    
    if (splashController?.settingCategory?.setting?.isStripePay ?? false) {
      methods.add({"value": "Stripe", "label": "Stripe"});
    }
    if (splashController?.settingCategory?.setting?.isMtnMomo ?? false) {
      methods.add({"value": "MTN MoMo", "label": "MTN Mobile Money"});
    }
    if (splashController?.settingCategory?.setting?.isRazorPay ?? false) {
      methods.add({"value": "Razorpay", "label": "Razorpay"});
    }
    if (splashController?.settingCategory?.setting?.isFlutterWave ?? false) {
      methods.add({"value": "FlutterWave", "label": "FlutterWave"});
    }
    
    return methods;
  }
  
  // Select quick amount
  void selectQuickAmount(String amount) {
    selectedAmount = amount;
    amountController.text = amount;
    amountError = false;
    update();
  }
  
  // Handle amount input change
  void onAmountChanged(String value) {
    selectedAmount = "";
    amountError = false;
    update();
  }
  
  // Select payment method
  void selectPaymentMethod(String method) {
    if (isProcessing) return;
    selectedPaymentMethod = method;
    phoneNumberController.text = Constant.storage.read<String>('UserMobile') ?? "";
    useRegisteredPhone = true;
    phoneError = false;
    update();
  }
  
  // Toggle phone number usage
  void togglePhoneUsage(bool value) {
    useRegisteredPhone = value;
    if (value) {
      phoneNumberController.text = Constant.storage.read<String>('UserMobile') ?? "";
    }
    phoneError = false;
    update();
  }
  
  // Validate amount only (payment method will be selected on payment screen)
  bool validateAmount() {
    String amount = amountController.text.trim();
    if (amount.isEmpty || double.tryParse(amount) == null || double.parse(amount) <= 0) {
      amountError = true;
      update();
      return false;
    } else {
      amountError = false;
      update();
      return true;
    }
  }
  
  // Handle continue to payment screen
  Future<void> handleContinue() async {
    if (!validateAmount()) {
      Utils.showToast(Get.context!, "Please enter a valid amount");
      return;
    }
    
    String amount = amountController.text.trim();
    if (amount.isEmpty) {
      amount = selectedAmount;
    }
    
    if (amount.isEmpty || double.tryParse(amount) == null || double.parse(amount) <= 0) {
      Utils.showToast(Get.context!, "Please enter a valid amount");
      return;
    }
    
    isProcessing = true;
    update();
    
    try {
      // Navigate to payment screen without pre-selected payment method
      // Pass null for selectedPayment so all methods are shown
      var result = await Get.toNamed(
        AppRoutes.payment,
        arguments: [
          true, // isWalletAdd
          amount, // totalAmount
          false, // isCreateOrder
          null, // selectedPayment - null means show all payment methods
        ],
      );
      
      // After returning from payment screen, check if payment was successful
      if (result == 'success') {
        // Payment was successful, go back to wallet screen
        Get.back(result: 'success');
      } else {
        // Payment was cancelled or failed, stay on recharge screen
        // User can try again or go back manually
      }
    } catch (e) {
      log("Error in handleContinue: $e");
      Utils.showToast(Get.context!, "Error: $e");
    } finally {
      isProcessing = false;
      update();
    }
  }
  
  // Get currency symbol
  String getCurrencySymbol() {
    return splashController?.settingCategory?.setting?.currencySymbol ?? "";
  }
}

