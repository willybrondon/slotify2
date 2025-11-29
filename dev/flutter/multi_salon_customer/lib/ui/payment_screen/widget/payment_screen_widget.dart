import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/home_screen/widget/view_all_screen_widget.dart';
import 'package:salon_2/ui/payment_screen/controller/payment_screen_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class PaymentAppBarView extends StatelessWidget {
  const PaymentAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtPayment".tr,
      method: InkWell(
        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        onTap: () {
          // Stop any ongoing loading states and go back immediately
          final paymentController = Get.find<PaymentScreenController>();
          paymentController.isLoading.value = false;
          Get.back();
        },
        child: Icon(
          Icons.arrow_back,
          color: AppColors.blackColor,
        ),
      ),
    );
  }
}

class PaymentMethodView extends StatelessWidget {
  const PaymentMethodView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentScreenController>(
      id: Constant.idSelectPaymentMethod,
      builder: (logic) {
        return logic.isWalletAdd == true
            ? const Column(
                children: [
                  PaymentTitleView(),
                  // PaymentRazorPayView(), // Commented out for wallet recharge
                  PaymentStripeView(),
                  // PaymentFlutterWaveView(), // Commented out for wallet recharge
                ],
              ).paddingAll(15)
            : Column(
                children: [
                  PaymentTitleView(),
                  // Show the payment method that was already selected in booking screen
                  if (logic.selectedPayment == "wallet") PaymentMyWalletView(),
                  if (logic.selectedPayment == "Stripe") PaymentStripeView(),
                  if (logic.selectedPayment == "cashAfterService")
                    PaymentCashOnHandView(),
                  // Add other payment methods as needed

                  // Show a message that payment method is already selected
                  Container(
                    width: Get.width,
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.only(top: 16),
                    decoration: BoxDecoration(
                      color: AppColors.primaryAppColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primaryAppColor.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: AppColors.primaryAppColor,
                          size: 20,
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            "Payment method '${logic.selectedPayment}' is already selected. Click Continue to proceed.",
                            style: TextStyle(
                              color: AppColors.primaryAppColor,
                              fontSize: 14,
                              fontFamily: AppFontFamily.sfProDisplay,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Coupon Section - Only show if not wallet add
                  if (logic.isWalletAdd != true) PaymentCouponView(),
                ],
              ).paddingAll(15);
      },
    );
  }
}

class PaymentTitleView extends StatelessWidget {
  const PaymentTitleView({super.key});

  @override
  Widget build(BuildContext context) {
    return ViewAll(
      title: "txtPaymentMethod".tr,
      subtitle: "",
      textColor: AppColors.primaryTextColor,
      fontFamily: AppFontFamily.heeBo700,
      fontSize: 18,
    ).paddingOnly(bottom: 14);
  }
}

class PaymentMyWalletView extends StatelessWidget {
  const PaymentMyWalletView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentScreenController>(
      id: Constant.idSelectPaymentMethod,
      builder: (logic) {
        return InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: () {
            logic.onSelectPaymentMethod("wallet");
          },
          child: Container(
            height: 60,
            width: Get.width,
            padding: const EdgeInsets.only(left: 10, right: 5),
            decoration: BoxDecoration(
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(10),
              color: AppColors.whiteColor,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(
                        AppAsset.icWallet,
                        height: 30,
                        width: 30,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "txtMyWallet".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 16.5,
                            color: AppColors.primaryTextColor,
                          ),
                        ),
                        GetBuilder<WalletScreenController>(
                          id: Constant.idProgressView,
                          builder: (logic) {
                            return Text(
                              "($currency ${walletAmount?.toStringAsFixed(2)}) ${"txtInYourWallet".tr}",
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplay,
                                fontSize: 12,
                                color: AppColors.currencyGrey,
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  height: 25,
                  width: 25,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: logic.selectedPayment == "wallet"
                          ? AppColors.primaryAppColor
                          : AppColors.greyColor.withOpacity(0.3),
                    ),
                  ),
                  child: logic.selectedPayment == "wallet"
                      ? Image.asset(
                          AppAsset.icCheck,
                          color: AppColors.primaryAppColor,
                          height: 15,
                          width: 15,
                        )
                      : const SizedBox(),
                ).paddingOnly(right: 10)
              ],
            ),
          ),
        );
      },
    ).paddingOnly(bottom: 15);
  }
}

class PaymentCashOnHandView extends StatelessWidget {
  const PaymentCashOnHandView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentScreenController>(
      id: Constant.idSelectPaymentMethod,
      builder: (logic) {
        return InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: () {
            logic.onSelectPaymentMethod("cashAfterService");
          },
          child: Container(
            height: 60,
            width: Get.width,
            padding: const EdgeInsets.only(left: 10, right: 5),
            decoration: BoxDecoration(
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(10),
              color: AppColors.whiteColor,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(
                        AppAsset.icCashAfterService,
                        height: 25,
                        width: 25,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Text(
                      "Cash After Service",
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 16.5,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                  ],
                ),
                Container(
                  height: 25,
                  width: 25,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: logic.selectedPayment == "cashAfterService"
                          ? AppColors.primaryAppColor
                          : AppColors.greyColor.withOpacity(0.3),
                    ),
                  ),
                  child: logic.selectedPayment == "cashAfterService"
                      ? Image.asset(
                          AppAsset.icCheck,
                          color: AppColors.primaryAppColor,
                          height: 15,
                          width: 15,
                        )
                      : const SizedBox(),
                ).paddingOnly(right: 10)
              ],
            ),
          ),
        );
      },
    ).paddingOnly(bottom: 15);
  }
}

class PaymentRazorPayView extends StatelessWidget {
  const PaymentRazorPayView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentScreenController>(
      id: Constant.idSelectPaymentMethod,
      builder: (logic) {
        return InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: () {
            logic.onSelectPaymentMethod("Razorpay");
          },
          child: Container(
            height: 60,
            width: Get.width,
            padding: const EdgeInsets.only(left: 10, right: 5),
            decoration: BoxDecoration(
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(10),
              color: AppColors.whiteColor,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(
                        AppAsset.icRazorPay,
                        height: 30,
                        width: 30,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Text(
                      "Razorpay",
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 16.5,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                  ],
                ),
                Container(
                  height: 25,
                  width: 25,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: logic.selectedPayment == "Razorpay"
                          ? AppColors.primaryAppColor
                          : AppColors.greyColor.withOpacity(0.3),
                    ),
                  ),
                  child: logic.selectedPayment == "Razorpay"
                      ? Image.asset(
                          AppAsset.icCheck,
                          color: AppColors.primaryAppColor,
                          height: 15,
                          width: 15,
                        )
                      : const SizedBox(),
                ).paddingOnly(right: 10)
              ],
            ),
          ),
        );
      },
    ).paddingOnly(bottom: 15);
  }
}

class PaymentStripeView extends StatelessWidget {
  const PaymentStripeView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentScreenController>(
      id: Constant.idSelectPaymentMethod,
      builder: (logic) {
        return InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: () {
            logic.onSelectPaymentMethod("Stripe");
          },
          child: Container(
            height: 60,
            width: Get.width,
            padding: const EdgeInsets.only(left: 10, right: 5),
            decoration: BoxDecoration(
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(10),
              color: AppColors.whiteColor,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(
                        AppAsset.icStripe,
                        height: 30,
                        width: 30,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Text(
                      "Stripe",
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 16.5,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                  ],
                ),
                Container(
                  height: 25,
                  width: 25,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: logic.selectedPayment == "Stripe"
                          ? AppColors.primaryAppColor
                          : AppColors.greyColor.withOpacity(0.3),
                    ),
                  ),
                  child: logic.selectedPayment == "Stripe"
                      ? Image.asset(
                          AppAsset.icCheck,
                          color: AppColors.primaryAppColor,
                          height: 15,
                          width: 15,
                        )
                      : const SizedBox(),
                ).paddingOnly(right: 10),
              ],
            ),
          ),
        );
      },
    ).paddingOnly(bottom: 15);
  }
}

class PaymentFlutterWaveView extends StatelessWidget {
  const PaymentFlutterWaveView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentScreenController>(
      id: Constant.idSelectPaymentMethod,
      builder: (logic) {
        return InkWell(
          overlayColor: WidgetStatePropertyAll(AppColors.transparent),
          onTap: () {
            logic.onSelectPaymentMethod("flutterWave");
          },
          child: Container(
            height: 60,
            width: Get.width,
            padding: const EdgeInsets.only(left: 10, right: 5),
            decoration: BoxDecoration(
              border: Border.all(
                width: 1,
                color: AppColors.grey.withOpacity(0.1),
              ),
              borderRadius: BorderRadius.circular(10),
              color: AppColors.whiteColor,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(
                        AppAsset.icFlutterWave,
                        height: 30,
                        width: 30,
                      ),
                    ),
                    SizedBox(width: Get.width * 0.04),
                    Text(
                      "Flutter Wave",
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 16.5,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                  ],
                ),
                Container(
                  height: 25,
                  width: 25,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: logic.selectedPayment == "flutterWave"
                          ? AppColors.primaryAppColor
                          : AppColors.greyColor.withOpacity(0.3),
                    ),
                  ),
                  child: logic.selectedPayment == "flutterWave"
                      ? Image.asset(
                          AppAsset.icCheck,
                          color: AppColors.primaryAppColor,
                          height: 15,
                          width: 15,
                        )
                      : const SizedBox(),
                ).paddingOnly(right: 10)
              ],
            ),
          ),
        );
      },
    ).paddingOnly(bottom: 15);
  }
}

class PaymentScreenBottomView extends StatelessWidget {
  const PaymentScreenBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: Get.height * 0.120,
      width: double.infinity,
      alignment: Alignment.bottomLeft,
      decoration: BoxDecoration(
        color: AppColors.categoryBottom,
        boxShadow: Constant.boxShadow,
        border: Border.all(
          color: AppColors.grey.withOpacity(0.1),
          width: 0.8,
        ),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(22),
          topRight: Radius.circular(22),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: GetBuilder<PaymentScreenController>(
        id: Constant.idSelectPaymentMethod,
        builder: (logic) {
          return Row(
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "txtTotalAmount".tr,
                      style: TextStyle(
                        fontFamily: AppFontFamily.heeBo700,
                        fontSize: 17,
                        color: AppColors.appText,
                      ),
                    ).paddingOnly(left: 5, bottom: 7),
                    Row(
                      children: [
                        Text(
                          "$currency ${logic.totalAmount}",
                          style: TextStyle(
                            fontFamily: AppFontFamily.heeBo800,
                            fontSize: 18,
                            color: AppColors.primaryAppColor,
                          ),
                        ),
                        SizedBox(width: Get.width * 0.02),
                      ],
                    ).paddingOnly(left: 5)
                  ],
                ),
              ),
              const Spacer(),
              AppButton(
                height: 46,
                buttonColor: AppColors.primaryAppColor,
                color: AppColors.whiteColor,
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 15,
                buttonText: "Continue",
                width: Get.width * 0.28,
                onTap: () {
                  logic.onClickPayNow();
                },
              ),
            ],
          );
        },
      ),
    );
  }
}

class PaymentCouponView extends StatelessWidget {
  const PaymentCouponView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BookingScreenController>(
      id: Constant.idGetCoupon,
      builder: (logic) {
        return logic.getCouponModel?.data?.isEmpty == true
            ? const SizedBox()
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Apply Coupon",
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 16,
                      color: AppColors.primaryTextColor,
                    ),
                  ).paddingOnly(top: 15, bottom: 13),
                  // Manual Coupon Code Input
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.whiteColor,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: AppColors.grey.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: TextField(
                            controller: logic.couponCodeController,
                            decoration: InputDecoration(
                              hintText: "Enter coupon code",
                              hintStyle: TextStyle(
                                fontSize: 14,
                                color: AppColors.currencyGrey,
                                fontFamily: AppFontFamily.sfProDisplay,
                              ),
                              border: InputBorder.none,
                              contentPadding:
                                  const EdgeInsets.symmetric(
                                horizontal: 15,
                                vertical: 12,
                              ),
                              suffixIcon: logic.manualCouponCode != null
                                  ? IconButton(
                                      icon: Icon(
                                        Icons.close,
                                        color:
                                            AppColors.primaryAppColor,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        logic.onRemoveManualCoupon();
                                      },
                                    )
                                  : null,
                            ),
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.primaryTextColor,
                              fontFamily: AppFontFamily.sfProDisplay,
                            ),
                            textCapitalization:
                                TextCapitalization.characters,
                          ),
                        ),
                      ),
                      SizedBox(width: 10),
                      AppButton(
                        height: 48,
                        width: 100,
                        buttonColor: AppColors.primaryAppColor,
                        color: AppColors.whiteColor,
                        fontFamily: AppFontFamily.sfProDisplayBold,
                        fontSize: 14,
                        buttonText: logic.manualCouponCode != null
                            ? "Applied"
                            : "Apply",
                        onTap: () {
                          if (logic.manualCouponCode == null) {
                            logic.onApplyManualCouponCode();
                          }
                        },
                      ),
                    ],
                  ).paddingOnly(bottom: 15),
                  // Show applied coupon code if manually entered
                  if (logic.manualCouponCode != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color:
                            AppColors.primaryAppColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.primaryAppColor
                              .withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: AppColors.primaryAppColor,
                            size: 18,
                          ),
                          SizedBox(width: 8),
                          Text(
                            "Coupon '${logic.manualCouponCode}' applied",
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.primaryAppColor,
                              fontFamily:
                                  AppFontFamily.sfProDisplayMedium,
                            ),
                          ),
                        ],
                      ),
                    ).paddingOnly(bottom: 15),
                  SizedBox(
                    height: Get.height * 0.16,
                    child: ListView.builder(
                      itemCount:
                          logic.getCouponModel?.data?.length ?? 0,
                      scrollDirection: Axis.horizontal,
                      shrinkWrap: true,
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemBuilder: (context, index) {
                        final coupon =
                            logic.getCouponModel?.data?[index];
                        return GestureDetector(
                          onTap: () {
                            logic.onSelectCoupon(index);
                          },
                          child: Container(
                            width: Get.width * 0.83,
                            margin: EdgeInsets.only(right: 12),
                            decoration: BoxDecoration(
                              image: DecorationImage(
                                image: AssetImage(AppAsset.icCouponBox),
                                fit: BoxFit.fill,
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    SizedBox(
                                      width: Get.width * 0.6,
                                      child: Text(
                                        coupon?.title ?? "",
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 2,
                                        style: TextStyle(
                                          fontSize: 15,
                                          color:
                                              logic.applyCoupon == index
                                                  ? AppColors
                                                      .primaryAppColor
                                                  : AppColors
                                                      .primaryTextColor,
                                          fontFamily:
                                              AppFontFamily.heeBo800,
                                        ),
                                      ),
                                    ),
                                    // Discount Display
                                    Container(
                                      padding:
                                          const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 4),
                                      decoration: BoxDecoration(
                                        color: logic.applyCoupon ==
                                                index
                                            ? AppColors.whiteColor
                                                .withOpacity(0.2)
                                            : AppColors.primaryAppColor
                                                .withOpacity(0.1),
                                        borderRadius:
                                            BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        coupon?.discountType == 1
                                            ? "$currency ${coupon?.maxDiscount ?? 0} OFF"
                                            : "${coupon?.discountPercent ?? 0}% OFF${coupon?.maxDiscount != null && coupon!.maxDiscount! > 0 ? " (Up to $currency ${coupon.maxDiscount})" : ""}",
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: logic.applyCoupon == index
                                              ? AppColors.whiteColor
                                              : AppColors.primaryAppColor,
                                          fontFamily:
                                              AppFontFamily.heeBo700,
                                        ),
                                      ),
                                    ),
                                  ],
                                ).paddingOnly(
                                    top: 13, bottom: 13, left: 28),
                                Container(
                                  height: 22,
                                  width: 22,
                                  margin: EdgeInsets.only(right: 15),
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: logic.applyCoupon == index
                                          ? AppColors.whiteColor
                                          : AppColors.paymentText,
                                      width: 1.3,
                                    ),
                                    shape: BoxShape.circle,
                                  ),
                                  child: logic.applyCoupon == index
                                      ? Container(
                                          height: 21,
                                          width: 21,
                                          decoration: BoxDecoration(
                                            color:
                                                AppColors.primaryAppColor,
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(
                                            Icons.check,
                                            size: 14,
                                            color: AppColors.whiteColor,
                                          ),
                                        )
                                      : null,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ).paddingOnly(top: 15);
      },
    );
  }
}
