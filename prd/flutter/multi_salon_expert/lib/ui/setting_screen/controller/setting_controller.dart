import 'package:get/get.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/preference.dart';

class SettingController extends GetxController {
  LanguageModel? languagesChosenValue;
  String? prefLanguageCode;
  String? prefCountryCode;

  getLanguageData() {
    prefLanguageCode = Preference.shared.getString(Preference.selectedLanguage) ?? 'en';
    prefCountryCode = Preference.shared.getString(Preference.selectedCountryCode) ?? 'US';
    languagesChosenValue = languages
        .where(
            (element) => (element.languageCode == prefLanguageCode && element.countryCode == prefCountryCode))
        .toList()[0];
    update([Constant.idChangeLanguage]);
  }
}
