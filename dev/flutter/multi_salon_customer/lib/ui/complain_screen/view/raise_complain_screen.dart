import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/ui/complain_screen/controller/raise_complain_controller.dart';
import 'package:salon_2/ui/complain_screen/widget/raise_complain_widget.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';

class RaiseComplainScreen extends StatelessWidget {
  const RaiseComplainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<RaiseComplainController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return ProgressDialog(
          inAsyncCall: logic.isLoading.value,
          child: Scaffold(
            backgroundColor: AppColors.whiteColor,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: const RaiseComplainTopView(),
            ),
            bottomNavigationBar: const RaiseComplainBottomView(),
            body: SingleChildScrollView(
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RaiseComplainContactView(),
                  RaiseComplainOrSuggestionView(),
                  RaiseComplainAddImageView(),
                ],
              ).paddingOnly(left: 15, right: 15),
            ),
          ),
        );
      },
    );
  }
}
