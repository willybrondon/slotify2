import 'package:flutter/services.dart';

class MobileNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    String newText = newValue.text;

    // If the new text is empty, allow it
    if (newText.isEmpty) {
      return newValue;
    }

    // Allow + only at the beginning
    if (newText.contains('+')) {
      // If + is not at the start, remove it
      if (newText[0] != '+') {
        newText = newText.replaceAll('+', '');
        return TextEditingValue(
          text: newText,
          selection: TextSelection.collapsed(offset: newText.length),
        );
      }
      // If + is at the start, ensure only one + and only digits after it
      if (newText.startsWith('+')) {
        // Remove any + signs after the first character
        String digits = newText.substring(1).replaceAll('+', '');
        // Keep only digits after the +
        digits = digits.replaceAll(RegExp(r'[^0-9]'), '');
        newText = '+$digits';
      }
    } else {
      // No + sign, allow only digits
      newText = newText.replaceAll(RegExp(r'[^0-9]'), '');
    }

    // Limit total length to 16 (1 for + and 15 for digits)
    if (newText.length > 16) {
      newText = newText.substring(0, 16);
    }

    return TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length),
    );
  }
}
