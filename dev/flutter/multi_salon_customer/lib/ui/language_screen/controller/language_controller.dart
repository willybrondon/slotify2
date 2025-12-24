import 'dart:ui';
import 'package:get/get.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/preference.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/main.dart' as main;

class LanguageController extends GetxController {
  int checkedValue = Constant.storage.read<int>('checkedValue') ?? 3;
  LanguageModel? languagesChosenValue;

  String? prefLanguageCode;
  String? prefCountryCode;

  @override
  void onInit() {
    getLanguageData();
    super.onInit();
  }

  getLanguageData() {
    prefLanguageCode = Preference.shared.getString(Preference.selectedLanguage) ?? 'en';
    prefCountryCode = Preference.shared.getString(Preference.selectedCountryCode) ?? 'US';
    languagesChosenValue = languages
        .where(
            (element) => (element.languageCode == prefLanguageCode && element.countryCode == prefCountryCode))
        .toList()[0];
    update([Constant.idChangeLanguage]);
  }

  onLanguageSave() async {
    Preference.shared.setString(Preference.selectedLanguage, languagesChosenValue!.languageCode);
    Preference.shared.setString(Preference.selectedCountryCode, languagesChosenValue!.countryCode);
    Get.updateLocale(Locale(languagesChosenValue!.languageCode, languagesChosenValue!.countryCode));
    
    // Reload categories and services with new language
    try {
      if (Get.isRegistered<HomeScreenController>()) {
        final homeController = Get.find<HomeScreenController>();
        // Clear existing data to force reload
        homeController.getAllCategory = null;
        homeController.getAllServiceCategory = null;
        // Reload with new language
        await homeController.onGetAllCategoryApiCall();
        // Get city from main.dart global variable
        await homeController.onGetAllServiceApiCall(city: main.city ?? "");
      }
    } catch (e) {
      // Silently handle errors - language change should still work
      print("Error reloading data after language change: $e");
    }
    
    Get.back();
  }

  onChangeLanguage(LanguageModel value, int index) {
    languagesChosenValue = value;

    checkedValue = index;

    Constant.storage.write('checkedValue', checkedValue);

    update([Constant.idChangeLanguage]);
  }
}
