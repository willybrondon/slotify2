import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/complain_screen/controller/raise_complain_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class RaiseComplainScreen extends StatelessWidget {
  const RaiseComplainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: AppBarCustom(
          title: "txtComplain".tr,
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
        ),
      ),
      bottomNavigationBar: GetBuilder<RaiseComplainController>(
        builder: (logic) {
          return AppButton(
            height: 55,
            width: Get.width,
            fontFamily: FontFamily.sfProDisplayBold,
            fontSize: 20,
            color: AppColors.whiteColor,
            buttonColor: AppColors.primaryAppColor,
            buttonText: "txtSubmit".tr,
            onTap: () async {
              await logic.onRaiseComplainApiCall(
                bookingId: logic.bookingIdController.text,
                details: logic.raiseComplainController.text,
                userId: Constant.storage.read<String>("UserId"),
                selectImageFile: '',
              );

              if (logic.raiseComplainCategory?.status == true) {
                Utils.showToast(Get.context!, logic.raiseComplainCategory?.message ?? "");
                Get.back();
              } else {
                Utils.showToast(Get.context!, logic.raiseComplainCategory?.message ?? "");
              }
            },
          ).paddingOnly(left: 12, right: 12, bottom: 15);
        },
      ),
      body: GetBuilder<RaiseComplainController>(
        id: Constant.idProgressView,
        builder: (logic) {
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: SingleChildScrollView(
              child: SizedBox(
                height: Get.height,
                width: Get.width,
                child: Padding(
                  padding: const EdgeInsets.only(left: 15, right: 15),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "txtComplainOrSuggestion".tr,
                        style: TextStyle(
                            color: AppColors.primaryTextColor, fontFamily: FontFamily.sfProDisplay, fontSize: 18),
                      ).paddingOnly(top: 15, bottom: 10),
                      GetBuilder<RaiseComplainController>(
                        builder: (logic) {
                          return TextFormFieldCustom(
                            method: TextFieldCustom(
                              hintText: "txtTypeSomething".tr,
                              obscureText: false,
                              controller: logic.raiseComplainController,
                              textInputAction: TextInputAction.done,
                              maxLine: 10,
                            ),
                            title: "",
                            borderColor: AppColors.greyColor.withOpacity(0.1),
                            borderWidth: 1,
                            hintTextColor: AppColors.subTitle,
                            hintTextSize: 14.5,
                            hintTextStyle: FontFamily.sfProDisplayRegular,
                          );
                        },
                      ),

                      Text(
                        "txtBookingId".tr,
                        style: TextStyle(
                            color: AppColors.primaryTextColor, fontFamily: FontFamily.sfProDisplay, fontSize: 18),
                      ).paddingOnly(top: 20, bottom: 7),
                      GetBuilder<RaiseComplainController>(
                        builder: (logic) {
                          return TextFormFieldCustom(
                            method: TextFieldCustom(
                              hintText: "txtEnterBookingId".tr,
                              obscureText: false,
                              controller: logic.bookingIdController,
                              inputFormatters: [LengthLimitingTextInputFormatter(10)],
                              textInputType: TextInputType.number,
                            ),
                            borderColor: AppColors.greyColor.withOpacity(0.1),
                            borderWidth: 1,
                            title: '',
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
