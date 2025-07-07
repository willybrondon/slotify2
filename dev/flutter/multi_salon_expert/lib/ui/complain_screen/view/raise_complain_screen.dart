import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/custom/text_field/text_form_field_custom.dart';
import 'package:salon_2/ui/complain_screen/controller/raise_complain_controller.dart';
import 'package:salon_2/utils/app_button.dart';
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
            buttonColor: AppColors.primaryAppColor,
            buttonText: "txtSubmit".tr,
            onTap: () async {
              FocusScopeNode currentFocus = FocusScope.of(context);
              currentFocus.focusedChild?.unfocus();

              await logic.onRaiseComplainApiCall(
                bookingId: logic.bookingIdController.text,
                details: logic.raiseComplainController.text,
                expertId: Constant.storage.read<String>("expertId"),
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
            child: SizedBox(
              height: Get.height,
              width: Get.width,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "txtComplainOrSuggestion".tr,
                      style: TextStyle(
                          color: AppColors.primaryTextColor, fontFamily: FontFamily.sfProDisplay, fontSize: 18),
                    ).paddingOnly(left: 12, top: 15),
                    GetBuilder<RaiseComplainController>(
                      builder: (logic) {
                        return TextFormFieldCustom(
                          method: SizedBox(
                            height: 230,
                            child: TextFieldCustom(
                              hintText: "txtTypeSomething".tr,
                              obscureText: false,
                              maxLines: 10,
                              controller: logic.raiseComplainController,
                            ),
                          ),
                          title: '',
                        ).paddingOnly(left: 12, right: 12,top: 10);
                      },
                    ),
                    Text(
                      "txtBookingId".tr,
                      style: TextStyle(
                          color: AppColors.primaryTextColor, fontFamily: FontFamily.sfProDisplay, fontSize: 18),
                    ).paddingOnly(left: 12, top: 15),
                    GetBuilder<RaiseComplainController>(
                      builder: (logic) {
                        return TextFormFieldCustom(
                          method: TextFieldCustom(
                            hintText: "txtEnterBookingId".tr,
                            obscureText: false,
                            inputFormatters: [LengthLimitingTextInputFormatter(10)],
                            textInputType: TextInputType.number,
                            controller: logic.bookingIdController,
                          ),
                          title: '',
                        ).paddingOnly(left: 12, right: 12,top: 10);
                      },
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
