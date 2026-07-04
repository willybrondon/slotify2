// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/app_button/app_button.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/date_formatter.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/day_style.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/easy_day_props.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/easy_header_props.dart';
import 'package:salon_2/custom/date_time_picker/src/widgets/easy_date_timeline_widget/easy_date_timeline_widget.dart';
import 'package:salon_2/custom/dialog/progress_dialog.dart';
import 'package:salon_2/custom/dialog/service_price_dialog.dart';
import 'package:salon_2/custom/text_field/text_field_custom.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class BookingScreen extends StatelessWidget {
  BookingScreen({super.key});

  BookingScreenController bookingScreenController =
      Get.put(BookingScreenController());
  SplashController splashController = Get.put(SplashController());
  HomeScreenController homeScreenController = Get.put(HomeScreenController());

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) async {
        bookingScreenController.onBackStep();

        bookingScreenController.expertDetail != null
            ? bookingScreenController.onExpertSelect()
            : bookingScreenController.selectExpert = -1;

        await bookingScreenController.onGetBookingApiCall(
          selectedDate: bookingScreenController.date,
          expertId: Constant.storage.read<String>('expertDetail') != null
              ? Constant.storage.read<String>('expertDetail').toString()
              : Constant.storage.read<String>('expertId').toString(),
          salonId: bookingScreenController.salonId.toString(),
        );
        bookingScreenController.formattedDate = bookingScreenController.date;

        bookingScreenController.splitBreakTime();
        bookingScreenController.onGetSlotsList();

        bookingScreenController.selectedSlot = '';
        bookingScreenController.selectedSlotsList.clear();
        bookingScreenController.withOutTaxRupee == 0.0;
        bookingScreenController.totalPrice == 0.0;
        bookingScreenController.finalTaxRupee == 0.0;
        if (didPop) {
          return;
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backGround,
        resizeToAvoidBottomInset: false,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: AppBarCustom(
            title: "txtBooking".tr,
            method: GetBuilder<BookingScreenController>(
              id: Constant.idCurrentStep,
              builder: (logic) {
                return InkWell(
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                  onTap: () async {
                    logic.onBackStep();

                    logic.expertDetail != null
                        ? logic.onExpertSelect()
                        : logic.selectExpert = -1;

                    await logic.onGetBookingApiCall(
                      selectedDate: logic.date,
                      expertId:
                          Constant.storage.read<String>('expertDetail') != null
                              ? Constant.storage
                                  .read<String>('expertDetail')
                                  .toString()
                              : Constant.storage
                                  .read<String>('expertId')
                                  .toString(),
                      salonId: logic.salonId.toString(),
                    );

                    logic.formattedDate = logic.date;

                    logic.splitBreakTime();
                    logic.onGetSlotsList();

                    logic.selectedSlot = '';
                    logic.selectedSlotsList.clear();
                    logic.withOutTaxRupee == 0.0;
                    logic.totalPrice == 0.0;
                    logic.finalTaxRupee == 0.0;
                  },
                  child: Icon(
                    Icons.arrow_back,
                    color: AppColors.blackColor,
                  ),
                );
              },
            ),
          ),
        ),
        bottomNavigationBar: GetBuilder<BookingScreenController>(
          id: Constant.idConfirm,
          builder: (logic) {
            final hasPrice = logic.withOutTaxRupee != 0.0 ||
                logic.totalPrice != 0.0 ||
                logic.finalTaxRupee != 0.0;

            return SafeArea(
              top: false,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.categoryBottom,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.blackColor.withOpacity(0.05),
                      offset: const Offset(0.0, 1.0),
                      blurRadius: 2.0,
                      spreadRadius: 2.0,
                    ),
                    const BoxShadow(
                      color: Colors.black12,
                      offset: Offset(0.0, 0.0),
                      blurRadius: 0.0,
                      spreadRadius: 0.0,
                    ),
                  ],
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (logic.checkItem.isNotEmpty)
                      GestureDetector(
                        onTap: () {
                          Get.dialog(
                            barrierColor:
                                AppColors.blackColor.withOpacity(0.8),
                            Dialog(
                              backgroundColor: AppColors.transparent,
                              shadowColor: AppColors.transparent,
                              elevation: 0,
                              child: const ServicePriceDialog(),
                            ),
                          );
                        },
                        child: SizedBox(
                          height: 20,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: logic.checkItem.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 10),
                            itemBuilder: (context, index) {
                              return Text(
                                logic.checkItem[index].toString(),
                                style: TextStyle(
                                  fontFamily: AppFontFamily.sfProDisplay,
                                  fontSize: 13,
                                  color: AppColors.categoryService,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    if (logic.checkItem.isNotEmpty && hasPrice)
                      const SizedBox(height: 6),
                    if (hasPrice)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${logic.totalMinute != null && logic.totalMinute! > 0 ? '${logic.totalMinute} ${"txtMin".tr} · ' : ''}$currency${logic.withOutTaxRupee.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    fontSize: 14,
                                    color: AppColors.brandBlack,
                                  ),
                                ),
                                Text(
                                  '$currency${logic.finalTaxRupee.toStringAsFixed(2)} ${"txtTax".tr}',
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    fontSize: 12,
                                    color: AppColors.termsDialog,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          GetBuilder<BookingScreenController>(
                            id: Constant.idApplyCoupon,
                            builder: (couponLogic) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  if (couponLogic.couponDiscountAmount > 0) ...[
                                    Text(
                                      '$currency ${(couponLogic.withOutTaxRupee + couponLogic.finalTaxRupee).toStringAsFixed(2)}',
                                      style: TextStyle(
                                        fontFamily:
                                            AppFontFamily.sfProDisplay,
                                        fontSize: 13,
                                        color: AppColors.currencyGrey,
                                        decoration: TextDecoration.lineThrough,
                                      ),
                                    ),
                                    Text(
                                      '- $currency ${couponLogic.couponDiscountAmount.toStringAsFixed(2)}',
                                      style: TextStyle(
                                        fontFamily:
                                            AppFontFamily.sfProDisplay,
                                        fontSize: 12,
                                        color: AppColors.primaryAppColor,
                                      ),
                                    ),
                                  ],
                                  Text(
                                    '= $currency ${couponLogic.totalPrice.toStringAsFixed(2)}',
                                    style: TextStyle(
                                      fontFamily:
                                          AppFontFamily.sfProDisplayBold,
                                      fontSize: 15,
                                      color: AppColors.currency,
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                    const SizedBox(height: 10),
                    AppButton(
                      height: 50,
                      buttonColor: logic.currentStep == 0
                          ? logic.selectedVenue.isEmpty
                              ? AppColors.grey.withOpacity(0.5)
                              : AppColors.primaryAppColor
                          : logic.currentStep == 1
                              ? logic.expertDetail != null
                                  ? AppColors.primaryAppColor
                                  : logic.selectExpert == -1
                                      ? AppColors.grey.withOpacity(0.5)
                                      : AppColors.primaryAppColor
                              : logic.currentStep == 2
                                  ? logic.selectedSlotsList.isEmpty
                                      ? AppColors.grey.withOpacity(0.5)
                                      : AppColors.primaryAppColor
                                  : AppColors.primaryAppColor,
                      color: AppColors.whiteColor,
                      fontFamily: AppFontFamily.sfProDisplay,
                      fontSize: 15,
                      buttonText: logic.currentStep == 3
                          ? "txtConfirm".tr
                          : "txtContinue".tr,
                      width: double.infinity,
                      onTap: () async {
                        if (logic.currentStep == 0) {
                          if (logic.searchEditingController.text.isEmpty &&
                              logic.selectedVenue == "At Home") {
                            Utils.showToast(
                                context, "txtPleaseEnterAddress".tr);
                          } else {
                            logic.onConfirmButton(context);
                          }
                        } else if (logic.currentStep == 1) {
                          if (logic.expertDetail != null) {
                            logic.onConfirmButton(context);

                            await logic.onGetBookingApiCall(
                              selectedDate: logic.date,
                              expertId: Constant.storage
                                          .read<String>('expertDetail') !=
                                      null
                                  ? Constant.storage
                                      .read<String>('expertDetail')
                                      .toString()
                                  : Constant.storage
                                      .read<String>('expertId')
                                      .toString(),
                              salonId: logic.salonId.toString(),
                            );

                            logic.formattedDate = logic.date;

                            logic.splitBreakTime();
                            logic.onGetSlotsList();
                            log("Get Booking Status :: ${logic.getBookingModel?.status}");
                            if (logic.getBookingModel?.status == false) {
                              Utils.showToast(Get.context!,
                                  logic.getBookingModel?.message ?? "");
                            }

                            logic.rupee = (logic.totalPrice.toDouble() +
                                logic.finalTaxRupee.toDouble());
                            log("rupee :: ${logic.rupee}");
                          } else {
                            if (logic.selectExpert == -1) {
                            } else {
                              logic.onConfirmButton(context);

                              await logic.onGetBookingApiCall(
                                selectedDate: logic.date,
                                expertId: Constant.storage
                                            .read<String>('expertDetail') !=
                                        null
                                    ? Constant.storage
                                        .read<String>('expertDetail')
                                        .toString()
                                    : Constant.storage
                                        .read<String>('expertId')
                                        .toString(),
                                salonId: logic.salonId.toString(),
                              );
                              logic.formattedDate = logic.date;

                              logic.splitBreakTime();
                              logic.onGetSlotsList();

                              if (logic.getBookingModel?.status == true) {
                              } else {
                                Utils.showToast(Get.context!,
                                    logic.getBookingModel?.message ?? "");
                              }

                              logic.rupee = (logic.totalPrice.toDouble() +
                                  logic.finalTaxRupee.toDouble());
                              log("rupee :: ${logic.rupee}");
                            }
                          }
                        } else if (logic.currentStep == 2) {
                          log("Enter Step 1");

                          if (logic.selectedSlotsList.isEmpty) {
                          } else {
                            await logic.onGetCheckBookingApiCall(
                              userId:
                                  Constant.storage.read<String>('userId') ?? "",
                              expertId: Constant.storage
                                          .read<String>('expertDetail') !=
                                      null
                                  ? Constant.storage
                                      .read<String>('expertDetail')
                                      .toString()
                                  : Constant.storage
                                      .read<String>('expertId')
                                      .toString(),
                              serviceId: logic.serviceId.join(","),
                              salonId: logic.salonId.toString(),
                              date: logic.formattedDate.toString(),
                              time: logic.slotsString.toString(),
                              amount: bookingScreenController.totalPrice,
                              withoutTax: bookingScreenController
                                  .withOutTaxRupee
                                  .toInt(),
                            );

                            if (logic.getCheckBookingCategory?.status == true) {
                              logic.onConfirmButton(context);
                            } else {
                              Utils.showToast(Get.context!,
                                  logic.getCheckBookingCategory?.message ?? "");
                            }
                          }
                        } else if (logic.currentStep == 3) {
                          log("Enter Step 2");
                          logic.onConfirmButton(context);
                        } else {
                          log("Error In Stepper");
                        }
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        body: GetBuilder<BookingScreenController>(
          id: Constant.idProgressView,
          builder: (logic) {
            return ProgressDialog(
              inAsyncCall: logic.isLoading.value,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding:
                      const EdgeInsets.fromLTRB(12, 12, 12, 24),
                  child: GetBuilder<BookingScreenController>(
                    id: Constant.idCurrentStep,
                    builder: (logic) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(height: Get.height * 0.02),
                          Text(
                            "txtBookingProcess".tr,
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayBold,
                              fontSize: 18,
                              color: AppColors.primaryTextColor,
                            ),
                          ),
                          SizedBox(height: Get.height * 0.02),
                          Container(
                            height: 80,
                            padding: const EdgeInsets.symmetric(horizontal: 15),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: AppColors.whiteColor,
                              boxShadow: Constant.boxShadow,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                // For Top Experts: Venue step is current (not done) until venue is selected
                                (logic.expertDetail != null &&
                                        logic.selectedVenue.isEmpty)
                                    ? stepDesign(
                                        color: AppColors.primaryAppColor,
                                        title: "txtVenue".tr,
                                        widget: Text(
                                          "1",
                                          style: TextStyle(
                                            fontFamily:
                                                AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.whiteColor,
                                          ),
                                        ),
                                      )
                                    : (logic.expertDetail != null &&
                                            logic.selectedVenue.isNotEmpty)
                                        ? stepDesign(
                                            color: AppColors.primaryAppColor,
                                            title: "txtVenue".tr,
                                            widget: Image.asset(
                                              AppAsset.icCheck1,
                                              height: 20,
                                              width: 20,
                                            ),
                                          )
                                        : logic.currentStep >= 0
                                            ? stepDesign(
                                                color:
                                                    AppColors.primaryAppColor,
                                                title: "txtVenue".tr,
                                                widget: Image.asset(
                                                  AppAsset.icCheck1,
                                                  height: 20,
                                                  width: 20,
                                                ),
                                              )
                                            : stepDesign(
                                                color: AppColors.transparent,
                                                title: "txtVenue".tr,
                                                fontColor: AppColors.greyColor2,
                                              ),
                                const SizedBox(width: 10),
                                divider(
                                    color: (logic.expertDetail != null &&
                                                logic.selectedVenue
                                                    .isNotEmpty) ||
                                            (logic.expertDetail == null &&
                                                logic.currentStep >= 1)
                                        ? AppColors.primaryAppColor
                                        : AppColors.greyColor),
                                const SizedBox(width: 10),
                                // For Top Experts: Staff step is current when venue is selected
                                (logic.expertDetail != null &&
                                        logic.selectedVenue.isNotEmpty &&
                                        logic.currentStep <= 1)
                                    ? stepDesign(
                                        color: AppColors.primaryAppColor,
                                        title: "txtStaff".tr,
                                        widget: Text(
                                          "2",
                                          style: TextStyle(
                                            fontFamily:
                                                AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.whiteColor,
                                          ),
                                        ),
                                      )
                                    : (logic.expertDetail != null &&
                                                logic.currentStep >= 2) ||
                                            (logic.expertDetail == null &&
                                                logic.currentStep >= 1)
                                        ? stepDesign(
                                            color: AppColors.primaryAppColor,
                                            title: "txtStaff".tr,
                                            widget: Image.asset(
                                              AppAsset.icCheck1,
                                              height: 20,
                                              width: 20,
                                            ),
                                          )
                                        : stepDesign(
                                            color: AppColors.transparent,
                                            title: "txtStaff".tr,
                                            fontColor: AppColors.greyColor2,
                                            widget: Text(
                                              "2",
                                              style: TextStyle(
                                                fontFamily:
                                                    AppFontFamily.sfProDisplay,
                                                fontSize: 13,
                                                color: AppColors.stepper,
                                              ),
                                            ),
                                          ),
                                const SizedBox(width: 10),
                                divider(
                                    color: logic.currentStep >= 2
                                        ? AppColors.primaryAppColor
                                        : AppColors.greyColor),
                                logic.currentStep >= 2
                                    ? stepDesign(
                                        color: AppColors.primaryAppColor,
                                        title: "txtDateTime".tr,
                                        widget: Image.asset(
                                          AppAsset.icCheck1,
                                          height: 20,
                                          width: 20,
                                        ),
                                      )
                                    : stepDesign(
                                        color: AppColors.transparent,
                                        title: "txtDateTime".tr,
                                        fontColor: AppColors.greyColor2,
                                        widget: Text(
                                          "3",
                                          style: TextStyle(
                                            fontFamily:
                                                AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.stepper,
                                          ),
                                        ),
                                      ),
                                divider(
                                    color: logic.currentStep >= 3
                                        ? AppColors.primaryAppColor
                                        : AppColors.greyColor),
                                const SizedBox(width: 6),
                                logic.currentStep >= 3
                                    ? stepDesign(
                                        color: AppColors.primaryAppColor,
                                        title: "txtPayment".tr,
                                        widget: Image.asset(
                                          AppAsset.icCheck1,
                                          height: 20,
                                          width: 20,
                                        ),
                                      )
                                    : stepDesign(
                                        color: AppColors.transparent,
                                        title: "txtPayment".tr,
                                        fontColor: AppColors.greyColor2,
                                        widget: Text(
                                          "4",
                                          style: TextStyle(
                                            fontFamily:
                                                AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.stepper,
                                          ),
                                        ),
                                      ),
                              ],
                            ),
                          ),
                          SizedBox(height: Get.height * 0.02),

                          // Expert/salon/address info moved to showExpertSalonInfo() method

                          SizedBox(height: Get.height * 0.02),
                          logic.currentStep == 0
                              ? selectServiceVenue()
                              : logic.currentStep == 1
                                  ? (logic.expertDetail != null
                                      ? showExpertSalonInfo() // Show expert/salon/address for Top Experts
                                      : selectExpert())
                                  : logic.currentStep == 2
                                      ? selectDateTime()
                                      : payment()
                        ],
                      );
                    },
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  selectServiceVenue() {
    return GetBuilder<BookingScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "txtSelectServiceVenue".tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 15,
                color: AppColors.primaryTextColor,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _venueOptionCard(
                    logic: logic,
                    venueValue: "At Salon",
                    label: "txtAtSalon".tr,
                    icon: AppAsset.icSalonIcon,
                    onTap: () {
                      logic.selectVenue("At Salon");
                      final ctx = Get.context;
                      if (ctx != null) {
                        logic.onConfirmButton(ctx);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _venueOptionCard(
                    logic: logic,
                    venueValue: "At Home",
                    label: "txtAtHome".tr,
                    icon: AppAsset.icHomeIcon,
                    onTap: () => logic.selectVenue("At Home"),
                  ),
                ),
              ],
            ),
            if (logic.selectedVenue == "At Home") ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                height: 120,
                padding: const EdgeInsets.only(left: 10, right: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: AppColors.whiteColor,
                  border: Border.all(
                    color: AppColors.grey.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: TextFieldCustom(
                  hintText: "txtPleaseEnterAddress".tr,
                  obscureText: false,
                  textInputAction: TextInputAction.newline,
                  maxLines: 4,
                  controller: logic.searchEditingController,
                ),
              ),
            ]
          ],
        );
      },
    );
  }

  Widget _venueOptionCard({
    required BookingScreenController logic,
    required String venueValue,
    required String label,
    required String icon,
    required VoidCallback onTap,
  }) {
    final selected = logic.selectedVenue == venueValue;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 96,
        decoration: BoxDecoration(
          color: AppColors.whiteColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? AppColors.primaryAppColor
                : AppColors.greyColor.withOpacity(0.2),
            width: selected ? 1.2 : 0.7,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 34,
              width: 34,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.roundBg,
              ),
              child: Image.asset(icon).paddingAll(8),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 13,
                color: AppColors.primaryTextColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  selectExpert() {
    return GetBuilder<BookingScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return logic.isLoading1.value
            ? Shimmers.selectExpertShimmer()
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "txtChooseYourExpert".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplay,
                      fontSize: 15,
                      color: AppColors.primaryTextColor,
                    ),
                  ),
                  SizedBox(height: Get.height * 0.01),
                  GetBuilder<BookingScreenController>(
                    id: Constant.idProgressView,
                    builder: (logic) {
                      logic.selectedExpertDataList.isEmpty
                          ? logic.onExpertSelect()
                          : null;

                      return logic.getExpertServiceBaseSalonCategory?.data
                                  ?.isEmpty ==
                              true
                          ? Center(
                              child: Column(
                                children: [
                                  Image.asset(AppAsset.icNoExpert,
                                          height: 150, width: 150)
                                      .paddingOnly(bottom: 7),
                                  Text(
                                    "txtNoFoundExpert".tr,
                                    style: TextStyle(
                                      fontFamily:
                                          AppFontFamily.sfProDisplayBold,
                                      fontSize: 15,
                                      color: AppColors.primaryTextColor,
                                    ),
                                  )
                                ],
                              ),
                            ).paddingOnly(top: Get.height * 0.1)
                          : AnimationLimiter(
                              child: GridView.builder(
                                scrollDirection: Axis.vertical,
                                physics: const ScrollPhysics(),
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                itemCount: logic.expertDetail != null
                                    ? 1
                                    : logic.getExpertServiceBaseSalonCategory
                                            ?.data?.length ??
                                        0,
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  childAspectRatio: 0.80,
                                  crossAxisSpacing: 13.5,
                                  mainAxisSpacing: 2,
                                ),
                                itemBuilder: (BuildContext context, int index) {
                                  logic.rating = logic.expertDetail != null
                                      ? logic.selectedExpertDataList[4]
                                      : logic.getExpertServiceBaseSalonCategory
                                              ?.data?[index].review ??
                                          0.0;
                                  logic.roundedRating = logic.rating?.round();
                                  logic.filledStars =
                                      logic.roundedRating?.clamp(0, 5);

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic
                                            .getExpertServiceBaseSalonCategory
                                            ?.data
                                            ?.length ??
                                        0,
                                    child: ScaleAnimation(
                                      child: FadeInAnimation(
                                        child: GestureDetector(
                                          onTap: () {
                                            Constant.storage.write(
                                              'expertId',
                                              logic.expertDetail ??
                                                  logic
                                                      .getExpertServiceBaseSalonCategory
                                                      ?.data?[index]
                                                      .id,
                                            );

                                            log("Expert Id Issss :: ${logic.expertDetail}");
                                            log("Expert Id Is :: ${Constant.storage.read<String>('expertId')}");

                                            if (logic.selectedExpertDataList
                                                .isEmpty) {
                                              logic.onStep1(index);
                                            }
                                          },
                                          child: Container(
                                            width: Get.width * 0.45,
                                            margin:
                                                const EdgeInsets.only(top: 10),
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 12, vertical: 12),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(18),
                                              color: AppColors.whiteColor,
                                              boxShadow: Constant.boxShadow,
                                            ),
                                            child: Stack(
                                              children: [
                                                Align(
                                                  alignment: Alignment.center,
                                                  child: Column(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .center,
                                                    children: [
                                                      DottedBorder(
                                                        color: AppColors
                                                            .roundBorder,
                                                        borderType:
                                                            BorderType.RRect,
                                                        radius: const Radius
                                                            .circular(41),
                                                        strokeWidth: 1,
                                                        dashPattern: const [
                                                          3,
                                                          3
                                                        ],
                                                        child: Container(
                                                          height: 80,
                                                          width: 80,
                                                          decoration:
                                                              const BoxDecoration(
                                                                  shape: BoxShape
                                                                      .circle),
                                                          clipBehavior:
                                                              Clip.hardEdge,
                                                          child:
                                                              CachedNetworkImage(
                                                            imageUrl: logic
                                                                        .expertDetail !=
                                                                    null
                                                                ? logic.selectedExpertDataList[
                                                                    3]
                                                                : logic
                                                                        .getExpertServiceBaseSalonCategory
                                                                        ?.data?[
                                                                            index]
                                                                        .image ??
                                                                    "",
                                                            fit: BoxFit.cover,
                                                            placeholder:
                                                                (context, url) {
                                                              return Image.asset(
                                                                  AppAsset
                                                                      .icPlaceHolder);
                                                            },
                                                            errorWidget:
                                                                (context, url,
                                                                    error) {
                                                              return Icon(
                                                                Icons
                                                                    .error_outline,
                                                                color: AppColors
                                                                    .blackColor,
                                                                size: 20,
                                                              );
                                                            },
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(
                                                          height: Get.height *
                                                              0.015),
                                                      logic.expertDetail != null
                                                          ? Text(
                                                              "${logic.selectedExpertDataList[1]} ${logic.selectedExpertDataList[2]}",
                                                              maxLines: 1,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              style: TextStyle(
                                                                fontFamily:
                                                                    AppFontFamily
                                                                        .sfProDisplay,
                                                                fontSize: 15.5,
                                                                color: AppColors
                                                                    .category,
                                                              ),
                                                            )
                                                          : Text(
                                                              "${logic.getExpertServiceBaseSalonCategory?.data?[index].fname} ${logic.getExpertServiceBaseSalonCategory?.data?[index].lname}",
                                                              maxLines: 1,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              style: TextStyle(
                                                                fontFamily:
                                                                    AppFontFamily
                                                                        .sfProDisplay,
                                                                fontSize: 15.5,
                                                                color: AppColors
                                                                    .category,
                                                              ),
                                                            ),
                                                      SizedBox(
                                                          height: Get.height *
                                                              0.015),
                                                      Container(
                                                        height: 32,
                                                        decoration:
                                                            BoxDecoration(
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(8),
                                                          color:
                                                              AppColors.yellow2,
                                                        ),
                                                        child: SizedBox(
                                                          height: 15,
                                                          child: ListView
                                                              .separated(
                                                            shrinkWrap: true,
                                                            itemCount: 5,
                                                            scrollDirection:
                                                                Axis.horizontal,
                                                            padding:
                                                                const EdgeInsets
                                                                    .symmetric(
                                                                    horizontal:
                                                                        13),
                                                            itemBuilder:
                                                                (context,
                                                                    index) {
                                                              if (index <
                                                                  logic
                                                                      .filledStars!) {
                                                                return Image
                                                                    .asset(
                                                                  AppAsset
                                                                      .icStarFilled,
                                                                  height: 15,
                                                                  width: 15,
                                                                );
                                                              } else {
                                                                return Image
                                                                    .asset(
                                                                  AppAsset
                                                                      .icStarOutline,
                                                                  height: 15,
                                                                  width: 15,
                                                                );
                                                              }
                                                            },
                                                            separatorBuilder:
                                                                (context,
                                                                    index) {
                                                              return SizedBox(
                                                                  width:
                                                                      Get.width *
                                                                          0.017);
                                                            },
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                logic.selectExpert == index
                                                    ? Align(
                                                        alignment:
                                                            Alignment.topRight,
                                                        child: Container(
                                                          height: 22,
                                                          width: 22,
                                                          padding:
                                                              const EdgeInsets
                                                                  .all(7),
                                                          decoration:
                                                              BoxDecoration(
                                                            shape:
                                                                BoxShape.circle,
                                                            color: AppColors
                                                                .primaryAppColor,
                                                          ),
                                                          child: Image.asset(
                                                            AppAsset.icCheck,
                                                          ),
                                                        ),
                                                      )
                                                    : Align(
                                                        alignment:
                                                            Alignment.topRight,
                                                        child: Container(
                                                          height: 22,
                                                          width: 22,
                                                          padding:
                                                              const EdgeInsets
                                                                  .all(7),
                                                          decoration:
                                                              BoxDecoration(
                                                            shape:
                                                                BoxShape.circle,
                                                            border: Border.all(
                                                              color: AppColors
                                                                  .greyColor
                                                                  .withOpacity(
                                                                      0.2),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            );
                    },
                  ),
                ],
              );
      },
    );
  }

  selectDateTime() {
    return GetBuilder<BookingScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        if (logic.getBookingModel == null) {
          return Shimmers.selectSlotShimmer();
        }

        return SingleChildScrollView(
          child: GetBuilder<BookingScreenController>(
            id: Constant.idUpdateSlots0,
            builder: (logic) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "txtSelectDate".tr,
                    style: TextStyle(
                      color: AppColors.primaryTextColor,
                      fontSize: 16,
                      fontFamily: AppFontFamily.sfProDisplay,
                    ),
                  ).paddingOnly(bottom: 12),
                  Container(
                    height: 150,
                    width: Get.width,
                    decoration: BoxDecoration(
                      color: AppColors.whiteColor,
                      border: Border.all(
                        color: AppColors.grey.withOpacity(0.1),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: EasyDateTimeLine(
                      initialDate: DateTime.now(),
                      disabledDates: logic.getDisabledDates(),
                      onDateChange: (selectedDate) async {
                        logic.formattedDate =
                            DateFormat('yyyy-MM-dd').format(selectedDate);
                        log("Selected Date :: ${logic.formattedDate}");

                        await logic.onGetBookingApiCall(
                          selectedDate: logic.formattedDate.toString(),
                          expertId: Constant.storage
                                      .read<String>('expertDetail') !=
                                  null
                              ? Constant.storage
                                  .read<String>('expertDetail')
                                  .toString()
                              : Constant.storage
                                  .read<String>('expertId')
                                  .toString(),
                          salonId: logic.salonId.toString(),
                        );

                        if (logic.getBookingModel?.status == true) {
                          logic.splitBreakTime();
                          logic.onGetSlotsList();
                        } else {
                          Utils.showToast(Get.context!,
                              logic.getBookingModel?.message ?? "");
                        }
                      },
                      headerProps: EasyHeaderProps(
                        monthPickerType: MonthPickerType.switcher,
                        showMonthPicker: true,
                        dateFormatter:
                            const DateFormatter.fullDateDMonthAsStrY(),
                        monthStyle: TextStyle(
                          color: AppColors.greyColor,
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                        ),
                        selectedDateStyle: TextStyle(
                          color: AppColors.darkGrey3,
                          fontFamily: AppFontFamily.sfProDisplayMedium,
                        ),
                      ),
                      dayProps: EasyDayProps(
                        height: 80,
                        width: 62,
                        borderColor: Colors.transparent,
                        todayHighlightColor: Colors.transparent,
                        dayStructure: DayStructure.dayStrDayNum,
                        todayStyle: DayStyle(
                          dayNumStyle: TextStyle(
                            color: AppColors.primaryAppColor,
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                          ),
                          dayStrStyle: TextStyle(
                            color: AppColors.primaryAppColor,
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                          ),
                        ),
                        activeDayStyle: DayStyle(
                          dayNumStyle: TextStyle(
                            color: AppColors.brandTerracotta,
                            fontFamily: AppFontFamily.sfProDisplayBold,
                          ),
                          dayStrStyle: TextStyle(
                            color: AppColors.brandTerracotta,
                            fontFamily: AppFontFamily.sfProDisplayBold,
                          ),
                          decoration: BoxDecoration(
                            borderRadius:
                                const BorderRadius.all(Radius.circular(8)),
                            color: AppColors.dateSelect,
                            border: Border.all(
                              color: AppColors.brandTerracotta.withOpacity(0.35),
                            ),
                          ),
                        ),
                        inactiveDayStyle: DayStyle(
                          dayNumStyle: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                            color: AppColors.darkGrey3,
                          ),
                          dayStrStyle: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                            color: AppColors.darkGrey3,
                          ),
                          decoration: BoxDecoration(
                            borderRadius:
                                const BorderRadius.all(Radius.circular(8)),
                            color: AppColors.brandTerracottaLight,
                          ),
                        ),
                        disabledDayStyle: DayStyle(
                          dayNumStyle: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                            color: AppColors.brandGrayMuted,
                          ),
                          dayStrStyle: TextStyle(
                            fontFamily: AppFontFamily.sfProDisplayMedium,
                            color: AppColors.brandGrayMuted,
                          ),
                          decoration: BoxDecoration(
                            borderRadius:
                                const BorderRadius.all(Radius.circular(8)),
                            color: AppColors.brandGrayLight,
                          ),
                        ),
                      ),
                    ),
                  ).paddingOnly(bottom: 10),
                  logic.getBookingModel?.status == true
                      ? Text(
                          "txtAvailableSlots".tr,
                          style: TextStyle(
                              color: AppColors.primaryTextColor,
                              fontSize: 16,
                              fontFamily: AppFontFamily.sfProDisplay),
                        ).paddingOnly(bottom: 15, top: 8)
                      : const SizedBox(),
                  logic.isLoading1.value
                      ? Shimmers.selectSlotShimmer()
                      : logic.getBookingModel?.status == true
                          ? logic.getBookingModel?.isOpen == false
                              ? Center(
                                  child: SizedBox(
                                    height: 220,
                                    width: 220,
                                    child: Image.asset(AppAsset.imgSalonClosed),
                                  ),
                                )
                              : SingleChildScrollView(
                                  physics: const BouncingScrollPhysics(),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      !(logic.hasMorningSlots)
                                          ? const SizedBox()
                                          : buildSlotCategory(
                                              "txtMorning".tr,
                                              logic.morningSlots,
                                              logic.formattedDate.toString()),
                                      logic.getBookingModel?.allSlots?.evening
                                                  ?.isEmpty ==
                                              true
                                          ? const SizedBox()
                                          : !(logic.hasAfternoonSlots)
                                              ? const SizedBox()
                                              : buildSlotCategory(
                                                  "txtAfternoon".tr,
                                                  logic.afternoonSlots,
                                                  logic.formattedDate
                                                      .toString()),
                                    ],
                                  ),
                                )
                          : Utils.showToast(Get.context!,
                              logic.getBookingModel?.message ?? ""),
                ],
              );
            },
          ),
        );
      },
    );
  }

  Widget buildSlotCategory(
      String category, List<String> slots, String selectedDate) {
    // Check if there are any available slots (slots in the future)
    bool hasAvailableSlots = slots.any((slot) {
      DateTime currentTime = DateTime.now();
      DateTime currentDate = DateTime.now();
      DateTime slotDateTime = DateFormat('yyyy-MM-dd').parse(selectedDate);

      // Normalize current date to start of day for comparison
      DateTime currentDateNormalized = DateTime(
        currentDate.year,
        currentDate.month,
        currentDate.day,
      );

      // Normalize slot date to start of day for comparison
      DateTime slotDateNormalized = DateTime(
        slotDateTime.year,
        slotDateTime.month,
        slotDateTime.day,
      );

      DateTime slotTime = DateFormat('hh:mm a').parse(slot);
      DateTime slotTimeWithDate = DateTime(
        slotDateTime.year,
        slotDateTime.month,
        slotDateTime.day,
        slotTime.hour,
        slotTime.minute,
      );

      // If slot date is in the future, show all slots
      if (slotDateNormalized.isAfter(currentDateNormalized)) {
        return true;
      }

      // If slot date is today, only show slots that are after current time
      if (slotDateNormalized.isAtSameMomentAs(currentDateNormalized)) {
        return slotTimeWithDate.isAfter(currentTime);
      }

      // If slot date is in the past, don't show
      return false;
    });

    // Set the appropriate flag based on category
    if (category == "txtMorning".tr || category == "Morning") {
      bookingScreenController.hasMorningSlots = hasAvailableSlots;
      if (!hasAvailableSlots) {
        return const SizedBox();
      }
    } else if (category == "txtAfternoon".tr || category == "Afternoon") {
      bookingScreenController.hasAfternoonSlots = hasAvailableSlots;
      if (!hasAvailableSlots) {
        return const SizedBox();
      }
    }

    return SafeArea(
      child: GetBuilder<BookingScreenController>(
        id: Constant.idUpdateSlots,
        builder: (logic) {
          return Container(
            width: Get.width,
            margin: const EdgeInsets.only(bottom: 13),
            padding: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: AppColors.whiteColor,
              boxShadow: Constant.boxShadow,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 20, left: 15, bottom: 10),
                  child: Text(
                    category,
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.primaryAppColor,
                      fontFamily: AppFontFamily.sfProDisplay,
                    ),
                  ),
                ),
                AnimationLimiter(
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.only(left: 8, right: 8),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 2,
                      crossAxisSpacing: 3,
                      mainAxisSpacing: 0.10,
                    ),
                    itemCount: slots.length,
                    itemBuilder: (context, index) {
                      DateTime currentTime = DateTime.now();
                      DateTime currentDate = DateTime.now();
                      DateTime slotDateTime =
                          DateFormat('yyyy-MM-dd').parse(selectedDate);

                      DateTime currentTimeWithDate = DateTime(
                          currentDate.year,
                          currentDate.month,
                          currentDate.day,
                          currentTime.hour,
                          currentTime.minute);

                      DateTime slotTime =
                          DateFormat('hh:mm a').parse(slots[index]);
                      DateTime slotTimeWithDate = DateTime(
                          slotDateTime.year,
                          slotDateTime.month,
                          slotDateTime.day,
                          slotTime.hour,
                          slotTime.minute);

                      List<String>? timeSlots =
                          logic.getBookingModel?.timeSlots;

                      bool isSlotBooked =
                          timeSlots != null && timeSlots.contains(slots[index]);
                      bool isSelected =
                          logic.selectedSlotsList.contains(slots[index]);

                      bool isSlotTimePassed =
                          currentDate.isAfter(slotDateTime) &&
                              currentTimeWithDate.isAfter(slotTimeWithDate);

                      logic.isFirstTap = true;
                      return AnimationConfiguration.staggeredGrid(
                        position: index,
                        duration: const Duration(milliseconds: 800),
                        columnCount: slots.length,
                        child: SlideAnimation(
                          child: FadeInAnimation(
                            child: GestureDetector(
                              onTap: () {
                                if (isSlotBooked) {
                                  if (logic.isFirstTap) {
                                    logic.isFirstTap = false;
                                    Utils.showToast(
                                        Get.context!, "desSlotBooked".tr);
                                    Future.delayed(
                                      const Duration(seconds: 5),
                                      () {
                                        logic.isFirstTap = true;
                                      },
                                    );
                                  }
                                } else if (isSlotTimePassed) {
                                  if (logic.isFirstTap) {
                                    logic.isFirstTap = false;
                                    Utils.showToast(
                                        Get.context!, "desPreviousSlot".tr);
                                    Future.delayed(
                                      const Duration(seconds: 5),
                                      () {
                                        logic.isFirstTap = true;
                                      },
                                    );
                                  }
                                } else {
                                  if (logic.isFirstTap) {
                                    logic.isFirstTap = false;

                                    logic.selectSlot(slots[index]);
                                    log("Slots String eee :: ${logic.selectedSlotsList}");

                                    /// if already booked slot within selected slot
                                    List selectSlot = logic.selectedSlotsList;
                                    List<String>? alreadyBookedSlot =
                                        logic.getBookingModel?.timeSlots;

                                    List commonElements = selectSlot
                                        .toSet()
                                        .intersection(
                                            alreadyBookedSlot!.toSet())
                                        .toList();

                                    log("Booked Slot is :: ${logic.getBookingModel?.timeSlots}");
                                    log("Select Slot is :::: ${logic.selectedSlotsList}");
                                    log("Common element :: $commonElements");

                                    if (commonElements.isNotEmpty) {
                                      Utils.showToast(
                                          Get.context!, "desInvalidSlot".tr);
                                    }

                                    /// if already booked slot within break time
                                    List slotSelected = logic.selectedSlotsList;
                                    String breakTimes =
                                        logic.breakStartTimes.trim();

                                    if (slotSelected.contains(breakTimes)) {
                                      Utils.showToast(
                                          Get.context!, "desInvalidSlot".tr);
                                    }

                                    /// if already booked slot within shop close time
                                    log("The Shop Close time :: ${logic.getBookingModel?.salonTime?.closedTime}");

                                    if (slotSelected.contains(logic
                                        .getBookingModel
                                        ?.salonTime
                                        ?.closedTime)) {
                                      Utils.showToast(
                                          Get.context!, "desInvalidSlot".tr);
                                    }

                                    Future.delayed(
                                      const Duration(seconds: 5),
                                      () {
                                        logic.isFirstTap = true;
                                      },
                                    );
                                  }
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Container(
                                  height: 30,
                                  width: 50,
                                  decoration: BoxDecoration(
                                    color: isSlotTimePassed || isSlotBooked
                                        ? AppColors.slotUnavailableBg
                                        : AppColors.slotAvailableBg,
                                    border: Border.all(
                                      color: isSelected &&
                                              !isSlotBooked &&
                                              !isSlotTimePassed
                                          ? AppColors.slotSelectedBorder
                                          : Colors.transparent,
                                      width: 2,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Center(
                                    child: Text(
                                      slots[index],
                                      style: TextStyle(
                                        fontFamily: isSlotBooked ||
                                                isSlotTimePassed
                                            ? AppFontFamily.sfProDisplayRegular
                                            : AppFontFamily.sfProDisplay,
                                        fontSize: 14,
                                        decoration:
                                            isSlotBooked || isSlotTimePassed
                                                ? TextDecoration.lineThrough
                                                : TextDecoration.none,
                                        color: isSelected &&
                                                !isSlotBooked &&
                                                !isSlotTimePassed
                                            ? AppColors.slotSelectedText
                                            : AppColors.textSlot,
                                        decorationColor: AppColors.textSlot,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  payment() {
    return GetBuilder<BookingScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "txtPaymentMethod".tr,
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplayBold,
                fontSize: 16,
                color: AppColors.primaryTextColor,
              ),
            ).paddingOnly(bottom: 13),
            splashController.settingCategory?.setting?.isWalletPay == true
                ? GetBuilder<BookingScreenController>(
              id: Constant.idStep3,
              builder: (logic) {
                return InkWell(
                  overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                  onTap: () {
                    logic.onStep3("wallet");
                  },
                  child: Container(
                    height: 60,
                    width: Get.width,
                    padding: const EdgeInsets.only(left: 10, right: 5),
                    decoration: BoxDecoration(
                      border: Border.all(
                        width: 1,
                        color: AppColors.grey.withOpacity(0.1),
                      ),
                      borderRadius: BorderRadius.circular(10),
                      color: AppColors.whiteColor,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              height: 40,
                              width: 40,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.roundBg,
                              ),
                              child: Image.asset(
                                AppAsset.icWallet,
                                height: 30,
                                width: 30,
                              ),
                            ),
                            SizedBox(width: Get.width * 0.04),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  "txtMyWallet".tr,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    fontSize: 16.5,
                                    color: AppColors.primaryTextColor,
                                  ),
                                ),
                                GetBuilder<WalletScreenController>(
                                  id: Constant.idProgressView,
                                  builder: (logic) {
                                    return Text(
                                      "($currency ${walletAmount?.toStringAsFixed(2)}) ${"txtInYourWallet".tr}",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplay,
                                        fontSize: 12,
                                        color: AppColors.currencyGrey,
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          height: 25,
                          width: 25,
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: logic.selectedPayment == "wallet"
                                  ? AppColors.primaryAppColor
                                  : AppColors.greyColor.withOpacity(0.3),
                            ),
                          ),
                          child: logic.selectedPayment == "wallet"
                              ? Image.asset(
                                  AppAsset.icCheck,
                                  color: AppColors.primaryAppColor,
                                  height: 15,
                                  width: 15,
                                )
                              : const SizedBox(),
                        ).paddingOnly(right: 10)
                      ],
                    ),
                  ),
                );
              },
            ).paddingOnly(bottom: 15)
                : const SizedBox(),

            // Razorpay Payment Method - COMMENTED OUT as requested
            // splashController.settingCategory?.setting?.isRazorPay == true
            //     ? GetBuilder<BookingScreenController>(
            //         id: Constant.idStep3,
            //         builder: (logic) {
            //           return InkWell(
            //             overlayColor:
            //                 WidgetStatePropertyAll(AppColors.transparent),
            //             onTap: () {
            //               logic.onStep3("Razorpay");
            //             },
            //             child: Container(
            //               height: 60,
            //               width: Get.width,
            //               padding: const EdgeInsets.only(left: 10, right: 5),
            //               decoration: BoxDecoration(
            //                 border: Border.all(
            //                   width: 1,
            //                   color: AppColors.grey.withOpacity(0.1),
            //                 ),
            //                 borderRadius: BorderRadius.circular(10),
            //                 color: AppColors.whiteColor,
            //               ),
            //               child: Row(
            //                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
            //                 children: [
            //                   Row(
            //                     children: [
            //                       Container(
            //                         height: 40,
            //                         width: 40,
            //                         alignment: Alignment.center,
            //                         decoration: BoxDecoration(
            //                           shape: BoxShape.circle,
            //                           color: AppColors.roundBg,
            //                         ),
            //                         child: Image.asset(
            //                           AppAsset.icRazorPay,
            //                           height: 30,
            //                           width: 30,
            //                         ),
            //                       ),
            //                       SizedBox(width: Get.width * 0.04),
            //                       Text(
            //                         "Razorpay",
            //                         style: TextStyle(
            //                           fontFamily: AppFontFamily.sfProDisplay,
            //                           fontSize: 16.5,
            //                           color: AppColors.primaryTextColor,
            //                         ),
            //                       ),
            //                     ],
            //                   ),
            //                   GestureDetector(
            //                     onTap: () {
            //                       logic.onStep3("Razorpay");
            //                     },
            //                     child: Container(
            //                       height: 25,
            //                       width: 25,
            //                       padding: const EdgeInsets.all(6),
            //                       decoration: BoxDecoration(
            //                         borderRadius: BorderRadius.circular(6),
            //                         border: Border.all(
            //                           color: logic.selectedPayment == "Razorpay"
            //                               ? AppColors.primaryAppColor
            //                               : AppColors.greyColor
            //                                   .withOpacity(0.3),
            //                         ),
            //                       ),
            //                       child: logic.selectedPayment == "Razorpay"
            //                           ? Image.asset(
            //                               AppAsset.icCheck,
            //                               color: AppColors.primaryAppColor,
            //                               height: 15,
            //                               width: 15,
            //                             )
            //                           : const SizedBox(),
            //                     ).paddingOnly(right: 10),
            //                   )
            //                 ],
            //               ),
            //             ),
            //           );
            //         },
            //       ).paddingOnly(bottom: 15)
            //     : const SizedBox(),

            /// Stripe Payment
            logic.salonAcceptsStripe()
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor:
                            WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          logic.onStep3("Stripe");
                        },
                        child: Container(
                          height: 60,
                          width: Get.width,
                          padding: const EdgeInsets.only(left: 10, right: 5),
                          decoration: BoxDecoration(
                            border: Border.all(
                              width: 1,
                              color: AppColors.grey.withOpacity(0.1),
                            ),
                            borderRadius: BorderRadius.circular(10),
                            color: AppColors.whiteColor,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    height: 40,
                                    width: 40,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.roundBg,
                                    ),
                                    child: Image.asset(
                                      AppAsset.icStripe,
                                      height: 30,
                                      width: 30,
                                    ),
                                  ),
                                  SizedBox(width: Get.width * 0.04),
                                  Text(
                                    "Stripe",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 16.5,
                                      color: AppColors.primaryTextColor,
                                    ),
                                  ),
                                ],
                              ),
                              GestureDetector(
                                onTap: () {
                                  logic.onStep3("Stripe");
                                },
                                child: Container(
                                        height: 25,
                                        width: 25,
                                        padding: const EdgeInsets.all(6),
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                            color: logic.selectedPayment ==
                                                    "Stripe"
                                                ? AppColors.primaryAppColor
                                                : AppColors.greyColor
                                                    .withOpacity(0.3),
                                          ),
                                        ),
                                        child: logic.selectedPayment == "Stripe"
                                            ? Image.asset(
                                                AppAsset.icCheck,
                                                color:
                                                    AppColors.primaryAppColor,
                                                height: 15,
                                                width: 15,
                                              )
                                            : const SizedBox())
                                    .paddingOnly(right: 10),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ).paddingOnly(bottom: 15)
                : const SizedBox(),

            /// MTN MoMo Payment
            splashController.settingCategory?.setting?.isMtnMomo == true
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor:
                            WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          logic.onStep3("MTN MoMo");
                        },
                        child: Container(
                          height: 60,
                          width: Get.width,
                          padding: const EdgeInsets.only(left: 10, right: 5),
                          decoration: BoxDecoration(
                            border: Border.all(
                              width: 1,
                              color: AppColors.grey.withOpacity(0.1),
                            ),
                            borderRadius: BorderRadius.circular(10),
                            color: AppColors.whiteColor,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    height: 40,
                                    width: 40,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.roundBg,
                                    ),
                                    child: Image.asset(
                                      AppAsset.icMtnMomo,
                                      height: 30,
                                      width: 30,
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                        return Icon(
                                          Icons.payment,
                                          size: 30,
                                          color: AppColors.primaryAppColor,
                                        );
                                      },
                                    ),
                                  ),
                                  SizedBox(width: Get.width * 0.04),
                                  Text(
                                    "MTN Mobile Money",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 16.5,
                                      color: AppColors.primaryTextColor,
                                    ),
                                  ),
                                ],
                              ),
                              GestureDetector(
                                onTap: () {
                                  logic.onStep3("MTN MoMo");
                                },
                                child: Container(
                                        height: 25,
                                        width: 25,
                                        padding: const EdgeInsets.all(6),
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                            color: logic.selectedPayment ==
                                                    "MTN MoMo"
                                                ? AppColors.primaryAppColor
                                                : AppColors.greyColor
                                                    .withOpacity(0.3),
                                          ),
                                        ),
                                        child: logic.selectedPayment ==
                                                "MTN MoMo"
                                            ? Image.asset(
                                                AppAsset.icCheck,
                                                color:
                                                    AppColors.primaryAppColor,
                                                height: 15,
                                                width: 15,
                                              )
                                            : const SizedBox())
                                    .paddingOnly(right: 10),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ).paddingOnly(bottom: 15)
                : const SizedBox(),

            // Flutter Wave Payment Method - COMMENTED OUT as requested
            // splashController.settingCategory?.setting?.isFlutterWave == true
            //     ? GetBuilder<BookingScreenController>(
            //         id: Constant.idStep3,
            //         builder: (logic) {
            //           return InkWell(
            //             overlayColor:
            //                 WidgetStatePropertyAll(AppColors.transparent),
            //             onTap: () {
            //               logic.onStep3("flutterWave");
            //             },
            //             child: Container(
            //               height: 60,
            //               width: Get.width,
            //               padding: const EdgeInsets.only(left: 10, right: 5),
            //               decoration: BoxDecoration(
            //                 border: Border.all(
            //                   width: 1,
            //                           color: AppColors.grey.withOpacity(0.1),
            //                         ),
            //                         borderRadius: BorderRadius.circular(10),
            //                         color: AppColors.whiteColor,
            //                       ),
            //                       child: Row(
            //                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
            //                         children: [
            //                           Row(
            //                             children: [
            //                               Container(
            //                                 height: 40,
            //                                 width: 40,
            //                               alignment: Alignment.center,
            //                               decoration: BoxDecoration(
            //                                 shape: BoxShape.circle,
            //                                 color: AppColors.roundBg,
            //                               ),
            //                               child: Image.asset(
            //                                 AppAsset.icFlutterWave,
            //                                 height: 30,
            //                                 width: 30,
            //                               ),
            //                             ),
            //                             SizedBox(width: Get.width * 0.04),
            //                             Text(
            //                               "Flutter Wave",
            //                               style: TextStyle(
            //                                 fontFamily: AppFontFamily.sfProDisplay,
            //                                 fontSize: 16.5,
            //                                 color: AppColors.primaryTextColor,
            //                               ),
            //                             ),
            //                           ),
            //                           GestureDetector(
            //                             onTap: () {
            //                               logic.onStep3("flutterWave");
            //                             },
            //                             child: Container(
            //                               height: 25,
            //                               width: 25,
            //                               padding: const EdgeInsets.all(6),
            //                               decoration: BoxDecoration(
            //                                 borderRadius: BorderRadius.circular(6),
            //                                 border: Border.all(
            //                                   color:
            //                                       logic.selectedPayment == "flutterWave"
            //                                           ? AppColors.primaryAppColor
            //                                           ? AppColors.greyColor
            //                                               .withOpacity(0.3),
            //                                 ),
            //                               ),
            //                               child: logic.selectedPayment == "flutterWave"
            //                                   ? Image.asset(
            //                                       AppAsset.icCheck,
            //                                       color: AppColors.primaryAppColor,
            //                                       height: 15,
            //                                       width: 15,
            //                                     )
            //                                   : const SizedBox(),
            //                             ).paddingOnly(right: 10),
            //                           )
            //                         ],
            //                       ),
            //                     ),
            //                   );
            //                 },
            //               ).paddingOnly(bottom: 15)
            //             : const SizedBox(),

            /// Cash After Service Payment
            logic.salonAcceptsCash()
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor:
                            WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          logic.onStep3("cashAfterService");
                        },
                        child: Container(
                          height: 60,
                          width: Get.width,
                          padding: const EdgeInsets.only(left: 10, right: 5),
                          decoration: BoxDecoration(
                            border: Border.all(
                              width: 1,
                              color: AppColors.grey.withOpacity(0.1),
                            ),
                            borderRadius: BorderRadius.circular(10),
                            color: AppColors.whiteColor,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    height: 40,
                                    width: 40,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.roundBg,
                                    ),
                                    child: Image.asset(
                                      AppAsset.icCashAfterService,
                                      height: 25,
                                      width: 25,
                                    ),
                                  ),
                                  SizedBox(width: Get.width * 0.04),
                                  Text(
                                    "Cash After Service",
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplay,
                                      fontSize: 16.5,
                                      color: AppColors.primaryTextColor,
                                    ),
                                  ),
                                ],
                              ),
                              GestureDetector(
                                onTap: () {
                                  logic.onStep3("cashAfterService");
                                },
                                child: Container(
                                  height: 25,
                                  width: 25,
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: logic.selectedPayment ==
                                              "cashAfterService"
                                          ? AppColors.primaryAppColor
                                          : AppColors.greyColor
                                              .withOpacity(0.3),
                                    ),
                                  ),
                                  child: logic.selectedPayment ==
                                          "cashAfterService"
                                      ? Image.asset(
                                          AppAsset.icCheck,
                                          color: AppColors.primaryAppColor,
                                          height: 15,
                                          width: 15,
                                        )
                                      : const SizedBox(),
                                ).paddingOnly(right: 10),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ).paddingOnly(bottom: 15)
                : const SizedBox(),

            // Coupon Section
            GetBuilder<BookingScreenController>(
              id: Constant.idGetCoupon,
              builder: (logic) {
                return logic.getCouponModel?.data?.isEmpty == true
                    ? const SizedBox()
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Apply Coupon",
                            style: TextStyle(
                              fontFamily: AppFontFamily.sfProDisplayBold,
                              fontSize: 16,
                              color: AppColors.primaryTextColor,
                            ),
                          ).paddingOnly(top: 15, bottom: 13),
                          // Manual Coupon Code Input
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.whiteColor,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: AppColors.grey.withOpacity(0.2),
                                      width: 1,
                                    ),
                                  ),
                                  child: TextField(
                                    controller: logic.couponCodeController,
                                    decoration: InputDecoration(
                                      hintText: 'txtEnterCouponCode'.tr,
                                      hintStyle: TextStyle(
                                        fontSize: 14,
                                        color: AppColors.currencyGrey,
                                        fontFamily: AppFontFamily.sfProDisplay,
                                      ),
                                      border: InputBorder.none,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                        horizontal: 15,
                                        vertical: 12,
                                      ),
                                      suffixIcon: logic.manualCouponCode != null
                                          ? IconButton(
                                              icon: Icon(
                                                Icons.close,
                                                color:
                                                    AppColors.primaryAppColor,
                                                size: 20,
                                              ),
                                              onPressed: () {
                                                logic.onRemoveManualCoupon();
                                              },
                                            )
                                          : null,
                                    ),
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: AppColors.primaryTextColor,
                                      fontFamily: AppFontFamily.sfProDisplay,
                                    ),
                                    textCapitalization:
                                        TextCapitalization.characters,
                                  ),
                                ),
                              ),
                              SizedBox(width: 10),
                              AppButton(
                                height: 48,
                                width: 100,
                                buttonColor: AppColors.primaryAppColor,
                                color: AppColors.whiteColor,
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 14,
                                buttonText: logic.manualCouponCode != null
                                    ? "Applied"
                                    : 'txtApply'.tr,
                                onTap: () {
                                  if (logic.manualCouponCode == null) {
                                    logic.onApplyManualCouponCode();
                                  }
                                },
                              ),
                            ],
                          ).paddingOnly(bottom: 15),
                          // Show applied coupon code if manually entered
                          if (logic.manualCouponCode != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color:
                                    AppColors.primaryAppColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.primaryAppColor
                                      .withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.check_circle,
                                    color: AppColors.primaryAppColor,
                                    size: 18,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    "Coupon '${logic.manualCouponCode}' applied",
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.primaryAppColor,
                                      fontFamily:
                                          AppFontFamily.sfProDisplayMedium,
                                    ),
                                  ),
                                ],
                              ),
                            ).paddingOnly(bottom: 15),
                          SizedBox(
                            height: Get.height * 0.16,
                            child: ListView.builder(
                              itemCount:
                                  logic.getCouponModel?.data?.length ?? 0,
                              scrollDirection: Axis.horizontal,
                              shrinkWrap: true,
                              physics: const AlwaysScrollableScrollPhysics(),
                              itemBuilder: (context, index) {
                                final coupon =
                                    logic.getCouponModel?.data?[index];
                                return GestureDetector(
                                  onTap: () {
                                    logic.onSelectCoupon(index);
                                  },
                                  child: Container(
                                    width: Get.width * 0.83,
                                    decoration: BoxDecoration(
                                      image: DecorationImage(
                                        image: AssetImage(AppAsset.icCouponBox),
                                        fit: BoxFit.fill,
                                      ),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            SizedBox(
                                              width: Get.width * 0.6,
                                              child: Text(
                                                coupon?.title ?? "",
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 2,
                                                style: TextStyle(
                                                  fontSize: 15,
                                                  color:
                                                      logic.applyCoupon == index
                                                          ? AppColors
                                                              .primaryAppColor
                                                          : AppColors
                                                              .primaryTextColor,
                                                  fontFamily:
                                                      AppFontFamily.heeBo800,
                                                ),
                                              ),
                                            ),
                                            // Discount Display
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 4),
                                              decoration: BoxDecoration(
                                                color: logic.applyCoupon ==
                                                        index
                                                    ? AppColors.whiteColor
                                                        .withOpacity(0.2)
                                                    : AppColors.primaryAppColor
                                                        .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                coupon?.discountType == 1
                                                    ? "$currency ${coupon?.maxDiscount ?? 0} OFF"
                                                    : "${coupon?.discountPercent ?? 0}% OFF${coupon?.maxDiscount != null && coupon!.maxDiscount! > 0 ? " (Up to $currency ${coupon.maxDiscount})" : ""}",
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color:
                                                      logic.applyCoupon == index
                                                          ? AppColors.whiteColor
                                                          : AppColors
                                                              .primaryAppColor,
                                                  fontFamily:
                                                      AppFontFamily.heeBo900,
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 4),
                                              decoration: BoxDecoration(
                                                color: logic.applyCoupon ==
                                                        index
                                                    ? AppColors.primaryAppColor
                                                    : AppColors.dateBox,
                                                borderRadius:
                                                    BorderRadius.circular(5),
                                              ),
                                              child: RichText(
                                                text: TextSpan(
                                                  text: '${'txtOfferValidity'.tr}  ',
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    color: AppColors
                                                        .primaryTextColor,
                                                    fontFamily:
                                                        AppFontFamily.heeBo700,
                                                  ),
                                                  children: [
                                                    TextSpan(
                                                      text:
                                                          coupon?.expiryDate ??
                                                              "",
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        color: AppColors
                                                            .primaryTextColor,
                                                        fontFamily:
                                                            AppFontFamily
                                                                .heeBo900,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                            Text(
                                              coupon?.description ?? "",
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 10,
                                                color:
                                                    logic.applyCoupon == index
                                                        ? AppColors.whiteColor
                                                        : AppColors.paymentText,
                                                fontFamily:
                                                    AppFontFamily.heeBo700,
                                              ),
                                            ),
                                          ],
                                        ).paddingOnly(
                                            top: 10, bottom: 10, left: 20),
                                        Container(
                                          height: 22,
                                          width: 22,
                                          decoration: BoxDecoration(
                                            border: Border.all(
                                              color: logic.applyCoupon == index
                                                  ? AppColors.whiteColor
                                                  : AppColors.paymentText,
                                              width: 1.3,
                                            ),
                                            shape: BoxShape.circle,
                                          ),
                                          child: logic.applyCoupon == index
                                              ? Container(
                                                  height: 21,
                                                  width: 21,
                                                  decoration: BoxDecoration(
                                                    color: AppColors
                                                        .primaryAppColor,
                                                    shape: BoxShape.circle,
                                                  ),
                                                  child: Image.asset(
                                                          AppAsset.icCheck)
                                                      .paddingAll(5),
                                                )
                                              : const SizedBox.shrink(),
                                        ).paddingOnly(right: Get.width * 0.08)
                                      ],
                                    ),
                                  ).paddingOnly(right: 12.5),
                                );
                              },
                            ),
                          ),
                        ],
                      );
              },
            ),

            // splashController.settingCategory?.setting?.isRazorPay == false &&
            //         splashController.settingCategory?.setting?.isStripePay == false &&
            //         splashController.settingCategory?.setting?.cashAfterService == false &&
            //         splashController.settingCategory?.setting?.isFlutterWave == false
            //     ? Center(
            //         child: Column(
            //           children: [
            //             Image.asset(
            //               AppAsset.icNoPayment,
            //               height: 185,
            //               width: 185,
            //             ).paddingOnly(top: 30),
            //             Text(
            //               "txtNotPayment".tr,
            //               style:
            //                   TextStyle(color: AppColors.primaryTextColor, fontFamily: AppFontFamily.sfProDisplay, fontSize: 18),
            //             )
            //           ],
            //         ),
            //       )
            //     : const SizedBox(),
            SizedBox(height: Get.height * 0.02),
            // Add extra bottom padding to ensure service prices and next button are visible
            SizedBox(height: Get.height * 0.15),
          ],
        );
      },
    );
  }

  Widget divider({Color? color, double? margin}) {
    return Expanded(
      child: Container(
        height: 3,
        margin: const EdgeInsets.only(bottom: 5),
        color: color,
      ),
    );
  }

  Widget stepDesign({title, Color? color, Color? fontColor, Widget? widget}) {
    return Column(
      children: [
        Container(
          height: 32,
          width: 32,
          margin: const EdgeInsets.only(top: 20),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border.all(
              color: AppColors.stepperGrey.withOpacity(0.8),
              width: 1,
            ),
            shape: BoxShape.circle,
          ),
          child: CircleAvatar(
            radius: 20,
            backgroundColor: color,
            child: widget,
          ),
        ),
        SizedBox(height: Get.height * 0.005),
        Text(
          title,
          style: TextStyle(
            fontFamily: AppFontFamily.sfProDisplay,
            fontSize: 11,
            color: fontColor,
          ),
        ),
      ],
    );
  }

  // Show expert, salon, and address info for Top Experts in step 1
  showExpertSalonInfo() {
    return GetBuilder<BookingScreenController>(
      id: Constant.idStep1,
      builder: (logic) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Expert Container
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: AppColors.whiteColor,
                boxShadow: Constant.boxShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Expert Row
                  Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                              color: AppColors.primaryAppColor, width: 2),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(25),
                          child: CachedNetworkImage(
                            imageUrl: logic.selectedExpertDataList.length > 3
                                ? logic.selectedExpertDataList[3] ?? ""
                                : "",
                            fit: BoxFit.cover,
                            placeholder: (context, url) =>
                                Image.asset(AppAsset.icImagePlaceholder),
                            errorWidget: (context, url, error) =>
                                Image.asset(AppAsset.icImagePlaceholder),
                          ),
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Expert",
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplay,
                                fontSize: 12,
                                color: AppColors.greyColor2,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              "${logic.selectedExpertDataList.length > 1 ? logic.selectedExpertDataList[1] : ""} ${logic.selectedExpertDataList.length > 2 ? logic.selectedExpertDataList[2] : ""}",
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                fontSize: 16,
                                color: AppColors.primaryTextColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: Get.height * 0.15),
          ],
        );
      },
    );
  }
}
