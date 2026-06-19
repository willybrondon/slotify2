import 'dart:convert';
import 'dart:developer' as dev;

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/model/check_sign_up_model.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/model/sign_up_otp_login_model.dart';
import 'package:salon_2/ui/login_screen/sign_up_screen/model/verify_mobile_model.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SignUpController extends GetxController {
  final formKey = GlobalKey<FormState>();
  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController =
      Get.put(ProfileScreenController());
  final EditProfileScreenController editProfileScreenController =
      Get.put(EditProfileScreenController());

  TextEditingController fNameController = TextEditingController();
  TextEditingController lNameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController mobileController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  TextEditingController confirmPasswordController = TextEditingController();
  TextEditingController ageController = TextEditingController();

  int checkedValue = 0;
  bool isObscure = false;
  bool? isDataSelected;
  // final FirebaseAuth _auth = FirebaseAuth.instance;

  //----------- API Variables -----------//
  SignUpOtpLoginModel? signUpOtpLoginCategory;
  CheckSignUpModel? checkSignUpCategory;
  VerifyMobileModel? verifyMobileCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    await getDataFromArgs();

    fNameController.addListener(() {
      final newText = capitalizeFirstLetter(fNameController.text);
      if (fNameController.text != newText) {
        fNameController.value = fNameController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });
    lNameController.addListener(() {
      final newText = capitalizeFirstLetter(lNameController.text);
      if (lNameController.text != newText) {
        lNameController.value = lNameController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });
    super.onInit();
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    dev.log("args::$args");
    dev.log("Arguments::${Get.arguments}");

    if (args != null) {
      if (args[0] != null) {
        isDataSelected = args[0];
      }
    }
    update([Constant.idProgressView]);
  }

  String capitalizeFirstLetter(String text) {
    if (text.isEmpty) {
      return text;
    }
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  onGenderChange(int index) {
    checkedValue = index;
    update([Constant.idChangeGender]);
  }

  onClickObscure() {
    isObscure = !isObscure;
    update();
  }

  bool isEmailValid(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  bool isMobileValid(String mobile) {
    // Remove any spaces, dashes, or parentheses
    String cleanedMobile = mobile.replaceAll(RegExp(r'[\s\-\(\)]'), '');

    // Check if it starts with + (international format)
    bool hasPlusPrefix = cleanedMobile.startsWith('+');

    if (hasPlusPrefix) {
      // Remove the + sign for validation
      cleanedMobile = cleanedMobile.substring(1);

      // After removing +, it should contain only digits
      if (!RegExp(r'^\d+$').hasMatch(cleanedMobile)) {
        return false;
      }

      // Check for French number (+33)
      if (cleanedMobile.startsWith('33')) {
        // French number: +33XXXXXXXXX (should be 11 digits after +33, total 13 with +)
        // Format: +33XXXXXXXXX (e.g., +33690343431 = 11 digits)
        if (cleanedMobile.length == 11) {
          return true;
        }
      }
      
      // Check for Cameroon number (+237)
      if (cleanedMobile.startsWith('237')) {
        // Cameroon number: +237XXXXXXXXX (should be 9 digits after +237, total 12 with +)
        // Format: +237XXXXXXXXX (e.g., +237690343431 = 9 digits)
        if (cleanedMobile.length == 12) {
          return true;
        }
      }

      // For other international format: 10-15 digits (not counting the +)
      if (cleanedMobile.length >= 10 && cleanedMobile.length <= 15) {
        return true;
      }
      
      return false;
    } else {
      // For local format: should contain only digits
      if (!RegExp(r'^\d+$').hasMatch(cleanedMobile)) {
        return false;
      }

      // Check for French number without + (33XXXXXXXXX or 0XXXXXXXXX)
      if (cleanedMobile.startsWith('33')) {
        // French international format without +: 33XXXXXXXXX (11 digits)
        if (cleanedMobile.length == 11) {
          return true;
        }
      } else if (cleanedMobile.startsWith('0')) {
        // French national format: 0XXXXXXXXX (10 digits)
        if (cleanedMobile.length == 10) {
          return true;
        }
      }
      
      // Check for Cameroon number without + (237XXXXXXXXX)
      if (cleanedMobile.startsWith('237')) {
        // Cameroon international format without +: 237XXXXXXXXX (12 digits)
        if (cleanedMobile.length == 12) {
          return true;
        }
      }
      
      // Check for Cameroon local format (9 digits, typically starting with 6, 7, or 8)
      // Cameroon mobile numbers are 9 digits: 6XXXXXXXX, 7XXXXXXXX, or 8XXXXXXXX
      if (cleanedMobile.length == 9 && 
          (cleanedMobile.startsWith('6') || cleanedMobile.startsWith('7') || cleanedMobile.startsWith('8'))) {
        return true;
      }

      // For other local format: 10-15 digits
      if (cleanedMobile.length >= 10 && cleanedMobile.length <= 15) {
        return true;
      }
      
      return false;
    }
  }

  onClickSignup() async {
    if (formKey.currentState!.validate()) {
      try {
        isLoading(true);
        update([Constant.idProgressView, Constant.idBookingAndLogin]);

        // var auth = await _auth.createUserWithEmailAndPassword(
        //     email: emailController.text.trim(), password: confirmPasswordController.text.trim());
        // if (auth.user != null) {
        //   dev.log("message log in successful :::::${auth.user}");
        //   await loginScreenController.onLoginApiCall(
        //     loginType: "1",
        //     mobile: mobileController.text.trim(),
        //     fcmToken: fcmToken!,
        //     password: confirmPasswordController.text.trim(),
        //     email: emailController.text.trim(),
        //   );
        //   dev.log("isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");
        //
        //   if (loginScreenController.loginCategory?.status == true) {
        //     Constant.storage.write('isLogIn', true);
        //     Constant.storage.write('userId', loginScreenController.loginCategory?.user?.id);
        //     dev.log("is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");
        //     dev.log("is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");
        //
        //     await editProfileScreenController.onUpdateUserApiCall(
        //         fName: fNameController.text.trim(),
        //         lName: lNameController.text.trim(),
        //         email: emailController.text.trim(),
        //         mobile: mobileController.text.trim(),
        //         age: "",
        //         bio: "",
        //         selectImageFile: "",
        //         gender: checkedValue == 0
        //             ? "Male"
        //             : checkedValue == 1
        //                 ? "Female"
        //                 : checkedValue == 2
        //                     ? "Other"
        //                     : " ");
        //
        //     if (editProfileScreenController.updateUserCategory != null &&
        //         editProfileScreenController.updateUserCategory?.status == true) {
        //       Utils.showToast(
        //           Get.context!, editProfileScreenController.updateUserCategory?.message.toString() ?? "");
        //
        //       Constant.storage.write('isUpdate', true);
        //       loginScreenController.isUpdate = Constant.storage.read<bool>('isUpdate')!;
        //
        //       await profileScreenController.onGetUserApiCall(loginType: 1);
        //       if (profileScreenController.getUserCategory?.status == true) {
        //         Constant.storage.write('userId', profileScreenController.getUserCategory?.user?.id);
        //         Constant.storage.write('userImage', profileScreenController.getUserCategory?.user?.image);
        //         Get.toNamed(AppRoutes.bottom);
        //         editProfileScreenController.signOnTap();
        //       } else {
        //         Utils.showToast(
        //             Get.context!, profileScreenController.getUserCategory?.message.toString() ?? "");
        //       }
        //     } else {
        //       Utils.showToast(
        //           Get.context!, editProfileScreenController.updateUserCategory?.message.toString() ?? "");
        //     }
        //   }
        // }
        // dev.log("message :::::sf");
        await onSignUpOtpLoginApiCall(email: emailController.text.trim());

        if (signUpOtpLoginCategory?.status == true) {
          Get.toNamed(AppRoutes.signUpVerifyOtp,
              arguments: [emailController.text.trim(), isDataSelected]);
          Utils.showToast(Get.context!, "txtCheckMail".tr);
        } else {
          Utils.showToast(Get.context!, signUpOtpLoginCategory?.message ?? "");
        }
      } catch (e) {
        dev.log("Sign Up Otp Errorr :: $e");
      } finally {
        isLoading(false);
        update([Constant.idProgressView, Constant.idBookingAndLogin]);
      }
    }

    update([Constant.idBookingAndLogin]);
  }

  onSignUpOtpLoginApiCall({required String email}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"email": email};

      dev.log("Sign Up Otp Login Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.signUpOtpLogin + queryString);
      dev.log("Sign Up Otp Login Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.post(url, headers: headers);

      dev.log("Sign Up Otp Login Status Code :: ${response.statusCode}");
      dev.log("Sign Up Otp Login Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        signUpOtpLoginCategory = SignUpOtpLoginModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      dev.log("Error call Sign Up Otp Login Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onCheckSignUpUserApiCall(
      {required String email,
      required String loginType,
      required String password,
      required String mobile}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);

      // Step 1: Verify mobile number by sending SMS
      dev.log("Step 1: Verifying mobile number by sending SMS...");
      await onVerifyMobileForSignupApiCall(mobile: mobile);

      if (verifyMobileCategory?.status != true) {
        // SMS verification failed, stop the signup process
        dev.log(
            "Mobile verification failed: ${verifyMobileCategory?.message ?? verifyMobileCategory?.error}");
        return;
      }

      dev.log("Mobile number verified successfully. SMS sent to ${mobile}");

      // Step 2: Check if user can sign up (email check)
      final queryParameters = {
        "email": email,
        "loginType": loginType,
        "password": password,
        "mobile": mobile
      };

      dev.log("Step 2: Check Sign Up User Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.checkSignUpUser + queryString);
      dev.log("Check Sign Up User Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      dev.log("Check Sign Up User Status Code :: ${response.statusCode}");
      dev.log("Check Sign Up User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        checkSignUpCategory = CheckSignUpModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      dev.log("Error call Check Sign Up User Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);
    }
  }

  onVerifyMobileForSignupApiCall({required String mobile}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);

      final queryParameters = {"mobile": mobile.trim()};

      dev.log("Verify Mobile For Signup Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL +
          ApiConstant.verifyMobileForSignup +
          queryString);
      dev.log("Verify Mobile For Signup Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      dev.log("Verify Mobile For Signup Status Code :: ${response.statusCode}");
      dev.log("Verify Mobile For Signup Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        verifyMobileCategory = VerifyMobileModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
      verifyMobileCategory =
          VerifyMobileModel(status: false, error: exception.message);
    } catch (e) {
      dev.log("Error call Verify Mobile For Signup Api :: $e");
      Utils.showToast(Get.context!, 'desErrorVerifyingMobile'.tr);
      verifyMobileCategory =
          VerifyMobileModel(status: false, error: e.toString());
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);
    }
  }
}
