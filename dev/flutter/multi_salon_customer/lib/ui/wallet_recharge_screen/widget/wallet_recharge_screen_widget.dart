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
    final controller = Get.put(WalletRechargeController());
    
    return GetBuilder<WalletRechargeController>(
      id: Constant.idProgressView,
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
              
              const SizedBox(height: 24),
              
              // Payment Method Selection
              _buildPaymentMethodSection(logic),
              
              const SizedBox(height: 24),
              
              // MTN MoMo Phone Number Input (if MTN MoMo is selected)
              if (logic.selectedPaymentMethod == "MTN MoMo")
                _buildPhoneNumberSection(logic),
              
              const SizedBox(height: 24),
              
              // Recharge Button
              _buildRechargeButton(logic),
              
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
          "Enter Recharge Amount",
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
                  hintText: "Enter amount",
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
              "*Please enter a valid amount",
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
          "Or Select Quick Amount",
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
  
  Widget _buildPaymentMethodSection(WalletRechargeController logic) {
    final availableMethods = logic.getAvailablePaymentMethods();
    
    if (availableMethods.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.redText.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.redText.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(Icons.error_outline, color: AppColors.redText, size: 40),
            const SizedBox(height: 10),
            Text(
              "No Payment Methods Available",
              style: TextStyle(
                fontSize: 16,
                color: AppColors.redText,
                fontFamily: AppFontFamily.heeBo700,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 5),
            Text(
              "Please contact admin to enable payment methods",
              style: TextStyle(
                fontSize: 12,
                color: AppColors.paymentText,
                fontFamily: AppFontFamily.heeBo400,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Select Payment Method",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo700,
          ),
        ),
        const SizedBox(height: 12),
        ...availableMethods.map((method) {
          bool isSelected = logic.selectedPaymentMethod == method["value"];
          return GestureDetector(
            onTap: logic.isProcessing ? null : () => logic.selectPaymentMethod(method["value"]!),
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected 
                    ? AppColors.primaryAppColor.withOpacity(0.1) 
                    : AppColors.whiteColor,
                border: Border.all(
                  color: isSelected ? AppColors.primaryAppColor : AppColors.greyColor,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  // Payment Method Logo/Icon
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.greyColor.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: _getPaymentMethodIcon(method["value"]!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      method["label"]!,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryTextColor,
                        fontFamily: AppFontFamily.heeBo700,
                      ),
                    ),
                  ),
                  // Selection Indicator
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primaryAppColor : Colors.transparent,
                      border: Border.all(
                        color: isSelected ? AppColors.primaryAppColor : AppColors.greyColor,
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: isSelected
                        ? Icon(Icons.check, color: AppColors.whiteColor, size: 16)
                        : null,
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }
  
  Widget _getPaymentMethodIcon(String method) {
    if (method == "Stripe") {
      return Text(
        "S",
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: AppColors.primaryAppColor,
          fontSize: 14,
        ),
      );
    } else if (method == "MTN MoMo") {
      return Text(
        "MTN",
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: Colors.yellow.shade700,
          fontSize: 10,
        ),
      );
    } else if (method == "Zitopay") {
      return Text(
        "ZP",
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: AppColors.primaryAppColor,
          fontSize: 12,
        ),
      );
    } else {
      return Text(
        method[0],
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: AppColors.greyColor,
          fontSize: 14,
        ),
      );
    }
  }
  
  Widget _buildPhoneNumberSection(WalletRechargeController logic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "MTN MoMo Phone Number",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryTextColor,
            fontFamily: AppFontFamily.heeBo700,
          ),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: logic.phoneNumberController,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            hintText: "Enter your MTN MoMo phone number (e.g., 237612345678)",
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: logic.phoneError ? AppColors.redText : AppColors.greyColor,
                width: 2,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: logic.phoneError ? AppColors.redText : AppColors.greyColor,
                width: 2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
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
          enabled: !logic.isProcessing,
        ),
        if (logic.phoneError)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              "*Please enter a valid phone number with country code",
              style: TextStyle(
                color: AppColors.redText,
                fontSize: 14,
                fontFamily: AppFontFamily.heeBo400,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        const SizedBox(height: 8),
        Text(
          "Enter your MTN Mobile Money registered phone number",
          style: TextStyle(
            color: AppColors.greyColor,
            fontSize: 12,
            fontFamily: AppFontFamily.heeBo400,
          ),
        ),
      ],
    );
  }
  
  Widget _buildRechargeButton(WalletRechargeController logic) {
    final availableMethods = logic.getAvailablePaymentMethods();
    bool isEnabled = !logic.isProcessing &&
        logic.amountController.text.trim().isNotEmpty &&
        double.tryParse(logic.amountController.text.trim()) != null &&
        double.parse(logic.amountController.text.trim()) > 0 &&
        logic.selectedPaymentMethod != null &&
        availableMethods.isNotEmpty &&
        (logic.selectedPaymentMethod != "MTN MoMo" || 
         (logic.phoneNumberController.text.trim().isNotEmpty &&
          logic.phoneNumberController.text.trim().startsWith("237") &&
          logic.phoneNumberController.text.trim().length >= 12));
    
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: isEnabled ? logic.handleRecharge : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryAppColor,
          disabledBackgroundColor: AppColors.greyColor.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Text(
          logic.isProcessing ? "Processing..." : "Recharge Wallet",
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
              "Your wallet will be credited immediately after successful payment",
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

