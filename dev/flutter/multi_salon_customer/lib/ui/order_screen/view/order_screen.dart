import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/order_screen/controller/order_screen_controller.dart';
import 'package:salon_2/ui/order_screen/widget/order_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class OrderScreen extends StatelessWidget {
  const OrderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading.value,
          child: Scaffold(
            backgroundColor: AppColors.whiteColor,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const OrderAppBarView(),
            ),
            body: RefreshIndicator(
              onRefresh: () => logic.onRefresh(),
              color: AppColors.primaryAppColor,
              child: const OrderListView(),
            ),
          ),
        );
      },
    );
  }
}
