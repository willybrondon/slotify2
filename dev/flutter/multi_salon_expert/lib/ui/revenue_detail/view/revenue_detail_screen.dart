import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/text_field/custom_text_field.dart';
import 'package:salon_2/custom/text_field/custom_title.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';
import 'package:salon_2/ui/revenue_detail/controller/revenue_detail_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_button.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class RevenueDetailScreen extends StatelessWidget {
  const RevenueDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtMyWallet".tr,
          method: InkWell(
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back,
              color: AppColors.whiteColor,
            ),
          ),
        ),
      ),
      bottomNavigationBar: const WithdrawBottomView(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              height: 100,
              width: Get.width,
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                image: const DecorationImage(
                  image: AssetImage(AppAsset.imWalletBox),
                  fit: BoxFit.cover,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "txtMyBalance".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo500,
                      fontSize: 16,
                      color: AppColors.whiteColor,
                    ),
                  ),
                  Text(
                    "$currency $earning",
                    style: TextStyle(
                      fontFamily: AppFontFamily.heeBo800,
                      fontSize: 28,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ],
              ),
            ).paddingAll(13),
            const WithdrawAddAmountView(),
          ],
        ),
      ),
    );
  }
}

class WithdrawAddAmountView extends StatelessWidget {
  const WithdrawAddAmountView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GetBuilder<RevenueDetailController>(
          builder: (logic) {
            return Form(
              key: logic.formKey,
              child: CustomTitle(
                title: "txtEnterAmount".tr,
                method: CustomTextField(
                  controller: logic.amountController,
                  filled: true,
                  fillColor: AppColors.greyColor.withOpacity(0.07),
                  cursorColor: AppColors.primaryAppColor,
                  fontColor: AppColors.primaryAppColor,
                  fontSize: 15,
                  textInputAction: TextInputAction.done,
                  textInputType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "desPleaseEnterAmount".tr;
                    }
                    return null;
                  },
                ).paddingOnly(bottom: 20),
              ),
            );
          },
        ),
        const WithdrawMethodView(),
        const AddBankDetailInfoView(),
      ],
    ).paddingAll(15);
  }
}

class WithdrawMethodView extends StatelessWidget {
  const WithdrawMethodView({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          isScrollControlled: true,
          context: context,
          isDismissible: false,
          backgroundColor: AppColors.transparent,
          builder: (BuildContext context) {
            return const SelectWithdrawMethodBottomSheetView();
          },
        );
      },
      child: Container(
        height: 65,
        width: Get.width,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.greyColor.withOpacity(0.1),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(14),
            topRight: Radius.circular(14),
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
                    color: AppColors.primaryAppColor,
                    fontFamily: AppFontFamily.heeBo700,
                  ),
                ).paddingOnly(left: 10);
              },
            ),
            const Spacer(),
            SizedBox(
              height: Get.height * 0.06,
              width: Get.width * 0.06,
              child: Image.asset(
                AppAsset.icArrowDown,
                color: AppColors.primaryAppColor,
              ),
            ),
          ],
        ),
      ),
    );
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
        border: Border.all(
          color: AppColors.greyColor.withOpacity(0.1),
          width: 1,
        ),
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
                  color: AppColors.appText,
                  fontFamily: AppFontFamily.heeBo700,
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
                                color: AppColors.greyColor.withOpacity(0.1),
                                width: 1,
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
                                    color: AppColors.primaryAppColor,
                                    fontFamily: AppFontFamily.heeBo700,
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

class AddBankDetailInfoView extends StatelessWidget {
  const AddBankDetailInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    RevenueDetailController withdrawScreenController = Get.find<RevenueDetailController>();

    return GetBuilder<PaymentMethodController>(
      id: Constant.idChangePaymentMethod,
      builder: (controller) {
        if (controller.selectedPaymentMethod != null) {
          withdrawScreenController.paymentMethods = controller.getPaymentDetailsModel?.data?.paymentMethods ?? [];
          if (withdrawScreenController.paymentMethods != null && withdrawScreenController.paymentMethods?.isNotEmpty == true) {
            withdrawScreenController.paymentDetails =
                withdrawScreenController.paymentMethods?[controller.selectedPaymentMethod ?? 0].paymentDetails;
          }
          withdrawScreenController.formattedPaymentDetails = [];

          for (var detail in (withdrawScreenController.paymentDetails ?? [])) {
            withdrawScreenController.formattedPaymentDetails?.add(detail);
          }

          log("formattedPaymentDetails :: ${withdrawScreenController.formattedPaymentDetails}");
        }

        return controller.selectedPaymentMethod == null
            ? const Offstage()
            : withdrawScreenController.paymentMethods != null && withdrawScreenController.paymentMethods?.isNotEmpty == true
                ? Column(
                    children: [
                      for (var detail in withdrawScreenController.formattedPaymentDetails ?? [])
                        Container(
                          width: Get.width,
                          padding: const EdgeInsets.symmetric(vertical: 17, horizontal: 10),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: AppColors.greyColor.withOpacity(0.08),
                              width: 1,
                            ),
                            color: AppColors.whiteColor,
                          ),
                          child: RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: "${detail.split(': ')[0]}: ",
                                  style: TextStyle(
                                    fontSize: 17,
                                    color: AppColors.appText,
                                    fontFamily: AppFontFamily.heeBo600,
                                  ),
                                ),
                                TextSpan(
                                  text: detail.split(': ')[1],
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: AppColors.greyColor.withOpacity(0.5),
                                    fontFamily: AppFontFamily.heeBo600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  )
                : Text(
                    "desDataNoAdd".tr,
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.grey,
                      fontFamily: AppFontFamily.heeBo600,
                    ),
                  ).paddingOnly(top: Get.height * 0.1);
      },
    );
  }
}

/// =================== Bottom View =================== ///
class WithdrawBottomView extends StatelessWidget {
  const WithdrawBottomView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<RevenueDetailController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Row(
          children: [
            Expanded(
              child: AppButton(
                height: Get.height * 0.065,
                buttonColor: AppColors.redText,
                buttonText: "txtHistory".tr,
                textColor: AppColors.whiteColor,
                fontSize: 16,
                fontFamily: AppFontFamily.heeBo600,
                onTap: () {
                  Get.toNamed(AppRoutes.history);
                },
              ).paddingOnly(left: 12, bottom: 20, top: 10),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: AppButton(
                height: Get.height * 0.065,
                buttonColor: AppColors.primaryAppColor,
                buttonText: "txtWithdrawal".tr,
                textColor: AppColors.whiteColor,
                fontSize: 16,
                fontFamily: AppFontFamily.heeBo600,
                onTap: () {
                  logic.onWithdrawalClick(context);
                },
              ).paddingOnly(right: 12, bottom: 20, top: 10),
            ),
          ],
        );
      },
    );
  }
}
