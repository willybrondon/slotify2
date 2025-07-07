import 'dart:convert';
import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/edit_profile/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login/sign_up_screen/model/check_sign_up_model.dart';
import 'package:salon_2/ui/login/sign_up_screen/model/sign_up_otp_login_model.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SignUpController extends GetxController {
  final formKey = GlobalKey<FormState>();
  final LoginScreenController loginScreenController = Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController = Get.put(ProfileScreenController());
  final EditProfileScreenController editProfileScreenController = Get.put(EditProfileScreenController());

  TextEditingController fNameController = TextEditingController();
  TextEditingController lNameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
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

    log("args::$args");
    log("Arguments::${Get.arguments}");

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

  onClickSignup() async {
    if (formKey.currentState!.validate()) {
      try {
        isLoading(true);
        update([Constant.idProgressView, Constant.idBookingAndLogin]);

        // var auth = await _auth.createUserWithEmailAndPassword(
        //     email: emailController.text.trim(), password: confirmPasswordController.text.trim());
        // if (auth.user != null) {
        //   log("message log in successful :::::${auth.user}");
        //   await loginScreenController.onLoginApiCall(
        //     loginType: "1",
        //     mobile: mobileController.text.trim(),
        //     fcmToken: fcmToken!,
        //     password: confirmPasswordController.text.trim(),
        //     email: emailController.text.trim(),
        //   );
        //   log("isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");
        //
        //   if (loginScreenController.loginCategory?.status == true) {
        //     Constant.storage.write('isLogIn', true);
        //     Constant.storage.write('UserId', loginScreenController.loginCategory?.user?.id);
        //     log("is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");
        //     log("is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");
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
        //         Constant.storage.write('isGetUserId', profileScreenController.getUserCategory?.user?.id);
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
        // log("message :::::sf");
        await onSignUpOtpLoginApiCall(email: emailController.text.trim());

        if (signUpOtpLoginCategory?.status == true) {
          Get.toNamed(AppRoutes.signUpVerifyOtp, arguments: [emailController.text.trim(), isDataSelected]);
          Utils.showToast(Get.context!, "txtCheckMail".tr);
        } else {
          Utils.showToast(Get.context!, signUpOtpLoginCategory?.message ?? "");
        }
      } catch (e) {
        log("Sign Up Otp Errorr :: $e");
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

      log("Sign Up Otp Login Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.signUpOtpLogin + queryString);
      log("Sign Up Otp Login Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers);

      log("Sign Up Otp Login Status Code :: ${response.statusCode}");
      log("Sign Up Otp Login Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        signUpOtpLoginCategory = SignUpOtpLoginModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Sign Up Otp Login Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onCheckSignUpUserApiCall({required String email, required String loginType, required String password}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);

      final queryParameters = {"email": email, "loginType": loginType, "password": password};

      log("Check Sign Up User Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.checkSignUpUser + queryString);
      log("Check Sign Up User Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Check Sign Up User Status Code :: ${response.statusCode}");
      log("Check Sign Up User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        checkSignUpCategory = CheckSignUpModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Check Sign Up User Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idBookingAndLogin]);
    }
  }
}
