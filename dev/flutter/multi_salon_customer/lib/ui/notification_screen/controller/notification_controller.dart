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
    onGetNotificationApiCall(
        userId: Constant.storage.read<String>('userId') ?? "");
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

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getAllNotification + queryString);

      log("Get All Notification Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
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

  onDeleteNotificationApiCall(
      {required String notificationId,
      required String userId,
      required int index}) async {
    try {
      // Validate inputs
      if (notificationId.isEmpty || userId.isEmpty) {
        Utils.showToast(Get.context!, "desInvalidNotificationData".tr);
        return;
      }

      // Show loading state
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "notificationId": notificationId,
        "userId": userId,
      };

      log("Delete Notification Parameters :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.deleteNotification + queryString);

      log("Delete Notification Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Delete Notification Headers :: $headers");

      final response = await http.delete(url, headers: headers);

      log("Delete Notification StatusCode :: ${response.statusCode}");
      log("Delete Notification Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['status'] == true) {
          // Remove notification from local list
          if (notificationCategory?.notification != null) {
            // Find the notification by ID instead of index (more reliable)
            final notificationIndex = notificationCategory!.notification!
                .indexWhere((notif) => notif.id == notificationId);

            if (notificationIndex != -1) {
              notificationCategory!.notification!.removeAt(notificationIndex);
              update([Constant.idProgressView]);
              Utils.showToast(
                  Get.context!,
                  jsonResponse['message'] ??
                      "desNotificationDeletedSuccess".tr);
            } else {
              // If not found by ID, try using the provided index
              if (index < notificationCategory!.notification!.length) {
                notificationCategory!.notification!.removeAt(index);
                update([Constant.idProgressView]);
                Utils.showToast(
                    Get.context!,
                    jsonResponse['message'] ??
                        "desNotificationDeletedSuccess".tr);
              } else {
                // Refresh the list if index is out of bounds
                log("Index out of bounds, refreshing notification list");
                await onGetNotificationApiCall(userId: userId);
                Utils.showToast(
                    Get.context!,
                    jsonResponse['message'] ??
                        "desNotificationDeletedSuccess".tr);
              }
            }
          } else {
            // Refresh the list if notification list is null
            await onGetNotificationApiCall(userId: userId);
            Utils.showToast(Get.context!,
                jsonResponse['message'] ?? "desNotificationDeletedSuccess".tr);
          }
        } else {
          Utils.showToast(Get.context!,
              jsonResponse['message'] ?? "desNotificationDeleteFailed".tr);
        }
      } else {
        // Handle non-200 status codes
        try {
          final jsonResponse = jsonDecode(response.body);
          Utils.showToast(Get.context!,
              jsonResponse['message'] ?? "desNotificationDeleteFailed".tr);
        } catch (e) {
          Utils.showToast(
              Get.context!, "desNotificationDeleteFailed".tr);
        }
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Delete Notification Api :: $e");
      Utils.showToast(
          Get.context!, "desErrorDeletingNotification".tr + ": ${e.toString()}");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
