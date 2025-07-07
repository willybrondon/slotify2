// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';

class AppButton extends StatefulWidget {
  Function()? onTap;
  String? buttonText;
  String? fontFamily;
  double? width;
  double? height;
  double? fontSize;
  double? borderWidth;
  Color? buttonColor;
  Color? color;
  Color? borderColor;

  AppButton({
    super.key,
    this.onTap,
    this.buttonText,
    this.fontFamily,
    this.width,
    this.height,
    this.borderWidth,
    this.fontSize,
    this.buttonColor,
    this.color,
    this.borderColor,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(50),
            color: widget.buttonColor,
            border: Border.all(
                color: widget.borderColor ?? Colors.transparent, width: widget.borderWidth ?? 0.0)),
        height: widget.height,
        width: widget.width,
        child: Center(
            child: Text(widget.buttonText!,
                style: TextStyle(
                    letterSpacing: 0.5,
                    color: widget.color,
                    fontFamily: widget.fontFamily,
                    fontSize: widget.fontSize))),
      ),
    );
  }
}
