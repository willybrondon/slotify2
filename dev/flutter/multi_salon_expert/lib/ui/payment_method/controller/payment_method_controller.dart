import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/payment_method/model/get_payment_details_model.dart';
import 'package:salon_2/ui/payment_method/model/get_withdraw_method_model.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/payment_method/model/update_withdraw_method_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class PaymentMethodController extends GetxController {
  bool isLoading = false;
  List<GetWithdrawMethod> withdrawMethods = [];
  List<TextEditingController> withdrawPaymentDetails = [];
  List<String> withdrawDetails = [];
  int? selectedPaymentMethod;
  bool isShowPaymentMethod = false;
  bool isWithdrawDetailsEmpty = false;
  String? paymentMethodName;

  @override
  void onInit() async {
    await onGetWithdrawMethods();
    await onGetPaymentDetailsApiCall();

    if (withdrawMethods.isNotEmpty) {
      selectedPaymentMethod = 0;
      paymentMethodName = withdrawMethods[0].name;
      withdrawPaymentDetails =
          List<TextEditingController>.generate(withdrawMethods[0].details?.length ?? 0, (counter) => TextEditingController());

      populateWithdrawPaymentDetails();

      update([Constant.idChangePaymentMethod, Constant.idGetWithdrawMethods]);
    }

    super.onInit();
  }

  Future<void> onWithdraw() async {
    List<Map<String, dynamic>> paymentMethods = [];

    for (int i = 0; i < withdrawMethods.length; i++) {
      List<String> details = [];

      if (i == selectedPaymentMethod) {
        for (int j = 0; j < (withdrawMethods[i].details?.length ?? 0); j++) {
          details.add("${withdrawMethods[i].details?[j]}: ${withdrawPaymentDetails[j].text}");
        }
      } else {
        for (var paymentDetail in getPaymentDetailsModel?.data?.paymentMethods ?? []) {
          if (paymentDetail.paymentGateway == withdrawMethods[i].name) {
            details = paymentDetail.paymentDetails ?? [];
            break;
          }
        }
      }

      paymentMethods.add({
        "paymentGateway": withdrawMethods[i].name ?? "",
        "paymentDetails": details,
      });
    }

    Map<String, dynamic> data = {
      "expertId": Constant.storage.read("expertId"),
      "paymentMethods": paymentMethods,
    };

    log("Withdraw Data :: $data");

    log("withdrawPaymentDetails.isEmpty ::${withdrawPaymentDetails.isEmpty}");

    for (int i = 0; i < withdrawMethods.length; i++) {
      if (withdrawPaymentDetails[i].text.isEmpty) {
        Utils.showToast(Get.context!, "Please enter details !!");
      } else {
        await onUpdateWithdrawMethodApiCall(withdrawDetail: data);
        await onGetPaymentDetailsApiCall();

        Utils.showToast(Get.context!, "Withdraw method updated successfully");
        Get.back();
      }
    }
  }

  void populateWithdrawPaymentDetails() {
    if (getPaymentDetailsModel?.data?.paymentMethods != null) {
      for (var method in getPaymentDetailsModel!.data!.paymentMethods!) {
        if (method.paymentGateway == paymentMethodName) {
          for (int i = 0; i < method.paymentDetails!.length; i++) {
            withdrawPaymentDetails[i].text = method.paymentDetails![i].split(': ').last;
          }
          break;
        }
      }
    }
  }

  Future<void> onGetWithdrawMethods() async {
    isLoading = true;
    getWithdrawMethodModel = await onGetWithdrawMethodApiCall();
    if (getWithdrawMethodModel?.data != null) {
      withdrawMethods.addAll(getWithdrawMethodModel?.data ?? []);
      isLoading = false;
      update([Constant.idGetWithdrawMethods]);
    }
  }

  Future<void> onSwitchWithdrawMethod() async {
    isShowPaymentMethod = !isShowPaymentMethod;
    update([Constant.idSwitchWithdrawMethod, Constant.idChangePaymentMethod, Constant.idGetWithdrawMethods]);
  }

  Future<void> onChangePaymentMethod({required int index, required String name}) async {
    selectedPaymentMethod = index;
    paymentMethodName = name;
    if (isShowPaymentMethod) {
      onSwitchWithdrawMethod();
    }

    withdrawPaymentDetails =
        List<TextEditingController>.generate(withdrawMethods[index].details?.length ?? 0, (counter) => TextEditingController());

    populateWithdrawPaymentDetails();

    update([Constant.idChangePaymentMethod, Constant.idGetWithdrawMethods]);
  }

  /// =================== API Calling =================== ///
  GetWithdrawMethodModel? getWithdrawMethodModel;
  UpdateWithdrawMethodModel? updateWithdrawMethodModel;
  GetPaymentDetailsModel? getPaymentDetailsModel;

  Future<GetWithdrawMethodModel?> onGetWithdrawMethodApiCall() async {
    try {
      isLoading = true;
      update([Constant.idProgressView, Constant.idGetWithdrawMethods]);

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getWithdrawMethod);
      log("Get Withdraw Method Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Withdraw Method Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Withdraw Method Status Code :: ${response.statusCode}");
      log("Get Withdraw Method Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        return GetWithdrawMethodModel.fromJson(jsonResponse);
      }

      log("Get Withdraw Method Api Call Successful");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Withdraw Method Api :: $e");
    } finally {
      isLoading = false;
      update([Constant.idProgressView, Constant.idGetWithdrawMethods]);
    }
    return null;
  }

  onUpdateWithdrawMethodApiCall({required Map<String, dynamic> withdrawDetail}) async {
    try {
      isLoading = true;
      update([Constant.idProgressView]);

      final body = json.encode(withdrawDetail);

      log("Update Withdraw Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.updateWithdrawMethod);
      log("Update Withdraw Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Update Withdraw Headers :: $headers");

      final response = await http.post(url, headers: headers, body: body);

      log("Update Withdraw Status Code :: ${response.statusCode}");
      log("Update Withdraw Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        updateWithdrawMethodModel = UpdateWithdrawMethodModel.fromJson(jsonResponse);
      }
      log("Update Withdraw Api Called Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Update Withdraw Api :: $e");
    } finally {
      isLoading = false;
      update([Constant.idProgressView]);
    }
  }

  onGetPaymentDetailsApiCall() async {
    try {
      isLoading = true;
      update([Constant.idProgressView]);

      final queryParameters = {
        "expertId": Constant.storage.read("expertId").toString(),
      };

      log("Get Payment Details Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getPaymentDetails + queryString);
      log("Get Payment Details Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Payment Details Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Payment Details Status Code :: ${response.statusCode}");
      log("Get Payment Details Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getPaymentDetailsModel = GetPaymentDetailsModel.fromJson(jsonResponse);
      }

      log("Get Payment Details Api Call Successfully");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Payment Details Api :: $e");
    } finally {
      isLoading = false;
      update([Constant.idProgressView]);
    }
  }
}
