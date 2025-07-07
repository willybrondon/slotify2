import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/login/login_screen/model/login_model.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class LoginScreenController extends GetxController {
  bool isUpdate = Constant.storage.read<bool>('isUpdate') ?? false;
  bool isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;
  String isUserId = Constant.storage.read<String>('UserId') ?? "";
  String mobileNumber = Constant.storage.read<String>('mobileNumber') ?? " ";
  bool verification = false;
  String selectedCountryCode = '+91';
  String verificationCode = "";
  TextEditingController mobileEditingController = TextEditingController();
  TextEditingController otpEditingController = TextEditingController();
  int secondsRemaining = 70;
  Timer? timer;
  bool isFirstTap = false;
  bool? isDataSelected;

  final ProfileScreenController profileScreenController = Get.put(ProfileScreenController());

  //----------- API Variables -----------//
  LoginModel? loginCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    log("Enter in Login Screen Controller");
    await getDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    log("Login Args::$args");
    log("Login Arguments::${Get.arguments}");

    if (args != null) {
      if (args[0] != null) {
        isDataSelected = args[0];
        log("Login Arguments isDataSelected::$isDataSelected");
      }
    } else {
      isDataSelected = false;
    }
    update([Constant.idProgressView]);
  }

  void startTimer() {
    const oneSecond = Duration(seconds: 1);
    timer = Timer.periodic(oneSecond, (timer) {
      if (secondsRemaining > 0) {
        secondsRemaining--;
      } else {
        timer.cancel();
      }
      update([Constant.idTimer]);
    });
  }

  void resetTimer() {
    timer?.cancel();
    secondsRemaining = 60;
    startTimer();
    update([Constant.idTimer]);
  }

  onCheckMobile() {
    if (mobileEditingController.text.isNotEmpty) {
      Constant.storage.write('mobileNumber', mobileEditingController.text);

      verifyPhone();
      onVerification();
    } else {
      Utils.showToast(Get.context!, "Please Enter Mobile Number");
    }
    update([Constant.idCheckMobile]);
  }

  onVerification() {
    verification = true;
    log("Verification == $verification");
    update([Constant.idVerification]);
  }

  onChangeNumber() {
    verification = false;
    log("Change on Verification :: $verification");
    update([Constant.idChangeNumber, Constant.idVerification]);
  }

  void verifyPhone() async {
    log('---- number ---- ${mobileEditingController.text}');

    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: '$selectedCountryCode${mobileEditingController.text}',
      verificationCompleted: (PhoneAuthCredential credential) async {},
      verificationFailed: (FirebaseAuthException e) {
        String errorMessage;

        switch (e.code) {
          case 'invalid-verification-code':
            errorMessage = "Invalid verification code.";
            break;
          case 'invalid-verification-id':
            errorMessage = "Invalid verification ID.";
            break;
          case 'session-expired':
            errorMessage = "Verification session has expired. Please try again.";
            break;
          case 'quota-exceeded':
            errorMessage = "SMS quota exceeded. Please try again later.";
            break;
          case 'missing-verification-code':
            errorMessage = "Verification code is missing.";
            break;
          case 'missing-verification-id':
            errorMessage = "Verification ID is missing.";
            break;
          case 'app-not-authorized':
            errorMessage = "App is not authorized to use Firebase Authentication.";
            break;
          case 'operation-not-allowed':
            errorMessage = "Phone authentication is not enabled.";
            break;
          case 'too-many-requests':
            errorMessage = "Too many requests. Please try again later.";
            break;
          case 'credential-already-in-use':
            errorMessage = "The phone number is already linked to another account.";
            break;
          default:
            errorMessage = "An error occurred during OTP verification.";
        }

        Utils.showToast(Get.context!, errorMessage);
        log("Mobile number Verification :: ${e.code}");
        log("Mobile number verification :: ${e.message}");
      },
      codeSent: (String verificationID, int? resendToken) {
        verificationCode = verificationID;
      },
      codeAutoRetrievalTimeout: (String verificationID) {},
    );
  }

  verifyOTP({required String mobileNumber}) async {
    log("Mobile Number :: $mobileNumber");
    log("otpEditingController :: ${otpEditingController.text}");
    try {
      isLoading(true);
      update([Constant.idProgressView]);
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationCode,
        smsCode: otpEditingController.text,
      );

      UserCredential userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      log("User Credential :: $userCredential");
    } on FirebaseAuthException catch (e) {
      String errorMessage;

      switch (e.code) {
        case 'invalid-verification-code':
          errorMessage = "Invalid verification code.";
          break;
        case 'invalid-verification-id':
          errorMessage = "Invalid verification ID.";
          break;
        case 'session-expired':
          errorMessage = "Verification session has expired. Please try again.";
          break;
        case 'quota-exceeded':
          errorMessage = "SMS quota exceeded. Please try again later.";
          break;
        case 'missing-verification-code':
          errorMessage = "Verification code is missing.";
          break;
        case 'missing-verification-id':
          errorMessage = "Verification ID is missing.";
          break;
        case 'app-not-authorized':
          errorMessage = "App is not authorized to use Firebase Authentication.";
          break;
        case 'operation-not-allowed':
          errorMessage = "Phone authentication is not enabled.";
          break;
        case 'too-many-requests':
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 'credential-already-in-use':
          errorMessage = "The phone number is already linked to another account.";
          break;
        default:
          errorMessage = "An error occurred during OTP verification.";
      }

      Utils.showToast(Get.context!, errorMessage);
      log("Verify OTP :: ${e.code}");
      log("Verify OTP ::  ${e.message}");
      throw Exception("Error occurred during OTP verification.");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  //------------ API Services ------------//

  onLoginApiCall({
    String? mobile,
    required String fcmToken,
    required String loginType,
    String? email,
    String? password,
    String? age,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);

      final body = json.encode(
          {"mobile": mobile, "loginType": loginType, "fcmToken": fcmToken, "email": email, "password": password, "age": age});

      log("Login Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.loginUser);
      log("Login Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Login Status Code :: ${response.statusCode}");
      log("Login Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        loginCategory = LoginModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Login Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);
    }
  }
}
