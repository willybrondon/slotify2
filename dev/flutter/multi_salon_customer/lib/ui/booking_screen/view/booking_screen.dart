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

  BookingScreenController bookingScreenController = Get.put(BookingScreenController());
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

                    logic.expertDetail != null ? logic.onExpertSelect() : logic.selectExpert = -1;

                    await logic.onGetBookingApiCall(
                      selectedDate: logic.date,
                      expertId: Constant.storage.read<String>('expertDetail') != null
                          ? Constant.storage.read<String>('expertDetail').toString()
                          : Constant.storage.read<String>('expertId').toString(),
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
                    color: AppColors.whiteColor,
                  ),
                );
              },
            ),
          ),
        ),
        bottomNavigationBar: GetBuilder<BookingScreenController>(
          id: Constant.idConfirm,
          builder: (logic) {
            return InkWell(
              overlayColor: WidgetStatePropertyAll(AppColors.transparent),
              onTap: () {
                Get.dialog(
                  barrierColor: AppColors.blackColor.withOpacity(0.8),
                  Dialog(
                    backgroundColor: AppColors.transparent,
                    shadowColor: AppColors.transparent,
                    elevation: 0,
                    child: const ServicePriceDialog(),
                  ),
                );
              },
              child: Container(
                height: Get.height * 0.120,
                width: double.infinity,
                alignment: Alignment.bottomLeft,
                decoration: BoxDecoration(
                  color: AppColors.categoryBottom,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.blackColor.withOpacity(0.05),
                      offset: const Offset(
                        0.0,
                        1.0,
                      ),
                      blurRadius: 2.0,
                      spreadRadius: 2.0,
                    ), //BoxShadow
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
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Row(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            height: 23,
                            width: Get.width * 0.62,
                            child: SizedBox(
                              height: 20,
                              width: Get.width * 0.02,
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Text(
                                  logic.checkItem.join(", "),
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    fontSize: 17.5,
                                    color: AppColors.categoryService,
                                  ),
                                ),
                              ),
                            ),
                          ).paddingOnly(left: 5, bottom: 7),
                          logic.withOutTaxRupee == 0.0 && logic.totalPrice == 0.0 && logic.finalTaxRupee == 0.0
                              ? const SizedBox()
                              : Row(
                                  children: [
                                    Text(
                                      "$currency ${logic.withOutTaxRupee.toStringAsFixed(2)}",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplay,
                                        fontSize: 15.5,
                                        color: AppColors.currency.withOpacity(0.9),
                                      ),
                                    ),
                                    Text(
                                      " ($currency${logic.finalTaxRupee.toStringAsFixed(2)} ${"txtTax".tr})",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplay,
                                        fontSize: 12.5,
                                        color: AppColors.currency.withOpacity(0.9),
                                      ),
                                    ),
                                    SizedBox(width: Get.width * 0.02),
                                    Text(
                                      "= $currency ${logic.totalPrice.toStringAsFixed(2)}",
                                      style: TextStyle(
                                        fontFamily: AppFontFamily.sfProDisplayBold,
                                        fontSize: 17,
                                        color: AppColors.currency,
                                      ),
                                    ),
                                  ],
                                ).paddingOnly(left: 5)
                        ],
                      ),
                    ),
                    const Spacer(),
                    AppButton(
                      height: 46,
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
                      buttonText: logic.currentStep == 3 ? "txtConfirm".tr : "txtNext".tr,
                      width: Get.width * 0.28,
                      onTap: () async {
                        if (logic.currentStep == 0) {
                          if (logic.searchEditingController.text.isEmpty && logic.selectedVenue == "At Home") {
                            Utils.showToast(context, "Please enter an address");
                          } else {
                            logic.onConfirmButton(context);
                          }
                        } else if (logic.currentStep == 1) {
                          if (logic.expertDetail != null) {
                            logic.onConfirmButton(context);

                            await logic.onGetBookingApiCall(
                              selectedDate: logic.date,
                              expertId: Constant.storage.read<String>('expertDetail') != null
                                  ? Constant.storage.read<String>('expertDetail').toString()
                                  : Constant.storage.read<String>('expertId').toString(),
                              salonId: logic.salonId.toString(),
                            );

                            logic.formattedDate = logic.date;

                            logic.splitBreakTime();
                            logic.onGetSlotsList();
                            log("Get Booking Status :: ${logic.getBookingModel?.status}");
                            if (logic.getBookingModel?.status == false) {
                              Utils.showToast(Get.context!, logic.getBookingModel?.message ?? "");
                            }

                            logic.rupee = (logic.totalPrice.toDouble() + logic.finalTaxRupee.toDouble());
                            log("rupee :: ${logic.rupee}");
                          } else {
                            if (logic.selectExpert == -1) {
                            } else {
                              logic.onConfirmButton(context);

                              await logic.onGetBookingApiCall(
                                selectedDate: logic.date,
                                expertId: Constant.storage.read<String>('expertDetail') != null
                                    ? Constant.storage.read<String>('expertDetail').toString()
                                    : Constant.storage.read<String>('expertId').toString(),
                                salonId: logic.salonId.toString(),
                              );
                              logic.formattedDate = logic.date;

                              logic.splitBreakTime();
                              logic.onGetSlotsList();

                              if (logic.getBookingModel?.status == true) {
                              } else {
                                Utils.showToast(Get.context!, logic.getBookingModel?.message ?? "");
                              }

                              logic.rupee = (logic.totalPrice.toDouble() + logic.finalTaxRupee.toDouble());
                              log("rupee :: ${logic.rupee}");
                            }
                          }
                        } else if (logic.currentStep == 2) {
                          log("Enter Step 1");

                          if (logic.selectedSlotsList.isEmpty) {
                          } else {
                            await logic.onGetCheckBookingApiCall(
                              userId: Constant.storage.read<String>('userId') ?? "",
                              expertId: Constant.storage.read<String>('expertDetail') != null
                                  ? Constant.storage.read<String>('expertDetail').toString()
                                  : Constant.storage.read<String>('expertId').toString(),
                              serviceId: logic.serviceId.join(","),
                              salonId: logic.salonId.toString(),
                              date: logic.formattedDate.toString(),
                              time: logic.slotsString.toString(),
                              amount: bookingScreenController.totalPrice,
                              withoutTax: bookingScreenController.withOutTaxRupee.toInt(),
                            );

                            if (logic.getCheckBookingCategory?.status == true) {
                              logic.onConfirmButton(context);
                            } else {
                              Utils.showToast(Get.context!, logic.getCheckBookingCategory?.message ?? "");
                            }
                          }
                        } else if (logic.currentStep == 3) {
                          log("Enter Step 2");
                          logic.onConfirmButton(context);
                        } else {
                          log("Error In Stepper");
                        }
                      },
                    )
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
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
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
                                logic.currentStep >= 0
                                    ? stepDesign(
                                        color: AppColors.primaryAppColor,
                                        title: "Venue",
                                        widget: Image.asset(
                                          AppAsset.icCheck1,
                                          height: 20,
                                          width: 20,
                                        ),
                                      )
                                    : stepDesign(
                                        color: AppColors.transparent,
                                        title: "Venue",
                                        fontColor: AppColors.greyColor2,
                                      ),
                                const SizedBox(width: 10),
                                divider(color: logic.currentStep >= 1 ? AppColors.primaryAppColor : AppColors.greyColor),
                                const SizedBox(width: 10),
                                logic.currentStep >= 1
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
                                            fontFamily: AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.stepper,
                                          ),
                                        ),
                                      ),
                                const SizedBox(width: 10),
                                divider(color: logic.currentStep >= 2 ? AppColors.primaryAppColor : AppColors.greyColor),
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
                                            fontFamily: AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.stepper,
                                          ),
                                        ),
                                      ),
                                divider(color: logic.currentStep >= 3 ? AppColors.primaryAppColor : AppColors.greyColor),
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
                                            fontFamily: AppFontFamily.sfProDisplay,
                                            fontSize: 13,
                                            color: AppColors.stepper,
                                          ),
                                        ),
                                      ),
                              ],
                            ),
                          ),
                          SizedBox(height: Get.height * 0.03),
                          logic.currentStep == 0
                              ? selectServiceVenue()
                              : logic.currentStep == 1
                                  ? selectExpert()
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
              "Select Service Venue",
              style: TextStyle(
                fontFamily: AppFontFamily.sfProDisplay,
                fontSize: 15,
                color: AppColors.primaryTextColor,
              ),
            ),
            const SizedBox(height: 15),
            GestureDetector(
              onTap: () => logic.selectVenue("At Salon"),
              child: Container(
                height: 60,
                width: Get.width,
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: logic.selectedVenue == "At Salon" ? AppColors.primaryAppColor : AppColors.greyColor.withOpacity(0.2),
                    width: 0.7,
                  ),
                ),
                padding: const EdgeInsets.only(left: 12, right: 12),
                child: Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(AppAsset.icSalonIcon).paddingAll(10),
                    ),
                    const SizedBox(width: 7),
                    Text(
                      "At Salon",
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 17,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      height: 22,
                      width: 22,
                      decoration: BoxDecoration(
                        color: logic.selectedVenue == "At Salon" ? AppColors.primaryAppColor : AppColors.whiteColor,
                        border: Border.all(
                          color: AppColors.grey.withOpacity(0.2),
                          width: 0.8,
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: logic.selectedVenue == "At Salon" ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 15),
            GestureDetector(
              onTap: () => logic.selectVenue("At Home"),
              child: Container(
                height: 60,
                width: Get.width,
                decoration: BoxDecoration(
                  color: AppColors.whiteColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: logic.selectedVenue == "At Home" ? AppColors.primaryAppColor : AppColors.greyColor.withOpacity(0.2),
                    width: 0.7,
                  ),
                ),
                padding: const EdgeInsets.only(left: 12, right: 12),
                child: Row(
                  children: [
                    Container(
                      height: 40,
                      width: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.roundBg,
                      ),
                      child: Image.asset(AppAsset.icHomeIcon).paddingAll(10),
                    ),
                    const SizedBox(width: 7),
                    Text(
                      "At Home",
                      style: TextStyle(
                        fontFamily: AppFontFamily.sfProDisplay,
                        fontSize: 17,
                        color: AppColors.primaryTextColor,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      height: 22,
                      width: 22,
                      decoration: BoxDecoration(
                        color: logic.selectedVenue == "At Home" ? AppColors.primaryAppColor : AppColors.whiteColor,
                        border: Border.all(
                          color: AppColors.grey.withOpacity(0.2),
                          width: 1,
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: logic.selectedVenue == "At Home" ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                    ),
                  ],
                ),
              ),
            ),
            if (logic.selectedVenue == "At Home") ...[
              const SizedBox(height: 15),
              Container(
                width: double.infinity,
                height: 150,
                margin: const EdgeInsets.only(bottom: 15),
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
                  hintText: "Please enter address",
                  obscureText: false,
                  textInputAction: TextInputAction.newline,
                  maxLines: 5,
                  controller: logic.searchEditingController,
                ),
              ),
            ]
          ],
        );
      },
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
                      logic.selectedExpertDataList.isEmpty ? logic.onExpertSelect() : null;

                      return logic.getExpertServiceBaseSalonCategory?.data?.isEmpty == true
                          ? Center(
                              child: Column(
                                children: [
                                  Image.asset(AppAsset.icNoExpert, height: 150, width: 150).paddingOnly(bottom: 7),
                                  Text(
                                    "txtNoFoundExpert".tr,
                                    style: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayBold,
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
                                itemCount:
                                    logic.expertDetail != null ? 1 : logic.getExpertServiceBaseSalonCategory?.data?.length ?? 0,
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  childAspectRatio: 0.80,
                                  crossAxisSpacing: 13.5,
                                  mainAxisSpacing: 2,
                                ),
                                itemBuilder: (BuildContext context, int index) {
                                  logic.rating = logic.expertDetail != null
                                      ? logic.selectedExpertDataList[4]
                                      : logic.getExpertServiceBaseSalonCategory?.data?[index].review ?? 0.0;
                                  logic.roundedRating = logic.rating?.round();
                                  logic.filledStars = logic.roundedRating?.clamp(0, 5);

                                  return AnimationConfiguration.staggeredGrid(
                                    position: index,
                                    duration: const Duration(milliseconds: 800),
                                    columnCount: logic.getExpertServiceBaseSalonCategory?.data?.length ?? 0,
                                    child: ScaleAnimation(
                                      child: FadeInAnimation(
                                        child: GestureDetector(
                                          onTap: () {
                                            Constant.storage.write(
                                              'expertId',
                                              logic.expertDetail ?? logic.getExpertServiceBaseSalonCategory?.data?[index].id,
                                            );

                                            log("Expert Id Issss :: ${logic.expertDetail}");
                                            log("Expert Id Is :: ${Constant.storage.read<String>('expertId')}");

                                            if (logic.selectedExpertDataList.isEmpty) {
                                              logic.onStep1(index);
                                            }
                                          },
                                          child: Container(
                                            width: Get.width * 0.45,
                                            margin: const EdgeInsets.only(top: 10),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(18),
                                              color: AppColors.whiteColor,
                                              boxShadow: Constant.boxShadow,
                                            ),
                                            child: Stack(
                                              children: [
                                                Align(
                                                  alignment: Alignment.center,
                                                  child: Column(
                                                    mainAxisAlignment: MainAxisAlignment.center,
                                                    children: [
                                                      DottedBorder(
                                                        color: AppColors.roundBorder,
                                                        borderType: BorderType.RRect,
                                                        radius: const Radius.circular(41),
                                                        strokeWidth: 1,
                                                        dashPattern: const [3, 3],
                                                        child: Container(
                                                          height: 80,
                                                          width: 80,
                                                          decoration: const BoxDecoration(shape: BoxShape.circle),
                                                          clipBehavior: Clip.hardEdge,
                                                          child: CachedNetworkImage(
                                                            imageUrl: logic.expertDetail != null
                                                                ? logic.selectedExpertDataList[3]
                                                                : logic.getExpertServiceBaseSalonCategory?.data?[index].image ??
                                                                    "",
                                                            fit: BoxFit.cover,
                                                            placeholder: (context, url) {
                                                              return Image.asset(AppAsset.icPlaceHolder);
                                                            },
                                                            errorWidget: (context, url, error) {
                                                              return Icon(
                                                                Icons.error_outline,
                                                                color: AppColors.blackColor,
                                                                size: 20,
                                                              );
                                                            },
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(height: Get.height * 0.015),
                                                      logic.expertDetail != null
                                                          ? Text(
                                                              "${logic.selectedExpertDataList[1]} ${logic.selectedExpertDataList[2]}",
                                                              maxLines: 1,
                                                              overflow: TextOverflow.ellipsis,
                                                              style: TextStyle(
                                                                fontFamily: AppFontFamily.sfProDisplay,
                                                                fontSize: 15.5,
                                                                color: AppColors.category,
                                                              ),
                                                            )
                                                          : Text(
                                                              "${logic.getExpertServiceBaseSalonCategory?.data?[index].fname} ${logic.getExpertServiceBaseSalonCategory?.data?[index].lname}",
                                                              maxLines: 1,
                                                              overflow: TextOverflow.ellipsis,
                                                              style: TextStyle(
                                                                fontFamily: AppFontFamily.sfProDisplay,
                                                                fontSize: 15.5,
                                                                color: AppColors.category,
                                                              ),
                                                            ),
                                                      SizedBox(height: Get.height * 0.015),
                                                      Container(
                                                        height: 32,
                                                        decoration: BoxDecoration(
                                                          borderRadius: BorderRadius.circular(8),
                                                          color: AppColors.yellow2,
                                                        ),
                                                        child: SizedBox(
                                                          height: 15,
                                                          child: ListView.separated(
                                                            shrinkWrap: true,
                                                            itemCount: 5,
                                                            scrollDirection: Axis.horizontal,
                                                            padding: const EdgeInsets.symmetric(horizontal: 13),
                                                            itemBuilder: (context, index) {
                                                              if (index < logic.filledStars!) {
                                                                return Image.asset(
                                                                  AppAsset.icStarFilled,
                                                                  height: 15,
                                                                  width: 15,
                                                                );
                                                              } else {
                                                                return Image.asset(
                                                                  AppAsset.icStarOutline,
                                                                  height: 15,
                                                                  width: 15,
                                                                );
                                                              }
                                                            },
                                                            separatorBuilder: (context, index) {
                                                              return SizedBox(width: Get.width * 0.017);
                                                            },
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                logic.selectExpert == index
                                                    ? Align(
                                                        alignment: Alignment.topRight,
                                                        child: Container(
                                                          height: 22,
                                                          width: 22,
                                                          padding: const EdgeInsets.all(7),
                                                          decoration: BoxDecoration(
                                                            shape: BoxShape.circle,
                                                            color: AppColors.primaryAppColor,
                                                          ),
                                                          child: Image.asset(
                                                            AppAsset.icCheck,
                                                          ),
                                                        ),
                                                      )
                                                    : Align(
                                                        alignment: Alignment.topRight,
                                                        child: Container(
                                                          height: 22,
                                                          width: 22,
                                                          padding: const EdgeInsets.all(7),
                                                          decoration: BoxDecoration(
                                                            shape: BoxShape.circle,
                                                            border: Border.all(
                                                              color: AppColors.greyColor.withOpacity(0.2),
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
                        logic.formattedDate = DateFormat('yyyy-MM-dd').format(selectedDate);
                        log("Selected Date :: ${logic.formattedDate}");

                        await logic.onGetBookingApiCall(
                          selectedDate: logic.formattedDate.toString(),
                          expertId: Constant.storage.read<String>('expertDetail') != null
                              ? Constant.storage.read<String>('expertDetail').toString()
                              : Constant.storage.read<String>('expertId').toString(),
                          salonId: logic.salonId.toString(),
                        );

                        if (logic.getBookingModel?.status == true) {
                          logic.splitBreakTime();
                          logic.onGetSlotsList();
                        } else {
                          Utils.showToast(Get.context!, logic.getBookingModel?.message ?? "");
                        }
                      },
                      headerProps: EasyHeaderProps(
                        monthPickerType: MonthPickerType.switcher,
                        showMonthPicker: true,
                        dateFormatter: const DateFormatter.fullDateDMonthAsStrY(),
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
                            color: AppColors.primaryAppColor,
                            fontFamily: AppFontFamily.sfProDisplayBold,
                          ),
                          dayStrStyle: TextStyle(
                            color: AppColors.primaryAppColor,
                            fontFamily: AppFontFamily.sfProDisplayBold,
                          ),
                          decoration: BoxDecoration(
                            borderRadius: const BorderRadius.all(Radius.circular(8)),
                            color: AppColors.dateSelect,
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
                        ),
                      ),
                    ),
                  ).paddingOnly(bottom: 10),
                  logic.getBookingModel?.status == true
                      ? Text(
                          "txtAvailableSlots".tr,
                          style:
                              TextStyle(color: AppColors.primaryTextColor, fontSize: 16, fontFamily: AppFontFamily.sfProDisplay),
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
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      !(logic.hasMorningSlots)
                                          ? const SizedBox()
                                          : buildSlotCategory(
                                              "txtMorning".tr, logic.morningSlots, logic.formattedDate.toString()),
                                      logic.getBookingModel?.allSlots?.evening?.isEmpty == true
                                          ? const SizedBox()
                                          : !(logic.hasAfternoonSlots)
                                              ? const SizedBox()
                                              : buildSlotCategory(
                                                  "txtAfternoon".tr, logic.afternoonSlots, logic.formattedDate.toString()),
                                    ],
                                  ),
                                )
                          : Utils.showToast(Get.context!, logic.getBookingModel?.message ?? ""),
                ],
              );
            },
          ),
        );
      },
    );
  }

  Widget buildSlotCategory(String category, List<String> slots, String selectedDate) {
    bookingScreenController.hasMorningSlots = slots.any((slot) {
      DateTime currentTime = DateTime.now();
      DateTime currentDate = DateTime.now();
      DateTime slotDateTime = DateFormat('yyyy-MM-dd').parse(selectedDate);

      DateTime currentTimeWithDate = DateTime(
        currentDate.year,
        currentDate.month,
        currentDate.day,
        currentTime.hour,
        currentTime.minute,
      );

      DateTime slotTime = DateFormat('hh:mm a').parse(slot);
      DateTime slotTimeWithDate = DateTime(
        slotDateTime.year,
        slotDateTime.month,
        slotDateTime.day,
        slotTime.hour,
        slotTime.minute,
      );

      return !currentDate.isAfter(slotDateTime) || !currentTimeWithDate.isAfter(slotTimeWithDate);
    });

    if (!(bookingScreenController.hasMorningSlots) && category == "Morning") {
      return const SizedBox();
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
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 2,
                      crossAxisSpacing: 3,
                      mainAxisSpacing: 0.10,
                    ),
                    itemCount: slots.length,
                    itemBuilder: (context, index) {
                      DateTime currentTime = DateTime.now();
                      DateTime currentDate = DateTime.now();
                      DateTime slotDateTime = DateFormat('yyyy-MM-dd').parse(selectedDate);

                      DateTime currentTimeWithDate =
                          DateTime(currentDate.year, currentDate.month, currentDate.day, currentTime.hour, currentTime.minute);

                      DateTime slotTime = DateFormat('hh:mm a').parse(slots[index]);
                      DateTime slotTimeWithDate =
                          DateTime(slotDateTime.year, slotDateTime.month, slotDateTime.day, slotTime.hour, slotTime.minute);

                      List<String>? timeSlots = logic.getBookingModel?.timeSlots;

                      bool isSlotBooked = timeSlots != null && timeSlots.contains(slots[index]);
                      bool isSelected = logic.selectedSlotsList.contains(slots[index]);

                      bool isSlotTimePassed = currentDate.isAfter(slotDateTime) && currentTimeWithDate.isAfter(slotTimeWithDate);

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
                                    Utils.showToast(Get.context!, "desSlotBooked".tr);
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
                                    Utils.showToast(Get.context!, "desPreviousSlot".tr);
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
                                    List<String>? alreadyBookedSlot = logic.getBookingModel?.timeSlots;

                                    List commonElements = selectSlot.toSet().intersection(alreadyBookedSlot!.toSet()).toList();

                                    log("Booked Slot is :: ${logic.getBookingModel?.timeSlots}");
                                    log("Select Slot is :::: ${logic.selectedSlotsList}");
                                    log("Common element :: $commonElements");

                                    if (commonElements.isNotEmpty) {
                                      Utils.showToast(Get.context!, "desInvalidSlot".tr);
                                    }

                                    /// if already booked slot within break time
                                    List slotSelected = logic.selectedSlotsList;
                                    String breakTimes = logic.breakStartTimes.trim();

                                    if (slotSelected.contains(breakTimes)) {
                                      Utils.showToast(Get.context!, "desInvalidSlot".tr);
                                    }

                                    /// if already booked slot within shop close time
                                    log("The Shop Close time :: ${logic.getBookingModel?.salonTime?.closedTime}");

                                    if (slotSelected.contains(logic.getBookingModel?.salonTime?.closedTime)) {
                                      Utils.showToast(Get.context!, "desInvalidSlot".tr);
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
                                    color: isSelected
                                        ? isSlotBooked
                                            ? AppColors.greenButton
                                            : AppColors.primaryAppColor
                                        : isSlotTimePassed || isSlotBooked
                                            ? AppColors.redButton
                                            : AppColors.greenButton,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Center(
                                    child: Text(
                                      slots[index],
                                      style: TextStyle(
                                        fontFamily: isSlotBooked || isSlotTimePassed
                                            ? AppFontFamily.sfProDisplayRegular
                                            : AppFontFamily.sfProDisplay,
                                        fontSize: 14,
                                        decoration:
                                            isSlotBooked || isSlotTimePassed ? TextDecoration.lineThrough : TextDecoration.none,
                                        color: isSelected
                                            ? isSlotBooked
                                                ? AppColors.textSlot
                                                : AppColors.whiteColor
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
            GetBuilder<BookingScreenController>(
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
                            Row(
                              children: [
                                Text(
                                  "txtMyWallet".tr,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    fontSize: 16.5,
                                    color: AppColors.primaryTextColor,
                                  ),
                                ).paddingOnly(right: 5),
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
            ).paddingOnly(bottom: 15),

            /// Razorpay Payment
            splashController.settingCategory?.setting?.isRazorPay == true
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          logic.onStep3("Razorpay");
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
                                      AppAsset.icRazorPay,
                                      height: 30,
                                      width: 30,
                                    ),
                                  ),
                                  SizedBox(width: Get.width * 0.04),
                                  Text(
                                    "Razorpay",
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
                                  logic.onStep3("Razorpay");
                                },
                                child: Container(
                                  height: 25,
                                  width: 25,
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: logic.selectedPayment == "Razorpay"
                                          ? AppColors.primaryAppColor
                                          : AppColors.greyColor.withOpacity(0.3),
                                    ),
                                  ),
                                  child: logic.selectedPayment == "Razorpay"
                                      ? Image.asset(
                                          AppAsset.icCheck,
                                          color: AppColors.primaryAppColor,
                                          height: 15,
                                          width: 15,
                                        )
                                      : const SizedBox(),
                                ).paddingOnly(right: 10),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ).paddingOnly(bottom: 15)
                : const SizedBox(),

            /// Stripe Payment
            splashController.settingCategory?.setting?.isStripePay == true
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
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
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(
                                            color: logic.selectedPayment == "Stripe"
                                                ? AppColors.primaryAppColor
                                                : AppColors.greyColor.withOpacity(0.3),
                                          ),
                                        ),
                                        child: logic.selectedPayment == "Stripe"
                                            ? Image.asset(
                                                AppAsset.icCheck,
                                                color: AppColors.primaryAppColor,
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

            /// Flutter Wave Payment
            splashController.settingCategory?.setting?.isFlutterWave == true
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
                        onTap: () {
                          logic.onStep3("flutterWave");
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
                                      AppAsset.icFlutterWave,
                                      height: 30,
                                      width: 30,
                                    ),
                                  ),
                                  SizedBox(width: Get.width * 0.04),
                                  Text(
                                    "Flutter Wave",
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
                                  logic.onStep3("flutterWave");
                                },
                                child: Container(
                                  height: 25,
                                  width: 25,
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: logic.selectedPayment == "flutterWave"
                                          ? AppColors.primaryAppColor
                                          : AppColors.greyColor.withOpacity(0.3),
                                    ),
                                  ),
                                  child: logic.selectedPayment == "flutterWave"
                                      ? Image.asset(
                                          AppAsset.icCheck,
                                          color: AppColors.primaryAppColor,
                                          height: 15,
                                          width: 15,
                                        )
                                      : const SizedBox(),
                                ).paddingOnly(right: 10),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ).paddingOnly(bottom: 15)
                : const SizedBox(),

            /// Cash After Service Payment
            splashController.settingCategory?.setting?.cashAfterService == true
                ? GetBuilder<BookingScreenController>(
                    id: Constant.idStep3,
                    builder: (logic) {
                      return InkWell(
                        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
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
                                      color: logic.selectedPayment == "cashAfterService"
                                          ? AppColors.primaryAppColor
                                          : AppColors.greyColor.withOpacity(0.3),
                                    ),
                                  ),
                                  child: logic.selectedPayment == "cashAfterService"
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
}
