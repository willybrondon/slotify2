import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/app_bar/app_bar.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/date_formatter.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/day_style.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/easy_day_props.dart';
import 'package:salon_2/custom/date_time_picker/src/properties/easy_header_props.dart';
import 'package:salon_2/custom/date_time_picker/src/widgets/easy_date_timeline_widget/easy_date_timeline_widget.dart';
import 'package:salon_2/ui/booking_screen/controller/booking_screen_controller.dart';
import 'package:salon_2/utils/app_asset.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/shimmer.dart';
import 'package:salon_2/utils/utils.dart';

class ReScheduleAppBarView extends StatelessWidget {
  const ReScheduleAppBarView({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBarCustom(
      title: "txtReSchedule".tr,
      method: InkWell(
        overlayColor: WidgetStatePropertyAll(AppColors.transparent),
        onTap: () {
          Get.back();
        },
        child: Icon(
          Icons.arrow_back,
          color: AppColors.whiteColor,
        ),
      ),
    );
  }
}

class ReScheduleSelectDateView extends StatelessWidget {
  const ReScheduleSelectDateView({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<BookingScreenController>(
      id: Constant.idProgressView,
      builder: (logic) {
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
                          style: TextStyle(
                            color: AppColors.primaryTextColor,
                            fontSize: 16,
                            fontFamily: AppFontFamily.sfProDisplay,
                          ),
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
}

BookingScreenController bookingScreenController = Get.put(BookingScreenController());

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
                                          ? AppFontFamily.heeBo500
                                          : AppFontFamily.heeBo700,
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
