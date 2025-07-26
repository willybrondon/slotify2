// ignore_for_file: must_be_immutable

import 'dart:developer';

import 'package:blurrycontainer/blurrycontainer.dart';
import 'package:flutter/material.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/day_style.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/easy_day_props.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/easy_header_props.dart';
import 'package:salon_2/custom/date_time_picker/src/widgets/easy_date_timeline_widget/easy_date_timeline_widget.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/ui/bottom_bar/controller/bottom_bar_controller.dart';
import 'package:salon_2/ui/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/slot_manager_screen/controller/slot_manager_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class SlotManagerScreen extends StatelessWidget {
  SlotManagerScreen({super.key});

  final SlotManagerController slotManagerController = Get.find<SlotManagerController>();

  @override
  Widget build(BuildContext context) {
    LoginScreenController loginScreenController = Get.put(LoginScreenController());

    log("loginScreenController.emailController.text${loginScreenController.emailController.text}");

    slotManagerController.isFirstClick = true;
    log("Is first click :: ${slotManagerController.isFirstClick}");
    double statusBarHeight = MediaQuery.of(context).padding.top;

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
                    ],
                  ).paddingOnly(bottom: 8)
                ],
              ).paddingOnly(left: 18, right: 18),
            ),
          ),
        ),
        backgroundColor: AppColors.whiteColor,
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        floatingActionButton: GetBuilder<SlotManagerController>(
          id: Constant.idUpdateSlots0,
          builder: (logic) {
            return GestureDetector(
              onTap: () {
                logic.onClickUploadSlot(
                    selectSlots: logic.slotsString.toString(),
                    selectDate: logic.formattedDate.toString(),
                    expertId: Constant.storage.read<String>("expertId").toString());
              },
              child: logic.selectedSlotsList.isEmpty
                  ? const SizedBox()
                  : BlurryContainer(
                      height: 68,
                      width: Get.width,
                      blur: 2,
                      elevation: 0,
                      color: Colors.white38,
                      child: Center(
                        child: Container(
                          height: 51,
                          width: 350,
                          decoration: BoxDecoration(
                            color: logic.currentIndex == true ? AppColors.cancelButton : AppColors.primaryAppColor,
                            borderRadius: BorderRadius.circular(45),
                          ),
                          child: Center(
                            child: Text(
                              "txtMakeBusy".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplay,
                                fontSize: 17,
                                color: AppColors.whiteColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
            );
          },
        ),
        body: GetBuilder<SlotManagerController>(
          id: Constant.idUpdateSlots0,
          builder: (logic) {
            return NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) {
                return [
                  SliverList(
                    delegate: SliverChildListDelegate.fixed(
                      [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "txtSlotManagement".tr,
                              style: TextStyle(
                                fontFamily: AppFontFamily.sfProDisplayBold,
                                color: AppColors.primaryTextColor,
                                fontSize: 20,
                              ),
                            ).paddingOnly(left: 13),
                            Container(
                              height: 150,
                              width: Get.width,
                              margin: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.whiteColor,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(width: 1, color: AppColors.grey.withOpacity(0.1)),
                              ),
                              child: EasyDateTimeLine(
                                initialDate: DateTime.now(),
                                disabledDates: logic.getDisabledDates(),
                                onDateChange: (selectedDate) async {
                                  logic.comparedList.clear();
                                  logic.formattedDate = DateFormat('yyyy-MM-dd').format(selectedDate);
                                  log("Selected Date :: ${logic.formattedDate}");
                                  log("salon Id :: ${Constant.storage.read<String>("salonId").toString()}");
                                  logic.selectedSlotsList.clear();
                                  logic.currentIndex = false;

                                  await logic.onGetBookingApiCall(
                                    selectedDate: logic.formattedDate.toString(),
                                    expertId: Constant.storage.read<String>("expertId").toString(),
                                    salonId: Constant.storage.read<String>("salonId").toString(),
                                  );
                                  logic.selectedAndBookSlot();
                                  logic.checkSlot();
                                  logic.onGetSlotsList();
                                },
                                headerProps: EasyHeaderProps(
                                  monthPickerType: MonthPickerType.switcher,
                                  showMonthPicker: true,
                                  selectedDateFormat: SelectedDateFormat.fullDateMonthAsStrDY,
                                  monthStyle: TextStyle(
                                    color: AppColors.primaryTextColor,
                                    fontFamily: AppFontFamily.sfProDisplay,
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
                                      color: AppColors.dateUnSelect,
                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                    ),
                                    dayStrStyle: TextStyle(
                                      color: AppColors.dateUnSelect,
                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                    ),
                                  ),
                                  activeDayStyle: DayStyle(
                                    dayNumStyle: TextStyle(
                                      color: AppColors.primaryTextColor,
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                    ),
                                    dayStrStyle: TextStyle(
                                      color: AppColors.primaryTextColor,
                                      fontFamily: AppFontFamily.sfProDisplayBold,
                                    ),
                                    decoration: BoxDecoration(
                                      borderRadius: const BorderRadius.all(
                                        Radius.circular(8),
                                      ),
                                      color: AppColors.dateSelect,
                                    ),
                                  ),
                                  inactiveDayStyle: DayStyle(
                                    dayNumStyle: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                      color: AppColors.dateUnSelect,
                                    ),
                                    dayStrStyle: TextStyle(
                                      fontFamily: AppFontFamily.sfProDisplayMedium,
                                      color: AppColors.dateUnSelect,
                                    ),
                                  ),
                                ),
                              ),
                            ).paddingOnly(bottom: 10),
                            logic.isSlotTimePassed == true
                                ? const SizedBox.shrink()
                                : Container(
                                    width: Get.width,
                                    decoration: BoxDecoration(
                                      color: AppColors.holidayBg,
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    padding: const EdgeInsets.all(13),
                                    margin: const EdgeInsets.only(left: 12, right: 12, bottom: 12),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          "txtHolidayMode".tr,
                                          style: TextStyle(
                                            fontFamily: AppFontFamily.heeBo700,
                                            color: AppColors.redColor,
                                            fontSize: 17,
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            Image.asset(AppAsset.icHoliday, height: 22).paddingOnly(right: 8),
                                            SizedBox(
                                              width: Get.width * 0.62,
                                              child: Text(
                                                "desNotAvailableWork".tr,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontFamily: AppFontFamily.heeBo600,
                                                  color: AppColors.primaryAppColor,
                                                  fontSize: 16,
                                                ),
                                              ),
                                            ),
                                            const Spacer(),
                                            GetBuilder<SlotManagerController>(
                                              id: Constant.idSwitchOn,
                                              builder: (logic) {
                                                return SizedBox(
                                                  height: 30,
                                                  child: Switch(
                                                    value: logic.isSwitchOn,
                                                    activeColor: AppColors.greenColor,
                                                    activeTrackColor: AppColors.whiteColor,
                                                    inactiveThumbColor: AppColors.redColor,
                                                    inactiveTrackColor: AppColors.whiteColor,
                                                    trackOutlineColor: WidgetStatePropertyAll(AppColors.grey.withOpacity(0.15)),
                                                    trackColor: WidgetStatePropertyAll(AppColors.switchBox),
                                                    onChanged: (value) {
                                                      if (logic.comparedList.length != logic.getBookingModel?.timeSlots?.length) {
                                                        logic.onSwitch(value);
                                                      }
                                                    },
                                                  ),
                                                );
                                              },
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ];
              },
              body: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "txtAvailableSlots".tr,
                    style: TextStyle(
                      fontFamily: AppFontFamily.sfProDisplayBold,
                      color: AppColors.primaryTextColor,
                      fontSize: 16,
                    ),
                  ).paddingOnly(left: 15),
                  Expanded(
                    child: Container(
                      height: Get.height,
                      width: Get.width,
                      margin: const EdgeInsets.only(top: 10, left: 15, right: 15, bottom: 10),
                      padding: const EdgeInsets.only(top: 15),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        color: AppColors.whiteColor,
                        border: Border.all(
                          width: 1,
                          color: AppColors.grey.withOpacity(0.1),
                        ),
                      ),
                      child: SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Container(
                                  height: 18,
                                  width: 28,
                                  margin: const EdgeInsets.only(right: 5),
                                  decoration: BoxDecoration(
                                    color: AppColors.redButton,
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                                Text(
                                  "txtNotAvailable".tr,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    color: AppColors.blackColor,
                                    fontSize: 14,
                                  ),
                                ),
                                Container(
                                  height: 18,
                                  width: 28,
                                  margin: const EdgeInsets.only(right: 5, left: 10),
                                  decoration: BoxDecoration(
                                    color: AppColors.greenButton,
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                                Text(
                                  "txtAvailable".tr,
                                  style: TextStyle(
                                    fontFamily: AppFontFamily.sfProDisplay,
                                    color: AppColors.blackColor,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ).paddingOnly(right: 15),
                            logic.isLoading.value
                                ? Shimmers.slotManagementShimmer()
                                : logic.getBookingModel?.status == true
                                    ? logic.getBookingModel?.isOpen == false
                                        ? Center(
                                            child: SizedBox(
                                              height: 220,
                                              width: 220,
                                              child: Image.asset(AppAsset.imgSalonClosed),
                                            ).paddingOnly(top: 30),
                                          )
                                        : Column(
                                            children: [
                                              !(logic.hasMorningSlots)
                                                  ? const SizedBox()
                                                  : buildSlotCategory(
                                                      "txtMorning".tr,
                                                      slotManagerController.morningSlots,
                                                      logic.formattedDate.toString(),
                                                    ),
                                              logic.getBookingModel?.allSlots?.evening?.isEmpty == true
                                                  ? const SizedBox()
                                                  : !(logic.hasAfternoonSlots)
                                                      ? const SizedBox()
                                                      : buildSlotCategory(
                                                          "txtAfternoon".tr,
                                                          slotManagerController.afternoonSlots,
                                                          logic.formattedDate.toString(),
                                                        ),
                                            ],
                                          )
                                    : Utils.showToast(Get.context!, logic.getBookingModel?.message ?? ""),
                            SizedBox(height: Get.height * 0.08)
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget buildSlotCategory(String category, List<String> slots, String selectedDate) {
    slotManagerController.hasMorningSlots = slots.any((slot) {
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

    if (!(slotManagerController.hasMorningSlots) && category == "Morning") {
      return const SizedBox();
    }

    return SafeArea(
      child: GetBuilder<SlotManagerController>(
        id: Constant.idUpdateSlots,
        builder: (logic) {
          return logic.isLoading.value
              ? Shimmers.slotManagementShimmer()
              : Container(
                  width: Get.width,
                  decoration: BoxDecoration(
                    color: AppColors.whiteColor,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 15, bottom: 5),
                        child: Text(
                          category,
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.primaryTextColor,
                            fontFamily: AppFontFamily.sfProDisplayBold,
                          ),
                        ),
                      ),
                      AnimationLimiter(
                        child: GridView.builder(
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3, childAspectRatio: 2, crossAxisSpacing: 5, mainAxisSpacing: 0.10),
                          itemCount: slots.length,
                          itemBuilder: (context, index) {
                            DateTime currentTime = DateTime.now();
                            DateTime currentDate = DateTime.now();
                            DateTime slotDateTime = DateFormat('yyyy-MM-dd').parse(selectedDate);

                            DateTime currentTimeWithDate = DateTime(
                                currentDate.year, currentDate.month, currentDate.day, currentTime.hour, currentTime.minute);
                            bool isSelected = logic.selectedSlotsList.contains(slots[index]);

                            DateTime slotTime = DateFormat('hh:mm a').parse(slots[index]);
                            DateTime slotTimeWithDate =
                                DateTime(slotDateTime.year, slotDateTime.month, slotDateTime.day, slotTime.hour, slotTime.minute);

                            ///   isSlotBooked
                            List<String>? timeSlots = logic.getBookingModel?.timeSlots;

                            bool isSlotBooked = timeSlots != null && timeSlots.contains(slots[index]);

                            bool isSlotTimePassed =
                                currentDate.isAfter(slotDateTime) && currentTimeWithDate.isAfter(slotTimeWithDate);
                            logic.isFirstTap = true;

                            return AnimationConfiguration.staggeredGrid(
                              position: index,
                              duration: const Duration(milliseconds: 500),
                              columnCount: slots.length,
                              child: ScaleAnimation(
                                child: FadeInAnimation(
                                  child: GestureDetector(
                                    onTap: () {
                                      if (logic.currentIndex == false) {
                                        if (isSlotBooked) {
                                          if (logic.isFirstTap) {
                                            logic.isFirstTap = false;
                                            Future.delayed(
                                              const Duration(seconds: 5),
                                              () {
                                                logic.isFirstTap = true;
                                              },
                                            );
                                            Utils.showToast(Get.context!, "desSlotBooked".tr);
                                          }
                                        } else if (isSlotTimePassed) {
                                          if (logic.isFirstTap) {
                                            logic.isFirstTap = false;
                                            Future.delayed(
                                              const Duration(seconds: 5),
                                              () {
                                                logic.isFirstTap = true;
                                              },
                                            );
                                            Utils.showToast(Get.context!, "desPreviousSlot".tr);
                                          }
                                        } else {
                                          logic.selectSlot(slots[index]);

                                          logic.slotsString = logic.selectedSlotsList.join(',');
                                          log("Slots String :: ${logic.slotsString}");
                                          log("selectedSlotsList :: ${logic.selectedSlotsList}");
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
                                              decorationColor: AppColors.slotText,
                                              decoration: isSlotBooked || isSlotTimePassed
                                                  ? TextDecoration.lineThrough
                                                  : TextDecoration.none,
                                              color: isSelected
                                                  ? isSlotBooked
                                                      ? AppColors.slotText
                                                      : AppColors.whiteColor
                                                  : AppColors.slotText,
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
}
