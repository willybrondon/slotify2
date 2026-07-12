import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

/// Checkout progress: delivery → payment → done (Planity / Fresha style).
class CheckoutStepHeader extends StatelessWidget {
  const CheckoutStepHeader({
    super.key,
    required this.currentStep,
  });

  /// 1 = address, 2 = payment, 3 = confirmation
  final int currentStep;

  @override
  Widget build(BuildContext context) {
    final steps = [
      "txtCheckoutStepDelivery".tr,
      "txtCheckoutStepPayment".tr,
      "txtCheckoutStepDone".tr,
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Row(
        children: List.generate(steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            final lineIndex = i ~/ 2;
            final active = currentStep > lineIndex + 1;
            return Expanded(
              child: Container(
                height: 2,
                margin: const EdgeInsets.only(bottom: 18),
                color: active
                    ? AppColors.primaryAppColor
                    : AppColors.grey.withOpacity(0.2),
              ),
            );
          }

          final stepIndex = i ~/ 2;
          final stepNum = stepIndex + 1;
          final isActive = currentStep >= stepNum;
          final isCurrent = currentStep == stepNum;

          return Column(
            children: [
              Container(
                height: 28,
                width: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive
                      ? AppColors.primaryAppColor
                      : AppColors.grey.withOpacity(0.15),
                  border: isCurrent
                      ? Border.all(
                          color: AppColors.primaryAppColor.withOpacity(0.35),
                          width: 3,
                        )
                      : null,
                ),
                child: Text(
                  '$stepNum',
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo700,
                    fontSize: 12,
                    color: isActive
                        ? AppColors.whiteColor
                        : AppColors.email,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              SizedBox(
                width: 72,
                child: Text(
                  steps[stepIndex],
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  style: TextStyle(
                    fontFamily: AppFontFamily.heeBo600,
                    fontSize: 10,
                    height: 1.2,
                    color: isActive
                        ? AppColors.primaryTextColor
                        : AppColors.email,
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}
