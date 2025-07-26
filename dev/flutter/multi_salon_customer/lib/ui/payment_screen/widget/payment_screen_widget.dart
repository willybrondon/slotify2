import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/main.dart';
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
          Get.back();
        },
        child: Icon(
          Icons.arrow_back,
          color: AppColors.whiteColor,
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
                  PaymentRazorPayView(),
                  PaymentStripeView(),
                  PaymentFlutterWaveView(),
                ],
              ).paddingAll(15)
            : const Column(
                children: [
                  PaymentTitleView(),
                  PaymentMyWalletView(),
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
                    Row(
                      children: [
                        Text(
                          "txtMyWallet".tr,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            fontSize: 16.5,
                            color: AppColors.primaryTextColor,
                          ),
                        ).paddingOnly(right: 5),
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
                      color: logic.selectedPayment == "wallet" ? AppColors.primaryAppColor : AppColors.greyColor.withOpacity(0.3),
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
                      color:
                          logic.selectedPayment == "Razorpay" ? AppColors.primaryAppColor : AppColors.greyColor.withOpacity(0.3),
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
                      color: logic.selectedPayment == "Stripe" ? AppColors.primaryAppColor : AppColors.greyColor.withOpacity(0.3),
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
