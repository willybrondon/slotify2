import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/ui/setting_screen/model/delete_model.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SettingController extends GetxController {
  bool? isSwitchOn;

  @override
  void onInit() {
    Constant.storage.read("notification") == false
        ? Constant.storage.write("notification", false)
        : Constant.storage.write("notification", true);

    isSwitchOn = Constant.storage.read("notification");
    super.onInit();
  }

  onSwitch(value) {
    isSwitchOn = value;
    update([Constant.idSwitchOn]);
  }

  //----------- API Variables -----------//
  DeleteModel? deleteUserCategory;
  RxBool isLoading = false.obs;

  //------------ API Services ------------//

  onDeleteUserApiCall({required String userId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"userId": userId});

      log("Delete User Body :: $body");

      final queryParameters = {
        "userId": Constant.storage.read<String>('userId') ?? "",
      };

      log("Delete User Id :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse('${ApiConstant.BASE_URL}${ApiConstant.deleteUser}?$queryString');

      log("Delete User Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.put(url, headers: headers, body: body);

      log("Delete User Status Code :: ${response.statusCode}");
      log("Delete User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        deleteUserCategory = DeleteModel.fromJson(jsonResponse);
      }

      Utils.showToast(Get.context!, deleteUserCategory?.message.toString() ?? "");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Delete User Api :: $e");
      Utils.showToast(Get.context!, deleteUserCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
