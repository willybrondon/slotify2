import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class InsufficientWalletRechargeDialog extends StatelessWidget {
  final double currentBalance;
  final double requiredBalance;
  final double deficit;
  final String currencySymbol;
  final VoidCallback onCancel;
  final VoidCallback onRecharge;

  const InsufficientWalletRechargeDialog({
    super.key,
    required this.currentBalance,
    required this.requiredBalance,
    required this.deficit,
    required this.currencySymbol,
    required this.onCancel,
    required this.onRecharge,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 420,
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(45),
      ),
      child: Column(
        children: [
          Container(
            height: 58,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(44),
                topRight: Radius.circular(44),
              ),
              color: AppColors.primaryAppColor,
            ),
            child: Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    color: AppColors.whiteColor,
                    size: 24,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    "Insufficient Wallet",
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      color: AppColors.whiteColor,
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primaryAppColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primaryAppColor.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          "Your money is insufficient in your wallet",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            color: AppColors.primaryTextColor,
                            fontSize: 16,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.whiteColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "Current Balance:",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      color: AppColors.primaryTextColor,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    "$currencySymbol ${currentBalance.toStringAsFixed(2)}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      color: AppColors.primaryTextColor,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "Required Amount:",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      color: AppColors.primaryTextColor,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    "$currencySymbol ${requiredBalance.toStringAsFixed(2)}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      color: AppColors.primaryAppColor,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Divider(
                                color: AppColors.greyColor.withOpacity(0.2),
                                height: 1,
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "Deficit:",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      color: AppColors.primaryTextColor,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    "$currencySymbol ${deficit.toStringAsFixed(2)}",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                      color: AppColors.redText,
                                      fontSize: 15,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          "Please recharge your wallet to continue with your booking.",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplay,
                            color: AppColors.currencyGrey,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppButton(
                buttonColor: AppColors.whiteColor,
                buttonText: "Cancel",
                textColor: AppColors.primaryAppColor,
                borderColor: AppColors.greyColor.withOpacity(0.2),
                borderWidth: 1,
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 46,
                width: Get.width * 0.33,
                onTap: onCancel,
              ),
              AppButton(
                buttonColor: AppColors.primaryAppColor,
                buttonText: "Recharge",
                textColor: AppColors.whiteColor,
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 16.5,
                height: 46,
                width: Get.width * 0.33,
                onTap: onRecharge,
              ),
            ],
          ).paddingOnly(left: 13, right: 13, bottom: 25),
        ],
      ),
    );
  }
}

