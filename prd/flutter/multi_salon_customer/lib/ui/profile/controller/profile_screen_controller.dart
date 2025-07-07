import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/profile/model/profile_model.dart';
import 'package:salon_2/ui/profile/model/raise_complain_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class ProfileScreenController extends GetxController {
  TextEditingController bookingIdController = TextEditingController();
  TextEditingController detailController = TextEditingController();

  //----------- API Variables -----------//
  ProfileModel? getUserCategory;
  RaiseComplainModel? raiseComplainCategory;
  RxBool isLoading = false.obs;

  //----------- API SERVICE -----------//

  @override
  void onInit() async {
    super.onInit();
    log("loginnnnnnn :: ${Constant.storage.read<bool>('isLogIn')}");
    Constant.storage.read<bool>('isLogIn') ?? false == true ? await onGetUserApiCall() : const Text("");
    Constant.storage.write('userImage', getUserCategory?.user?.image);
    Constant.storage.write('salonRequestSent', getUserCategory?.user?.salonRequestSent);

    if (getUserCategory?.status == false) {
      Utils.showToast(Get.context!, getUserCategory?.message ?? "");
    }
  }

  onGetUserApiCall({int? loginType}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);
      final queryParameters = {"userId": Constant.storage.read<String>('UserId') ?? ""};

      log("Get User Id :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getUser + queryString);
      log("Get User Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.get(url, headers: headers);

      log("Get User Status Code :: ${response.statusCode}");
      log("Get User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getUserCategory = ProfileModel.fromJson(jsonResponse);
        Constant.storage.write("UserEmail", getUserCategory?.user?.email ?? "");
        Constant.storage.write("UserName", getUserCategory?.user?.fname ?? "");
        Constant.storage.write("UserContactNumber", getUserCategory?.user?.mobile ?? 0);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.toString());
    } catch (e) {
      log("Error call Get User Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onRaiseComplainApiCall({String? userId, required String bookingId, String? details}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"userId": userId, "bookingId": bookingId, "details": details});

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
      unawaited(Utils.showToast(Get.context!, exception.message));
    } catch (e) {
      log("Error call Raise Complain Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
