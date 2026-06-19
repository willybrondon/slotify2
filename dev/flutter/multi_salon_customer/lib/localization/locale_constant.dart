import 'dart:developer';
import 'dart:ui';

import '../utils/constant.dart';
import '../utils/preference.dart';

const _supportedLanguages = {'en', 'fr'};

Future<Locale> getLocale() async {
  String languageCode =
      Preference.shared.getString(Preference.selectedLanguage) ?? Constant.languageDefault;
  String countryCode =
      Preference.shared.getString(Preference.selectedCountryCode) ?? Constant.countryCodeDefault;
  log('getLocale Updated $languageCode   $countryCode');
  return _locale(languageCode, countryCode);
}

Locale _locale(String languageCode, String countryCode) {
  if (!_supportedLanguages.contains(languageCode)) {
    languageCode = Constant.languageDefault;
    countryCode = Constant.countryCodeDefault;
  }
  if (languageCode == 'en') {
    return const Locale('en', 'US');
  }
  return const Locale('fr', 'FR');
}
