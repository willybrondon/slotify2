import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/select_address_screen/controller/select_address_controller.dart';
import 'package:salon_2/ui/select_address_screen/widget/select_address_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class SelectAddressScreen extends StatelessWidget {
  const SelectAddressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<SelectAddressController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading.value,
          child: Scaffold(
            backgroundColor: AppColors.whiteColor,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const SelectAddressAppBarView(),
            ),
            bottomNavigationBar: const SelectAddressBottomView(),
            body: const SelectAddressItemView(),
          ),
        );
      },
    );
  }
}
