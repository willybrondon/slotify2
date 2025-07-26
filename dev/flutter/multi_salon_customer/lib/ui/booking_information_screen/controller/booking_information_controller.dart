import 'dart:convert';
import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/ui/booking_information_screen/model/get_booking_information_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:url_launcher/url_launcher.dart';

class BookingInformationController extends GetxController {
  String? bookingId;
  TextEditingController reviewEditingController = TextEditingController();

  //----------- API Variables -----------//
  GetBookingInformationModel? getBookingInformationCategory;
  RxBool isLoading = false.obs;

  dynamic args = Get.arguments;

  @override
  void onInit() async {
    await getDataFromArgs();
    await onGetBookingInformationApiCall(bookingId: bookingId!);
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        bookingId = args[0];
      }
    }
  }

  makingPhoneCall() async {
    var url = Uri.parse("tel:${getBookingInformationCategory?.booking?.salonId?.mobile}");
    await launchUrl(url);
  }

  launchMaps() async {
    var googleUrl = Uri.parse(
        "https://www.google.com/maps/dir/?api=1&destination=${getBookingInformationCategory?.booking?.salonId?.locationCoordinates?.latitude},${getBookingInformationCategory?.booking?.salonId?.locationCoordinates?.longitude}");
    await launchUrl(googleUrl);
  }

  onGetBookingInformationApiCall({required String bookingId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final queryParameters = {
        "bookingId": bookingId,
      };

      log("Get Booking Information Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getBookingInformation + queryString);

      log("Get Booking Information Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Booking Information Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Booking Information StatusCode :: ${response.statusCode}");
      log("Get Booking Information Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getBookingInformationCategory = GetBookingInformationModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
      log("Get Booking Information Api Exception :: $exception");
    } catch (e) {
      log("Error call Get Booking Information Api :: $e");
      Utils.showToast(Get.context!, "$e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
