import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:salon_2/ui/complain_screen/model/raise_complain_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class RaiseComplainController extends GetxController {
  ImagePicker picker = ImagePicker();
  XFile? image;
  File? selectImageFile;

  TextEditingController raiseComplainController = TextEditingController();
  TextEditingController bookingIdController = TextEditingController();

  //----------- API Variables -----------//
  RaiseComplainModel? raiseComplainCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() {
    raiseComplainController.addListener(() {
      final newText = capitalizeFirstLetter(raiseComplainController.text);
      if (raiseComplainController.text != newText) {
        raiseComplainController.value = raiseComplainController.value.copyWith(
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

  onPickImage() async {
    image = await picker.pickImage(source: ImageSource.gallery);
    selectImageFile = File(image?.path ?? '');
    update();
  }

  //----------- API SERVICE -----------//

  onRaiseComplainApiCall({String? expertId, required String bookingId, String? details}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"expertId": expertId, "bookingId": bookingId, "details": details});

      log("Raise Complain Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.raiseComplain);
      log("Raise Complain Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Raise Complain Status Code :: ${response.statusCode}");
      log("Raise Complain Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        raiseComplainCategory = RaiseComplainModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Raise Complain Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
