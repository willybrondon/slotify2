import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/model/get_country_model.dart';
import 'package:salon_2/ui/splash_screen/model/setting_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SplashController extends GetxController {
  //----------- API Variables -----------//
  SettingModel? settingCategory;
  GetCountryModel? getCountryModel;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    await onGetCountryApiCall();
    getDialCode();
    await onSettingApiCall();
    super.onInit();
  }

  void syncGlobalsFromSettings() {
    final setting = settingCategory?.setting;
    if (setting == null) return;

    currencyName = setting.currencyName;
    currency = setting.currencySymbol;
    tnc = setting.tnc;
    privacyPolicyLink = setting.privacyPolicyLink;
    flutterWaveKey = setting.flutterWaveKey;
    razorPayId = setting.razorPayId;
    stripePublishableKey = setting.stripePublishableKey;
    stripeSecretKey = setting.stripeSecretKey;
    isStripePay = setting.isStripePay;
    isRazorPay = setting.isRazorPay;
    isFlutterWave = setting.isFlutterWave;
    isWalletPay = setting.isWalletPay;
    adminCommissionCharges = setting.adminCommissionCharges;
    cancelOrderCharges = setting.cancelOrderCharges;

    log("Settings synced — Stripe: $isStripePay, Wallet: $isWalletPay, MTN: ${setting.isMtnMomo}");
  }

  void _notifyDependentControllers() {
    if (Get.isRegistered<BookingScreenController>()) {
      Get.find<BookingScreenController>()
          .syncPaymentMethodsAfterSettingsRefresh();
    }
  }

  /// Fetch latest platform settings (payment toggles, currency, etc.).
  Future<bool> refreshSettings({bool showLoading = false}) async {
    try {
      if (showLoading) {
        isLoading(true);
        update([Constant.idProgressView, Constant.idSettingsRefresh]);
      }

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.setting);
      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
      };

      final response = await http.get(url, headers: headers);

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        settingCategory = SettingModel.fromJson(jsonResponse);
        syncGlobalsFromSettings();
        update();
        update([Constant.idProgressView, Constant.idSettingsRefresh]);
        _notifyDependentControllers();
        return settingCategory?.status == true;
      }
    } on AppException catch (exception) {
      log("Error refresh settings: ${exception.message}");
    } catch (e) {
      log("Error refresh settings: $e");
    } finally {
      if (showLoading) {
        isLoading(false);
        update([Constant.idProgressView, Constant.idSettingsRefresh]);
      }
    }
    return false;
  }

  onGetCountryApiCall() async {
    try {
      isLoading(true);
      update([Constant.idGetCountry]);

      final url = Uri.parse("http://ip-api.com/json");
      log("Get Country Url :: $url");

      final headers = {'Content-Type': 'application/json'};
      log("Get Country Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Country Status Code :: ${response.statusCode}");
      log("Get Country Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getCountryModel = GetCountryModel.fromJson(jsonResponse);

        country = getCountryModel?.country;
        countryCode = getCountryModel?.countryCode;
        city = getCountryModel?.city;
        log("The Country Name :: $country");
        log("The Country Code :: $countryCode");
        log("The City Name :: $city");
      }

      log("Get Country Api Call Successful");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Country Api :: $e");
      Utils.showToast(Get.context!, '$e');
    } finally {
      isLoading(false);
      update([Constant.idGetCountry]);
    }
  }

  onSettingApiCall() async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idSettingsRefresh]);

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.setting);

      log("Setting Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json'
      };
      log("Setting Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Setting StatusCode :: ${response.statusCode}");
      log("Setting Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        settingCategory = SettingModel.fromJson(jsonResponse);
        log("Settings loaded successfully. Status: ${settingCategory?.status}");
        syncGlobalsFromSettings();
        update();
        update([Constant.idProgressView, Constant.idSettingsRefresh]);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Setting Api :: $e");
    } finally {
      isLoading(false);
      update();
      update([Constant.idProgressView, Constant.idSettingsRefresh]);
    }
  }
}
