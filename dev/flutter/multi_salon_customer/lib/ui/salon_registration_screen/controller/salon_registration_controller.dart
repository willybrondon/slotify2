import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/profile/controller/profile_screen_controller.dart';
import 'package:salon_2/ui/salon_registration_screen/model/salon_registration_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';

class SalonRegistrationController extends GetxController {
  final formKey = GlobalKey<FormState>();

  ImagePicker picker = ImagePicker();
  XFile? image;
  File? selectImageFile;

  ProfileScreenController profileScreenController = Get.find<ProfileScreenController>();

  //----------- API Variables -----------//
  SalonRegistrationModel? salonRegistrationCategory;
  RxBool isLoading = false.obs;

  TextEditingController nameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController mobileController = TextEditingController();
  TextEditingController addressController = TextEditingController();
  TextEditingController aboutController = TextEditingController();
  TextEditingController expertController = TextEditingController();

  onPickImage() async {
    image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      selectImageFile = File(image!.path);
      update();
    }
    update([Constant.idPickSalonImage]);
  }

  onClickRegister() async {
    if (Constant.storage.read("salonRequestSent") == true) {
      Utils.showToast(Get.context!, "Already sent request for salon registration");
    } else {
      if (nameController.text.isEmpty ||
          emailController.text.isEmpty ||
          addressController.text.isEmpty ||
          mobileController.text.isEmpty ||
          aboutController.text.isEmpty ||
          expertController.text.isEmpty ||
          (selectImageFile?.path.isEmpty ?? false)) {
        Utils.showToast(Get.context!, "Please fill up all fields");
      } else {
        FocusScopeNode currentFocus = FocusScope.of(Get.context!);
        if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
          currentFocus.focusedChild?.unfocus();
        }

        await onSalonRegistrationApiCall(
          userId: Constant.storage.read<String>('UserId') ?? "",
          name: nameController.text,
          email: emailController.text,
          address: addressController.text,
          mobile: mobileController.text,
          about: aboutController.text,
          expertCount: int.parse(expertController.text),
          latitude: (latitude ?? 0.0).toString(),
          longitude: (longitude ?? 0.0).toString(),
          image: selectImageFile?.path ?? "",
        );
        Utils.showToast(Get.context!, salonRegistrationCategory?.message ?? "");

        if (salonRegistrationCategory?.status == true) {
          Get.back();
          profileScreenController.onGetUserApiCall();

          Constant.storage.write('isGetUserId', profileScreenController.getUserCategory?.user?.id);
          Constant.storage.write('userImage', profileScreenController.getUserCategory?.user?.image);
          Constant.storage.write('salonRequestSent', profileScreenController.getUserCategory?.user?.salonRequestSent);
          Constant.storage.write('fName', profileScreenController.getUserCategory?.user?.fname);
          Constant.storage.write('lName', profileScreenController.getUserCategory?.user?.lname);
        }

        update([Constant.idProgressView]);
      }
    }
  }

  //------------ API Services ------------//

  onSalonRegistrationApiCall({
    required String userId,
    required String name,
    required String email,
    required String address,
    required String mobile,
    required String about,
    required int expertCount,
    required String latitude,
    required String longitude,
    required String image,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      var uri = Uri.parse(ApiConstant.BASE_URL + ApiConstant.salonRegistration);
      var request = http.MultipartRequest("POST", uri);
      log("Salon Registration URL :: $uri");

      if (image.isNotEmpty) {
        var addImage = await http.MultipartFile.fromPath("image", image);
        request.files.add(addImage);
        log("Salon Registration addImage :: $addImage");
        log("Salon Registration Image :: $selectImageFile");
      }

      request.headers.addAll({"key": ApiConstant.SECRET_KEY});

      Map<String, dynamic> requestBody = <String, dynamic>{
        "userId": userId,
        "name": name,
        "email": email,
        "address": address,
        "mobile": mobile,
        "about": about,
        "expertCount": expertCount,
        "latitude": latitude,
        "longitude": longitude,
      };

      log("Salon Registration Body :: $requestBody");

      Map<String, String> requestBodyString = {};
      requestBody.forEach((key, value) {
        requestBodyString[key] = value.toString();
      });

      request.fields.addAll(requestBodyString);
      var res1 = await request.send();
      var res = await http.Response.fromStream(res1);
      log("Salon Registration Status Code :: ${res.statusCode}");
      log("Salon Registration Response :: ${res.body}");

      if (res.statusCode == 200) {
        final jsonResponse = jsonDecode(res.body);
        salonRegistrationCategory = SalonRegistrationModel.fromJson(jsonResponse);
        return SalonRegistrationModel.fromJson(jsonDecode(res.body));
      } else {
        log("Salon Registration Status Code :: ${res.statusCode.toString()}");
        log("Salon Registration Body Bytes :: ${res.bodyBytes.toString()}");
      }
    } catch (e) {
      throw Exception(e);
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
