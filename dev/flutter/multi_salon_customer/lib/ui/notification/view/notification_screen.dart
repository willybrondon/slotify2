// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/notification/controller/notification_controller.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/shimmer.dart';

class NotificationScreen extends StatelessWidget {
  NotificationScreen({super.key});

  NotificationController notificationController = Get.find<NotificationController>();

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Get.find<BottomBarController>().onClick(0);
        return false;
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(70),
          child: AppBar(
            backgroundColor: AppColors.primaryAppColor,
            automaticallyImplyLeading: false,
            centerTitle: true,
            title: Text(
              "txtNotification".tr,
              style: TextStyle(fontFamily: FontFamily.sfProDisplayBold, fontSize: 20, color: AppColors.whiteColor),
            ).paddingOnly(top: 30),
          ),
        ),
        body: GetBuilder<NotificationController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return logic.isLoading.value
                ? Shimmers.notificationShimmer()
                : logic.notificationCategory?.notification?.isEmpty ?? true
                    ? Column(
                        children: [
                          Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(height: Get.height * 0.3),
                                Image.asset(AppAsset.icNoNotification, height: 150, width: 150),
                                Text(
                                  "txtNoNotifications".tr,
                                  style: TextStyle(
                                      fontFamily: FontFamily.sfProDisplayBold, fontSize: 20, color: AppColors.primaryTextColor),
                                ),
                                SizedBox(height: Get.height * 0.005),
                                Text(
                                  "desNotification".tr,
                                  style:
                                      TextStyle(fontFamily: FontFamily.sfProDisplayRegular, fontSize: 14, color: AppColors.email),
                                ),
                              ],
                            ),
                          ),
                        ],
                      )
                    : SingleChildScrollView(
                        child: Column(
                          children: [
                            AnimationLimiter(
                              child: ListView.builder(
                                itemCount: logic.notificationCategory?.notification?.length ?? 0,
                                padding: const EdgeInsets.all(10),
                                physics: const BouncingScrollPhysics(),
                                shrinkWrap: true,
                                scrollDirection: Axis.vertical,
                                itemBuilder: (context, index) {
                                  logic.str = logic.notificationCategory?.notification?[index].date;
                                  logic.parts = logic.str?.split(', ');
                                  logic.date = logic.parts?[0];
                                  logic.time = logic.parts![1].trim();

                                  log("date :: ${logic.date}");
                                  log("time :: ${logic.time}");

                                  ///Remove AM-PM
                                  logic.timeParts = logic.time?.split(':');
                                  logic.hour = logic.timeParts?[0];
                                  logic.minute = logic.timeParts?[1].split(' ')[0];
                                  logic.formattedTime = '${logic.hour}:${logic.minute}';

                                  log("Formatted time: ${logic.formattedTime}");

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.notificationCategory?.notification?.length ?? 0,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: Container(
                                          height: 83,
                                          width: Get.width,
                                          decoration: BoxDecoration(
                                              color: AppColors.whiteColor,
                                              border: Border.all(
                                                color: AppColors.grey.withOpacity(0.1),
                                                width: 1,
                                              ),
                                              borderRadius: BorderRadius.circular(15)),
                                          margin: const EdgeInsets.only(bottom: 10),
                                          padding: const EdgeInsets.only(right: 10),
                                          child: Row(
                                            children: [
                                              DottedBorder(
                                                color: AppColors.roundBorder,
                                                borderType: BorderType.RRect,
                                                radius: const Radius.circular(35),
                                                strokeWidth: 1,
                                                dashPattern: const [2.5, 2.5],
                                                child: Container(
                                                  height: 55,
                                                  width: 55,
                                                  decoration: const BoxDecoration(shape: BoxShape.circle),
                                                  clipBehavior: Clip.hardEdge,
                                                  child: CachedNetworkImage(
                                                    imageUrl: logic.notificationCategory?.notification?[index].image ?? "",
                                                    fit: BoxFit.cover,
                                                    placeholder: (context, url) {
                                                      return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                                    },
                                                    errorWidget: (context, url, error) {
                                                      return Image.asset(AppAsset.icImagePlaceholder).paddingAll(10);
                                                    },
                                                  ),
                                                ),
                                              ).paddingOnly(left: 10, right: 10),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                  children: [
                                                    Text(
                                                      logic.notificationCategory?.notification?[index].title ?? "",
                                                      style: TextStyle(
                                                          color: AppColors.primaryTextColor,
                                                          fontSize: 16,
                                                          fontFamily: FontFamily.sfProDisplayBold),
                                                    ).paddingOnly(bottom: 4),
                                                    SizedBox(
                                                      width: Get.width * 0.85,
                                                      child: Text(
                                                        logic.notificationCategory?.notification?[index].message ?? "",
                                                        maxLines: 2,
                                                        style: TextStyle(
                                                          color: AppColors.service,
                                                          fontSize: 13,
                                                          fontFamily: FontFamily.sfProDisplayMedium,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Align(
                                                alignment: Alignment.bottomRight,
                                                child: Text(
                                                  "${logic.date}  ${logic.formattedTime}",
                                                  style: TextStyle(
                                                      color: AppColors.roundBorder,
                                                      fontSize: 10,
                                                      fontFamily: FontFamily.sfProDisplay),
                                                ).paddingOnly(bottom: 3),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            )
                          ],
                        ),
                      );
          },
        ),
      ),
    );
  }
}
