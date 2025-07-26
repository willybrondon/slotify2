import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/main.dart';
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

    currencyName = settingCategory?.setting?.currencyName;
    currency = settingCategory?.setting?.currencySymbol;
    tnc = settingCategory?.setting?.tnc;
    privacyPolicyLink = settingCategory?.setting?.privacyPolicyLink;
    flutterWaveKey = settingCategory?.setting?.flutterWaveKey;
    razorPayId = settingCategory?.setting?.razorPayId;
    stripePublishableKey = settingCategory?.setting?.stripePublishableKey;
    stripeSecretKey = settingCategory?.setting?.stripeSecretKey;
    isStripePay = settingCategory?.setting?.isStripePay;
    isRazorPay = settingCategory?.setting?.isRazorPay;
    isFlutterWave = settingCategory?.setting?.isFlutterWave;
    adminCommissionCharges = settingCategory?.setting?.adminCommissionCharges;
    cancelOrderCharges = settingCategory?.setting?.cancelOrderCharges;

    log("Currency Name :: $currencyName");
    log("Currency :: $currency");
    log("T&C :: $tnc");
    log("Privacy Policy Link :: $privacyPolicyLink");
    log("Flutter Wave Key :: $flutterWaveKey");
    log("Razor Pay Id :: $razorPayId");
    log("Stripe Publishable Key :: $stripePublishableKey");
    log("Stripe Secret Key :: $stripeSecretKey");
    log("Is StripePay :: $isStripePay");
    log("Is RazorPay :: $isRazorPay");
    log("is FlutterWave :: $isFlutterWave");
    log("Admin Commission Charges :: $adminCommissionCharges");
    log("Cancel Order Charges :: $cancelOrderCharges");
    super.onInit();
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
      update([Constant.idProgressView]);

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.setting);

      log("Setting Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Setting Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Setting StatusCode :: ${response.statusCode}");
      log("Setting Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        settingCategory = SettingModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Setting Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }
}
