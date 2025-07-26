import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/add_new_address_screen/model/create_address_model.dart';
import 'package:salon_2/ui/add_new_address_screen/model/update_address_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class AddNewAddressController extends GetxController {
  final formKey = GlobalKey<FormState>();
  dynamic args = Get.arguments;
  bool isSetPrimary = false;

  String? country;
  String? state;
  String? city;

  String? firstName;
  String? lastName;
  String? address1;
  String? address2;
  String? zipCode;
  bool? isUpdate;
  bool? isSelect;
  String? addressId;

  TextEditingController firstNameController = TextEditingController();
  TextEditingController lastNameController = TextEditingController();
  TextEditingController zipCodeController = TextEditingController();
  TextEditingController addressLine1Controller = TextEditingController();
  TextEditingController addressLine2Controller = TextEditingController();

  @override
  void onInit() async {
    await getDataFromArgs();
    await setDataFromArgs();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null ||
          args[1] != null ||
          args[2] != null ||
          args[3] != null ||
          args[4] != null ||
          args[5] != null ||
          args[6] != null ||
          args[7] != null ||
          args[8] != null ||
          args[9] != null ||
          args[10] != null) {
        firstName = args[0];
        lastName = args[1];
        address1 = args[2];
        address2 = args[3];
        city = args[4];
        state = args[5];
        country = args[6];
        zipCode = args[7];
        isUpdate = args[8];
        isSetPrimary = args[9];
        addressId = args[10];
      }
      log("First Name :: $firstNameController");
      log("Last Name :: $lastName");
      log("Address 1 :: $address1");
      log("Address 2 :: $address2");
      log("City :: $city");
      log("State :: $state");
      log("Country :: $country");
      log("ZipCode :: $zipCode");
      log("Is update :: $isUpdate");
      log("Is Select :: $isSetPrimary");
      log("Address Id :: $addressId");
    }
    update([Constant.idProgressView]);
  }

  setDataFromArgs() {
    firstNameController.text = firstName ?? "";
    lastNameController.text = lastName ?? "";
    addressLine1Controller.text = address1 ?? "";
    addressLine2Controller.text = address2 ?? "";
    city = city ?? "";
    state = state ?? "";
    country = country ?? "";
    zipCodeController.text = zipCode ?? "";
  }

  onSelectAddress() {
    isSetPrimary = !isSetPrimary;
    update([Constant.idSetPrimary]);
  }

  onClickSaveAddress() async {
    if (formKey.currentState!.validate() || (country?.isEmpty == true) || (state?.isEmpty == true) || (city?.isEmpty == true)) {
      if (isUpdate == true) {
        await onUpdateAddressApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          addressId: addressId ?? "",
          name: "${firstNameController.text} ${lastNameController.text}",
          country: country ?? "",
          state: state ?? "",
          city: city ?? "",
          zipCode: zipCodeController.text,
          address: "${addressLine1Controller.text},${addressLine2Controller.text}",
          isSelected: isSetPrimary,
        );

        if (updateAddressModel?.status == true) {
          Utils.showToast(Get.context!, "Address updated successfully");
          Get.back();
        } else {
          Utils.showToast(Get.context!, updateAddressModel?.message ?? "");
        }
      } else {
        await onCreateAddressApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          name: "${firstNameController.text} ${lastNameController.text}",
          country: country ?? "",
          state: state ?? "",
          city: city ?? "",
          zipCode: zipCodeController.text,
          address: "${addressLine1Controller.text},${addressLine2Controller.text}",
          isSelected: isSetPrimary,
        );

        if (createAddressModel?.status == true) {
          Utils.showToast(Get.context!, "Address created successfully");
          Get.back();
        } else {
          Utils.showToast(Get.context!, createAddressModel?.message ?? "");
        }
      }
    } else {
      Utils.showToast(Get.context!, "Please enter all details");
    }
  }

  //----------- API Variables -----------//
  CreateAddressModel? createAddressModel;
  UpdateAddressModel? updateAddressModel;
  RxBool isLoading = false.obs;

  onCreateAddressApiCall({
    required String userId,
    required String name,
    required String country,
    required String state,
    required String city,
    required String zipCode,
    required String address,
    required bool isSelected,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({
        "userId": userId,
        "name": name,
        "country": country,
        "state": state,
        "city": city,
        "zipCode": zipCode,
        "address": address,
        "isSelected": isSelected,
      });

      log("Create Booking Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.createAddress);
      log("Create Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Create Booking Status Code :: ${response.statusCode}");
      log("Create Booking Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        createAddressModel = CreateAddressModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Create Booking Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onUpdateAddressApiCall({
    required String userId,
    required String addressId,
    required String name,
    required String country,
    required String state,
    required String city,
    required String zipCode,
    required String address,
    required bool isSelected,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {"addressId": addressId};

      String queryString = Uri(queryParameters: queryParameters).query;

      log("Update Address Params :: $queryParameters");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.updateAddress + queryString);
      log("Update Address Url :: $url");

      final body = json.encode({
        "userId": userId,
        "name": name,
        "country": country,
        "state": state,
        "city": city,
        "zipCode": zipCode,
        "address": address,
        "isSelected": isSelected,
      });

      log("Update Address Body :: $body");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.patch(url, headers: headers, body: body);

      log("Update Address Status Code :: ${response.statusCode}");
      log("Update Address Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        updateAddressModel = UpdateAddressModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Update Address Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
