import 'dart:developer';

import 'package:blurrycontainer/blurrycontainer.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/utils.dart';

class LoginScreen extends StatelessWidget {
  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();

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
                // Background Image
                SizedBox(
                  width: Get.width,
                  height: Get.height,
                  child: Image.asset(AppAsset.imLogin, fit: BoxFit.cover),
                ),
                // Login Container
                SafeArea(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: BlurryContainer(
                        width: Get.width * 0.9,
                        padding: const EdgeInsets.all(24.0),
                        blur: 6,
                        elevation: 0,
                        color: Colors.white12,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(20)),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Title - Always visible at top
                            Center(
                              child: Text(
                                "txtLogIn".tr,
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplayBold,
                                  fontSize: 28,
                                  color: AppColors.whiteColor,
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),

                            // ID Field
                            Text(
                              "txtEnterID".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 16,
                                color: AppColors.whiteColor,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                boxShadow: Constant.boxShadow,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: TextFormField(
                                controller:
                                    loginScreenController.emailController,
                                cursorColor: AppColors.primaryAppColor,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: AppFontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                ),
                                keyboardType: TextInputType.emailAddress,
                                decoration: InputDecoration(
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 16),
                                  fillColor: AppColors.whiteColor,
                                  filled: true,
                                  hintStyle: TextStyle(
                                    color: AppColors.greyColor,
                                    fontSize: 14,
                                    fontFamily: AppFontFamily.sfProDisplay,
                                  ),
                                  hintText: "txtEnterID".tr,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: BorderSide.none,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: BorderSide(
                                        color: AppColors.primaryAppColor,
                                        width: 2),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Password Field
                            Text(
                              "txtEnterPassword".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 16,
                                color: AppColors.whiteColor,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                boxShadow: Constant.boxShadow,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: TextFormField(
                                controller: loginScreenController.pwController,
                                cursorColor: AppColors.primaryAppColor,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: AppFontFamily.sfProDisplayBold,
                                  color: AppColors.primaryTextColor,
                                ),
                                decoration: InputDecoration(
                                  contentPadding:
                                      const EdgeInsets.only(top: 12, left: 10),
                                  fillColor: AppColors.whiteColor,
                                  filled: true,
                                  hintStyle: TextStyle(
                                    color: AppColors.greyColor,
                                    fontSize: 13.8,
                                    fontFamily:
                                        AppFontFamily.sfProDisplayMedium,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                        color: AppColors.primaryAppColor),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide:
                                        BorderSide(color: AppColors.bgColor),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 32),

                            // Buttons - Always visible at bottom
                            Row(
                              children: [
                                // Demo Login Button
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () async {
                                      FocusScopeNode currentFocus =
                                          FocusScope.of(context);
                                      currentFocus.focusedChild?.unfocus();

                                      await logic.onLoginApiCall(
                                        email: "john.doe@gmail.com",
                                        password: "john123",
                                        fcmToken: fcmToken ?? "",
                                      );

                                      if (logic.loginCategory?.status == true) {
                                        logic.isLogin = true;
                                        Constant.storage
                                            .write('isLogIn', logic.isLogin);
                                        Constant.storage.write('expertId',
                                            logic.loginCategory?.expert?.id);
                                        Constant.storage.write('emailId',
                                            logic.emailController.text);
                                        Constant.storage.write('password',
                                            logic.pwController.text);

                                        log("Is login check :: ${Constant.storage.read("isLogIn")}");
                                        log("Expert Id :: ${Constant.storage.read("expertId")}");
                                        log("Email Id :: ${Constant.storage.read("emailId")}");
                                        log("Password :: ${Constant.storage.read("password")}");

                                        await logic.onGetExpertApiCall(
                                            expertId: Constant.storage
                                                .read<String>("expertId")
                                                .toString());

                                        if (logic.getExpertCategory?.status ==
                                            true) {
                                          earning = loginScreenController
                                              .getExpertCategory?.data?.earning
                                              ?.toStringAsFixed(2);
                                          Constant.storage
                                              .write('isDemoLogin', true);
                                          Constant.storage.write(
                                              'fName',
                                              logic.loginCategory?.expert?.fname
                                                  .toString());
                                          Constant.storage.write(
                                              'lName',
                                              logic.loginCategory?.expert?.lname
                                                  .toString());
                                          Constant.storage.write(
                                              'uniqueID',
                                              logic.loginCategory?.expert
                                                  ?.uniqueId
                                                  .toString());
                                          Constant.storage.write(
                                              'hostImage',
                                              logic.loginCategory?.expert
                                                  ?.image);
                                          Constant.storage.write(
                                              'paymentType',
                                              logic.loginCategory?.expert
                                                  ?.paymentType);
                                          Constant.storage.write(
                                              "salonId",
                                              logic.getExpertCategory?.data
                                                  ?.salonId?.id);

                                          log("First Name :: ${Constant.storage.read("fName")}");
                                          log("Last Name :: ${Constant.storage.read("lName")}");
                                          log("Payment Type :: ${Constant.storage.read("paymentType")}");
                                          log("Host Image :: ${Constant.storage.read("hostImage")}");

                                          Get.offAndToNamed(AppRoutes.bottom);
                                        } else {
                                          Utils.showToast(Get.context!,
                                              "${logic.getExpertCategory?.message}");
                                        }
                                      } else {
                                        Utils.showToast(Get.context!,
                                            "${logic.loginCategory?.message}");
                                      }
                                    },
                                    child: Container(
                                      height: 50,
                                      margin: const EdgeInsets.only(right: 8),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryAppColor,
                                        borderRadius: BorderRadius.circular(25),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "Demo Login",
                                          style: TextStyle(
                                            fontFamily:
                                                AppFontFamily.sfProDisplay,
                                            fontSize: 16,
                                            color: AppColors.whiteColor,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                // Login Button
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () async {
                                      FocusScopeNode currentFocus =
                                          FocusScope.of(context);
                                      currentFocus.focusedChild?.unfocus();

                                      logic.onContinueClick();
                                    },
                                    child: Container(
                                      height: 50,
                                      margin: const EdgeInsets.only(left: 8),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryAppColor,
                                        borderRadius: BorderRadius.circular(25),
                                      ),
                                      child: Center(
                                        child: Text(
                                          "txtLogIn".tr,
                                          style: TextStyle(
                                            fontFamily:
                                                AppFontFamily.sfProDisplay,
                                            fontSize: 16,
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
