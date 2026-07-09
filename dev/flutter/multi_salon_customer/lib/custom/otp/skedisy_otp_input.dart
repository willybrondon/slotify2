import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:pinput/pinput.dart';
import 'package:salon_2/custom/otp/otp_code_detector.dart';
import 'package:salon_2/custom/otp/skedisy_otp_pin_theme.dart';
import 'package:salon_2/custom/otp/skedisy_sms_retriever.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

/// OTP field with iOS/Android autofill, SMS consent (Android), and tap-to-fill banner.
class SkedisyOtpInput extends StatefulWidget {
  const SkedisyOtpInput({
    super.key,
    required this.controller,
    required this.length,
    this.enableSmsAutofill = true,
    this.onCompleted,
    this.autofocus = true,
    this.cellSize = 48,
  });

  final TextEditingController controller;
  final int length;
  final bool enableSmsAutofill;
  final ValueChanged<String>? onCompleted;
  final bool autofocus;
  final double cellSize;

  @override
  State<SkedisyOtpInput> createState() => _SkedisyOtpInputState();
}

class _SkedisyOtpInputState extends State<SkedisyOtpInput>
    with WidgetsBindingObserver {
  SkedisySmsRetriever? _smsRetriever;
  final FocusNode _focusNode = FocusNode();
  String? _suggestedCode;
  Timer? _clipboardPollTimer;
  bool _userDismissedSuggestion = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.enableSmsAutofill && !kIsWeb && Platform.isAndroid) {
      _smsRetriever = SkedisySmsRetriever();
    }
    _focusNode.addListener(_onFocusChange);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scanClipboard();
      _startClipboardPolling();
    });
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      _scanClipboard();
    }
  }

  void _startClipboardPolling() {
    _clipboardPollTimer?.cancel();
    _clipboardPollTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (!mounted) return;
      if (_focusNode.hasFocus && !_userDismissedSuggestion) {
        _scanClipboard(silent: true);
      }
    });
  }

  Future<void> _scanClipboard({bool silent = false}) async {
    if (_userDismissedSuggestion) return;
    if (widget.controller.text.length >= widget.length) return;

    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      final code = OtpCodeDetector.extract(
        data?.text,
        length: widget.length,
      );
      if (!mounted || code == null) return;
      if (code == _suggestedCode) return;
      setState(() => _suggestedCode = code);
    } catch (_) {
      if (!silent) return;
    }
  }

  void _applySuggestedCode() {
    final code = _suggestedCode;
    if (code == null) return;
    widget.controller.text = code;
    setState(() {
      _suggestedCode = null;
      _userDismissedSuggestion = true;
    });
    if (code.length == widget.length) {
      widget.onCompleted?.call(code);
      _focusNode.unfocus();
    }
  }

  void _dismissSuggestion() {
    setState(() {
      _suggestedCode = null;
      _userDismissedSuggestion = true;
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _userDismissedSuggestion = false;
      _scanClipboard();
    }
  }

  @override
  void dispose() {
    _clipboardPollTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    _smsRetriever?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final defaultTheme = SkedisyOtpPinTheme.defaultTheme(cellSize: widget.cellSize);
    final focusedTheme = SkedisyOtpPinTheme.focusedTheme(cellSize: widget.cellSize);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_suggestedCode != null) ...[
          Material(
            color: AppColors.brandTerracottaLight,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              onTap: _applySuggestedCode,
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Icon(
                      Icons.sms_outlined,
                      size: 20,
                      color: AppColors.brandTerracotta,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: RichText(
                        text: TextSpan(
                          style: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayRegular,
                            fontSize: 14,
                            color: AppColors.brandBlack,
                            height: 1.35,
                          ),
                          children: [
                            TextSpan(text: '${'txtOtpTapToFill'.tr} '),
                            TextSpan(
                              text: _suggestedCode,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                letterSpacing: 2,
                                color: AppColors.brandTerracotta,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _dismissSuggestion,
                      icon: Icon(
                        Icons.close,
                        size: 18,
                        color: AppColors.brandGrayMuted,
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
        Pinput(
          length: widget.length,
          controller: widget.controller,
          focusNode: _focusNode,
          autofocus: widget.autofocus,
          defaultPinTheme: defaultTheme,
          focusedPinTheme: focusedTheme,
          submittedPinTheme: focusedTheme,
          pinAnimationType: PinAnimationType.fade,
          keyboardType: TextInputType.number,
          autofillHints: const [AutofillHints.oneTimeCode],
          smsRetriever: _smsRetriever,
          hapticFeedbackType: HapticFeedbackType.lightImpact,
          onCompleted: widget.onCompleted,
          cursor: Container(
            width: 2,
            height: 22,
            color: AppColors.brandTerracotta,
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 10),
          child: Text(
            'txtOtpAutofillHint'.tr,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppFontFamily.sfProDisplayRegular,
              fontSize: 12,
              color: AppColors.brandGrayMuted,
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}
