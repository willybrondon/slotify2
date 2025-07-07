// ignore_for_file: must_be_immutable


import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/booking_screen/widget/cancel_order.dart';
import 'package:salon_2/ui/booking_screen/widget/complete_order.dart';
import 'package:salon_2/ui/booking_screen/widget/pending_order.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';

class BookingScreen extends StatelessWidget {
  BookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();
    LoginScreenController loginScreenController = Get.put(LoginScreenController());
    double statusBarHeight = MediaQuery.of(context).padding.top;

    log("bookingScreenController.isCheckOut${bookingScreenController.isCheckOut}");
    log("loginScreenController.emailController.text${loginScreenController.emailController.text}");

    return WillPopScope(
      onWillPop: () async {
        Get.find<BottomBarController>().onClick(0);
        return false;
      },
      child: Scaffold(
          appBar: PreferredSize(
            preferredSize: const Size.fromHeight(100),
            child: AppBar(
              automaticallyImplyLeading: false,
              backgroundColor: AppColors.transparent,
              flexibleSpace: Container(
                height: 90 + statusBarHeight,
                width: double.infinity,
                color: AppColors.primaryAppColor,
                padding: EdgeInsets.only(top: statusBarHeight),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Row(
                    children: [
                      GetBuilder<LoginScreenController>(
                        id: Constant.idProgressView,
                        builder: (logic) {
                          return Container(
                            margin: const EdgeInsets.only(left: 15, right: 10),
                            height: 55,
                            width: 55,
                            decoration: BoxDecoration(
                              border: Border.all(width: 0.8, color: AppColors.whiteColor),
                              shape: BoxShape.circle,
                            ),
                            padding: const EdgeInsets.all(2),
                            child: CircleAvatar(
                              radius: 35,
                              backgroundImage: NetworkImage(
                                Constant.storage.read("hostImage") ??
                                    "${ApiConstant.BASE_URL}static/media/male.459a8699b07b4b9bf3d6.png",
                              ),
                            ),
                          );
                        },
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "${"txtHello".tr}, ${Constant.storage.read<String>('fName').toString()} 👋",
                            style: TextStyle(
                              fontFamily: FontFamily.sfProDisplayBold,
                              fontSize: 18,
                              color: AppColors.whiteColor,
                            ),
                          ),
                          Text(
                            "txtWelcomeService".tr,
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                            style: TextStyle(
                              fontFamily: FontFamily.sfProDisplayRegular,
                              fontSize: 15,
                              color: AppColors.whiteColor,
                            ),
                          ),
                        ],
                      )
                    ],
                  ).paddingOnly(bottom: 13)
                ]),
              ),
            ),
          ),
          backgroundColor: AppColors.backGround,
          body: Container(
            color: AppColors.whiteColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Container(
                    margin: const EdgeInsets.only(left: 13),
                    child: Text(
                      "txtBookingDetails".tr,
                      style: TextStyle(
                          fontFamily: FontFamily.sfProDisplayBold,
                          color: AppColors.primaryTextColor,
                          fontSize: 22),
                    )),
                GetBuilder<BookingScreenController>(
                  builder: (logic) {
                    return TabBar(
                      tabAlignment: TabAlignment.start,
                      controller: logic.tabController,
                      tabs: tabs,
                      labelStyle: const TextStyle(
                        fontSize: 13,
                        fontFamily: FontFamily.sfProDisplayMedium,
                      ),
                      physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 5),
                      indicator: BoxDecoration(
                          borderRadius: BorderRadius.circular(45), color: AppColors.primaryAppColor),
                      indicatorPadding: const EdgeInsets.all(5),
                      indicatorSize: TabBarIndicatorSize.tab,
                      labelColor: AppColors.whiteColor,
                      isScrollable: true,
                      unselectedLabelColor: AppColors.service,
                      dividerColor: Colors.transparent,
                    );
                  },
                ),
                Expanded(child: GetBuilder<BookingScreenController>(
                  builder: (logic) {
                    return TabBarView(
                      controller: logic.tabController,
                      physics: const BouncingScrollPhysics(),
                      children: [
                        PendingOrder(),
                        CancelOrder(),
                        CompleteOrder(),
                      ],
                    );
                  },
                ))
              ],
            ),
          )),
    );
  }

  var tabs = [
    Tab(text: "    ${"txtPendingOrder".tr}    "),
    Tab(text: "    ${"txtCancelOrder".tr}    "),
    Tab(text: "    ${"txtCompletedOrder".tr}    "),
  ];
}
