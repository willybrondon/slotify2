import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/text_field/custom_text_field.dart';
import 'package:salon_2/custom/text_field/custom_title.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

/// =================== App Bar =================== ///
class WithdrawMethodAppBarView extends StatelessWidget {
  const WithdrawMethodAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtWithdrawMethod".tr,
      method: InkWell(
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

class SelectWithdrawMethod extends StatelessWidget {
  const SelectWithdrawMethod({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 65,
      width: Get.width,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.border.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          GetBuilder<PaymentMethodController>(
            id: Constant.idChangePaymentMethod,
            builder: (logic) {
              return Text(
                logic.paymentMethodName ?? "",
                style: TextStyle(
                  fontSize: 15,
                  fontFamily: AppFontFamily.heeBo700,
                  color: AppColors.primaryAppColor,
                ),
              ).paddingOnly(left: 10);
            },
          ),
          const Spacer(),
          SizedBox(
            height: Get.height * 0.06,
            width: Get.width * 0.06,
            child: Image.asset(AppAsset.icArrowDown),
          ),
        ],
      ),
    ).paddingOnly(left: 12, right: 12, top: 12);
  }
}

class SelectWithdrawMethodBottomSheetView extends StatelessWidget {
  const SelectWithdrawMethodBottomSheetView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: Get.height * 0.60,
      width: Get.width,
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(35),
          topRight: Radius.circular(35),
        ),
        color: AppColors.whiteColor,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Text(
                "txtSelectMethod".tr,
                style: TextStyle(
                  fontSize: 18,
                  fontFamily: AppFontFamily.heeBo700,
                  color: AppColors.appText,
                ),
              ).paddingOnly(left: 20),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Get.back();
                },
                child: Image.asset(
                  AppAsset.icClose,
                  height: Get.height * 0.07,
                  width: Get.width * 0.07,
                ).paddingOnly(right: 15),
              )
            ],
          ),
          Container(
            width: Get.width,
            decoration: BoxDecoration(
              border: Border.all(
                color: AppColors.greyColor.withOpacity(0.1),
                width: 1,
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              child: GetBuilder<PaymentMethodController>(
                id: Constant.idGetWithdrawMethods,
                builder: (logic) {
                  return Column(
                    children: [
                      const SizedBox(height: 15),
                      for (int index = 0; index < logic.withdrawMethods.length; index++)
                        GestureDetector(
                          onTap: () {
                            logic.onChangePaymentMethod(
                              index: index,
                              name: logic.withdrawMethods[index].name ?? "",
                            );
                            Get.back();
                          },
                          child: Container(
                            height: 75,
                            width: Get.width,
                            padding: const EdgeInsets.symmetric(horizontal: 15),
                            margin: const EdgeInsets.only(bottom: 15),
                            decoration: BoxDecoration(
                              color: AppColors.whiteColor,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: AppColors.border.withOpacity(0.2),
                              ),
                            ),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 40,
                                  child: Center(
                                    child: CachedNetworkImage(
                                      imageUrl: logic.getWithdrawMethodModel?.data?[index].image ?? "",
                                      placeholder: (context, url) {
                                        return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                                      },
                                      errorWidget: (context, url, error) {
                                        return Image.asset(AppAsset.icPlaceholder).paddingAll(10);
                                      },
                                    ),
                                  ),
                                ),
                                Text(
                                  logic.withdrawMethods[index].name ?? "",
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontFamily: AppFontFamily.heeBo700,
                                    color: AppColors.primaryAppColor,
                                  ),
                                ).paddingOnly(left: 10),
                                const Spacer(),
                                Container(
                                  height: Get.height * 0.06,
                                  width: Get.width * 0.06,
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: logic.selectedPaymentMethod == index ? AppColors.service : AppColors.border,
                                      width: 1.3,
                                    ),
                                    shape: BoxShape.circle,
                                  ),
                                  padding: const EdgeInsets.all(1.5),
                                  child: logic.selectedPaymentMethod == index
                                      ? Container(
                                          height: Get.height * 0.05,
                                          width: Get.width * 0.05,
                                          decoration: BoxDecoration(
                                            color: AppColors.primaryAppColor,
                                            shape: BoxShape.circle,
                                          ),
                                        )
                                      : const SizedBox.shrink(),
                                ),
                              ],
                            ),
                          ).paddingOnly(left: 12, right: 12),
                        ),
                    ],
                  );
                },
              ),
            ),
          )
        ],
      ),
    );
  }
}

/// =================== Add Details =================== ///
class AddBankDetailInfoView extends StatelessWidget {
  const AddBankDetailInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentMethodController>(
      id: Constant.idGetWithdrawMethods,
      builder: (logic) {
        return SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 15),
              GetBuilder<PaymentMethodController>(
                id: Constant.idChangePaymentMethod,
                builder: (controller) {
                  return controller.selectedPaymentMethod == null
                      ? const Offstage()
                      : Column(
                          children: [
                            for (int i = 0;
                                i < controller.withdrawMethods[controller.selectedPaymentMethod ?? 0].details!.length;
                                i++)
                              WithdrawDetailsItemView(
                                title: controller.withdrawMethods[controller.selectedPaymentMethod ?? 0].details?[i] ?? "",
                                controller: controller.withdrawPaymentDetails[i],
                              ),
                          ],
                        );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

/// =================== Bottom View =================== ///
class AddBankDetailBottomView extends StatelessWidget {
  const AddBankDetailBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: Get.height * 0.1,
      width: Get.width,
      decoration: BoxDecoration(
        color: AppColors.whiteColor,
      ),
      child: GetBuilder<PaymentMethodController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return AppButton(
            height: Get.height * 0.065,
            width: Get.width,
            buttonColor: AppColors.primaryAppColor,
            buttonText: "txtUploadDetails".tr,
            textColor: AppColors.whiteColor,
            fontSize: 16,
            fontFamily: AppFontFamily.heeBo600,
            onTap: () {
              logic.onWithdraw();
            },
          ).paddingOnly(left: 12, right: 12, bottom: 20, top: 10);
        },
      ),
    );
  }
}

class WithdrawDetailsItemView extends StatelessWidget {
  const WithdrawDetailsItemView({
    super.key,
    required this.title,
    required this.controller,
  });

  final String title;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return CustomTitle(
      title: title,
      method: CustomTextField(
        controller: controller,
        filled: true,
        fillColor: AppColors.greyColor.withOpacity(0.07),
        cursorColor: AppColors.primaryAppColor,
        fontColor: AppColors.primaryAppColor,
        fontSize: 15,
        maxLines: 6,
        textInputAction: TextInputAction.newline,
        hintText: "Enter your ${title.toLowerCase()}...",
        hintTextSize: 12.5,
        hintTextColor: AppColors.inactivateDate,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return "Please enter ${title.toLowerCase()}...";
          }
          return null;
        },
      ).paddingOnly(bottom: 10),
    ).paddingOnly(left: 12, right: 12);
  }
}
