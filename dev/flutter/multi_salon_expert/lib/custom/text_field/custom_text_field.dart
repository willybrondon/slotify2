// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class CustomTextField extends StatelessWidget {
  final bool filled;
  bool? obscureText;
  bool? expands;
  bool? focusBorder;
  String? hintText;
  Color? fillColor;
  Color? hintTextColor;
  Color? cursorColor;
  Color? fontColor;
  double? hintTextSize;
  double? fontSize;
  int? maxLines;
  int? maxLength;
  bool? readOnly;
  Widget? prefixIcon;
  Widget? prefix;
  Widget? suffixIcon;
  TextStyle? textStyle;
  TextEditingController? controller;
  TextInputAction? textInputAction;
  TextInputType? textInputType;
  EdgeInsetsGeometry? contentPadding;
  String? Function(String?)? validator;
  String? Function(String?)? onChanged;
  void Function()? onTap;
  void Function(PointerDownEvent)? onTapOutside;
  List<TextInputFormatter>? inputFormatters;

  CustomTextField({
    super.key,
    required this.filled,
    this.obscureText,
    this.expands,
    this.focusBorder,
    this.hintText,
    this.fillColor,
    this.fontColor,
    this.cursorColor,
    this.maxLines,
    this.maxLength,
    this.readOnly,
    this.prefixIcon,
    this.prefix,
    this.suffixIcon,
    this.controller,
    this.textStyle,
    this.hintTextColor,
    this.hintTextSize,
    this.fontSize,
    this.textInputAction,
    this.textInputType,
    this.contentPadding,
    this.validator,
    this.onChanged,
    this.onTap,
    this.onTapOutside,
    this.inputFormatters,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      onChanged: onChanged,
      onTap: onTap,
      onTapOutside: onTapOutside,
      inputFormatters: inputFormatters,
      cursorColor: cursorColor,
      readOnly: readOnly ?? false,
      obscureText: obscureText ?? false,
      maxLength: maxLength,
      expands: expands ?? false,
      style: TextStyle(
        fontFamily: AppFontFamily.heeBo600,
        color: fontColor ?? AppColors.primaryAppColor,
        fontSize: fontSize ?? 13,
      ),
      textInputAction: textInputAction,
      keyboardType: textInputType,
      decoration: InputDecoration(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.transparent),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.transparent),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.transparent),
        ),
        focusedBorder: focusBorder == true
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.transparent),
              )
            : OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.redColor),
              ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.redColor),
        ),
        fillColor: fillColor,
        filled: filled,
        prefixIcon: prefixIcon,
        prefix: prefix,
        suffixIcon: suffixIcon,
        hintText: hintText,
        contentPadding: contentPadding,
        hintStyle: TextStyle(
          fontFamily: AppFontFamily.heeBo500,
          color: hintTextColor ?? AppColors.transparent,
          fontSize: hintTextSize ?? 0.0,
        ),
        errorStyle: TextStyle(
          fontFamily: AppFontFamily.heeBo500,
          color: AppColors.redColor,
          fontSize: 11,
        ),
      ),
    );
  }
}
