import 'dart:developer';

import 'package:blurrycontainer/blurrycontainer.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class LoginScreen extends StatelessWidget {
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();

  LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: GetBuilder<LoginScreenController>(
        id: Constant.idProgressView,
        builder: (logic) {
          logic.isFirstTap = true;
          return ProgressDialog(
            inAsyncCall: logic.isLoading.value,
            child: Stack(
              children: [
                SizedBox(width: Get.width, height: Get.height, child: Image.asset(AppAsset.imLogin, fit: BoxFit.cover)),
                Align(
                  alignment: Alignment.center,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: BlurryContainer(
                      height: Get.height * 0.52,
                      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 20),
                      blur: 6,
                      elevation: 0,
                      color: Colors.white12,
                      borderRadius: const BorderRadius.all(Radius.circular(20)),
                      child: Padding(
                        padding: const EdgeInsets.only(top: 10.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Center(
                              child: Text(
                                "txtLogIn".tr,
                                style: TextStyle(
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  fontSize: 30,
                                  color: AppColors.whiteColor,
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 20,
                            ),
                            Text(
                              "txtEnterID".tr,
                              style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold,
                                fontSize: 16,
                                color: AppColors.whiteColor,
                              ),
                            ),
                            Container(
                              margin: const EdgeInsets.only(top: 5),
                              decoration: BoxDecoration(
                                boxShadow: Constant.boxShadow,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: TextFormField(
                                controller: loginScreenController.emailController,
                                cursorColor: AppColors.primaryAppColor,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                ),
                                keyboardType: TextInputType.emailAddress,
                                decoration: InputDecoration(
                                  contentPadding: const EdgeInsets.only(top: 12, left: 10),
                                  fillColor: AppColors.whiteColor,
                                  filled: true,
                                  hintStyle: TextStyle(
                                    color: AppColors.greyColor,
                                    fontSize: 13.8,
                                    fontFamily: FontFamily.sfProDisplayMedium,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: AppColors.primaryAppColor),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(color: Colors.white),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "txtPassword".tr,
                              style: TextStyle(
                                fontFamily: FontFamily.sfProDisplayBold,
                                fontSize: 16,
                                color: AppColors.whiteColor,
                              ),
                            ),
                            Container(
                              margin: const EdgeInsets.only(top: 5),
                              decoration: BoxDecoration(
                                boxShadow: Constant.boxShadow,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: TextFormField(
                                controller: loginScreenController.pwController,
                                cursorColor: AppColors.primaryAppColor,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: FontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                ),
                                decoration: InputDecoration(
                                  contentPadding: const EdgeInsets.only(top: 12, left: 10),
                                  fillColor: AppColors.whiteColor,
                                  filled: true,
                                  hintStyle: TextStyle(
                                    color: AppColors.greyColor,
                                    fontSize: 13.8,
                                    fontFamily: FontFamily.sfProDisplayMedium,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: AppColors.primaryAppColor),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: AppColors.bgColor),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            GetBuilder<LoginScreenController>(
                              builder: (logic) {
                                return GestureDetector(
                                  onTap: () {
                                    logic.isCheck = !logic.isCheck;
                                    logic.update();
                                  },
                                  child: Container(
                                    color: Colors.transparent,
                                    child: Row(
                                      children: [
                                        Container(
                                                height: 25,
                                                width: 25,
                                                padding: const EdgeInsets.all(7),
                                                decoration: BoxDecoration(
                                                    borderRadius: BorderRadius.circular(6),
                                                    border: Border.all(color: AppColors.whiteColor),
                                                    color: AppColors.primaryAppColor.withOpacity(0.1)),
                                                child: logic.isCheck
                                                    ? Image.asset(
                                                        AppAsset.icCheck,
                                                        color: AppColors.whiteColor,
                                                      )
                                                    : const SizedBox())
                                            .paddingOnly(right: 10),
                                        SizedBox(
                                          width: Get.width * 0.6,
                                          child: FittedBox(
                                            child: RichText(
                                              text: TextSpan(
                                                text: 'desTerms'.tr,
                                                style: TextStyle(
                                                  color: AppColors.whiteColor,
                                                  fontFamily: FontFamily.sfProDisplay,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 13,
                                                ),
                                                children: <TextSpan>[
                                                  TextSpan(
                                                    text: 'desPolicy'.tr,
                                                    style: TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      color: AppColors.whiteColor,
                                                      decoration: TextDecoration.underline,
                                                      fontFamily: FontFamily.sfProDisplay,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        )
                                      ],
                                    ).paddingOnly(left: 15, top: 12, bottom: 10),
                                  ),
                                );
                              },
                            ),
                            /*GestureDetector(
                              onTap: () async {
                                FocusScopeNode currentFocus = FocusScope.of(context);
                                currentFocus.focusedChild?.unfocus();

                                logic.onContinueClick();
                              },
                              child: Center(
                                child: Container(
                                  margin: const EdgeInsets.only(top: 20),
                                  height: 50,
                                  width: Get.width * 0.7,
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryAppColor,
                                    borderRadius: BorderRadius.circular(50),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "txtLogIn".tr,
                                      style: TextStyle(
                                        fontFamily: FontFamily.sfProDisplay,
                                        fontSize: 18,
                                        color: AppColors.whiteColor,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),*/
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () async {
                                      FocusScopeNode currentFocus = FocusScope.of(context);
                                      currentFocus.focusedChild?.unfocus();

                                      await logic.onLoginApiCall(
                                        email: "test@expert.com",
                                        password: "123456",
                                        fcmToken: fcmToken!,
                                      );

                                      if (logic.loginCategory?.status == true) {
                                        logic.isLogin = true;
                                        Constant.storage.write('isLogIn', logic.isLogin);
                                        Constant.storage.write('expertId', logic.loginCategory?.expert?.id);
                                        Constant.storage.write('emailId', logic.emailController.text);
                                        Constant.storage.write('password', logic.pwController.text);

                                        log("Is login check :: ${Constant.storage.read("isLogIn")}");
                                        log("Expert Id :: ${Constant.storage.read("expertId")}");
                                        log("Email Id :: ${Constant.storage.read("emailId")}");
                                        log("Password :: ${Constant.storage.read("password")}");

                                        await logic.onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());

                                        if (logic.getExpertCategory?.status == true) {
                                          Constant.storage.write('fName', logic.loginCategory?.expert?.fname.toString());
                                          Constant.storage.write('lName', logic.loginCategory?.expert?.lname.toString());
                                          Constant.storage.write('uniqueID', logic.loginCategory?.expert?.uniqueId.toString());
                                          Constant.storage.write('hostImage', logic.loginCategory?.expert?.image);
                                          Constant.storage.write('paymentType', logic.loginCategory?.expert?.paymentType);
                                          Constant.storage.write("salonId", logic.getExpertCategory?.data?.salonId?.id);

                                          Constant.storage.write("bankName", logic.getExpertCategory?.data?.bankDetails?.bankName.toString());
                                          Constant.storage
                                              .write("accountNumber", logic.getExpertCategory?.data?.bankDetails?.accountNumber.toString());
                                          Constant.storage.write("IFSCCode", logic.getExpertCategory?.data?.bankDetails?.ifscCode.toString());
                                          Constant.storage
                                              .write("branchName", logic.getExpertCategory?.data?.bankDetails?.branchName.toString());
                                          Constant.storage.write("upiId", logic.getExpertCategory?.data?.upiId.toString());

                                          log("First Name :: ${Constant.storage.read("fName")}");
                                          log("Last Name :: ${Constant.storage.read("lName")}");
                                          log("Payment Type :: ${Constant.storage.read("paymentType")}");
                                          log("Host Image :: ${Constant.storage.read("hostImage")}");
                                          log("Bank Name :: ${Constant.storage.read<String>("bankName")}");
                                          log("Account Number :: ${Constant.storage.read<String>("accountNumber")}");
                                          log("IFSC Code :: ${Constant.storage.read<String>("IFSCCode")}");
                                          log("Branch Name :: ${Constant.storage.read<String>("branchName")}");
                                          log("UPI Id :: ${Constant.storage.read<String>("upiId")}");

                                          Get.offAndToNamed(AppRoutes.bottom);
                                        } else {
                                          Utils.showToast(Get.context!, "${logic.getExpertCategory?.message}");
                                        }
                                      } else {
                                        Utils.showToast(Get.context!, "${logic.loginCategory?.message}");
                                      }

                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(top: 20),
                                      height: 50,
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryAppColor,
                                        borderRadius: BorderRadius.circular(50),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "Demo Login",
                                          style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplay,
                                            fontSize: 18,
                                            color: AppColors.whiteColor,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () async {
                                      FocusScopeNode currentFocus = FocusScope.of(context);
                                      currentFocus.focusedChild?.unfocus();

                                      logic.onContinueClick();
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(top: 20),
                                      height: 50,
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryAppColor,
                                        borderRadius: BorderRadius.circular(50),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "txtLogIn".tr,
                                          style: TextStyle(
                                            fontFamily: FontFamily.sfProDisplay,
                                            fontSize: 18,
                                            color: AppColors.whiteColor,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
