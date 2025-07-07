import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/edit_profile/model/edit_profile_model.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/payment_method/model/select_payment_type_model.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class PaymentMethodController extends GetxController {
  int currentIndex = Constant.storage.read<int>("paymentType")!;

  TextEditingController bankNameController = TextEditingController();
  TextEditingController acNumberController = TextEditingController();
  TextEditingController ifscController = TextEditingController();
  TextEditingController branchNameController = TextEditingController();
  TextEditingController upiController = TextEditingController();
  ExpansionTileController expansionTileBankController = ExpansionTileController();
  ExpansionTileController expansionTileUpiController = ExpansionTileController();
  LoginScreenController loginScreenController = Get.find<LoginScreenController>();

  //----------- API Variables -----------//
  SelectPaymentTypeModel? selectPaymentTypeCategory;
  EditProfileModel? editBankDetailCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    log("Enter Payment Method Controller");

    super.onInit();

    bankNameController.text = Constant.storage.read<String>("bankName").toString();
    acNumberController.text = Constant.storage.read<String>("accountNumber").toString();
    ifscController.text = Constant.storage.read<String>("IFSCCode").toString();
    branchNameController.text = Constant.storage.read<String>("branchName").toString();
    upiController.text = Constant.storage.read<String>("upiId").toString();
  }

  onSelectPayment(int index) async {
    currentIndex = index;
    index = currentIndex;
    log("currentIndex :: $currentIndex");
    update([Constant.idSelectPayment]);
  }

  onSelectPaymentTypeApiCall({required String expertId, required String paymentType}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"expertId": expertId, "paymentType": paymentType};

      log("Select Payment Type Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.paymentType + queryString);
      log("Select Payment Type Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.put(url, headers: headers);

      log("Select Payment Type Status Code :: ${response.statusCode}");
      log("Select Payment Type Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        selectPaymentTypeCategory = SelectPaymentTypeModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Select Payment Type Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onUpdateUserApiCall({
    String? bankName,
    String? accountNumber,
    String? ifscCode,
    String? branchName,
    String? upiId,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"expertId": Constant.storage.read<String>("expertId").toString()};

      log("Update User Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final body = json.encode(
          {"bankName": bankName, "accountNumber": accountNumber, "IFSCCode": ifscCode, "branchName": branchName, "upiId": upiId});

      log("Update User Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.updateProfile + queryString);
      log("Update User Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.patch(url, headers: headers, body: body);

      log("Update User Status Code :: ${response.statusCode}");
      log("Update User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        editBankDetailCategory = EditProfileModel.fromJson(jsonResponse);
      }
      log("Update User Api Call SuccessFully..!");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Update User Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
