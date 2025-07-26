import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/payment_method/controller/payment_method_controller.dart';
import 'package:salon_2/ui/payment_method/widget/payment_method_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class PaymentMethodScreen extends StatelessWidget {
  const PaymentMethodScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PaymentMethodController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading,
          child: Scaffold(
            backgroundColor: AppColors.backGround,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const WithdrawMethodAppBarView(),
            ),
            bottomNavigationBar: const AddBankDetailBottomView(),
            body: SingleChildScrollView(
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () {
                      showModalBottomSheet(
                        isScrollControlled: true,
                        context: context,
                        isDismissible: false,
                        backgroundColor: AppColors.transparent,
                        builder: (BuildContext context) {
                          return const SelectWithdrawMethodBottomSheetView();
                        },
                      );
                    },
                    child: const SelectWithdrawMethod(),
                  ),
                  const AddBankDetailInfoView(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
