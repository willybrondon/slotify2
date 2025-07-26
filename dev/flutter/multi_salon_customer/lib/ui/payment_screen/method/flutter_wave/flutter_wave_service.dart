import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutterwave_standard/flutterwave.dart';
import 'package:get/get.dart';
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

class FlutterWaveService {
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.put(SplashController());
  CategoryDetailController categoryDetailController = Get.put(CategoryDetailController());
  BookingScreenController bookingScreenController = Get.put(BookingScreenController());
  SearchScreenController searchScreenController = Get.put(SearchScreenController());
  BranchDetailController branchDetailController = Get.put(BranchDetailController());
  SelectBranchController selectBranchController = Get.put(SelectBranchController());
  PaymentScreenController paymentScreenController = Get.put(PaymentScreenController());
  num discountAmount = 0;
  num discountPercentage = 0;
  String date = "";
  String time = "";
  double rupee = 0.0;
  String totalAmountWithOutTax = "";
  String serviceId = "";
  String expertId = "";
  String userId = "";
  String paymentType = "";
  Function(Map<String, dynamic>)? onComplete;
  String userEmail = Constant.storage.read<String>('UserEmail') ?? "";
  String userContactNumber = Constant.storage.read<String>('UserContactNumber') ?? "";

  init({
    String? flutterWavePublishKey,
    String? date,
    String? time,
    double? rupee,
    String? totalAmountWithOutTax,
    String? serviceId,
    String? expertId,
    String? userId,
    String? paymentType,
    Function(Map<String, dynamic>)? onComplete,
  }) {
    flutterWavePublishKey = flutterWavePublishKey;
    this.onComplete = onComplete;
    this.date = date ?? "";
    this.time = time ?? "";
    this.rupee = rupee ?? 0.0;
    totalAmountWithOutTax = totalAmountWithOutTax ?? "";
    this.serviceId = serviceId ?? "";
    this.expertId = expertId ?? "";
    this.userId = userId ?? "";
    this.paymentType = paymentType ?? "";
  }

  Future handlePaymentSuccess() async {
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
        paymentGateway: "3",
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
        expertId: Constant.storage.read<String>('expertDetail') != null ? Constant.storage.read<String>('expertDetail').toString() : Constant.storage.read<String>('expertId').toString(),
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

  void handlePaymentInitialization() async {
    log("Flutter Wave Stripe Key :: ${splashController.settingCategory?.setting?.flutterWaveKey}");

    final Customer customer = Customer(name: "Salon User", phoneNumber: userContactNumber.toString(), email: userEmail);

    log("Flutter Wave Start");
    final Flutterwave flutterWave = Flutterwave(
        // context: Get.context!,
        publicKey: splashController.settingCategory?.setting?.flutterWaveKey ?? "",
        currency: splashController.settingCategory?.setting?.currencyName ?? "",
        redirectUrl: "https://www.google.com/",
        txRef: DateTime.now().microsecond.toString(),
        amount: totalAmountWithOutTax.toString(),
        customer: customer,
        paymentOptions: "ussd, card, barter, payattitude",
        customization: Customization(title: Constant.appName),
        isTestMode: true);
    log("Flutter Wave Finish");
    final ChargeResponse response = await flutterWave.charge(Get.context!);
    log("Flutter Wave ----------- ");
    Utils.showToast(Get.context!, "Payment ${response.status.toString()}");

    if (response.success == true) {
      handlePaymentSuccess();
    }

    log("Flutter Wave Response :: ${response.toString()}");
    log("Flutter Wave Json Response :: ${response.toJson()}");
  }
}
