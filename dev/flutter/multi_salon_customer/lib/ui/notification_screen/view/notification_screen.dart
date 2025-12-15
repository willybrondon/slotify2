// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar_screen/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/view/sign_in_screen.dart';
import 'package:salon_2/ui/notification_screen/controller/notification_controller.dart';
import 'package:salon_2/ui/notification_screen/widget/notification_widget.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/shimmer.dart';

class NotificationScreen extends StatelessWidget {
  NotificationScreen({super.key});

  NotificationController notificationController =
      Get.find<NotificationController>();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) {
        Get.find<BottomBarController>().onClick(0);
        if (didPop) {
          return;
        }
      },
      child: GetBuilder<LoginScreenController>(
          id: Constant.idBookingAndLogin,
          builder: (logic) {
            logic.isUpdate = Constant.storage.read<bool>('isUpdate') ?? false;
            logic.isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;

            log("is LogIn :: ${Constant.storage.read<bool>('isLogIn')}");
            log("is Update :: ${Constant.storage.read<bool>('isUpdate')}");
            log("is LogIn Variable :: ${logic.isLogIn}");
            log("is Update Variable :: ${logic.isUpdate}");

            return Scaffold(
              backgroundColor: AppColors.backGround,
              body: logic.isLogIn != true
                  ? SignInScreen()
                  : Column(
                      children: [
                        const NotificationTopView(),
                        Expanded(
                          child: GetBuilder<NotificationController>(
                            id: Constant.idProgressView,
                            builder: (logic) {
                              return logic.isLoading.value
                                  ? Shimmers.notificationShimmer()
                                  : logic.notificationCategory?.notification
                                              ?.isEmpty ??
                                          true
                                      ? Column(
                                          children: [
                                            Center(
                                              child: Column(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                children: [
                                                  SizedBox(
                                                      height: Get.height * 0.3),
                                                  Image.asset(
                                                      AppAsset.icNoNotification,
                                                      height: 150,
                                                      width: 150),
                                                  Text(
                                                    "txtNoNotifications".tr,
                                                    style: TextStyle(
                                                        fontFamily: AppFontFamily
                                                            .sfProDisplayBold,
                                                        fontSize: 20,
                                                        color: AppColors
                                                            .primaryTextColor),
                                                  ),
                                                  SizedBox(
                                                      height:
                                                          Get.height * 0.005),
                                                  Text(
                                                    "desNotification".tr,
                                                    style: TextStyle(
                                                        fontFamily: AppFontFamily
                                                            .sfProDisplayRegular,
                                                        fontSize: 14,
                                                        color: AppColors.email),
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
                                                  itemCount: logic
                                                          .notificationCategory
                                                          ?.notification
                                                          ?.length ??
                                                      0,
                                                  padding:
                                                      const EdgeInsets.all(10),
                                                  physics:
                                                      const BouncingScrollPhysics(),
                                                  shrinkWrap: true,
                                                  scrollDirection:
                                                      Axis.vertical,
                                                  itemBuilder:
                                                      (context, index) {
                                                    logic.str = logic
                                                        .notificationCategory
                                                        ?.notification?[index]
                                                        .date;
                                                    logic.parts =
                                                        logic.str?.split(', ');
                                                    logic.date =
                                                        logic.parts?[0];
                                                    logic.time =
                                                        logic.parts![1].trim();

                                                    log("date :: ${logic.date}");
                                                    log("time :: ${logic.time}");

                                                    ///Remove AM-PM
                                                    logic.timeParts =
                                                        logic.time?.split(':');
                                                    logic.hour =
                                                        logic.timeParts?[0];
                                                    logic.minute = logic
                                                        .timeParts?[1]
                                                        .split(' ')[0];
                                                    logic.formattedTime =
                                                        '${logic.hour}:${logic.minute}';

                                                    log("Formatted time: ${logic.formattedTime}");

                                                    final notificationId = logic
                                                            .notificationCategory
                                                            ?.notification?[
                                                                index]
                                                            .id ??
                                                        "";
                                                    final userId = Constant
                                                            .storage
                                                            .read<String>(
                                                                'userId') ??
                                                        "";

                                                    return AnimationConfiguration
                                                        .staggeredGrid(
                                                      position: index,
                                                      duration: const Duration(
                                                          milliseconds: 800),
                                                      columnCount: logic
                                                              .notificationCategory
                                                              ?.notification
                                                              ?.length ??
                                                          0,
                                                      child: SlideAnimation(
                                                        child: FadeInAnimation(
                                                          child: Dismissible(
                                                            key: Key(
                                                                notificationId),
                                                            direction:
                                                                DismissDirection
                                                                    .endToStart,
                                                            background:
                                                                Container(
                                                              alignment: Alignment
                                                                  .centerRight,
                                                              padding:
                                                                  const EdgeInsets
                                                                      .only(
                                                                      right:
                                                                          20),
                                                              decoration:
                                                                  BoxDecoration(
                                                                color:
                                                                    Colors.red,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            15),
                                                              ),
                                                              child: const Icon(
                                                                Icons.delete,
                                                                color: Colors
                                                                    .white,
                                                                size: 30,
                                                              ),
                                                            ),
                                                            onDismissed:
                                                                (direction) {
                                                              logic
                                                                  .onDeleteNotificationApiCall(
                                                                notificationId:
                                                                    notificationId,
                                                                userId: userId,
                                                                index: index,
                                                              );
                                                            },
                                                            child: Container(
                                                              width: Get.width,
                                                              decoration:
                                                                  BoxDecoration(
                                                                      color: AppColors
                                                                          .whiteColor,
                                                                      border:
                                                                          Border
                                                                              .all(
                                                                        color: AppColors
                                                                            .grey
                                                                            .withOpacity(0.1),
                                                                        width:
                                                                            1,
                                                                      ),
                                                                      borderRadius:
                                                                          BorderRadius.circular(
                                                                              15)),
                                                              margin:
                                                                  const EdgeInsets
                                                                      .only(
                                                                      bottom:
                                                                          10),
                                                              padding:
                                                                  const EdgeInsets
                                                                      .only(
                                                                      right: 10,
                                                                      top: 7,
                                                                      bottom:
                                                                          7),
                                                              child: Row(
                                                                children: [
                                                                  DottedBorder(
                                                                    color: AppColors
                                                                        .roundBorder,
                                                                    borderType:
                                                                        BorderType
                                                                            .RRect,
                                                                    radius: const Radius
                                                                        .circular(
                                                                        35),
                                                                    strokeWidth:
                                                                        1,
                                                                    dashPattern: const [
                                                                      2.5,
                                                                      2.5
                                                                    ],
                                                                    child:
                                                                        Container(
                                                                      height:
                                                                          55,
                                                                      width: 55,
                                                                      decoration:
                                                                          const BoxDecoration(
                                                                              shape: BoxShape.circle),
                                                                      clipBehavior:
                                                                          Clip.hardEdge,
                                                                      child:
                                                                          CachedNetworkImage(
                                                                        imageUrl:
                                                                            logic.notificationCategory?.notification?[index].image ??
                                                                                "",
                                                                        fit: BoxFit
                                                                            .cover,
                                                                        placeholder:
                                                                            (context,
                                                                                url) {
                                                                          return Image.asset(AppAsset.icImagePlaceholder)
                                                                              .paddingAll(10);
                                                                        },
                                                                        errorWidget: (context,
                                                                            url,
                                                                            error) {
                                                                          return Image.asset(AppAsset.icImagePlaceholder)
                                                                              .paddingAll(10);
                                                                        },
                                                                      ),
                                                                    ),
                                                                  ).paddingOnly(
                                                                      left: 10,
                                                                      right:
                                                                          10),
                                                                  Expanded(
                                                                    child:
                                                                        Column(
                                                                      crossAxisAlignment:
                                                                          CrossAxisAlignment
                                                                              .start,
                                                                      mainAxisAlignment:
                                                                          MainAxisAlignment
                                                                              .center,
                                                                      children: [
                                                                        Text(
                                                                          logic.notificationCategory?.notification?[index].title ??
                                                                              "",
                                                                          style: TextStyle(
                                                                              color: AppColors.primaryTextColor,
                                                                              fontSize: 16,
                                                                              fontFamily: AppFontFamily.sfProDisplayBold),
                                                                        ).paddingOnly(
                                                                            bottom:
                                                                                4),
                                                                        SizedBox(
                                                                          width:
                                                                              Get.width * 0.6,
                                                                          child:
                                                                              Text(
                                                                            logic.notificationCategory?.notification?[index].message ??
                                                                                "",
                                                                            maxLines:
                                                                                2,
                                                                            style:
                                                                                TextStyle(
                                                                              color: AppColors.service,
                                                                              fontSize: 13,
                                                                              fontFamily: AppFontFamily.sfProDisplayMedium,
                                                                              overflow: TextOverflow.ellipsis,
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      ],
                                                                    ),
                                                                  ),
                                                                  Column(
                                                                    crossAxisAlignment:
                                                                        CrossAxisAlignment
                                                                            .end,
                                                                    mainAxisAlignment:
                                                                        MainAxisAlignment
                                                                            .spaceBetween,
                                                                    children: [
                                                                      // Delete button
                                                                      GestureDetector(
                                                                        onTap:
                                                                            () {
                                                                          // Show confirmation dialog
                                                                          Get.dialog(
                                                                            AlertDialog(
                                                                              title: Text(
                                                                                "Delete Notification",
                                                                                style: TextStyle(
                                                                                  fontFamily: AppFontFamily.sfProDisplayBold,
                                                                                  fontSize: 18,
                                                                                  color: AppColors.primaryTextColor,
                                                                                ),
                                                                              ),
                                                                              content: Text(
                                                                                "Are you sure you want to delete this notification?",
                                                                                style: TextStyle(
                                                                                  fontFamily: AppFontFamily.sfProDisplay,
                                                                                  fontSize: 14,
                                                                                  color: AppColors.primaryTextColor,
                                                                                ),
                                                                              ),
                                                                              actions: [
                                                                                TextButton(
                                                                                  onPressed: () => Get.back(),
                                                                                  child: Text(
                                                                                    "Cancel",
                                                                                    style: TextStyle(
                                                                                      fontFamily: AppFontFamily.sfProDisplay,
                                                                                      fontSize: 14,
                                                                                      color: AppColors.primaryTextColor,
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                                TextButton(
                                                                                  onPressed: () {
                                                                                    Get.back();
                                                                                    logic.onDeleteNotificationApiCall(
                                                                                      notificationId: notificationId,
                                                                                      userId: userId,
                                                                                      index: index,
                                                                                    );
                                                                                  },
                                                                                  child: Text(
                                                                                    "Delete",
                                                                                    style: TextStyle(
                                                                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                                                                      fontSize: 14,
                                                                                      color: Colors.red,
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                              ],
                                                                            ),
                                                                          );
                                                                        },
                                                                        child:
                                                                            Container(
                                                                          padding: const EdgeInsets
                                                                              .all(
                                                                              8),
                                                                          decoration:
                                                                              BoxDecoration(
                                                                            color:
                                                                                Colors.red.withOpacity(0.1),
                                                                            shape:
                                                                                BoxShape.circle,
                                                                          ),
                                                                          child:
                                                                              Icon(
                                                                            Icons.delete_outline,
                                                                            color:
                                                                                Colors.red,
                                                                            size:
                                                                                20,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                      // Date and time
                                                                      Text(
                                                                        "${logic.date}  ${logic.formattedTime}",
                                                                        style: TextStyle(
                                                                            color: AppColors
                                                                                .roundBorder,
                                                                            fontSize:
                                                                                10,
                                                                            fontFamily:
                                                                                AppFontFamily.sfProDisplay),
                                                                      ).paddingOnly(
                                                                          top:
                                                                              4,
                                                                          bottom:
                                                                              3),
                                                                    ],
                                                                  ).paddingOnly(
                                                                      right: 5),
                                                                ],
                                                              ),
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
                      ],
                    ),
            );
          }),
    );
  }
}
