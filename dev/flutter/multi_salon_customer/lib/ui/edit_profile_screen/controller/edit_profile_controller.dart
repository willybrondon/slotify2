import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:salon_2/ui/edit_profile_screen/model/update_user_model.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class EditProfileScreenController extends GetxController {
  int checkedValue = 0;
  ImagePicker picker = ImagePicker();
  XFile? image;
  File? selectImageFile;
  final formKey = GlobalKey<FormState>();

  String? fName;
  String? lName;
  String? email;
  String? mobile;
  int? age;
  String? bio;
  int? loginType;
  bool? isDataSelected;

  TextEditingController fNameEditingController = TextEditingController();
  TextEditingController lNameEditingController = TextEditingController();
  TextEditingController emailEditingController = TextEditingController();
  TextEditingController mobileNumberEditingController = TextEditingController();
  TextEditingController ageEditingController = TextEditingController();
  TextEditingController bioEditingController = TextEditingController();

  LoginScreenController loginScreenController = Get.find<LoginScreenController>();
  ProfileScreenController profileScreenController = Get.find<ProfileScreenController>();

  //----------- API Variables -----------//
  UpdateUserModel? updateUserCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() {
    log("Enter in edit profile controller");

    fNameEditingController.addListener(() {
      final newText = capitalizeFirstLetter(fNameEditingController.text);
      if (fNameEditingController.text != newText) {
        fNameEditingController.value = fNameEditingController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });

    lNameEditingController.addListener(() {
      final newText = capitalizeFirstLetter(lNameEditingController.text);
      if (lNameEditingController.text != newText) {
        lNameEditingController.value = lNameEditingController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });

    bioEditingController.addListener(() {
      final newText = capitalizeFirstLetter(bioEditingController.text);
      if (bioEditingController.text != newText) {
        bioEditingController.value = bioEditingController.value.copyWith(
          text: newText,
          selection: TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          ),
        );
      }
    });

    super.onInit();
  }

  getArgumentsData() {
    log("First Name :: $fName");
    log("Last Name :: $lName");
    log("Age :: $age");
    log("Bio :: $bio");
    log("Mobile :: $mobile");
    log("Email :: $email");
    log("LoginType :: $loginType");
    log("Is Data Selected :: $isDataSelected");

    fNameEditingController.text = fName ?? "";
    lNameEditingController.text = lName ?? "";
    emailEditingController.text = email ?? Constant.storage.read<String>("email") ?? "";
    ageEditingController.text = age == 0 ? "" : age.toString();
    bioEditingController.text = bio ?? "";
    mobileNumberEditingController.text = mobile ?? "";
    update([Constant.idProgressView]);
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    log("args::$args");
    log("Arguments::${Get.arguments}");

    if (args != null) {
      if (args[0] != null ||
          args[1] != null ||
          args[2] != null ||
          args[3] != null ||
          args[4] != null ||
          args[5] != null ||
          args[6] != null ||
          args[7] != null) {
        fName = args[0];
        lName = args[1];
        email = args[2];
        mobile = args[3];
        age = args[4];
        bio = args[5];
        loginType = args[6];
        isDataSelected = args[7];
      }
    }
    update([Constant.idProgressView]);
  }

  bool isEmailValid(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  String capitalizeFirstLetter(String text) {
    if (text.isEmpty) {
      return text;
    }
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  signOnTap() {
    loginScreenController.isLogIn = true;

    log("---------isLog In---------${loginScreenController.isLogIn}");
    update([Constant.idBookingAndLogin]);
  }

  onPickImage() async {
    image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      selectImageFile = File(image!.path);
      update();
    }
    update([Constant.idUpdate]);
  }

  onGenderChange(int index) {
    checkedValue = index;
    update([Constant.idEditProfile]);
  }

  onUpdateClick() async {
    if (formKey.currentState!.validate()) {
      await onUpdateUserApiCall(
          fName: fNameEditingController.text.trim(),
          lName: Constant.storage.read<bool>('isGoogle') == true ? "" : lNameEditingController.text.trim(),
          email: "",
          mobile: Constant.storage.read<bool>('isMobile') ?? false
              ? loginScreenController.mobileEditingController.text.trim()
              : mobileNumberEditingController.text.trim(),
          age: ageEditingController.text.trim(),
          bio: bioEditingController.text.trim(),
          selectImageFile: selectImageFile?.path ?? "",
          gender: checkedValue == 0
              ? "Male"
              : checkedValue == 1
                  ? "Female"
                  : checkedValue == 2
                      ? "Other"
                      : " ");

      if (updateUserCategory != null && updateUserCategory?.status == true) {
        Utils.showToast(Get.context!, updateUserCategory?.message.toString() ?? "");

        Constant.storage.write('isUpdate', true);
        loginScreenController.isUpdate = Constant.storage.read<bool>('isUpdate')!;

        await profileScreenController.onGetUserApiCall();
        if (profileScreenController.getUserCategory?.status == true) {
          Constant.storage.write('userId', profileScreenController.getUserCategory?.user?.id);
          Constant.storage.write('userImage', profileScreenController.getUserCategory?.user?.image);
          Constant.storage.write('salonRequestSent', profileScreenController.getUserCategory?.user?.salonRequestSent);
          Constant.storage.write('fName', profileScreenController.getUserCategory?.user?.fname);
          Constant.storage.write('lName', profileScreenController.getUserCategory?.user?.lname);

          if (isDataSelected == true) {
            signOnTap();
            Get.back();
            Get.back();

            Constant.storage.write('isUpdate', true);
          } else {
            Get.toNamed(AppRoutes.bottom);
            signOnTap();
            Constant.storage.write('isUpdate', true);
          }
          log("enter bottom select");
        } else {
          Utils.showToast(Get.context!, profileScreenController.getUserCategory?.message.toString() ?? "");
        }
      } else {
        Utils.showToast(Get.context!, updateUserCategory?.message.toString() ?? "");
      }

      update([Constant.idUpdate, Constant.idUpdateButton]);
    }
  }

//------------ API Services ------------//

  onUpdateUserApiCall({
    required String fName,
    required String lName,
    required String email,
    required String mobile,
    required String age,
    required String gender,
    required String bio,
    required String selectImageFile,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);
      final queryParameters = {
        "userId": Constant.storage.read<String>('userId') ?? "",
      };

      log("Update User Id :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      var uri = Uri.parse(ApiConstant.BASE_URL + ApiConstant.updateUser + queryString);
      var request = http.MultipartRequest("PATCH", uri);
      log("Update User URL :: $uri");

      if (selectImageFile.isNotEmpty) {
        var addImage = await http.MultipartFile.fromPath("image", selectImageFile);
        request.files.add(addImage);
        log("Update User addImage :: $addImage");
        log("Update User Image :: $selectImageFile");
      }

      request.headers.addAll({"key": ApiConstant.SECRET_KEY});

      Map<String, String> requestBody = <String, String>{
        "fname": fName,
        "lname": lName,
        "email": email,
        "mobile": mobile,
        "gender": gender,
        "age": age,
        "bio": bio,
      };

      log("Update User Body :: $requestBody");

      request.fields.addAll(requestBody);
      var res1 = await request.send();
      var res = await http.Response.fromStream(res1);
      log("Update User Status Code :: ${res.statusCode}");
      log("Update User Response :: ${res.body}");

      if (res.statusCode == 200) {
        final jsonResponse = jsonDecode(res.body);
        updateUserCategory = UpdateUserModel.fromJson(jsonResponse);
        return UpdateUserModel.fromJson(jsonDecode(res.body));
      } else {
        log("Update Expert Status Code :: ${res.statusCode.toString()}");
        log("Update Expert Body Bytes :: ${res.bodyBytes.toString()}");
      }
    } catch (e) {
      throw Exception(e);
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
