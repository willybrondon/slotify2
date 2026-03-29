import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/model/login_model.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class GuestLoginController extends GetxController with WidgetsBindingObserver {
  /// Persist guest login while user switches apps (e.g. mail app for OTP). TTL after last save.
  static const int draftTtlMs = 45 * 60 * 1000;
  static const String _draftTs = 'guest_login_draft_ts';
  static const String _draftEmail = 'guest_login_draft_email';
  static const String _draftMobileFull = 'guest_login_draft_mobile_full';
  static const String _draftMobileLocal = 'guest_login_draft_mobile_local';
  static const String _draftVerification = 'guest_login_draft_verification';
  static const String _draftOtp = 'guest_login_draft_otp';
  static const String _draftSeconds = 'guest_login_draft_seconds';

  bool verification = false;
  TextEditingController emailController = TextEditingController();
  TextEditingController otpEditingController = TextEditingController();
  TextEditingController mobileEditingController = TextEditingController();

  String completePhoneNumber = '';
  int secondsRemaining = 60;
  Timer? timer;

  LoginModel? loginCategory;
  RxBool isLoading = false.obs;

  bool? isDataSelected;

  final ProfileScreenController profileScreenController =
      Get.put(ProfileScreenController());

  static const idGuestVerification = 'idGuestVerification';
  static const idGuestTimer = 'idGuestTimer';

  static int? _readInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    if (v is num) return v.toInt();
    return int.tryParse(v.toString());
  }

  /// True if a recent guest-login draft exists (cold start → reopen guest OTP flow).
  static bool hasPendingDraft() {
    if (Constant.storage.read<bool>('isLogIn') == true) return false;
    final ts = _readInt(Constant.storage.read(_draftTs));
    if (ts == null) return false;
    if (DateTime.now().millisecondsSinceEpoch - ts > draftTtlMs) {
      clearDraftStatic();
      return false;
    }
    final email = Constant.storage.read<String>(_draftEmail) ?? '';
    final ver = Constant.storage.read<bool>(_draftVerification) ?? false;
    return email.trim().isNotEmpty || ver;
  }

  static void clearDraftStatic() {
    Constant.storage.remove(_draftTs);
    Constant.storage.remove(_draftEmail);
    Constant.storage.remove(_draftMobileFull);
    Constant.storage.remove(_draftMobileLocal);
    Constant.storage.remove(_draftVerification);
    Constant.storage.remove(_draftOtp);
    Constant.storage.remove(_draftSeconds);
  }

  void _saveDraft() {
    if (Constant.storage.read<bool>('isLogIn') == true) return;
    final email = emailController.text.trim();
    final hasPhone = completePhoneNumber.isNotEmpty ||
        mobileEditingController.text.trim().isNotEmpty;
    if (email.isEmpty && !verification && !hasPhone) return;
    Constant.storage.write(_draftTs, DateTime.now().millisecondsSinceEpoch);
    Constant.storage.write(_draftEmail, email);
    Constant.storage.write(_draftMobileFull, completePhoneNumber);
    Constant.storage.write(_draftMobileLocal, mobileEditingController.text);
    Constant.storage.write(_draftVerification, verification);
    Constant.storage.write(_draftOtp, otpEditingController.text);
    Constant.storage.write(_draftSeconds, secondsRemaining);
  }

  void _restoreDraft() {
    if (Constant.storage.read<bool>('isLogIn') == true) {
      clearDraftStatic();
      return;
    }
    final ts = _readInt(Constant.storage.read(_draftTs));
    if (ts == null) return;
    if (DateTime.now().millisecondsSinceEpoch - ts > draftTtlMs) {
      clearDraftStatic();
      return;
    }
    final em = Constant.storage.read<String>(_draftEmail);
    if (em != null) emailController.text = em;
    final mf = Constant.storage.read<String>(_draftMobileFull);
    if (mf != null) completePhoneNumber = mf;
    final ml = Constant.storage.read<String>(_draftMobileLocal);
    if (ml != null) mobileEditingController.text = ml;
    final ver = Constant.storage.read<bool>(_draftVerification) ?? false;
    if (ver) {
      verification = true;
      final otp = Constant.storage.read<String>(_draftOtp);
      if (otp != null) otpEditingController.text = otp;
      final sec = _readInt(Constant.storage.read(_draftSeconds)) ?? 60;
      _resumeTimerFromSeconds(sec.clamp(0, 600));
    }
    update([idGuestVerification, idGuestTimer, Constant.idProgressView]);
  }

  void _resumeTimerFromSeconds(int seconds) {
    timer?.cancel();
    secondsRemaining = seconds;
    if (secondsRemaining <= 0) return;
    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (secondsRemaining > 0) {
        secondsRemaining--;
      } else {
        t.cancel();
      }
      update([idGuestTimer]);
    });
  }

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    final args = Get.arguments;
    if (args != null && args is List && args.isNotEmpty && args[0] != null) {
      isDataSelected = args[0] as bool?;
    } else {
      isDataSelected = false;
    }
    Future.microtask(_restoreDraft);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.hidden) {
      _saveDraft();
    }
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    _saveDraft();
    timer?.cancel();
    emailController.dispose();
    otpEditingController.dispose();
    mobileEditingController.dispose();
    super.onClose();
  }

  void startTimer() {
    timer?.cancel();
    secondsRemaining = 60;
    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (secondsRemaining > 0) {
        secondsRemaining--;
      } else {
        t.cancel();
      }
      update([idGuestTimer]);
    });
  }

  void onChangeContact() {
    verification = false;
    otpEditingController.clear();
    _saveDraft();
    update([idGuestVerification]);
  }

  void goToOtpStep() {
    verification = true;
    startTimer();
    _saveDraft();
    update([idGuestVerification, idGuestTimer]);
  }

  void _syncLoginScreenController() {
    try {
      final lc = Get.find<LoginScreenController>();
      lc.isUpdate = true;
      lc.isLogIn = true;
      lc.update([Constant.idBookingAndLogin]);
    } catch (_) {}
  }

  bool _emailValid(String v) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v.trim());
  }

  Future<void> sendOtp() async {
    final email = emailController.text.trim();
    if (!_emailValid(email)) {
      Utils.showToast(Get.context!, 'desEnterValidEmail'.tr);
      return;
    }
    if (completePhoneNumber.isEmpty &&
        mobileEditingController.text.trim().isEmpty) {
      Utils.showToast(Get.context!, 'txtEnterMobileNumber'.tr);
      return;
    }
    final mobile = completePhoneNumber.isNotEmpty
        ? completePhoneNumber
        : mobileEditingController.text.trim();

    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({'email': email, 'mobile': mobile});
      final url =
          Uri.parse('${ApiConstant.BASE_URL}${ApiConstant.guestSendOtp}');
      final response = await http
          .post(
            url,
            headers: {
              'key': ApiConstant.SECRET_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: body,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['status'] == true) {
          Utils.showToast(
              Get.context!, jsonResponse['message']?.toString() ?? '');
          goToOtpStep();
        } else {
          Utils.showToast(
              Get.context!, jsonResponse['message']?.toString() ?? '');
        }
      } else {
        Utils.showToast(Get.context!, 'Connection error. Please try again.');
      }
    } on SocketException {
      Utils.showToast(
          Get.context!, 'Network error. Check your internet connection.');
    } on TimeoutException {
      Utils.showToast(Get.context!, 'Request timed out.');
    } catch (e) {
      dev.log('guest sendOtp: $e');
      Utils.showToast(Get.context!, 'Something went wrong.');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  Future<void> resendOtp() async {
    if (secondsRemaining > 0) return;
    await sendOtp();
  }

  Future<void> verifyAndComplete() async {
    final email = emailController.text.trim();
    final mobile = completePhoneNumber.isNotEmpty
        ? completePhoneNumber
        : mobileEditingController.text.trim();
    final otp = otpEditingController.text.trim();

    if (otp.length < 6) {
      Utils.showToast(Get.context!, 'txtGuestOtpInvalid'.tr);
      return;
    }

    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final safeFcm = (fcmToken ?? '').isNotEmpty ? fcmToken! : '';
      final body = json.encode({
        'email': email,
        'mobile': mobile,
        'otp': otp,
        'fcmToken': safeFcm,
      });

      final url =
          Uri.parse('${ApiConstant.BASE_URL}${ApiConstant.guestVerifyOtp}');
      final response = await http
          .post(
            url,
            headers: {
              'key': ApiConstant.SECRET_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: body,
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        loginCategory = LoginModel.fromJson(jsonResponse);

        if (loginCategory?.status == true && loginCategory?.user != null) {
          Utils.showToast(
              Get.context!, loginCategory?.message ?? 'Success');

          clearDraftStatic();
          Constant.storage.write('isLogIn', true);
          Constant.storage.write('isGuestBookingLogin', true);
          Constant.storage.write('isMobile', false);
          Constant.storage.write(
              'userId', loginCategory?.user?.id);
          Constant.storage.write(
              'mobileNumber', loginCategory?.user?.mobile?.toString() ?? '');

          await profileScreenController.onGetUserApiCall();
          if (profileScreenController.getUserCategory?.status == true) {
            Constant.storage.write(
                'userId',
                profileScreenController.getUserCategory?.user?.id);
            Constant.storage.write(
                'userImage',
                profileScreenController.getUserCategory?.user?.image);
            // Display name: API first; if empty, use part before @ from email (guest quick signup)
            final apiUser = profileScreenController.getUserCategory?.user;
            String fn = (apiUser?.fname ?? '').trim();
            if (fn.isEmpty) {
              fn = email.contains('@')
                  ? email.trim().split('@').first
                  : email.trim();
            }
            Constant.storage.write('fName', fn);
            Constant.storage.write('lName', (apiUser?.lname ?? '').trim());
            // Guest login = profile sufficient for booking & history (same UX as full account)
            Constant.storage.write('isUpdate', true);

            _syncLoginScreenController();

            if (isDataSelected == true) {
              Get.back();
            } else {
              Get.offAllNamed(AppRoutes.bottom);
            }
          } else {
            Utils.showToast(Get.context!,
                profileScreenController.getUserCategory?.message ?? '');
            // Fallback if profile API fails: still complete guest session
            final fn = email.contains('@')
                ? email.trim().split('@').first
                : email.trim();
            Constant.storage.write('fName', fn);
            Constant.storage.write('lName', '');
            Constant.storage.write('isUpdate', true);
            _syncLoginScreenController();
            if (isDataSelected == true) {
              Get.back();
            } else {
              Get.offAllNamed(AppRoutes.bottom);
            }
          }
        } else {
          Utils.showToast(
              Get.context!, loginCategory?.message ?? 'Verification failed');
        }
      } else {
        Utils.showToast(Get.context!, 'Connection error. Please try again.');
      }
    } on SocketException {
      Utils.showToast(
          Get.context!, 'Network error. Check your internet connection.');
    } on TimeoutException {
      Utils.showToast(Get.context!, 'Request timed out.');
    } catch (e) {
      dev.log('guest verify: $e');
      Utils.showToast(Get.context!, 'Something went wrong.');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
