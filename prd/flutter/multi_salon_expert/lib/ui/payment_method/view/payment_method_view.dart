// ignore_for_file: must_be_immutable


import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class PaymentMethodScreen extends StatelessWidget {
  PaymentMethodScreen({super.key});

  PaymentMethodController paymentMethodController = Get.put(PaymentMethodController());
  EditProfileController editProfileController = Get.find<EditProfileController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtPaymentMethod".tr,
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
      bottomNavigationBar: GetBuilder<PaymentMethodController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return InkWell(
            onTap: () async {
              if (logic.currentIndex == -1) {
                Utils.showToast(Get.context!, "desSelectPayment".tr);
              } else {
                if (logic.currentIndex == 0) {
                  if (logic.branchNameController.text.isNotEmpty &&
                      logic.acNumberController.text.isNotEmpty &&
                      logic.ifscController.text.isNotEmpty &&
                      logic.branchNameController.text.isNotEmpty) {
                    await logic.onSelectPaymentTypeApiCall(
                      expertId: Constant.storage.read<String>("expertId").toString(),
                      paymentType: logic.currentIndex.toString(),
                    );

                    Constant.storage.write('paymentType', logic.selectPaymentTypeCategory?.expert?.paymentType);

                    if (logic.selectPaymentTypeCategory?.status == true) {
                      await logic.onUpdateUserApiCall(
                          bankName: logic.bankNameController.text,
                          accountNumber: logic.acNumberController.text,
                          ifscCode: logic.ifscController.text,
                          branchName: logic.branchNameController.text,
                          upiId: logic.upiController.text);

                      if (logic.editBankDetailCategory?.status == true) {
                        Constant.storage.write('paymentType', logic.editBankDetailCategory?.expert?.paymentType);
                        Get.back();
                        Utils.showToast(Get.context!, "${logic.editBankDetailCategory?.message}");
                      } else {
                        Utils.showToast(Get.context!, "${logic.editBankDetailCategory?.message}");
                      }
                    } else {
                      Utils.showToast(Get.context!, "${logic.selectPaymentTypeCategory?.message}");
                    }
                  } else {
                    Utils.showToast(Get.context!, "desEnterBankDetail".tr);
                  }
                } else {
                  if (logic.upiController.text.isNotEmpty) {
                    await logic.onSelectPaymentTypeApiCall(
                      expertId: Constant.storage.read<String>("expertId").toString(),
                      paymentType: logic.currentIndex.toString(),
                    );

                    Constant.storage.write('paymentType', logic.selectPaymentTypeCategory?.expert?.paymentType);

                    if (logic.selectPaymentTypeCategory?.status == true) {
                      await logic.onUpdateUserApiCall(
                          bankName: logic.bankNameController.text,
                          accountNumber: logic.acNumberController.text,
                          ifscCode: logic.ifscController.text,
                          branchName: logic.branchNameController.text,
                          upiId: logic.upiController.text);

                      if (logic.editBankDetailCategory?.status == true) {
                        Constant.storage.write('paymentType', logic.editBankDetailCategory?.expert?.paymentType);
                        Get.back();
                        Utils.showToast(Get.context!, "${logic.editBankDetailCategory?.message}");
                      } else {
                        Utils.showToast(Get.context!, "${logic.selectPaymentTypeCategory?.message}");
                      }
                    } else {
                      Utils.showToast(Get.context!, "${logic.editBankDetailCategory?.message}");
                    }
                  } else {
                    Utils.showToast(Get.context!, "desEnterUPI".tr);
                  }
                }
              }
            },
            child: Container(
              height: Get.height * 0.068,
              width: Get.width * 0.6,
              decoration: BoxDecoration(color: AppColors.primaryAppColor, borderRadius: BorderRadius.circular(10)),
              child: Center(
                child: Text(
                  "txtSubmit".tr,
                  style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayMedium,
                    fontSize: 18,
                    color: AppColors.whiteColor,
                  ),
                ),
              ),
            ).paddingOnly(left: Get.width * 0.2, right: Get.width * 0.2, bottom: Get.width * 0.05),
          );
        },
      ),
      body: GetBuilder<PaymentMethodController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GetBuilder<PaymentMethodController>(
                    id: Constant.idSelectPayment,
                    builder: (logic) {
                      return Theme(
                        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          onExpansionChanged: (value) async {
                            logic.onSelectPayment(0);
                          },
                          controller: logic.expansionTileBankController,
                          initiallyExpanded: logic.currentIndex == 0,
                          title: Text(
                            "txtBank".tr,
                            style: TextStyle(
                              fontFamily: FontFamily.sfProDisplayBold,
                              fontSize: 16.5,
                              color: AppColors.primaryTextColor,
                            ),
                          ),
                          leading: Container(
                            height: 40,
                            width: 40,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.roundBg,
                            ),
                            child: Image.asset(
                              Constant.paymentList[0]["image"],
                              height: 22,
                              width: 22,
                            ),
                          ),
                          trailing: GestureDetector(
                            onTap: () {
                              logic.onSelectPayment(0);
                            },
                            child: Container(
                              height: 25,
                              width: 25,
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppColors.primaryAppColor),
                              ),
                              child: logic.currentIndex == 0
                                  ? Image.asset(
                                      AppAsset.icCheck,
                                      color: AppColors.primaryAppColor,
                                    )
                                  : const SizedBox(),
                            ),
                          ),
                          children: [
                            Container(
                              width: Get.width,
                              padding: const EdgeInsets.only(left: 10, right: 10),
                              margin: const EdgeInsets.only(top: 6, left: 12, right: 10, bottom: 15),
                              decoration: BoxDecoration(
                                  borderRadius: const BorderRadius.all(Radius.circular(8)),
                                  color: AppColors.whiteColor,
                                  boxShadow: Constant.boxShadow),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  TextFormFieldCustom(
                                    method: TextFieldCustom(
                                      hintText: "txtEnterBankName".tr,
                                      obscureText: false,
                                      controller: logic.bankNameController,
                                    ),
                                    title: "txtBankName".tr,
                                  ).paddingOnly(top: 8),
                                  TextFormFieldCustom(
                                    method: TextFieldCustom(
                                      hintText: "txtEnterACNumber".tr,
                                      obscureText: false,
                                      controller: logic.acNumberController,
                                    ),
                                    title: "txtAccountNumber".tr,
                                  ),
                                  TextFormFieldCustom(
                                    method: TextFieldCustom(
                                      hintText: "txtEnterIFSCNumber".tr,
                                      obscureText: false,
                                      controller: logic.ifscController,
                                    ),
                                    title: "txtIFSCCode".tr,
                                  ),
                                  TextFormFieldCustom(
                                    method: TextFieldCustom(
                                      hintText: "txtEnterBranchName".tr,
                                      obscureText: false,
                                      controller: logic.branchNameController,
                                    ),
                                    title: "txtBranchName".tr,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  GetBuilder<PaymentMethodController>(
                    id: Constant.idSelectPayment,
                    builder: (logic) {
                      return Theme(
                        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          initiallyExpanded: logic.currentIndex == 1,
                          controller: logic.expansionTileUpiController,
                          onExpansionChanged: (value) async {
                            logic.onSelectPayment(1);
                          },
                          leading: Container(
                            height: 40,
                            width: 40,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.roundBg,
                            ),
                            child: Image.asset(
                              Constant.paymentList[1]["image"],
                              height: 22,
                              width: 22,
                            ),
                          ),
                          trailing: GestureDetector(
                            onTap: () {
                              logic.onSelectPayment(1);
                            },
                            child: Container(
                              height: 25,
                              width: 25,
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppColors.primaryAppColor),
                              ),
                              child: logic.currentIndex == 1
                                  ? Image.asset(
                                      AppAsset.icCheck,
                                      color: AppColors.primaryAppColor,
                                    )
                                  : const SizedBox(),
                            ),
                          ),
                          title: Text(
                            "txtUPI".tr,
                            style: TextStyle(
                              fontFamily: FontFamily.sfProDisplayBold,
                              fontSize: 16.5,
                              color: AppColors.primaryTextColor,
                            ),
                          ),
                          children: [
                            Container(
                              width: Get.width,
                              padding: const EdgeInsets.only(left: 10, right: 10),
                              margin: const EdgeInsets.only(top: 12, left: 12, right: 10, bottom: 15),
                              decoration: BoxDecoration(
                                  borderRadius: const BorderRadius.all(Radius.circular(8)),
                                  color: AppColors.whiteColor,
                                  boxShadow: Constant.boxShadow),
                              child: TextFormFieldCustom(
                                method: TextFieldCustom(
                                  hintText: "txtEnterUPI".tr,
                                  obscureText: false,
                                  controller: logic.upiController,
                                  maxLines: 1,
                                ),
                                title: "txtUPINumber".tr,
                              ).paddingOnly(top: 8),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
