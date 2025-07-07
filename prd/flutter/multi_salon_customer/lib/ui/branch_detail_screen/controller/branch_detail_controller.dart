import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/branch_detail_screen/model/get_salon_detail_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:url_launcher/url_launcher.dart';

class BranchDetailController extends GetxController with GetSingleTickerProviderStateMixin {
  late TabController? tabController;
  double totalPrice = 0.0;
  int totalMinute = 0;
  double? withTaxRupee;
  double withOutTaxRupee = 0.0;
  double finalTaxRupee = 0.0;
  List serviceId = [];
  List checkItem = [];
  num? rating;
  int? roundedRating;
  int? filledStars;
  String? salonId;
  dynamic args = Get.arguments;
  late List<bool> isBranchSelected = List.generate((getSalonDetailCategory!.salon!.serviceIds!.length), (index) => false);

  //------ Split Time Variables ------//
  String? str;
  List? parts;
  String? date;
  String? time;

  //----------- API Variables -----------//
  GetSalonDetailModel? getSalonDetailCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    tabController = TabController(initialIndex: 0, length: 4, vsync: this);

    await getDataFromArgs();
    await onGetSalonDetailApiCall(salonId: salonId ?? "", latitude: latitude ?? 0.0, longitude: longitude ?? 0.0);
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        salonId = args[0];
      }
    }
  }

  makingPhoneCall() async {
    var url = Uri.parse("tel:${getSalonDetailCategory?.salon?.mobile}");
    await launchUrl(url);
  }

  launchMaps() async {
    var googleUrl = Uri.parse(
        "https://www.google.com/maps/dir/?api=1&destination=${getSalonDetailCategory?.salon?.locationCoordinates?.latitude},${getSalonDetailCategory?.salon?.locationCoordinates?.longitude}");
    await launchUrl(googleUrl);
  }

  var tabs = [
    const Tab(text: "Services"),
    const Tab(text: "Staff"),
    const Tab(text: "Reviews"),
    const Tab(text: "About"),
  ];

  onCheckBoxClick(value, int index) {
    isBranchSelected[index] = value;

    num servicePrice = getSalonDetailCategory?.salon?.serviceIds?[index].price ?? 0.0;
    num taxPercentage = getSalonDetailCategory?.tax ?? 0.0;
    double withTaxRupee = (servicePrice * taxPercentage) / 100;

    if (isBranchSelected[index]) {
      withOutTaxRupee += servicePrice;
      totalPrice += (servicePrice + withTaxRupee);
      finalTaxRupee += withTaxRupee;
      totalMinute += getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.duration ?? 0;
      checkItem.add(getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.name);
      serviceId.add(getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.id);

      log("Branch Details add WithOutTaxRupee :: $withOutTaxRupee");
      log("Branch Details add Total Price :: $totalPrice");
      log("Branch Details add FinalTaxRupee :: $finalTaxRupee");
      log("Branch Details add Total Minute :: $totalMinute");
      log("Branch Details add Check Item :: $checkItem");
      log("Branch Details add Service Id :: $serviceId");
    } else {
      withOutTaxRupee -= servicePrice;
      totalPrice -= (servicePrice + withTaxRupee);
      finalTaxRupee -= withTaxRupee;
      totalMinute -= getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.duration ?? 0;
      checkItem.remove(getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.name);
      serviceId.remove(getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.id);

      log("Branch Details Minus WithOutTaxRupee :: $withOutTaxRupee");
      log("Branch Details Minus Total Price :: $totalPrice");
      log("Branch Details Minus FinalTaxRupee :: $finalTaxRupee");
      log("Branch Details Minus Total Minute :: $totalMinute");
      log("Branch Details Minus Check Item :: $checkItem");
      log("Branch Details Minus Service Id :: $serviceId");
    }

    totalPrice = 0.0;
    for (int i = 0; i < isBranchSelected.length; i++) {
      if (isBranchSelected[i]) {
        num price = getSalonDetailCategory?.salon?.serviceIds?[i].price ?? 0.0;
        double tax = (price * taxPercentage) / 100;
        totalPrice += (price + tax);
      }
    }

    log("Final Branch Details Total Price :: $totalPrice");

    update([Constant.idServiceList, Constant.idBottomService]);
  }

  //------------ API Services ------------//

  onGetSalonDetailApiCall({required String salonId, required double latitude, required double longitude}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idServiceList]);

      final queryParameters = {
        "salonId": salonId,
        "latitude": latitude == 0.0 ? null : latitude.toString(),
        "longitude": longitude == 0.0 ? null : longitude.toString()
      };

      log("Get Salon Detail Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getSalonDetail + queryString);

      log("Get Salon Detail Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Salon Detail Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Salon Detail StatusCode :: ${response.statusCode}");
      log("Get Salon Detail Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getSalonDetailCategory = GetSalonDetailModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Salon Detail Api :: $e");
      Utils.showToast(Get.context!, getSalonDetailCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idServiceList]);
    }
  }
}
