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
import 'package:salon_2/ui/payment/Stripe_Payment/stripe_pay_model.dart';
import 'package:salon_2/ui/search/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class StripeService {
  String stripeURL = "";
  String stripePaymentKey = "";
  num discountAmount = 0;
  num discountPercentage = 0;
  bool isTest = false;
  String date = "";
  String time = "";
  double rupee = 0;
  int withoutTaxRupee = 0;
  String serviceId = "";
  String expertId = "";
  String userId = "";
  String paymentType = "";
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.find<SplashController>();
  CategoryDetailController categoryDetailController = Get.put(CategoryDetailController());
  SearchScreenController searchScreenController = Get.put(SearchScreenController());
  BookingScreenController bookingScreenController = Get.put(BookingScreenController());
  BranchDetailController branchDetailController = Get.put(BranchDetailController());
  SelectBranchController selectBranchController = Get.put(SelectBranchController());
  ExpertDetailController expertDetailController = Get.put(ExpertDetailController());

  Function(Map<String, dynamic>)? onComplete;

  init({
    required String stripePaymentPublishKey,
    required String stripeURL,
    required String stripePaymentKey,
    required bool isTest,
    required num discountAmount,
    required num discountPercentage,
    required String date,
    required String time,
    required double rupee,
    required int withoutTaxRupee,
    required String serviceId,
    required String expertId,
    required String userId,
    required String paymentType,
    Function(Map<String, dynamic>)? onComplete,
  }) async {
    log("object :: $stripePaymentPublishKey");
    log("object :: $stripePaymentKey");

    log("paymentType :: $paymentType");
    log("serviceId :: $serviceId");
    log("expertId :: $expertId");
    log("time :: $time");

    Stripe.publishableKey = stripePaymentPublishKey;
    Stripe.merchantIdentifier = 'merchant.flutter.stripe.test';

    await Stripe.instance.applySettings().catchError((e) {
      Utils.showToast(Get.context!, e.toString());
      bookingScreenController.isLoading(false);
      throw e.toString();
    });
    this.stripeURL = stripeURL;
    this.stripePaymentKey = stripePaymentKey;
    this.isTest = isTest;
    this.discountAmount = discountAmount;
    this.discountPercentage = discountPercentage;
    this.onComplete = onComplete;
    this.date = date;
    this.time = time;
    this.rupee = rupee;
    this.withoutTaxRupee = withoutTaxRupee;
    this.serviceId = serviceId;
    this.expertId = expertId;
    this.userId = userId;
    this.paymentType = paymentType;
  }

  //StripPayment
  Future<dynamic> stripePay() async {
    log("object :: $stripePaymentKey");

    String userId = Constant.storage.read<String>('UserId') ?? "";
    String userName = Constant.storage.read<String>('UserName') ?? "";
    String userEmail = Constant.storage.read<String>('UserEmail') ?? "";
    try {
      Map<String, dynamic> body = {
        'amount': (int.parse(bookingScreenController.totalPrice.round().toString()) * 100).toString(),
        'currency': splashController.settingCategory?.setting?.currencyName,
        'description': 'Name: $userName - Email: $userEmail',
      };

      log("Start Payment Intent http rwq post method${splashController.settingCategory?.setting?.stripeSecretKey.toString()}");
      log("Start Payment Intent http rwq post method${splashController.settingCategory?.setting?.stripePublishableKey}");

      var response = await http.post(Uri.parse(Constant.stripeUrl), body: body, headers: {
        "Authorization": "Bearer ${splashController.settingCategory?.setting?.stripeSecretKey.toString() ?? ""}",
        "Content-Type": 'application/x-www-form-urlencoded'
      });
      log("End Payment Intent http rwq post method");
      log("object2:::::::");

      log(response.body.toString());

      if (response.statusCode == 200) {
        log("object2:::::::");

        StripePayModel res = StripePayModel.fromJson(jsonDecode(response.body));
        bookingScreenController.isLoading(true);
        log("object:::::::$res");

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
            appearance:
                PaymentSheetAppearance(colors: PaymentSheetAppearanceColors(primary: AppColors.primaryAppColor)),
            applePay: const PaymentSheetApplePay(merchantCountryCode: Constant.stripeMerchantCountryCode),
            googlePay: PaymentSheetGooglePay(merchantCountryCode: Constant.stripeMerchantCountryCode, testEnv: isTest),
            merchantDisplayName: Constant.appName,
            customerId: userId.toString(),
            billingDetails: BillingDetails(name: userName, email: userEmail),
          );
          await Stripe.instance
              .initPaymentSheet(paymentSheetParameters: setupPaymentSheetParameters)
              .then((value) async {
            await Stripe.instance.presentPaymentSheet().then((value) async {
              log("object::::: presentPaymentSheetConfirm");

              log("paymentType :: $paymentType");
              log("serviceId :: $serviceId");
              log("expertId :: $expertId");
              log("time :: $time");
              await bookingScreenController.onCreateBookingApiCall(
                userId: Constant.storage.read<String>('UserId') ?? "",
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

                for (var i = 0;
                    i < (branchDetailController.getSalonDetailCategory?.salon?.serviceIds?.length ?? 0);
                    i++) {
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
            }).catchError((e) {
              log("on create::::::#####$e");
            });

            log("on complete :::");
          });
        } catch (e) {
          if (e is StripeException) {
            log('Stripe Error: ${e.error.localizedMessage}');
          } else {
            log('Unexpected error: $e');
          }
        }
      } else if (response.statusCode == 401) {
        log("Error during Stripe payment: ");
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
