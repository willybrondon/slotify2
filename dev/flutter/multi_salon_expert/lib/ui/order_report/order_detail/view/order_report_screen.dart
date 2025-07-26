// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/order_report/order_detail/controller/order_report_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class OrderReportScreen extends StatefulWidget {
  const OrderReportScreen({super.key});

  @override
  State<OrderReportScreen> createState() => _OrderReportScreenState();
}

class _OrderReportScreenState extends State<OrderReportScreen> {
  var tabs = [
    Tab(text: "txtToday".tr),
    Tab(text: "txtYesterday".tr),
    Tab(text: "txtThisWeek".tr),
    Tab(text: "txtThisMonth".tr),
  ];

  @override
  Widget build(BuildContext context) {
    LoginScreenController loginScreenController = Get.put(LoginScreenController());
    double statusBarHeight = MediaQuery.of(context).padding.top;

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
        backgroundColor: AppColors.whiteColor,
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
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.only(left: 13, bottom: 5),
              child: Text(
                "txtOrderDetails".tr,
                style: TextStyle(
                  fontFamily: AppFontFamily.heeBo800,
                  color: AppColors.primaryTextColor,
                  fontSize: 22,
                ),
              ),
            ),
            GetBuilder<OrderReportController>(
              builder: (logic) {
                return TabBar(
                  tabAlignment: TabAlignment.start,
                  controller: logic.tabController,
                  tabs: tabs,
                  labelStyle: const TextStyle(
                    fontSize: 15,
                    fontFamily: AppFontFamily.heeBo500,
                  ),
                  physics: const BouncingScrollPhysics(),
                  indicatorPadding: const EdgeInsets.all(4),
                  indicator: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    color: AppColors.primaryAppColor,
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: AppColors.whiteColor,
                  isScrollable: true,
                  unselectedLabelColor: AppColors.service,
                  dividerColor: Colors.transparent,
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                ).paddingOnly(left: 13);
              },
            ),
            Divider(color: AppColors.greyColor.withOpacity(0.15)).paddingOnly(top: 5, bottom: 10),
            GetBuilder<OrderReportController>(
              builder: (logic) {
                return Expanded(
                  child: TabBarView(
                    controller: logic.tabController,
                    physics: const BouncingScrollPhysics(),
                    children: List.generate(
                      4,
                      (index) => OrderReportTabView(
                        indexTabView: index,
                      ),
                    ),
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }
}

class OrderReportTabView extends StatelessWidget {
  int? indexTabView;

  OrderReportTabView({this.indexTabView, super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<OrderReportController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return RefreshIndicator(
          color: AppColors.primaryAppColor,
          onRefresh: () async {
            await logic.onChangeTabBar(indexTabView!);
          },
          child: logic.isLoading.value == true
              ? Shimmers.orderDetailShimmer()
              : logic.getBookingStatusWiseCategory?.data?.isEmpty ?? true
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Image.asset(AppAsset.icNoService, height: 155, width: 155),
                          Text(
                            "txtNoData".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayMedium,
                              fontSize: 20,
                              color: AppColors.primaryTextColor,
                            ),
                          ),
                        ],
                      ),
                    )
                  : InkWell(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                        child: GetBuilder<OrderReportController>(
                          id: Constant.idOrderReportTabView,
                          builder: (logic) {
                            return AnimationLimiter(
                              child: ListView.separated(
                                scrollDirection: Axis.vertical,
                                shrinkWrap: true,
                                padding: EdgeInsets.zero,
                                physics: const BouncingScrollPhysics(),
                                itemCount: logic.getBookingStatusWiseCategory?.data?.length ?? 0,
                                itemBuilder: (context, index) {
                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getBookingStatusWiseCategory?.data?.length ?? 0,
                                    child: SlideAnimation(
                                      child: FadeInAnimation(
                                        child: InkWell(
                                          onTap: () {
                                            Get.toNamed(
                                              AppRoutes.viewDetail,
                                              arguments: [
                                                logic.getBookingStatusWiseCategory?.data?[index] ?? [],
                                                logic.getBookingStatusWiseCategory?.reviews ?? [],
                                              ],
                                            );
                                          },
                                          child: Container(
                                            width: double.infinity,
                                            margin: const EdgeInsets.only(left: 5, right: 5),
                                            padding: const EdgeInsets.only(bottom: 10),
                                            decoration: BoxDecoration(
                                              color: AppColors.whiteColor,
                                              border: Border.all(
                                                width: 1,
                                                color: AppColors.grey.withOpacity(0.1),
                                              ),
                                              borderRadius: BorderRadius.circular(18),
                                              boxShadow: Constant.boxShadow,
                                            ),
                                            child: Stack(
                                              children: [
                                                Align(
                                                  alignment: Alignment.topRight,
                                                  child: GestureDetector(
                                                    onLongPress: () {
                                                      String bookingId =
                                                          logic.getBookingStatusWiseCategory!.data![index].bookingId ?? "";
                                                      FlutterClipboard.copy(bookingId);
                                                      Utils.showToast(Get.context!, "Copied $bookingId");
                                                      log("Copy Booking ID :: $bookingId");
                                                    },
                                                    child: Container(
                                                      height: 30,
                                                      width: Get.width * 0.2,
                                                      alignment: Alignment.center,
                                                      decoration: BoxDecoration(
                                                        borderRadius: const BorderRadius.only(
                                                          bottomLeft: Radius.circular(15),
                                                          topRight: Radius.circular(12),
                                                        ),
                                                        color: AppColors.bgTime,
                                                      ),
                                                      child: Text(
                                                        "#${logic.getBookingStatusWiseCategory!.data![index].bookingId}",
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          fontFamily: AppFontFamily.heeBo500,
                                                          color: AppColors.idTextColor,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                  children: [
                                                    Row(
                                                      children: [
                                                        Container(
                                                          height: 45,
                                                          width: 45,
                                                          decoration: BoxDecoration(
                                                            color: AppColors.grey.withOpacity(0.05),
                                                            shape: BoxShape.circle,
                                                          ),
                                                          clipBehavior: Clip.hardEdge,
                                                          child: CachedNetworkImage(
                                                            imageUrl: logic.getBookingStatusWiseCategory?.data?[index]
                                                                    .serviceImage?.first ??
                                                                "",
                                                            fit: BoxFit.cover,
                                                            placeholder: (context, url) {
                                                              return Image.asset(
                                                                AppAsset.icPlaceholder,
                                                                color: AppColors.blackColor1,
                                                              ).paddingAll(10);
                                                            },
                                                            errorWidget: (context, url, error) {
                                                              return Image.asset(
                                                                AppAsset.icPlaceholder,
                                                                color: AppColors.blackColor1,
                                                              ).paddingAll(10);
                                                            },
                                                          ),
                                                        ).paddingOnly(right: 13),
                                                        Column(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            Text(
                                                              "${logic.getBookingStatusWiseCategory!.data![index].userFname} ${logic.getBookingStatusWiseCategory!.data![index].userLname}",
                                                              style: TextStyle(
                                                                fontSize: 19,
                                                                fontFamily: AppFontFamily.heeBo800,
                                                                color: AppColors.primaryTextColor,
                                                              ),
                                                            ),
                                                            Text(
                                                              logic.getBookingStatusWiseCategory!.data![index].service?.first ??
                                                                  "",
                                                              style: TextStyle(
                                                                fontSize: 14,
                                                                fontFamily: AppFontFamily.heeBo600,
                                                                color: AppColors.greyText,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ],
                                                    ),
                                                    Container(
                                                      decoration: BoxDecoration(
                                                        color: AppColors.bgTime,
                                                        borderRadius: BorderRadius.circular(12),
                                                      ),
                                                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
                                                      child: Row(
                                                        children: [
                                                          Container(
                                                            height: 40,
                                                            width: 40,
                                                            decoration: BoxDecoration(
                                                              shape: BoxShape.circle,
                                                              color: AppColors.bgCircle,
                                                            ),
                                                            child: Image.asset(AppAsset.icBooking).paddingAll(10),
                                                          ).paddingOnly(right: 12),
                                                          Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                              Text(
                                                                logic.getBookingStatusWiseCategory?.data?[index].date ?? "",
                                                                style: TextStyle(
                                                                  fontFamily: AppFontFamily.heeBo700,
                                                                  fontSize: 14,
                                                                  color: AppColors.primaryTextColor,
                                                                ),
                                                              ),
                                                              Text(
                                                                "txtBookingDate".tr,
                                                                style: TextStyle(
                                                                  fontFamily: AppFontFamily.heeBo500,
                                                                  fontSize: 12,
                                                                  color: AppColors.service,
                                                                ),
                                                              )
                                                            ],
                                                          ),
                                                          const Spacer(),
                                                          Container(
                                                            height: 36,
                                                            width: 2,
                                                            color: AppColors.serviceBorder,
                                                          ),
                                                          const Spacer(),
                                                          Container(
                                                            height: 40,
                                                            width: 40,
                                                            decoration: BoxDecoration(
                                                              shape: BoxShape.circle,
                                                              color: AppColors.bgCircle,
                                                            ),
                                                            child: Image.asset(
                                                              AppAsset.icClock,
                                                            ).paddingAll(10),
                                                          ).paddingOnly(right: 12),
                                                          Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                              Text(
                                                                logic.getBookingStatusWiseCategory?.data?[index].startTime ?? '',
                                                                style: TextStyle(
                                                                  fontFamily: AppFontFamily.heeBo700,
                                                                  fontSize: 14,
                                                                  color: AppColors.primaryTextColor,
                                                                ),
                                                              ),
                                                              Text(
                                                                "txtBookingTiming".tr,
                                                                style: TextStyle(
                                                                  fontFamily: AppFontFamily.heeBo500,
                                                                  fontSize: 12,
                                                                  color: AppColors.service,
                                                                ),
                                                              )
                                                            ],
                                                          ),
                                                          const Spacer(),
                                                        ],
                                                      ),
                                                    ).paddingOnly(top: 12, bottom: 12, right: 12),
                                                    Row(
                                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                      children: [
                                                        Container(
                                                          decoration: BoxDecoration(
                                                            borderRadius: BorderRadius.circular(6),
                                                            color: AppColors.greenBg,
                                                          ),
                                                          padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 9),
                                                          child: Text(
                                                            '$currency ${logic.getBookingStatusWiseCategory?.data?[index].withoutTax?.toStringAsFixed(2)}',
                                                            style: TextStyle(
                                                              fontSize: 16,
                                                              fontFamily: AppFontFamily.heeBo700,
                                                              color: AppColors.greenColor,
                                                            ),
                                                          ),
                                                        ),
                                                        Text(
                                                          "txtViewDetails".tr,
                                                          style: TextStyle(
                                                              fontSize: 14,
                                                              fontFamily: AppFontFamily.heeBo500,
                                                              color: AppColors.greyText,
                                                              decoration: TextDecoration.underline,
                                                              decorationColor: AppColors.greyText),
                                                        ).paddingOnly(right: 10),
                                                      ],
                                                    ),
                                                  ],
                                                ).paddingOnly(left: 12, top: 10)
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                                separatorBuilder: (context, position) {
                                  return Container(
                                    height: 10,
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ),
        );
      },
    );
  }
}
