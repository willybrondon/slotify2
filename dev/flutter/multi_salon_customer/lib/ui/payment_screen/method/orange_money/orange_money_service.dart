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
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class OrangeMoneyService {
  static late String orangeMoneyApiKey;
  static late String orangeMoneyApiSecret;
  static late num discountAmounts;
  static late num discountPercentages;
  static late String dates;
  static late String times;
  static late double rupees;
  static late int totalAmountWithOutTaxs;
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
    String? orangeMoneyApiKey,
    String? orangeMoneyApiSecret,
    num? discountAmount,
    num? discountPercentage,
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
    log("Orange Money API Key :: $orangeMoneyApiKey");
    log("Orange Money API Secret :: $orangeMoneyApiSecret");
    log("totalAmountWithOutTax :: $totalAmountWithOutTax");
    log("paymentType :: $paymentType");
    log("serviceId :: $serviceId");
    log("expertId :: $expertId");
    log("time :: $time");

    this.orangeMoneyApiKey = orangeMoneyApiKey ?? "";
    this.orangeMoneyApiSecret = orangeMoneyApiSecret ?? "";
    this.discountAmounts = discountAmount ?? 0.0;
    this.discountPercentages = discountPercentage ?? 0.0;
    this.onComplete = onComplete;
    this.dates = date ?? "";
    this.times = time ?? "";
    this.rupees = rupee ?? 0.0;
    this.totalAmountWithOutTaxs = totalAmountWithOutTax ?? 0;
    this.serviceIds = serviceId ?? "";
    this.expertIds = expertId ?? "";
    this.userIds = userId ?? "";
    this.paymentTypes = paymentType ?? "";
  }

  Future<dynamic> orangeMoneyPay() async {
    log("Orange Money Payment Started");

    String userId = Constant.storage.read<String>('userId') ?? "";
    String userName = Constant.storage.read<String>('UserName') ?? "";
    String userEmail = Constant.storage.read<String>('UserEmail') ?? "";
    String userContactNumber =
        Constant.storage.read<String>('UserContactNumber') ?? "";

    try {
      // Simulate Orange Money payment process
      // In a real implementation, you would integrate with Orange Money API
      log("Initiating Orange Money payment for amount: $totalAmountWithOutTaxs");
      log("User: $userName, Phone: $userContactNumber");

      // Simulate payment processing delay
      await Future.delayed(const Duration(seconds: 2));

      // Simulate successful payment
      bool paymentSuccess = true; // In real implementation, check API response

      if (paymentSuccess) {
        log("Orange Money payment successful");
        handlePaymentSuccess();
        return {"status": "success", "message": "Payment successful"};
      } else {
        log("Orange Money payment failed");
        throw "Payment failed. Please try again.";
      }
    } catch (e) {
      log("Orange Money payment error: $e");
      throw e.toString();
    }
  }

  void handlePaymentSuccess() {
    log("Orange Money Payment Success - Handling success");

    if (paymentTypes == "wallet") {
      // Handle wallet deposit success
      Get.delete<CategoryDetailController>();
      Get.delete<BranchDetailController>();
      Get.delete<SelectBranchController>();
      Get.delete<ViewAllCategoryController>();
      Get.delete<ExpertDetailController>();

      Get.offAndToNamed(AppRoutes.bottom);
      Get.dialog(
        barrierColor: AppColors.blackColor.withOpacity(0.8),
        Dialog(
          backgroundColor: AppColors.transparent,
          child: SuccessDialog(),
        ),
      );
    } else {
      // Handle booking payment success
      if (bookingScreenController.createBookingCategory?.status == true) {
        Get.delete<CategoryDetailController>();
        Get.delete<BranchDetailController>();
        Get.delete<SelectBranchController>();
        Get.delete<ViewAllCategoryController>();
        Get.delete<ExpertDetailController>();

        Get.offAndToNamed(AppRoutes.bottom);
        Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
            backgroundColor: AppColors.transparent,
            child: SuccessDialog(),
          ),
        );
      } else {
        Utils.showToast(Get.context!,
            bookingScreenController.createBookingCategory?.message ?? "");
      }
    }
  }

  void handlePaymentError(String errorMessage) {
    Utils.showToast(Get.context!, errorMessage);
  }
}
