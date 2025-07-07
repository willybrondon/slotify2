// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class AppBarCustom extends StatefulWidget {
  final String title;
  Widget? method;
  List<Widget>? method1;
  AppBarCustom({super.key, required this.title, this.method, this.method1});

  @override
  State<AppBarCustom> createState() => _AppBarCustomState();
}

class _AppBarCustomState extends State<AppBarCustom> {
  customAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(55),
      child: AppBar(
        elevation: 0,
        backgroundColor: AppColors.primaryAppColor,
        centerTitle: true,
        leading: widget.method,
        actions: widget.method1,
        title: Text(
          widget.title,
          style:
              TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 20, color: AppColors.whiteColor),
        ).paddingOnly(top: 7),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return customAppBar();
  }
}
