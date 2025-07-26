import 'dart:math';
import 'package:flutter/material.dart';
import 'package:salon_2/utils/app_colors.dart';

class RandomColorGenerator {
  static Color getRandomColor() {
    final random = Random();
    int index = random.nextInt(AppColors.colorList.length);
    return AppColors.colorList[index];
  }
}
