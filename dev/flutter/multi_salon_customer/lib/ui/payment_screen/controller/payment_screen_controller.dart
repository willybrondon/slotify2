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
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/payment_screen/model/deposit_to_wallet_model.dart';
import 'package:salon_2/utils/app_colors.dart';

import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';

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

  // Booking controller reference for creating bookings
  BookingScreenController? bookingScreenController;

  @override
  void onInit() async {
    await getDataFromArgs();
    // Initialize booking controller and sync coupon data for booking payments
    if (isWalletAdd == false && isCreateOrder == true) {
      try {
        bookingScreenController = Get.find<BookingScreenController>();

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
    log("Payment Screen - Args received: $args");

    if (args != null) {
      log("Payment Screen - Args length: ${args.length}");

      if (args.length >= 4) {
        isWalletAdd = args[0];
        totalAmount = args[1];
        isCreateOrder = args[2];
        selectedPayment = args[3];
        if (args.length > 4) {
          bookingData = args[4]; // Additional booking data
        }
      } else if (args.length >= 3) {
        // Handle wallet recharge case with 3 arguments
        isWalletAdd = args[0];
        totalAmount = args[1];
        isCreateOrder = args[2];
        selectedPayment = null; // Will be set to default below
        log("Payment Screen - Wallet recharge detected with 3 arguments");
      }

      // Set default payment method if not specified
      selectedPayment ??= isWalletAdd == true
          ? "Stripe"
          : "wallet"; // Changed from "Razorpay" to "Stripe" for wallet recharge

      log("Payment Screen - Is Wallet Add :: $isWalletAdd");
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
    } else {
      log("Payment Screen - WARNING: No arguments received!");
    }
    update([Constant.idSelectPaymentMethod]);
  }

  onSelectPaymentMethod(String value) {
    selectedPayment = value;

    log("Current Index payment :: $selectedPayment");
    update([Constant.idSelectPaymentMethod]);
  }

  onClickPayNow() async {
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

        await StripeService().stripePay().then((value) {
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
            Utils.showToast(Get.context!, "Payment failed: ${e.toString()}");
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

            // If still not found, log warning but proceed (backend will validate)
            if (bookingScreenController!.selectedCouponId == null) {
              log("Cash Payment - ⚠️  WARNING: Coupon ID not found for code: ${bookingScreenController!.manualCouponCode}");
              log("Cash Payment - ⚠️  Booking will proceed without couponId - backend may reject if coupon is required");
            }
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

          // Set loading state
          bookingScreenController!.isLoading(true);
          bookingScreenController!.update([Constant.idProgressView]);

          // Ensure amount is properly formatted to 2 decimal places to match backend expectation
          double finalAmount = double.parse(
              bookingScreenController!.totalPrice.toStringAsFixed(2));

          await bookingScreenController!.onCreateBookingApiCall(
            userId: Constant.storage.read<String>('userId') ?? "",
            expertId: bookingData!['expertId'] ?? "",
            serviceId: bookingData!['serviceId'] ?? "",
            salonId: bookingData!['salonId'] ?? "",
            date: bookingData!['date'] ?? "",
            time: bookingData!['time'] ?? "",
            amount:
                finalAmount, // Use properly formatted amount with coupon discount
            withoutTax: withoutTaxValue,
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
            // Clear all data and show success
            bookingScreenController!.finalTaxRupee = 0.0;
            bookingScreenController!.withOutTaxRupee = 0.0;
            bookingScreenController!.totalPrice = 0.0;
            bookingScreenController!.resetCoupon();

            // Navigate back to home screen
            Get.offAllNamed(AppRoutes.bottom);

            // Show success dialog
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Material(
                color: AppColors.transparent,
                child: SuccessDialog(),
              ),
            );
          } else {
            Utils.showToast(
                Get.context!,
                bookingScreenController!.createBookingCategory?.message ??
                    "Booking failed");
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
            // Clear all data and show success
            bookingScreenController!.finalTaxRupee = 0.0;
            bookingScreenController!.withOutTaxRupee = 0.0;
            bookingScreenController!.totalPrice = 0.0;
            bookingScreenController!.resetCoupon();

            // Navigate back to home screen
            Get.offAllNamed(AppRoutes.bottom);

            // Show success dialog
            Get.dialog(
              barrierColor: AppColors.blackColor.withOpacity(0.8),
              Material(
                color: AppColors.transparent,
                child: SuccessDialog(),
              ),
            );
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
