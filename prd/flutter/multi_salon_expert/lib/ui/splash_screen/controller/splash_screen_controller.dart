import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/ui/splash_screen/model/setting_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class SplashScreenController extends GetxController {
  //----------- API Variables -----------//
  SettingModel? settingCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    await onSettingApiCall();
    super.onInit();
  }

  //------------ API Services ------------//

  onSettingApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.setting);

      log("Setting Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Setting Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Setting StatusCode :: ${response.statusCode}");
      log("Setting Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        settingCategory = SettingModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Setting Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
