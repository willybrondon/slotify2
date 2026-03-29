import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/branch_detail_screen/model/get_salon_detail_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/services.dart';

class BranchDetailController extends GetxController
    with GetSingleTickerProviderStateMixin {
  late TabController? tabController;
  int index = 0;
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
  String? localCity;
  double? localLatitude;
  double? localLongitude;
  /// From web deep link: pre-select this MongoDB service id on the venue / services step
  String? deepLinkServiceId;
  /// Optional: "At Salon" | "At Home" — applied on booking screen when user taps Book Now
  String? deepLinkVenuePreference;
  dynamic args = Get.arguments;
  late List<bool> isBranchSelected = List.generate(
      (getSalonDetailCategory?.salon?.serviceIds?.length ?? 0),
      (index) => false);

  var tabs = [
    Tab(child: Text("txtServices".tr)),
    Tab(child: Text("txtProduct".tr)),
    Tab(child: Text("txtStaff".tr)),
    Tab(child: Text("txtGallery".tr)),
    Tab(child: Text("txtReviews".tr)),
    Tab(child: Text("txtAbout".tr)),
  ];

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
    tabController = TabController(initialIndex: 0, length: 6, vsync: this);

    await getDataFromArgs();
    await onGetSalonDetailApiCall(
        salonId: salonId ?? "",
        latitude: localLatitude ?? 0.0,
        longitude: localLongitude ?? 0.0);
    _applyDeepLinkServicePreselection();

    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null) {
        salonId = args[0];
      }
      if (args.length > 1 && args[1] != null) {
        localCity = args[1];
      }
      if (args.length > 2 && args[2] != null) {
        localLatitude = args[2];
      }
      if (args.length > 3 && args[3] != null) {
        localLongitude = args[3];
      }
      if (args.length > 4 && args[4] != null) {
        final s = args[4].toString().trim();
        deepLinkServiceId = s.isEmpty ? null : s;
      }
      if (args.length > 5 && args[5] != null) {
        final v = args[5].toString().trim();
        deepLinkVenuePreference =
            (v == 'At Salon' || v == 'At Home') ? v : null;
      }
    }

    // Fallback to global values if not provided in arguments
    localCity ??= city;
    localLatitude ??= latitude;
    localLongitude ??= longitude;

    log("Branch Detail - Salon ID: $salonId");
    log("Branch Detail - City: $localCity");
    log("Branch Detail - Latitude: $localLatitude");
    log("Branch Detail - Longitude: $localLongitude");
    log("Branch Detail - deepLink serviceId: $deepLinkServiceId venue: $deepLinkVenuePreference");
  }

  /// After salon services load: select the service from web → app deep link (price bar + Book Now match website).
  void _applyDeepLinkServicePreselection() {
    final want = deepLinkServiceId;
    if (want == null || want.isEmpty) return;
    final services = getSalonDetailCategory?.salon?.serviceIds;
    if (services == null || services.isEmpty) return;
    final n = services.length;
    if (isBranchSelected.length != n) {
      isBranchSelected = List<bool>.generate(n, (_) => false);
    }
    for (int i = 0; i < n; i++) {
      final sid = services[i].serviceIdId?.id;
      if (sid != null &&
          sid.toString().toLowerCase() == want.toLowerCase()) {
        if (!isBranchSelected[i]) {
          onCheckBoxClick(true, i);
        }
        break;
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

  onCheckBoxClick(value, int index) {
    isBranchSelected[index] = value;

    num servicePrice =
        getSalonDetailCategory?.salon?.serviceIds?[index].price ?? 0.0;
    num taxPercentage = getSalonDetailCategory?.tax ?? 0.0;
    double withTaxRupee = (servicePrice * taxPercentage) / 100;

    if (isBranchSelected[index]) {
      withOutTaxRupee += servicePrice;
      totalPrice += (servicePrice + withTaxRupee);
      finalTaxRupee += withTaxRupee;
      totalMinute += getSalonDetailCategory
              ?.salon?.serviceIds?[index].serviceIdId?.duration ??
          0;
      checkItem.add(
          getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.name);
      serviceId.add(
          getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.id);

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
      totalMinute -= getSalonDetailCategory
              ?.salon?.serviceIds?[index].serviceIdId?.duration ??
          0;
      checkItem.remove(
          getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.name);
      serviceId.remove(
          getSalonDetailCategory?.salon?.serviceIds?[index].serviceIdId?.id);

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

  onGetSalonDetailApiCall(
      {required String salonId,
      required double latitude,
      required double longitude}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idServiceList]);

      final queryParameters = {
        "salonId": salonId,
        "latitude": latitude == 0.0 ? null : latitude.toString(),
        "longitude": longitude == 0.0 ? null : longitude.toString(),
        "city": localCity ?? "",
      };

      log("Get Salon Detail Params :: $queryParameters");
      log("Get Salon Detail - City being sent: '${localCity ?? ""}'");
      log("Get Salon Detail - Global city: '${city ?? ""}'");
      log("Get Salon Detail - Latitude: $latitude");
      log("Get Salon Detail - Longitude: $longitude");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getSalonDetail + queryString);

      log("Get Salon Detail Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Get Salon Detail Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Salon Detail StatusCode :: ${response.statusCode}");
      log("Get Salon Detail Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getSalonDetailCategory = GetSalonDetailModel.fromJson(jsonResponse);

        final n = getSalonDetailCategory?.salon?.serviceIds?.length ?? 0;
        if (isBranchSelected.length != n) {
          isBranchSelected = List<bool>.generate(n, (_) => false);
        }

        // Log the response data to see what services are returned
        if (getSalonDetailCategory?.salon?.serviceIds != null) {
          log("Get Salon Detail - Services found: ${getSalonDetailCategory?.salon?.serviceIds?.length ?? 0}");
          log("Get Salon Detail - Service names: ${getSalonDetailCategory?.salon?.serviceIds?.map((s) => s.serviceIdId?.name).toList()}");
        } else {
          log("Get Salon Detail - No services found in response");
        }
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Salon Detail Api :: $e");
      Utils.showToast(
          Get.context!, getSalonDetailCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idServiceList]);
    }
  }

  // Share URL for salon
  String? salonShareUrl;

  // Get salon share URL from backend
  Future<void> getSalonShareUrlApiCall() async {
    try {
      if (salonId == null || salonId!.isEmpty) {
        log("Get Salon Share URL - Salon ID is null or empty");
        return;
      }

      final queryParameters = {
        "salonId": salonId!,
      };

      log("Get Salon Share URL Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(
          ApiConstant.BASE_URL + ApiConstant.getSalonShareUrl + queryString);
      log("Get Salon Share URL Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };

      final response = await http.get(url, headers: headers);

      log("Get Salon Share URL Status Code :: ${response.statusCode}");
      log("Get Salon Share URL Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['status'] == true) {
          salonShareUrl = jsonResponse['shareUrl'];
          log("Get Salon Share URL - URL retrieved: $salonShareUrl");
        } else {
          log("Get Salon Share URL - Failed: ${jsonResponse['message']}");
        }
      }
    } on AppException catch (exception) {
      log("Get Salon Share URL - AppException: ${exception.message}");
    } catch (e) {
      log("Error call Get Salon Share URL Api :: $e");
    }
  }

  // Share salon link
  Future<void> shareSalonLink() async {
    try {
      // Get share URL if not already fetched
      if (salonShareUrl == null || salonShareUrl!.isEmpty) {
        await getSalonShareUrlApiCall();
      }

      if (salonShareUrl != null && salonShareUrl!.isNotEmpty) {
        final salonName = getSalonDetailCategory?.salon?.name ?? "Salon";
        final shareText = "Check out $salonName on Skedisy!\n\n$salonShareUrl";

        await Share.share(
          shareText,
          subject: "Check out $salonName",
        );
        log("Share Salon Link - Shared successfully: $salonShareUrl");
      } else {
        Utils.showToast(
            Get.context!, "Unable to generate share link. Please try again.");
        log("Share Salon Link - Share URL is null or empty");
      }
    } catch (e) {
      log("Error sharing salon link :: $e");
      Utils.showToast(Get.context!, "Error sharing salon link");
    }
  }

  // Copy salon link to clipboard
  Future<void> copySalonLink() async {
    try {
      // Get share URL if not already fetched
      if (salonShareUrl == null || salonShareUrl!.isEmpty) {
        await getSalonShareUrlApiCall();
      }

      if (salonShareUrl != null && salonShareUrl!.isNotEmpty) {
        await Clipboard.setData(ClipboardData(text: salonShareUrl!));
        Utils.showToast(Get.context!, "Link copied to clipboard!");
        log("Copy Salon Link - Copied: $salonShareUrl");
      } else {
        Utils.showToast(
            Get.context!, "Unable to generate share link. Please try again.");
        log("Copy Salon Link - Share URL is null or empty");
      }
    } catch (e) {
      log("Error copying salon link :: $e");
      Utils.showToast(Get.context!, "Error copying salon link");
    }
  }

  // Get share URL (for QR code generation)
  Future<String?> getShareUrl() async {
    if (salonShareUrl == null || salonShareUrl!.isEmpty) {
      await getSalonShareUrlApiCall();
    }
    return salonShareUrl;
  }
}
