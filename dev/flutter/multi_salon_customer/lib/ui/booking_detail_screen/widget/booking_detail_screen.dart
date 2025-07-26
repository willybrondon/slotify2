// ignore_for_file: must_be_immutable

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/booking_detail_screen/controller/booking_detail_screen_controller.dart';
import 'package:salon_2/ui/booking_detail_screen/widget/cancel_booking_screen.dart';
import 'package:salon_2/ui/booking_detail_screen/widget/complete_booking_screen.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/ui/booking_detail_screen/widget/pending_booking_screen.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';

class BookingDetailScreen extends StatelessWidget {
  final BookingDetailScreenController bookingDetailScreenController = Get.put(BookingDetailScreenController());

  BookingDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        body: Column(
          children: [
            Stack(
              children: [
                Container(
                  height: Get.height * 0.18,
                  width: double.infinity,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.primaryAppColor,
                  ),
                  child: Text(
                    "txtBooking".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      fontSize: 20,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ),
                GetBuilder<BookingDetailScreenController>(
                  id: Constant.idProgressView,
                  builder: (logic) {
                    return Container(
                      height: 50,
                      width: double.infinity,
                      margin: EdgeInsets.only(top: Get.height * 0.14, left: 16, right: 16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: AppColors.whiteColor,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.blackColor.withOpacity(0.02),
                            offset: const Offset(
                              0.0,
                              1.0,
                            ),
                            blurRadius: 5.0,
                            spreadRadius: 2.0,
                          ),
                          const BoxShadow(
                            color: Colors.black12,
                            offset: Offset(0.0, 0.0),
                            blurRadius: 0.0,
                            spreadRadius: 0.0,
                          ),
                        ],
                      ),
                      child: TextFieldCustom(
                        hintText: "txtSearchBooking".tr,
                        obscureText: false,
                        prefixIcon: Padding(
                          padding: const EdgeInsets.all(13.0),
                          child: Image.asset(
                            AppAsset.icSearch,
                            height: 22,
                            width: 22,
                            color: AppColors.greyColor,
                          ),
                        ),
                        suffixIcon: Image.asset(
                          AppAsset.icSearch,
                          height: 0,
                          width: 0,
                          color: AppColors.transparent,
                        ),
                        width: 0,
                        height: 0,
                        textInputAction: TextInputAction.done,
                        controller: logic.bookingDetailScreenEditingController,
                        onEditingComplete: () async {
                          FocusScopeNode currentFocus = FocusScope.of(context);
                          if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
                            currentFocus.focusedChild?.unfocus();
                          }

                          if (logic.tabController?.index == 0) {
                            logic.startPending = 0;
                            logic.getPending = [];
                            await logic.onGetAllBookingApiCall(
                              userId: Constant.storage.read<String>('userId') ?? "",
                              status: "pending",
                              start: logic.startPending.toString(),
                              limit: logic.limitPending.toString(),
                            );
                          }

                          if (logic.tabController?.index == 1) {
                            logic.startCancel = 0;
                            logic.getCancel = [];
                            await logic.onGetAllBookingApiCall(
                              userId: Constant.storage.read<String>('userId') ?? "",
                              status: "cancel",
                              start: logic.startCancel.toString(),
                              limit: logic.limitCancel.toString(),
                            );
                          }

                          if (logic.tabController?.index == 2) {
                            logic.startCompleted = 0;
                            logic.getComplete = [];
                            await logic.onGetAllBookingApiCall(
                              userId: Constant.storage.read<String>('userId') ?? "",
                              status: "completed",
                              start: logic.startCompleted.toString(),
                              limit: logic.limitCompleted.toString(),
                            );
                          }
                        },
                        onChanged: (text) {
                          logic.printLatestValue(text?.trim().toString());
                          return null;
                        },
                      ),
                    );
                  },
                ),
              ],
            ),
            GetBuilder<BookingDetailScreenController>(
              id: Constant.idChangeTab,
              builder: (logic) {
                return TabBar(
                  controller: logic.tabController,
                  tabs: tabs,
                  labelStyle: const TextStyle(
                    fontSize: 16,
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                  ),
                  physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  indicatorPadding: const EdgeInsets.all(5),
                  indicator: BoxDecoration(borderRadius: BorderRadius.circular(55), color: AppColors.primaryAppColor),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: AppColors.whiteColor,
                  unselectedLabelStyle: const TextStyle(
                    fontFamily: AppFontFamily.sfProDisplayRegular,
                    fontSize: 15,
                  ),
                  isScrollable: false,
                  unselectedLabelColor: AppColors.service,
                  dividerColor: Colors.transparent,
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                );
              },
            ),
            Expanded(
              child: GetBuilder<BookingDetailScreenController>(
                builder: (logic) {
                  return TabBarView(
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    controller: logic.tabController,
                    children: [
                      PendingBookingScreen(),
                      const CancelBookingScreen(),
                      CompleteBookingScreen(),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  var tabs = [
    Tab(text: "txtPending".tr),
    Tab(text: "txtCancelled".tr),
    Tab(text: "txtCompleted".tr),
  ];
}
