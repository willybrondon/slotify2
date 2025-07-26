import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ConfirmBookingController extends GetxController {
  dynamic args = Get.arguments;

  Color? color;
  Color? textColor;
  String? profileImage;
  String? name;
  String? services;
  String? price;
  String? avgRating;
  String? formattedDate;
  String? selectedSlotsList;

  @override
  void onInit() async {
    // await getDataFromArgs();

    super.onInit();
  }

  // getDataFromArgs() {
  //   if (args != null) {
  //     if (args[0] != null ||
  //         args[1] != null ||
  //         args[2] != null ||
  //         args[3] != null ||
  //         args[4] != null ||
  //         args[5] != null ||
  //         args[6] != null ||
  //         args[7] != null ||
  //         args[8] != null) {
  //       color = args[0];
  //       textColor = args[1];
  //       profileImage = args[2];
  //       name = args[3];
  //       services = args[4];
  //       price = args[5];
  //       avgRating = args[6];
  //       formattedDate = args[7];
  //       selectedSlotsList = args[8];
  //     }
  //
  //     log("Color :: $color");
  //     log("Text Color :: $textColor");
  //     log("Profile Image :: $profileImage");
  //     log("Name :: $name");
  //     log("Services :: $services");
  //     log("Price :: $price");
  //     log("Avg Rating :: $avgRating");
  //     log("Selected Date :: $formattedDate");
  //     log("Selected Slots :: $selectedSlotsList");
  //   }
  // }
}
