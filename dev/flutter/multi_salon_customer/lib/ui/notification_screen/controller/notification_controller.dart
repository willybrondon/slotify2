import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import 'package:salon_2/ui/notification_screen/model/notification_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class NotificationController extends GetxController {
  //----------- API Variables -----------//
  NotificationModel? notificationCategory;
  RxBool isLoading = false.obs;

  String? str;
  List? parts;
  String? date;
  String? time;
  List<String>? timeParts;
  String? hour;
  String? minute;
  String? formattedTime;

  @override
  void onInit() {
    log("Enter Notification Controller");
    onGetNotificationApiCall(userId: Constant.storage.read<String>('userId') ?? "");
    super.onInit();
  }

  onGetNotificationApiCall({required String userId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
      };

      log("userId :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getAllNotification + queryString);

      log("Get All Notification Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get All Notification Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get All Notification StatusCode :: ${response.statusCode}");
      log("Get All Notification Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        notificationCategory = NotificationModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get All Notification Api :: $e");
      // Utils.showToast(Get.context!, notificationCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idServiceList]);
    }
  }
}
