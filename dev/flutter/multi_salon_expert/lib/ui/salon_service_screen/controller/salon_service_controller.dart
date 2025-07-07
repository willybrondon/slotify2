import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/login_screen/model/get_profile_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SalonServiceController extends GetxController {
  LoginScreenController loginScreenController = Get.put(LoginScreenController());

  @override
  void onInit() {
    loginScreenController.onGetExpertApiCall(expertId: Constant.storage.read<String>("expertId").toString());
    super.onInit();
  }

// //----------- API Variables -----------//
//   GetProfileModel? getExpertCategory;
//   RxBool isLoading = false.obs;
//
//   onGetExpertApiCall({required String expertId}) async {
//     try {
//       isLoading(true);
//       update([Constant.idProgressView]);
//
//       final queryParameters = {"expertId": expertId};
//       log("Get Expert Params :: $queryParameters");
//       String queryString = Uri(queryParameters: queryParameters).query;
//
//       final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getExpert + queryString);
//       log("Get Expert Url :: $url");
//
//       final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
//       log("Get Expert Headers :: $headers");
//
//       final response = await http.get(url, headers: headers);
//
//       log("Get Expert StatusCode :: ${response.statusCode}");
//       log("Get Expert Body :: ${response.body}");
//
//       if (response.statusCode == 200) {
//         final jsonResponse = jsonDecode(response.body);
//         getExpertCategory = GetProfileModel.fromJson(jsonResponse);
//       }
//     } on AppException catch (exception) {
//       Utils.showToast(Get.context!, exception.message);
//     } catch (e) {
//       log("Error call Get Expert Api :: $e");
//       Utils.showToast(Get.context!, "$e");
//     } finally {
//       isLoading(false);
//       update([Constant.idProgressView]);
//     }
//   }
}
