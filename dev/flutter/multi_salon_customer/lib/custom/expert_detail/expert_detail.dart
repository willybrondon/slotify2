import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/font_family.dart';

class ExpertDetails extends StatefulWidget {
  final String leadingIcon;
  final String title;
  const ExpertDetails({super.key, required this.leadingIcon, required this.title});

  @override
  State<ExpertDetails> createState() => _ExpertDetailsState();
}

class _ExpertDetailsState extends State<ExpertDetails> {
  expertDetails() {
    return Column(
      children: [
        Row(
          children: [
            Container(
              height: 40,
              width: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.roundBg),
              child: Image.asset(widget.leadingIcon, height: 20, width: 20),
            ),
            SizedBox(width: Get.width * 0.04),
            SizedBox(
              width: Get.width * 0.65,
              child: Text(
                widget.title,
                style: TextStyle(
                    overflow: TextOverflow.ellipsis,
                    fontFamily: FontFamily.sfProDisplay,
                    fontSize: 15,
                    color: AppColors.primaryTextColor),
              ),
            )
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return expertDetails();
  }
}
