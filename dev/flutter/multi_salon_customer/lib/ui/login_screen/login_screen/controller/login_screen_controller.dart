import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/login_screen/model/login_model.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class LoginScreenController extends GetxController {
  bool isUpdate = Constant.storage.read<bool>('isUpdate') ?? false;
  bool isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;
  String isUserId = Constant.storage.read<String>('userId') ?? "";
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

  final ProfileScreenController profileScreenController =
      Get.put(ProfileScreenController());

  //----------- API Variables -----------//
  LoginModel? loginCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    dev.log("Enter in Login Screen Controller");
    await getDataFromArgs();
    // Existing sessions: guest quick-login users should not stay on "complete profile" wall
    if (Constant.storage.read<bool>('isGuestBookingLogin') == true &&
        Constant.storage.read<bool>('isLogIn') == true) {
      Constant.storage.write('isUpdate', true);
    }
    isUpdate = Constant.storage.read<bool>('isUpdate') ?? false;
    isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;
    update([Constant.idBookingAndLogin]);
    super.onInit();
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    dev.log("Login Args::$args");
    dev.log("Login Arguments::${Get.arguments}");

    if (args != null) {
      if (args[0] != null) {
        isDataSelected = args[0];
        dev.log("Login Arguments isDataSelected::$isDataSelected");
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
    dev.log("Verification == $verification");
    update([Constant.idVerification]);
  }

  onChangeNumber() {
    verification = false;
    dev.log("Change on Verification :: $verification");
    update([Constant.idChangeNumber, Constant.idVerification]);
  }

  void verifyPhone() async {
    dev.log('---- number ---- ${mobileEditingController.text}');

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
            errorMessage =
                "Verification session has expired. Please try again.";
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
            errorMessage =
                "App is not authorized to use Firebase Authentication.";
            break;
          case 'operation-not-allowed':
            errorMessage = "Phone authentication is not enabled.";
            break;
          case 'too-many-requests':
            errorMessage = "Too many requests. Please try again later.";
            break;
          case 'credential-already-in-use':
            errorMessage =
                "The phone number is already linked to another account.";
            break;
          default:
            errorMessage = "An error occurred during OTP verification.";
        }

        Utils.showToast(Get.context!, errorMessage);
        dev.log("Mobile number Verification :: ${e.code}");
        dev.log("Mobile number verification :: ${e.message}");
      },
      codeSent: (String verificationID, int? resendToken) {
        verificationCode = verificationID;
      },
      codeAutoRetrievalTimeout: (String verificationID) {},
    );
  }

  verifyOTP({required String mobileNumber}) async {
    dev.log("Mobile Number :: $mobileNumber");
    dev.log("otpEditingController :: ${otpEditingController.text}");
    try {
      isLoading(true);
      update([Constant.idProgressView]);
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationCode,
        smsCode: otpEditingController.text,
      );

      UserCredential userCredential =
          await FirebaseAuth.instance.signInWithCredential(credential);
      dev.log("User Credential :: $userCredential");
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
          errorMessage =
              "App is not authorized to use Firebase Authentication.";
          break;
        case 'operation-not-allowed':
          errorMessage = "Phone authentication is not enabled.";
          break;
        case 'too-many-requests':
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 'credential-already-in-use':
          errorMessage =
              "The phone number is already linked to another account.";
          break;
        default:
          errorMessage = "An error occurred during OTP verification.";
      }

      Utils.showToast(Get.context!, errorMessage);
      dev.log("Verify OTP :: ${e.code}");
      dev.log("Verify OTP ::  ${e.message}");
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
    String? fname,
    String? lname,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);

      // Ensure FCM token is not null for iOS
      String safeFcmToken = fcmToken.isNotEmpty ? fcmToken : '';

      final body = json.encode({
        "mobile": mobile,
        "loginType": loginType,
        "fcmToken": safeFcmToken,
        "email": email,
        "password": password,
        "age": age,
        "fname": fname,
        "lname": lname,
      });

      dev.log("Login Body :: $body");
      dev.log("FCM Token being sent :: $safeFcmToken");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.loginUser);
      dev.log("Login Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MultiSalonCustomer/1.0',
      };

      dev.log("Login Headers :: $headers");

      final response = await http
          .post(url, headers: headers, body: body)
          .timeout(const Duration(seconds: 30));

      dev.log("Login Status Code :: ${response.statusCode}");
      dev.log("Login Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        loginCategory = LoginModel.fromJson(jsonResponse);
        dev.log("Login successful: ${loginCategory?.status}");
      } else {
        dev.log("Login failed with status code: ${response.statusCode}");
        Utils.showToast(Get.context!, "Login failed. Please try again.");
      }
    } on AppException catch (exception) {
      dev.log("App Exception: ${exception.message}");
      Utils.showToast(Get.context!, exception.message);
    } on SocketException catch (e) {
      dev.log("Network error: $e");
      Utils.showToast(Get.context!,
          "Network connection error. Please check your internet connection.");
    } on HandshakeException catch (e) {
      dev.log("SSL Handshake error: $e");
      Utils.showToast(Get.context!, "SSL connection error. Please try again.");
    } on TimeoutException catch (e) {
      dev.log("Timeout error: $e");
      Utils.showToast(Get.context!,
          "Request timeout. Please check your connection and try again.");
    } catch (e) {
      dev.log("Error call Login Api :: $e");
      Utils.showToast(Get.context!, 'Connection error. Please try again.');
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);
    }
  }
}
