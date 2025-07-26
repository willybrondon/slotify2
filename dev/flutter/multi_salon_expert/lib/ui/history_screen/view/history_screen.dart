import 'package:flutter/material.dart';
import 'package:salon_2/ui/history_screen/widget/history_screen_widget.dart';
import 'package:salon_2/utils/app_colors.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        flexibleSpace: const HistoryAppBarView(),
      ),
      body: const Column(
        children: [
          HistoryTitleView(),
          Expanded(child: HistoryListView()),
        ],
      ),
    );
  }
}
