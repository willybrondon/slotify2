import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/app_button/button.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/setting/controller/setting_controller.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/utils.dart';

class DeleteAccountDialog extends StatelessWidget {
  final SettingController settingController = Get.find<SettingController>();
  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();

  DeleteAccountDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<LoginScreenController>(
      id: Constant.idBookingAndLogin,
      builder: (logic) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: Get.height * 0.75,
          ),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.dialogBg,
            borderRadius: BorderRadius.circular(24),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Warning Icon
                Container(
                  height: 80,
                  width: 80,
                  decoration: BoxDecoration(
                    color: AppColors.cancelButton.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.warning_rounded,
                    color: AppColors.cancelButton,
                    size: 50,
                  ),
                ),
                const SizedBox(height: 20),

                // Title
                Text(
                  "txtDeleteAccount".tr,
                  style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayBold,
                    color: AppColors.primaryTextColor,
                    fontSize: 24,
                  ),
                ),
                const SizedBox(height: 12),

                // Main Warning Message
                Text(
                  "desDeleteAccountWarning".tr,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayMedium,
                    color: AppColors.cancelButton,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 20),

                // What will be deleted section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.grey.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.grey.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "txtWhatWillBeDeleted".tr,
                        style: TextStyle(
                          fontFamily: FontFamily.sfProDisplayBold,
                          color: AppColors.primaryTextColor,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildDeletedItem(
                        icon: Icons.person_outline,
                        text: "desPersonalInfo".tr,
                      ),
                      _buildDeletedItem(
                        icon: Icons.calendar_today_outlined,
                        text: "desBookingHistory".tr,
                      ),
                      _buildDeletedItem(
                        icon: Icons.account_balance_wallet_outlined,
                        text: "desWalletBalance".tr,
                      ),
                      _buildDeletedItem(
                        icon: Icons.favorite_outline,
                        text: "desFavoritesWishlist".tr,
                      ),
                      _buildDeletedItem(
                        icon: Icons.shopping_cart_outlined,
                        text: "desOrderHistory".tr,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Important Note
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.cancelButton.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.cancelButton.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: AppColors.cancelButton,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          "desCannotBeUndone".tr,
                          style: TextStyle(
                            fontFamily: FontFamily.sfProDisplayRegular,
                            color: AppColors.primaryTextColor,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Button(
                        buttonColor: AppColors.whiteColor,
                        buttonText: "txtCancel".tr,
                        textColor: AppColors.primaryAppColor,
                        fontStyle: FontFamily.sfProDisplayMedium,
                        fontSize: 16,
                        height: 50,
                        borderWidth: 1.5,
                        borderColor: AppColors.primaryAppColor,
                        onTap: () {
                          Get.back();
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Button(
                        buttonColor: AppColors.cancelButton,
                        buttonText: "txtDeletePermanently".tr,
                        textColor: AppColors.whiteColor,
                        fontStyle: FontFamily.sfProDisplayMedium,
                        fontSize: 16,
                        height: 50,
                        onTap: () async {
                          Get.back();

                          // Show loading indicator
                          Get.dialog(
                            Center(
                              child: Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: AppColors.whiteColor,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    CircularProgressIndicator(
                                      color: AppColors.primaryAppColor,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      "txtDeletingAccount".tr,
                                      style: TextStyle(
                                        fontFamily:
                                            FontFamily.sfProDisplayMedium,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            barrierDismissible: false,
                          );

                          await settingController.onDeleteUserApiCall(
                            userId: Constant.storage
                                .read<String>('UserId')
                                .toString(),
                          );

                          Get.back(); // Close loading dialog

                          if (settingController.deleteUserCategory?.status ==
                              true) {
                            loginScreenController.verification = false;
                            Constant.storage.erase();
                            logic.isLogIn = false;

                            // Show success message
                            Utils.showToast(
                                Get.context!, "desAccountDeletedSuccess".tr);

                            Get.offAllNamed(AppRoutes.initial);
                          } else {
                            Utils.showToast(
                              Get.context!,
                              settingController.deleteUserCategory?.message ??
                                  "desDeleteAccountFailed".tr,
                            );
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDeletedItem({required IconData icon, required String text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            icon,
            color: AppColors.cancelButton,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontFamily: FontFamily.sfProDisplayRegular,
                color: AppColors.primaryTextColor,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
