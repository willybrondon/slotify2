import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/payment_screen/method/zitopay/zitopay_service.dart';
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
  
  // Get settings
  SplashController? splashController;
  
  @override
  void onInit() {
    super.onInit();
    try {
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
    if (splashController?.settingCategory?.setting?.isZitopay ?? false) {
      methods.add({"value": "Zitopay", "label": "Zitopay"});
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
    update([Constant.idSelectAmount]);
  }
  
  // Handle amount input change
  void onAmountChanged(String value) {
    selectedAmount = "";
    amountError = false;
    update([Constant.idSelectAmount]);
  }
  
  // Select payment method
  void selectPaymentMethod(String method) {
    if (isProcessing) return;
    selectedPaymentMethod = method;
    phoneNumberController.text = Constant.storage.read<String>('UserMobile') ?? "";
    useRegisteredPhone = true;
    phoneError = false;
    update([Constant.idSelectPaymentMethod]);
  }
  
  // Toggle phone number usage
  void togglePhoneUsage(bool value) {
    useRegisteredPhone = value;
    if (value) {
      phoneNumberController.text = Constant.storage.read<String>('UserMobile') ?? "";
    }
    phoneError = false;
    update([Constant.idSelectPaymentMethod]);
  }
  
  // Validate inputs
  bool validateInputs() {
    bool isValid = true;
    
    // Validate amount
    String amount = amountController.text.trim();
    if (amount.isEmpty || double.tryParse(amount) == null || double.parse(amount) <= 0) {
      amountError = true;
      isValid = false;
    } else {
      amountError = false;
    }
    
    // Validate payment method
    if (selectedPaymentMethod == null || selectedPaymentMethod!.isEmpty) {
      Utils.showToast(Get.context!, "Please select a payment method");
      isValid = false;
    }
    
    // Validate MTN MoMo phone number
    if (selectedPaymentMethod == "MTN MoMo") {
      String phone = phoneNumberController.text.trim();
      if (phone.isEmpty || !phone.startsWith("237") || phone.length < 12) {
        phoneError = true;
        isValid = false;
      } else {
        phoneError = false;
      }
    }
    
    update([Constant.idSelectAmount, Constant.idSelectPaymentMethod]);
    return isValid;
  }
  
  // Handle recharge
  Future<void> handleRecharge() async {
    if (!validateInputs()) {
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
    update([Constant.idProgressView]);
    
    try {
      // Navigate to payment screen with selected payment method
      String? phoneNumber = selectedPaymentMethod == "MTN MoMo" 
          ? phoneNumberController.text.trim() 
          : null;
      
      // Store phone number for MTN MoMo if provided
      if (phoneNumber != null && phoneNumber.isNotEmpty) {
        MtnMomoService.mtnMomoPhoneNumber = phoneNumber;
      }
      
      var result = await Get.toNamed(
        AppRoutes.payment,
        arguments: [
          true, // isWalletAdd
          amount, // totalAmount
          false, // isCreateOrder
          selectedPaymentMethod, // selectedPayment
        ],
      );
      
      // After payment (success or cancel), go back to wallet screen
      // The payment screen will handle showing success dialog and going back
      // We just need to ensure we're back on wallet screen
      if (Get.currentRoute == AppRoutes.payment) {
        // If still on payment screen, go back
        Get.back();
      }
      
      // Go back to wallet screen
      Get.back();
    } catch (e) {
      log("Error in handleRecharge: $e");
      Utils.showToast(Get.context!, "Error: $e");
    } finally {
      isProcessing = false;
      update([Constant.idProgressView]);
    }
  }
  
  // Get currency symbol
  String getCurrencySymbol() {
    return splashController?.settingCategory?.setting?.currencySymbol ?? "";
  }
}

