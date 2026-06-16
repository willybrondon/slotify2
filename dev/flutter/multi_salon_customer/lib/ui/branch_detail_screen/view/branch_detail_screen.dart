import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/branch_detail_screen/widget/branch_detail_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class BranchDetailScreen extends StatelessWidget {
  const BranchDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backGround,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(Get.height * 0.3),
        child: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
          toolbarHeight: Get.height * 0.3,
          flexibleSpace: const BranchDetailTopView(),
        ),
      ),
      body: const BranchDetailInfoView(),
    );
  }
}
