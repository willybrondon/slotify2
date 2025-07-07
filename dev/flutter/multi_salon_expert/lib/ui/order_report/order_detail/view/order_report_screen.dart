// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:clipboard/clipboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/order_report/order_detail/controller/order_report_controller.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/asset.dart';
import 'package:salon_2/utils/colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class OrderReportScreen extends StatefulWidget {
  const OrderReportScreen({super.key});

  @override
  State<OrderReportScreen> createState() => _OrderReportScreenState();
}

class _OrderReportScreenState extends State<OrderReportScreen> {
  var tabs = [
    Tab(text: "   ${"txtToday".tr}   "),
    Tab(text: "   ${"txtYesterday".tr}   "),
    Tab(text: "   ${"txtThisWeek".tr}   "),
    Tab(text: "   ${"txtThisMonth".tr}   "),
  ];

  @override
  Widget build(BuildContext context) {
    LoginScreenController loginScreenController = Get.put(LoginScreenController());
    double statusBarHeight = MediaQuery.of(context).padding.top;

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
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
                margin: const EdgeInsets.only(left: 13, bottom: 5),
                child: Text(
                  "txtOrderDetails".tr,
                  style: TextStyle(
                    fontFamily: FontFamily.sfProDisplayBold,
                    color: AppColors.primaryTextColor,
                    fontSize: 22,
                  ),
                )),
            GetBuilder<OrderReportController>(
              builder: (logic) {
                return TabBar(
                  tabAlignment: TabAlignment.start,
                  controller: logic.tabController,
                  tabs: tabs,
                  labelStyle: const TextStyle(
                    fontSize: 15,
                    fontFamily: FontFamily.sfProDisplayMedium,
                  ),
                  physics: const BouncingScrollPhysics(),
                  indicatorPadding: const EdgeInsets.all(4),
                  indicator: BoxDecoration(borderRadius: BorderRadius.circular(45), color: AppColors.primaryAppColor),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: AppColors.whiteColor,
                  isScrollable: true,
                  unselectedLabelColor: AppColors.service,
                  dividerColor: Colors.transparent,
                  overlayColor: MaterialStatePropertyAll(AppColors.transparent),
                ).paddingOnly(left: 13, bottom: 15);
              },
            ),
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
                ));
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
                              fontFamily: FontFamily.sfProDisplayMedium,
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
                                  logic.str = logic.getBookingStatusWiseCategory?.data?[index].date.toString();
                                  logic.parts = logic.str?.split(' ');
                                  logic.date = logic.parts?[0];
                                  logic.time = logic.parts![1].trim();

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
                                              arguments: logic.getBookingStatusWiseCategory!.data![index],
                                            );
                                          },
                                          child: Container(
                                            height: 135,
                                            width: double.infinity,
                                            margin: const EdgeInsets.only(left: 5, right: 5),
                                            padding: const EdgeInsets.only(bottom: 10),
                                            decoration: BoxDecoration(
                                              color: AppColors.whiteColor,
                                              border: Border.all(
                                                width: 1,
                                                color: AppColors.grey.withOpacity(0.1),
                                              ),
                                              borderRadius: BorderRadius.circular(10),
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
                                                        color: AppColors.tabUnSelect,
                                                      ),
                                                      child: Text(
                                                        "#${logic.getBookingStatusWiseCategory!.data![index].bookingId}",
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          fontFamily: FontFamily.sfProDisplay,
                                                          color: AppColors.buttonText,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                  children: [
                                                    Text(
                                                      "${logic.getBookingStatusWiseCategory!.data![index].userFname} ${logic.getBookingStatusWiseCategory!.data![index].userLname}",
                                                      style: TextStyle(
                                                        fontSize: 18,
                                                        fontFamily: FontFamily.sfProDisplay,
                                                        color: AppColors.primaryTextColor,
                                                      ),
                                                    ),
                                                    Text(
                                                      logic.getBookingStatusWiseCategory!.data![index].service?.first ?? "",
                                                      style: TextStyle(
                                                        fontSize: 13,
                                                        fontFamily: FontFamily.sfProDisplayMedium,
                                                        color: AppColors.title,
                                                      ),
                                                    ),
                                                    SizedBox(height: Get.height * 0.01),
                                                    Row(
                                                      children: [
                                                        Row(
                                                          children: [
                                                            Image.asset(AppAsset.icBooking, height: 19, width: 19),
                                                            SizedBox(width: Get.width * 0.01),
                                                            Text(
                                                              logic.date.toString(),
                                                              style: TextStyle(
                                                                fontFamily: FontFamily.sfProDisplayRegular,
                                                                fontSize: 12,
                                                                color: AppColors.service,
                                                              ),
                                                            ),
                                                            SizedBox(width: Get.width * 0.05),
                                                            Image.asset(AppAsset.icClock, height: 19, width: 19),
                                                            SizedBox(width: Get.width * 0.01),
                                                            Text(
                                                              logic.getBookingStatusWiseCategory!.data![index].startTime ?? '',
                                                              style: TextStyle(
                                                                fontFamily: FontFamily.sfProDisplayRegular,
                                                                fontSize: 12,
                                                                color: AppColors.service,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ],
                                                    ),
                                                    SizedBox(height: Get.height * 0.01),
                                                    Row(
                                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                      children: [
                                                        Container(
                                                          height: 28,
                                                          width: 78,
                                                          decoration: BoxDecoration(
                                                            borderRadius: BorderRadius.circular(6),
                                                            color: AppColors.green,
                                                          ),
                                                          child: Center(
                                                            child: Text(
                                                              '$currency ${logic.getBookingStatusWiseCategory?.data?[index].withoutTax?.toStringAsFixed(2)}',
                                                              style: TextStyle(
                                                                fontSize: 16,
                                                                fontFamily: FontFamily.sfProDisplayBold,
                                                                color: AppColors.currency,
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                        GestureDetector(
                                                          onTap: () {
                                                            Get.toNamed(
                                                              AppRoutes.viewDetail,
                                                              arguments: logic.getBookingStatusWiseCategory!.data![index],
                                                            );
                                                          },
                                                          child: Text(
                                                            "txtViewDetails".tr,
                                                            style: TextStyle(
                                                              fontSize: 12,
                                                              fontFamily: FontFamily.sfProDisplayMedium,
                                                              color: AppColors.primaryTextColor,
                                                              decoration: TextDecoration.underline,
                                                            ),
                                                          ).paddingOnly(right: 10),
                                                        ),
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
