// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:salon_2/custom/upper_case_formatter/upper_case_formatter_class.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class AddressTextField extends StatelessWidget {
  Color? labelColor;
  String? labelFontFamily;
  String? labelText;
  Color? hintColor;
  String? hintFontFamily;
  String? hintText;
  Color? textColor;
  String? textFontFamily;
  bool? filled;
  Color? fillColor;
  int? maxLines;
  TextInputType? keyboardType;
  TextEditingController? controller;
  String? Function(String?)? validator;
  List<TextInputFormatter>? inputFormatters;
  TextInputAction? textInputAction;

  AddressTextField({
    super.key,
    this.labelColor,
    this.labelFontFamily,
    this.textColor,
    this.textFontFamily,
    this.labelText,
    this.hintColor,
    this.hintFontFamily,
    this.hintText,
    this.filled,
    this.fillColor,
    this.maxLines,
    this.keyboardType,
    this.controller,
    this.validator,
    this.textInputAction,
    this.inputFormatters,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      maxLines: maxLines,
      keyboardType: keyboardType,
      textInputAction: textInputAction ?? TextInputAction.next,
      inputFormatters: inputFormatters ?? [UpperCaseTextFormatter()],
      decoration: InputDecoration(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: AppColors.transparent,
            width: 1,
          ),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: AppColors.transparent,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: AppColors.primaryAppColor,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: AppColors.transparent,
            width: 1,
          ),
        ),
        fillColor: fillColor ?? AppColors.textFieldBg,
        filled: filled ?? true,
        labelText: labelText,
        labelStyle: TextStyle(
          color: labelColor ?? AppColors.greyText,
          fontFamily: labelFontFamily ?? AppFontFamily.heeBo400,
          fontSize: 15,
        ),
        hintText: hintText,
        hintStyle: TextStyle(
          color: hintColor ?? AppColors.greyText,
          fontFamily: hintFontFamily ?? AppFontFamily.heeBo400,
          fontSize: 15,
        ),
      ),
      cursorColor: AppColors.appText,
      style: TextStyle(
        color: textColor ?? AppColors.appText,
        fontFamily: textFontFamily ?? AppFontFamily.heeBo500,
        fontSize: 15,
      ),
    );
  }
}
