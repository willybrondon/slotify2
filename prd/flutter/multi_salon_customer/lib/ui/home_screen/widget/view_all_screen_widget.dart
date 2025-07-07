// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class ViewAll extends StatefulWidget {
  final String title;
  final String subtitle;
  String? fontFamily;
  final Function() onTap;

  ViewAll({super.key, required this.title, required this.subtitle, required this.onTap, this.fontFamily});

  @override
  State<ViewAll> createState() => _ViewAllState();
}

class _ViewAllState extends State<ViewAll> {
  viewAll() {
    return GestureDetector(
      onTap: widget.onTap,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            widget.title,
            style: TextStyle(
                fontFamily: FontFamily.sfProDisplayBold, fontSize: 18, color: AppColors.primaryTextColor),
          ),
          Column(
            children: [
              Text(
                widget.subtitle,
                style: TextStyle(
                    fontFamily: widget.fontFamily,
                    fontSize: 11.5,
                    color: AppColors.grey,
                    decoration: TextDecoration.underline,
                    decorationColor: AppColors.grey),
              ),
            ],
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return viewAll();
  }
}
