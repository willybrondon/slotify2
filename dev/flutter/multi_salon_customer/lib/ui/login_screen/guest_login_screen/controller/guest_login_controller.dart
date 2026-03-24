import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/login_screen/login_screen/model/login_model.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class GuestLoginController extends GetxController {
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

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args != null && args is List && args.isNotEmpty && args[0] != null) {
      isDataSelected = args[0] as bool?;
    } else {
      isDataSelected = false;
    }
  }

  @override
  void onClose() {
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
    update([idGuestVerification]);
  }

  void goToOtpStep() {
    verification = true;
    startTimer();
    update([idGuestVerification, idGuestTimer]);
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

          Constant.storage.write('isLogIn', true);
          Constant.storage.write('isGuestBookingLogin', true);
          Constant.storage.write('isMobile', false);
          Constant.storage.write(
              'userId', loginCategory?.user?.id);
          Constant.storage.write(
              'mobileNumber', loginCategory?.user?.mobile?.toString() ?? '');
          Constant.storage.write(
              'isUpdate', loginCategory?.user?.isUpdate ?? true);

          await profileScreenController.onGetUserApiCall();
          if (profileScreenController.getUserCategory?.status == true) {
            Constant.storage.write(
                'userId',
                profileScreenController.getUserCategory?.user?.id);
            Constant.storage.write(
                'userImage',
                profileScreenController.getUserCategory?.user?.image);
            Constant.storage.write(
                'fName',
                profileScreenController.getUserCategory?.user?.fname);
            Constant.storage.write(
                'lName',
                profileScreenController.getUserCategory?.user?.lname);

            if (isDataSelected == true) {
              Get.back();
            } else {
              Get.offAllNamed(AppRoutes.bottom);
            }
          } else {
            Utils.showToast(Get.context!,
                profileScreenController.getUserCategory?.message ?? '');
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
