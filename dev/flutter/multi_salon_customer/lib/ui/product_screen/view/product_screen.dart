import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/ui/product_screen/widget/product_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';

class ProductScreen extends StatelessWidget {
  const ProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.find<BottomBarController>().onClick(0);
        if (didPop) {
          return;
        }
      },
      child: GetBuilder<LoginScreenController>(
        id: Constant.idBookingAndLogin,
        builder: (logic) {
          logic.isUpdate = Constant.storage.read<bool>('isUpdate') ?? false;
          logic.isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;

          log("is LogIn :: ${Constant.storage.read<bool>('isLogIn')}");
          log("is Update :: ${Constant.storage.read<bool>('isUpdate')}");
          log("is LogIn Variable :: ${logic.isLogIn}");
          log("is Update Variable :: ${logic.isUpdate}");
          return Scaffold(
            backgroundColor: AppColors.whiteColor,
            body: logic.isLogIn != true
                ? SignInScreen()
                : Column(
                    children: [
                      const ProductWelcomeHeader(),
                      const ProductScreenTopView(),
                      Expanded(
                        child: const ProductScreenView(),
                      ),
                    ],
                  ),
          );
        },
      ),
    );
  }
}
