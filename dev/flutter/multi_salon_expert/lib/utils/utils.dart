import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:url_launcher/url_launcher.dart';

class Utils {
  //----------TOAST------------//

  static showToast(BuildContext context, String msg,
      { ToastGravity gravity = ToastGravity.BOTTOM}) {
    return Fluttertoast.showToast(
      msg: msg,
      toastLength: Toast.LENGTH_LONG,
      gravity: gravity,
      backgroundColor: AppColors.toastBg,
      textColor: AppColors.toastText,
      fontSize: 15,
    );
  }

  static Future<void> launchURL(String value) async {
    var url = Uri.parse(value);
    if (await canLaunchUrl(url)) {
      launchUrl(url);
    } else {
      Utils.showToast(Get.context!, "Web page can't loaded");
      throw "Cannot load the page";
    }
  }

  static printLog(String tag, String str) {
    log("$tag -->> $str");
  }
}
