import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/edit_profile/model/edit_profile_model.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/model/login_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/utils.dart';

class EditProfileController extends GetxController {
  dynamic args = Get.arguments;
  LoginExpert? expert;
  ImagePicker picker = ImagePicker();
  XFile? image;
  File? selectImageFile;
  EditProfileModel? editUserCategory;
  RxBool isLoading = false.obs;
  TextEditingController fNameEditingController = TextEditingController();
  TextEditingController lNameEditingController = TextEditingController();
  LoginScreenController loginScreenController = Get.put(LoginScreenController());

  @override
  void onInit() {
    getDataFromArgs();

    log("Image Path from Storage: ${Constant.storage.read("hostImage")}");

    fNameEditingController.text = Constant.storage.read("fName");
    lNameEditingController.text = Constant.storage.read("lName");

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

    super.onInit();
  }

  String capitalizeFirstLetter(String text) {
    if (text.isEmpty) {
      return text;
    }
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  getDataFromArgs() {
    if (args != null) {
      expert = args;
    }
  }

  onPickImage() async {
    image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      selectImageFile = File(image!.path);
      update();
    }
    update();
  }

  onUpdateClick() async {
    log("Imge :: ${selectImageFile?.path}");
    if (fNameEditingController.text.isNotEmpty && lNameEditingController.text.isNotEmpty) {
      await onUpdateUserApiCall(
        fname: fNameEditingController.text,
        lname: lNameEditingController.text,
        selectImageFile: selectImageFile?.path ?? "",
        expertId: Constant.storage.read<String>("expertId").toString(),
      );

      if (editUserCategory?.status ?? true) {
        await loginScreenController.onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());

        if (loginScreenController.getExpertCategory?.status == true) {
          earning = loginScreenController.getExpertCategory?.data?.earning?.toStringAsFixed(2);
          Constant.storage.write('fName', loginScreenController.getExpertCategory?.data?.fname.toString());
          Constant.storage.write('lName', loginScreenController.getExpertCategory?.data?.lname.toString());
          Constant.storage.write('hostImage', loginScreenController.getExpertCategory?.data?.image.toString());
        } else {
          Utils.showToast(Get.context!, loginScreenController.getExpertCategory?.message ?? '');
        }
      } else {
        Utils.showToast(Get.context!, editUserCategory?.message ?? '');
      }
      Utils.showToast(Get.context!, editUserCategory?.message ?? '');

      Get.back();
    } else {
      Utils.showToast(Get.context!, "Please Enter All Details");
    }
    update();
  }

  onUpdateUserApiCall({required String fname, required String lname, required String selectImageFile, String? expertId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);
      final queryParameters = {
        "expertId": expertId,
      };

      log("Update Expert Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      var uri = Uri.parse(ApiConstant.BASE_URL + ApiConstant.updateProfile + queryString);
      var request = http.MultipartRequest("PATCH", uri);
      log("Update Expert URl :: $uri");

      if (selectImageFile.isNotEmpty) {
        var addImage = await http.MultipartFile.fromPath("image", selectImageFile);
        request.files.add(addImage);
        log("Update Expert addImage :: $addImage");
        log("Update Expert Image :: $selectImageFile");
      }

      request.headers.addAll({"key": ApiConstant.SECRET_KEY});

      Map<String, String> requestBody = <String, String>{
        "fname": fname,
        "lname": lname,
      };
      log("Update Expert Body :: $requestBody");
      request.fields.addAll(requestBody);
      var res1 = await request.send();
      var res = await http.Response.fromStream(res1);
      if (res.statusCode == 200) {
        final jsonResponse = jsonDecode(res.body);
        log("Update Expert Status Code :: ${res.statusCode}");
        log("Update Expert Response :: ${res.body}");

        editUserCategory = EditProfileModel.fromJson(jsonResponse);
        return EditProfileModel.fromJson(jsonDecode(res.body));
      } else {
        log("Update Expert Status Code :: ${res.statusCode.toString()}");
      }
    } catch (e) {
      throw Exception(e);
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
