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
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
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
  static late int totalAmountWithOutTaxs;
  static late String serviceIds;
  static late String expertIds;
  static late String userIds;
  static late String paymentTypes;
  Function(Map<String, dynamic>)? onComplete;

  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.put(SplashController());
  CategoryDetailController categoryDetailController = Get.put(CategoryDetailController());
  SearchScreenController searchScreenController = Get.put(SearchScreenController());
  BookingScreenController bookingScreenController = Get.put(BookingScreenController());
  PaymentScreenController paymentScreenController = Get.put(PaymentScreenController());
  BranchDetailController branchDetailController = Get.put(BranchDetailController());
  SelectBranchController selectBranchController = Get.put(SelectBranchController());
  ExpertDetailController expertDetailController = Get.put(ExpertDetailController());

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

    Stripe.publishableKey = "${splashController.settingCategory?.setting?.stripePublishableKey}";
    Stripe.merchantIdentifier = 'merchant.flutter.stripe.test';

    await Stripe.instance.applySettings().catchError((e) {
      Utils.showToast(Get.context!, e.toString());
      bookingScreenController.isLoading(false);
      throw e.toString();
    });

    stripeURLs = stripeURL ?? "";
    stripePaymentKeys = stripePaymentKey ?? "";
    isTests = isTest ?? true;
    discountAmounts = discountAmount ?? 0.0;
    discountPercentages = discountPercentage ?? 0.0;
    this.onComplete = onComplete;
    dates = date ?? "";
    times = time ?? "";
    rupees = rupee ?? 0.0;
    totalAmountWithOutTaxs = totalAmountWithOutTax ?? 0;
    serviceIds = serviceId ?? "";
    expertIds = expertId ?? "";
    userIds = userId ?? "";
    paymentTypes = paymentType ?? "";
  }

  Future<dynamic> stripePay() async {
    log("stripePaymentKey :::: $stripePaymentKeys");

    String userId = Constant.storage.read<String>('userId') ?? "";
    String userName = Constant.storage.read<String>('UserName') ?? "";
    String userEmail = Constant.storage.read<String>('UserEmail') ?? "";
    try {
      int stripeAmount = totalAmountWithOutTaxs * 100;
      log("stripeAmount :: $stripeAmount");

      Map<String, dynamic> body = {
        'amount': (totalAmountWithOutTaxs * 100).toString(),
        'currency': splashController.settingCategory?.setting?.currencyName,
        'description': 'Name: $userName - Email: $userEmail',
      };

      var response = await http.post(Uri.parse(Constant.stripeUrl), body: body, headers: {
        "Authorization": "Bearer ${splashController.settingCategory?.setting?.stripeSecretKey.toString() ?? ""}",
        "Content-Type": 'application/x-www-form-urlencoded'
      });
      log("End Payment Intent http request post method");

      log("Stripe Payment Response StatusCode :: ${response.statusCode}");
      log("Stripe Payment Response Body :: ${response.body}");

      if (response.statusCode == 200) {
        StripePayModel res = StripePayModel.fromJson(jsonDecode(response.body));
        bookingScreenController.isLoading(true);

        String? strSelectString;
        List? partsSelectedString;
        String? selectTime;

        strSelectString = bookingScreenController.selectedSlot;
        partsSelectedString = strSelectString.split(' ');
        selectTime = partsSelectedString[0];

        log("selectTime :: $selectTime");
        log("selectTime :: ${res.clientSecret}");

        try {
          SetupPaymentSheetParameters setupPaymentSheetParameters = SetupPaymentSheetParameters(
            paymentIntentClientSecret: res.clientSecret,
            appearance: PaymentSheetAppearance(colors: PaymentSheetAppearanceColors(primary: AppColors.primaryAppColor)),
            applePay: PaymentSheetApplePay(merchantCountryCode: Constant.stripeMerchantCountryCode),
            googlePay: PaymentSheetGooglePay(merchantCountryCode: Constant.stripeMerchantCountryCode, testEnv: isTests),
            merchantDisplayName: Constant.appName,
            customerId: userId.toString(),
            billingDetails: BillingDetails(name: userName, email: userEmail),
          );
          await Stripe.instance.initPaymentSheet(paymentSheetParameters: setupPaymentSheetParameters).then(
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
                      paymentGateway: "1",
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
                },
              ).catchError(
                (e) {
                  log("Error in Stripe Payment Method :: $e");
                },
              );

              log("Stripe Payment Method Complete");
            },
          );
        } catch (e) {
          if (e is StripeException) {
            log('Stripe Exception :: ${e.error.localizedMessage}');
          } else {
            log('Stripe Payment Method Unexpected Error :: $e');
          }
        }
      } else if (response.statusCode == 401) {
        log("Error during Stripe payment");
        bookingScreenController.isLoading(false);

        throw 'Something Went Wrong';
      }
      return jsonDecode(response.body);
    } catch (e) {
      if (e is StripeException) {
        log('Stripe Error: ${e.error.localizedMessage}');
      } else {
        log('Unexpected error: $e');
      }
    }
  }
}
