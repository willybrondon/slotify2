import 'package:flutter/material.dart';
import 'package:salon_2/ui/branch_detail_screen/widget/branch_detail_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class BranchDetailScreen extends StatelessWidget {
  const BranchDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(230),
        child: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: const BranchDetailTopView(),
        ),
      ),
      body: const BranchDetailInfoView(),
    );
  }
}
