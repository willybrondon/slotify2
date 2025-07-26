import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/add_new_address_screen/controller/add_new_address_controller.dart';
import 'package:salon_2/ui/add_new_address_screen/widget/add_new_address_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class AddNewAddressScreen extends StatelessWidget {
  const AddNewAddressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AddNewAddressController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading.value,
          child: Scaffold(
            backgroundColor: AppColors.whiteColor,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const AddNewAddressAppBarView(),
            ),
            bottomNavigationBar: const AddNewAddressBottomView(),
            body: SingleChildScrollView(
              child: const Column(
                children: [
                  AddNewAddressTitleView(),
                  AddNewAddressDataView(),
                  AddNewAddressSetPrimaryView(),
                ],
              ).paddingAll(15),
            ),
          ),
        );
      },
    );
  }
}
