import 'dart:ui';

import 'package:get/get.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/preference.dart';

class LanguageController extends GetxController {
  int checkedValue = 0;
  LanguageModel? languagesChosenValue;

  String? prefLanguageCode;
  String? prefCountryCode;

  @override
  void onInit() {
    getLanguageData();
    super.onInit();
  }

  getLanguageData() {
    prefLanguageCode = Preference.shared.getString(Preference.selectedLanguage) ?? 'fr';
    prefCountryCode = Preference.shared.getString(Preference.selectedCountryCode) ?? 'FR';
    final matchingLanguages = languages
        .where(
          (element) =>
              element.languageCode == prefLanguageCode &&
              element.countryCode == prefCountryCode,
        )
        .toList();
    if (matchingLanguages.isNotEmpty) {
      languagesChosenValue = matchingLanguages[0];
      checkedValue = languages.indexWhere(
        (l) =>
            l.languageCode == prefLanguageCode &&
            l.countryCode == prefCountryCode,
      );
      if (checkedValue < 0) checkedValue = 0;
    } else {
      final defaultIndex = languages.indexWhere(
        (l) => l.languageCode == 'fr' && l.countryCode == 'FR',
      );
      languagesChosenValue =
          defaultIndex >= 0 ? languages[defaultIndex] : languages.first;
      checkedValue = defaultIndex >= 0 ? defaultIndex : 0;
    }
    Constant.storage.write('checkedValue', checkedValue);
    update([Constant.idChangeLanguage]);
  }

  onLanguageSave() {
    Preference.shared.setString(Preference.selectedLanguage, languagesChosenValue!.languageCode);
    Preference.shared.setString(Preference.selectedCountryCode, languagesChosenValue!.countryCode);
    Get.updateLocale(Locale(languagesChosenValue!.languageCode, languagesChosenValue!.countryCode));
    Get.back();
  }

  onChangeLanguage(LanguageModel value, int index) {
    languagesChosenValue = value;

    checkedValue = index;

    Constant.storage.write('checkedValue', checkedValue);

    update([Constant.idChangeLanguage]);
  }
}
