// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/widget/booking_detail_screen.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/controller/sign_in_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class Booking extends StatelessWidget {
  Booking({super.key});

  LoginScreenController loginScreenController = Get.put(LoginScreenController());

  BookingDetailScreenController bookingDetailScreenController = Get.put(BookingDetailScreenController());

  @override
  Widget build(BuildContext context) {
    Get.put(SignInController()).getDataFromArgs();
    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.find<BottomBarController>().onClick(0);
        bookingDetailScreenController.bookingDetailScreenEditingController.clear();
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        body: GetBuilder<LoginScreenController>(
          id: Constant.idBookingAndLogin,
          builder: (logic) {
            logic.isUpdate = Constant.storage.read<bool>('isUpdate') ?? false;
            logic.isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;

            log("is LogIn :: ${Constant.storage.read<bool>('isLogIn')}");
            log("is Update :: ${Constant.storage.read<bool>('isUpdate')}");
            log("is LogIn Variable :: ${logic.isLogIn}");
            log("is Update Variable :: ${logic.isUpdate}");
            return logic.isLogIn == true && logic.isUpdate == false
                ? Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          "txtPleaseMakeYour".tr,
                          style:
                              TextStyle(fontFamily: AppFontFamily.sfProDisplayMedium, color: AppColors.blackColor, fontSize: 16),
                        ),
                        GestureDetector(
                          onTap: () {
                            Get.toNamed(AppRoutes.editProfile);
                          },
                          child: Text(
                            "txtProfile!".tr,
                            style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                color: AppColors.primaryAppColor,
                                decoration: TextDecoration.underline,
                                fontSize: 17),
                          ),
                        )
                      ],
                    ),
                  )
                : logic.isLogIn != true
                    ? SignInScreen()
                    : BookingDetailScreen();
          },
        ),
      ),
    );
  }
}
