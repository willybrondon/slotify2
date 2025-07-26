import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/wishlist_screen/controller/wishlist_controller.dart';
import 'package:salon_2/ui/wishlist_screen/widget/wishlist_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WishlistController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading.value,
          child: Scaffold(
            backgroundColor: AppColors.whiteColor,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const WishlistAppBarView(),
            ),
            body: const WishlistTabView(),
          ),
        );
      },
    );
  }
}
