import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/localization/localizations_delegate.dart';
import 'package:salon_2/ui/setting/model/delete_model.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

import '../../../utils/preference.dart';

class SettingController extends GetxController {
  LanguageModel? languagesChosenValue;
  String? prefLanguageCode;
  String? prefCountryCode;
  //----------- API Variables -----------//
  DeleteModel? deleteUserCategory;
  RxBool isLoading = false.obs;

  //------------ API Services ------------//

  onDeleteUserApiCall({required String userId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({"userId": userId});

      log("Delete User Body :: $body");

      final queryParameters = {
        "userId": Constant.storage.read<String>('UserId') ?? "",
      };

      log("Delete User Id :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse('${ApiConstant.BASE_URL}${ApiConstant.deleteUser}?$queryString');

      log("Delete User Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.put(url, headers: headers, body: body);

      log("Delete User Status Code :: ${response.statusCode}");
      log("Delete User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        deleteUserCategory = DeleteModel.fromJson(jsonResponse);
      }

      Utils.showToast(Get.context!, deleteUserCategory?.message.toString() ?? "");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Delete User Api :: $e");
      Utils.showToast(Get.context!, deleteUserCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
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
}
