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
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';

class BookingScreen extends StatelessWidget {
  BookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final BookingScreenController bookingScreenController = Get.find<BookingScreenController>();
    LoginScreenController loginScreenController = Get.put(LoginScreenController());
    double statusBarHeight = MediaQuery.of(context).padding.top;

    log("bookingScreenController.isCheckOut${bookingScreenController.isSwitchOn}");
    log("loginScreenController.emailController.text${loginScreenController.emailController.text}");

    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.find<BottomBarController>().onClick(0);
        if (didPop) {
          return;
        }
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
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "${"txtHello".tr}, ${Constant.storage.read<String>('fName').toString()}",
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo800,
                              fontSize: 23,
                              color: AppColors.whiteColor,
                            ),
                          ),
                          Text(
                            "txtWelcomeService".tr,
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                            style: TextStyle(
                              fontFamily: AppFontFamily.heeBo400,
                              fontSize: 15,
                              color: AppColors.whiteColor,
                            ),
                          ),
                        ],
                      ),
                      // Image.asset(AppAsset.icNotificationFilled, height: 40)
                    ],
                  ).paddingOnly(bottom: 8)
                ],
              ).paddingOnly(left: 18, right: 18),
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
                    fontFamily: AppFontFamily.heeBo800,
                    color: AppColors.primaryTextColor,
                    fontSize: 22,
                  ),
                ),
              ),
              GetBuilder<BookingScreenController>(
                builder: (logic) {
                  return TabBar(
                    tabAlignment: TabAlignment.start,
                    controller: logic.tabController,
                    tabs: tabs,
                    labelStyle: const TextStyle(
                      fontSize: 15,
                      fontFamily: AppFontFamily.heeBo500,
                    ),
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    indicator: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: AppColors.primaryAppColor,
                    ),
                    indicatorPadding: const EdgeInsets.all(5),
                    indicatorSize: TabBarIndicatorSize.tab,
                    labelColor: AppColors.whiteColor,
                    isScrollable: true,
                    unselectedLabelColor: AppColors.service,
                    dividerColor: Colors.transparent,
                  );
                },
              ),
              Divider(color: AppColors.greyColor.withOpacity(0.2)),
              Expanded(
                child: GetBuilder<BookingScreenController>(
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
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  var tabs = [
    Tab(text: "txtPendingOrder".tr),
    Tab(text: "txtCancelOrder".tr),
    Tab(text: "txtCompletedOrder".tr),
  ];
}
