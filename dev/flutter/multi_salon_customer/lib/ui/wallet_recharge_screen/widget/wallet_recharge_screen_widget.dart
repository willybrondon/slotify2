import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/wallet_recharge_screen/controller/wallet_recharge_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class WalletRechargeScreenWidget extends StatelessWidget {
  const WalletRechargeScreenWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Get controller from binding (already initialized)
    // The binding should have initialized it, but we'll handle errors gracefully
    return GetBuilder<WalletRechargeController>(
      builder: (logic) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Amount Input Section
              _buildAmountInputSection(logic),
              
              const SizedBox(height: 24),
              
              // Quick Amount Selection
              _buildQuickAmountSection(logic),
              
              const SizedBox(height: 32),
              
              // Continue Button
              _buildContinueButton(logic),
              
              const SizedBox(height: 16),
              
              // Info Message
              _buildInfoMessage(),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildAmountInputSection(WalletRechargeController logic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "txtEnterRechargeAmount".tr,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo700,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.primaryAppColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(10),
                  bottomLeft: Radius.circular(10),
                ),
              ),
              child: Text(
                logic.getCurrencySymbol(),
                style: TextStyle(
                  color: AppColors.whiteColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: AppFontFamily.heeBo700,
                ),
              ),
            ),
            Expanded(
              child: TextFormField(
                controller: logic.amountController,
                keyboardType: TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  hintText: "txtEnterAmount".tr,
                  border: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(10),
                      bottomRight: Radius.circular(10),
                    ),
                    borderSide: BorderSide(
                      color: logic.amountError ? AppColors.redText : AppColors.greyColor,
                      width: 2,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(10),
                      bottomRight: Radius.circular(10),
                    ),
                    borderSide: BorderSide(
                      color: logic.amountError ? AppColors.redText : AppColors.greyColor,
                      width: 2,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(10),
                      bottomRight: Radius.circular(10),
                    ),
                    borderSide: BorderSide(
                      color: AppColors.primaryAppColor,
                      width: 2,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  fontFamily: AppFontFamily.heeBo400,
                ),
                onChanged: logic.onAmountChanged,
              ),
            ),
          ],
        ),
        if (logic.amountError)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              "txtPleaseEnterValidAmount".tr,
              style: TextStyle(
                color: AppColors.redText,
                fontSize: 14,
                fontFamily: AppFontFamily.heeBo400,
              ),
              textAlign: TextAlign.end,
            ),
          ),
      ],
    );
  }
  
  Widget _buildQuickAmountSection(WalletRechargeController logic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "txtOrSelectQuickAmount".tr,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo700,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: logic.quickAmounts.map((amount) {
            bool isSelected = logic.selectedAmount == amount;
            return GestureDetector(
              onTap: () => logic.selectQuickAmount(amount),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryAppColor : Colors.transparent,
                  border: Border.all(
                    color: isSelected ? AppColors.primaryAppColor : AppColors.greyColor,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "${logic.getCurrencySymbol()} $amount",
                  style: TextStyle(
                    color: isSelected ? AppColors.whiteColor : AppColors.primaryTextColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    fontFamily: AppFontFamily.heeBo700,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
  
  Widget _buildContinueButton(WalletRechargeController logic) {
    // Validate only amount - no payment method needed here
    bool isEnabled = !logic.isProcessing &&
        logic.amountController.text.trim().isNotEmpty &&
        double.tryParse(logic.amountController.text.trim()) != null &&
        double.parse(logic.amountController.text.trim()) > 0;
    
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: isEnabled ? logic.handleContinue : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryAppColor,
          disabledBackgroundColor: AppColors.greyColor.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Text(
          logic.isProcessing ? "txtProcessing".tr : "txtContinueToPayment".tr,
          style: TextStyle(
            color: AppColors.whiteColor,
            fontSize: 16,
            fontWeight: FontWeight.w600,
            fontFamily: AppFontFamily.heeBo700,
          ),
        ),
      ),
    );
  }
  
  Widget _buildInfoMessage() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryAppColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
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
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              "txtWalletCreditedInfo".tr,
              style: TextStyle(
                color: AppColors.primaryAppColor,
                fontSize: 14,
                fontFamily: AppFontFamily.heeBo400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

