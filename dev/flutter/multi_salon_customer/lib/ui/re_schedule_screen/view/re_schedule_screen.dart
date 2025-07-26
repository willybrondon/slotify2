import 'package:flutter/material.dart';
import 'package:salon_2/ui/re_schedule_screen/widget/re_schedule_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class ReScheduleScreen extends StatelessWidget {
  const ReScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const ReScheduleAppBarView(),
      ),
      body: const ReScheduleSelectDateView(),
    );
  }
}
