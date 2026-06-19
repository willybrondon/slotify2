import 'package:get/get.dart';
import 'package:salon_2/language/english_language.dart';
import 'package:salon_2/language/french_language.dart';

class AppLanguages extends Translations {
  @override
  Map<String, Map<String, String>> get keys => {
        'en_US': enUS,
        'fr_FR': frFR,
      };
}

final List<LanguageModel> languages = [
  LanguageModel('🇫🇷', 'Français', 'fr', 'FR'),
  LanguageModel('🇺🇸', 'English', 'en', 'US'),
];

class LanguageModel {
  LanguageModel(
    this.symbol,
    this.language,
    this.languageCode,
    this.countryCode,
  );

  String language;
  String symbol;
  String countryCode;
  String languageCode;
}
