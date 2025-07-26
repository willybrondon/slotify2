import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
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

class RazorPayService {
  static late Razorpay razorPay;
  static late String razorKeys;
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

  SplashController splashController = Get.put(SplashController());
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SearchScreenController searchScreenController = Get.put(SearchScreenController());
  CategoryDetailController categoryDetailController = Get.put(CategoryDetailController());
  BookingScreenController bookingScreenController = Get.put(BookingScreenController());
  BranchDetailController branchDetailController = Get.put(BranchDetailController());
  SelectBranchController selectBranchController = Get.put(SelectBranchController());
  PaymentScreenController paymentScreenController = Get.put(PaymentScreenController());

  init({
    String? razorKey,
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
  }) {
    razorPay = Razorpay();
    razorPay.on(Razorpay.EVENT_PAYMENT_SUCCESS, handlePaymentSuccess);
    razorPay.on(Razorpay.EVENT_PAYMENT_ERROR, handlePaymentError);
    razorPay.on(Razorpay.EVENT_EXTERNAL_WALLET, handleExternalWallet);
    razorKeys = razorKey ?? "";
    discountAmounts = discountAmount ?? 0.0;
    discountPercentages = discountPercentage ?? 0.0;
    dates = date ?? "";
    times = time ?? "";
    rupees = rupee ?? 0.0;
    totalAmountWithOutTaxs = totalAmountWithOutTax ?? 0;
    serviceIds = serviceId ?? "";
    expertIds = expertId ?? "";
    userIds = userId ?? "";
    paymentTypes = paymentType ?? "";
    this.onComplete = onComplete;
  }

  Future handlePaymentSuccess(PaymentSuccessResponse response) async {
    String? strSelectString;
    List? partsSelectedString;
    String? selectTime;

    strSelectString = bookingScreenController.selectedSlot;
    partsSelectedString = strSelectString.split(' ');
    selectTime = partsSelectedString[0];

    log("selectTime :: $selectTime");

    if (paymentScreenController.isWalletAdd == true) {
      await paymentScreenController.onDepositToWalletApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        amount: paymentScreenController.totalAmount ?? "",
        paymentGateway: "2",
      );

      if (paymentScreenController.depositToWalletModel?.status == true) {
        Utils.showToast(Get.context!, paymentScreenController.depositToWalletModel?.message ?? "");
        Get.back();
      } else {
        Utils.showToast(Get.context!, paymentScreenController.depositToWalletModel?.message ?? "");
      }
    } else {
      await bookingScreenController.onCreateBookingApiCall(
        userId: Constant.storage.read<String>('userId') ?? "",
        expertId: Constant.storage.read<String>('expertDetail') != null
            ? Constant.storage.read<String>('expertDetail').toString()
            : Constant.storage.read<String>('expertId').toString(),
        serviceId: bookingScreenController.serviceId.join(","),
        salonId: bookingScreenController.salonId.toString(),
        date: bookingScreenController.formattedDate.toString(),
        time: bookingScreenController.slotsString.toString(),
        amount: bookingScreenController.totalPrice,
        withoutTax: bookingScreenController.withOutTaxRupee.toInt(),
        paymentType: bookingScreenController.selectedPayment,
        atPlace: bookingScreenController.selectedVenue == "At Salon" ? 1 : 2,
        address: bookingScreenController.searchEditingController.text,
      );

      if (bookingScreenController.createBookingCategory?.status == true) {
        bookingScreenController.finalTaxRupee = 0.0;
        bookingScreenController.withOutTaxRupee = 0.0;
        bookingScreenController.totalPrice = 0.0;

        for (var i = 0; i < (categoryDetailController.getServiceCategory?.services?.length ?? 0); i++) {
          categoryDetailController.onCheckBoxClick(false, i);
        }

        for (var i = 0; i < (homeScreenController.getAllServiceCategory?.services?.length ?? 0); i++) {
          homeScreenController.onServiceCheckBoxClick(false, i);
        }

        for (var i = 0; i < (homeScreenController.getExpertCategory?.data?.services?.length ?? 0); i++) {
          homeScreenController.onCheckBoxClick(false, i);
        }

        for (var i = 0; i < (branchDetailController.getSalonDetailCategory?.salon?.serviceIds?.length ?? 0); i++) {
          branchDetailController.onCheckBoxClick(false, i);
        }

        homeScreenController.withOutTaxRupee = 0.0;
        homeScreenController.totalPrice = 0.0;
        homeScreenController.finalTaxRupee = 0.0;
        homeScreenController.totalMinute = 0;
        homeScreenController.checkItem.clear();
        homeScreenController.serviceId.clear();
        homeScreenController.serviceName.clear();

        homeScreenController.withOutTaxRupeeExpert = 0.0;
        homeScreenController.totalPriceExpert = 0.0;
        homeScreenController.finalTaxRupeeExpert = 0.0;
        homeScreenController.totalMinuteExpert = 0;
        homeScreenController.checkItemExpert.clear();
        homeScreenController.serviceIdExpert.clear();
        homeScreenController.serviceNameExpert.clear();

        searchScreenController.totalMinute = 0;
        searchScreenController.checkItem.clear();
        searchScreenController.serviceId.clear();
        searchScreenController.serviceName.clear();

        categoryDetailController.totalMinute = 0;
        categoryDetailController.checkItem.clear();
        categoryDetailController.serviceId.clear();
        categoryDetailController.serviceName.clear();

        branchDetailController.withOutTaxRupee = 0.0;
        branchDetailController.totalPrice = 0.0;
        branchDetailController.finalTaxRupee = 0.0;
        branchDetailController.totalMinute = 0;
        branchDetailController.checkItem.clear();
        branchDetailController.serviceId.clear();

        selectBranchController.selectBranch = -1;
        Constant.storage.remove("expertDetail");
        bookingScreenController.selectedExpertDataList.clear();

        log("withOutTaxRupee :: home ${homeScreenController.withOutTaxRupee} :: branch ${branchDetailController.withOutTaxRupee} ::  homeExpert ${homeScreenController.withOutTaxRupeeExpert}");
        log("totalPrice :: home ${homeScreenController.totalPrice} :: branch ${branchDetailController.totalPrice} ::  homeExpert ${homeScreenController.totalPriceExpert}");
        log("finalTaxRupee :: home ${homeScreenController.finalTaxRupee} :: branch ${branchDetailController.finalTaxRupee} ::  homeExpert ${homeScreenController.finalTaxRupeeExpert}");
        log("totalMinute :: home ${homeScreenController.totalMinute} :: category ${categoryDetailController.totalMinute} :: branch ${branchDetailController.totalMinute} :: search ${searchScreenController.totalMinute} ");
        log("checkItem :: home ${homeScreenController.checkItem} :: category ${categoryDetailController.checkItem} :: branch ${branchDetailController.checkItem} :: search ${searchScreenController.checkItem} ");
        log("serviceId :: home ${homeScreenController.serviceId} :: category ${categoryDetailController.serviceId} :: branch ${branchDetailController.serviceId} :: search ${searchScreenController.serviceId} ");

        1.seconds.delay();
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
        Utils.showToast(Get.context!, bookingScreenController.createBookingCategory?.message ?? "");
      }
    }
  }

  void handlePaymentError(PaymentFailureResponse response) {
    Utils.showToast(Get.context!, response.message ?? "");
  }

  void handleExternalWallet(ExternalWalletResponse response) {
    Utils.showToast(Get.context!, "External Wallet: ${response.walletName!}");
  }

  void razorPayCheckout() async {
    String userEmail = Constant.storage.read<String>('UserEmail') ?? "";
    String userContactNumber = Constant.storage.read<String>('UserContactNumber') ?? "";

    int amountInPaise = totalAmountWithOutTaxs;
    log("Razor Pay Amount :: $amountInPaise");

    var options = {
      'key': razorKeys,
      'amount': amountInPaise,
      'name': Constant.appName,
      'theme.color': '#1C2B20',
      'description': Constant.appName,
      'image': 'https://razorpay.com/assets/razorpay-glyph.svg',
      'currency': splashController.settingCategory?.setting?.currencyName,
      'prefill': {'contact': userContactNumber.toString(), 'email': userEmail},
      'external': {
        'wallets': ['paytm']
      }
    };
    try {
      razorPay.open(options);
    } catch (e) {
      log("Error in razor pay :: $e");
    }
  }
}
