import 'dart:convert';
import 'dart:developer';

import 'package:http/http.dart' as http;
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/ui/slot_manager_screen/model/expert_busy_schedule_model.dart';
import 'package:salon_2/ui/slot_manager_screen/model/get_booking_model.dart';
import 'package:salon_2/utils/api.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/services/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SlotManagerController extends GetxController {
  List<String> morningSlots = [];
  List<String> afternoonSlots = [];
  List<String> eveningSlots = [];
  List<String> selectedSlotsList = [];
  List<String> allSlots = [];
  List<String> comparedList = [];
  String? slotsString;
  String selectedSlot = '';
  String shopOpenTime = "09:00 AM";
  String shopEndTime = "07:00 PM";
  String? formattedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  int? totalMinute;
  bool currentIndex = false;
  bool isFirstTap = false;
  bool isFirstClick = false;
  String? breakStartTimes;
  String? breakEndTimes;
  RxBool isLoading = false.obs;
  int? totalDuration;

  bool? isSlotTimePassed;

  /// Morning Slot Hide
  bool hasMorningSlots = true;

  /// AfterNoon Slot Hide
  bool hasAfternoonSlots = true;

  GetBookingModel? getBookingModel;
  ExpertBusyScheduleModel? expertBusyScheduleCategory;

  //------ Split Break Time Variables ------//
  String? str;
  List? parts;
  String? breakStartTime;
  String? breakEndTime;
  String? salonID;

  @override
  void onInit() async {
    log("salon Id :: ${Constant.storage.read<String>("salonId").toString()}");
    salonID = Constant.storage.read<String>("salonId").toString();

    await onGetBookingApiCall(
      selectedDate: formattedDate.toString(),
      expertId: Constant.storage.read<String>("expertId").toString(),
      salonId: Constant.storage.read<String>("salonId").toString(),
    );
    onGetSlotsList();
    selectedAndBookSlot();
    super.onInit();
  }

  selectedAndBookSlot() {
    DateTime currentTime = DateTime.now();
    DateTime currentDate = DateTime.now();
    DateTime slotDateTime = DateFormat('yyyy-MM-dd').parse(formattedDate.toString());

    DateTime currentTimeWithDate =
        DateTime(currentDate.year, currentDate.month, currentDate.day, currentTime.hour, currentTime.minute);

    DateTime slotTime = DateFormat('hh:mm a').parse(morningSlots[0]);

    DateTime slotTimeWithDate = DateTime(slotDateTime.year, slotDateTime.month, slotDateTime.day, slotTime.hour, slotTime.minute);

    isSlotTimePassed = currentDate.isAfter(slotDateTime) && currentTimeWithDate.isAfter(slotTimeWithDate);

    update([Constant.idUpdateSlots0]);
  }

  void onClickFullDayNot() {
    log("Formatted Date :: $formattedDate");
    log("DateTime now :: ${DateFormat('yyyy-MM-dd').format(DateTime.now())}");
    if (formattedDate == DateFormat('yyyy-MM-dd').format(DateTime.now())) {
      Utils.showToast(Get.context!, "Sorry Current Date Not Select");
    } else {
      currentIndex = !currentIndex;
      if (currentIndex) {
        log("current Index :: $currentIndex");

        selectedSlotsList.clear();
        selectedSlotsList.addAll(getAllAvailableSlots());
        slotsString = selectedSlotsList.join(',');
        log("Selected Slots List in if :: $selectedSlotsList");
      } else {
        selectedSlotsList.clear();
        slotsString = "";
        log("Selected Slots List in else :: $selectedSlotsList");
      }
      update([Constant.idProgressView, Constant.idFullDayNotAvailable, Constant.idUpdateSlots, Constant.idUpdateSlots0]);
    }
  }

  List<String> getAllAvailableSlots() {
    allSlots = [];

    allSlots.addAll(morningSlots);
    allSlots.addAll(afternoonSlots);
    allSlots.addAll(eveningSlots);

    log("All Slots :: $allSlots");
    return allSlots;
  }

  onGetSlotsList() {
    morningSlots.clear();
    afternoonSlots.clear();

    totalDuration = getBookingModel?.salonTime?.time?.toInt();
    breakStartTimes = breakStartTime ?? "";
    breakEndTimes = breakEndTime ?? "";

    for (var i = 0; i < (getBookingModel?.allSlots?.morning?.length ?? 0); i++) {
      morningSlots.add(getBookingModel?.allSlots?.morning?[i] ?? "");
    }

    for (var i = 0; i < (getBookingModel?.allSlots?.evening?.length ?? 0); i++) {
      afternoonSlots.add(getBookingModel?.allSlots?.evening?[i] ?? "");
    }

    afternoonSlots = afternoonSlots.sublist(1);

    log("Morning Slot :: $morningSlots");
    log("Afternoon Slot :: $afternoonSlots");

    update([Constant.idUpdateSlots, Constant.idUpdateSlots0]);
  }

  // calculateSlots() async {
  //   str = getBookingCategory?.salonTime?.breakTime.toString() ?? "";
  //   parts = str?.split('TO');
  //   breakStartTime = parts?[0];
  //   breakEndTime = parts![1].trim();
  //
  //   breakStartTimes = breakStartTime ?? "";
  //   breakEndTimes = breakEndTime ?? "";
  //   totalDuration = getBookingCategory?.salonTime?.time ?? 0;
  //
  //   morningSlots.clear();
  //   afternoonSlots.clear();
  //   eveningSlots.clear();
  //   DateTime shopOpen = DateFormat('hh:mm a').parse(getBookingCategory?.salonTime?.openTime.toString() ?? "");
  //   DateTime shopEnd = DateFormat('hh:mm a').parse(getBookingCategory?.salonTime?.closedTime.toString() ?? "");
  //   DateTime breakStart = DateFormat('hh:mm a').parse(breakStartTime!);
  //   DateTime breakEnd = DateFormat('hh:mm a').parse(breakEndTime!);
  //
  //   log("Shop Open Time :: $shopOpen");
  //   log("Shop Close Time :: $shopEnd");
  //   log("Break Start Time :: $breakStart");
  //   log("Break End Time :: $breakEnd");
  //
  //   while (shopOpen.isBefore(breakStart)) {
  //     morningSlots.add(DateFormat('hh:mm a').format(shopOpen));
  //     shopOpen = shopOpen.add(Duration(minutes: totalDuration!));
  //     update([Constant.idUpdateSlots, Constant.idUpdateSlots0]);
  //   }
  //
  //   while (breakEnd.isBefore(shopEnd) || breakEnd.isAtSameMomentAs(shopEnd)) {
  //     if (breakEnd.isBefore(DateFormat('hh:mm a').parse(breakStartTime!))) {
  //       morningSlots.add(DateFormat('hh:mm a').format(breakEnd));
  //     } else {
  //       afternoonSlots.add(DateFormat('hh:mm a').format(breakEnd));
  //     }
  //     breakEnd = breakEnd.add(Duration(minutes: totalDuration!));
  //   }
  //   update([Constant.idUpdateSlots, Constant.idUpdateSlots0]);
  // }

  bool isBreakTime(String slot) {
    DateTime slotTime = DateFormat('hh:mm a').parse(slot);
    DateTime breakStartTime = DateFormat('hh:mm a').parse(breakStartTimes!);
    DateTime breakEndTime = DateFormat('hh:mm a').parse(breakEndTimes!);

    return slotTime.isAfter(breakStartTime) && slotTime.isBefore(breakEndTime);
  }

  void addSlotsUntilTime(DateTime targetTime) {
    selectedSlotsList.clear();
    log("object :: $targetTime");
    DateTime selectedSlotTime = DateFormat('hh:mm a').parse(selectedSlot);

    selectedSlotsList.add(selectedSlot);

    int iterations = ((targetTime.hour * 60 + targetTime.minute) - (selectedSlotTime.hour * 60 + selectedSlotTime.minute)) ~/
        totalDuration!.toInt();
    log("iterations :: $iterations");

    for (int i = 0; i < iterations; i++) {
      selectedSlotTime = selectedSlotTime.add(Duration(minutes: totalDuration!.toInt()));

      if (isBreakTime(DateFormat('hh:mm a').format(selectedSlotTime))) {
        continue;
      }

      if (selectedSlotTime.isAtSameMomentAs(targetTime)) {
        break;
      }

      selectedSlotsList.add(DateFormat('hh:mm a').format(selectedSlotTime));
    }
  }

  List<DateTime> getDisabledDates() {
    DateTime currentDate = DateTime.now();
    List<DateTime> disabledDates = [];

    for (int i = 0; i < currentDate.day - 1; i++) {
      disabledDates.add(currentDate.subtract(Duration(days: i + 1)));
    }

    return disabledDates;
  }

  void selectSlot(String slot) {
    if (selectedSlotsList.contains(slot)) {
      selectedSlotsList.remove(slot);
    } else {
      selectedSlotsList.add(slot);
    }
    update([Constant.idUpdateSlots0]);
  }

  checkSlot() {
    comparedList.addAll(morningSlots);
    comparedList.addAll(afternoonSlots);
    comparedList.addAll(eveningSlots);

    if (comparedList.length == getBookingModel?.timeSlots?.length) {
      currentIndex = true;
    }
    update([Constant.idFullDayNotAvailable]);
  }

  onClickUploadSlot({
    required String selectSlots,
    required String selectDate,
    required String expertId,
  }) async {
    if (isFirstClick) {
      isFirstClick = false;

      if (selectedSlotsList.isNotEmpty) {
        await onExpertBusySlots(expertId: expertId, selectDate: selectDate, selectSlots: selectSlots);

        if (expertBusyScheduleCategory?.status == true) {
          await onGetBookingApiCall(
            selectedDate: formattedDate.toString(),
            expertId: Constant.storage.read<String>("expertId").toString(),
            salonId: Constant.storage.read<String>("salonId").toString(),
          );

          if (getBookingModel?.status == true) {
            Get.back();
          } else {
            Utils.showToast(Get.context!, getBookingModel?.message ?? "");
          }
        } else {
          Utils.showToast(Get.context!, expertBusyScheduleCategory?.message ?? "");
        }
      } else {
        Utils.showToast(Get.context!, "please select a slot");
      }

      Future.delayed(
        const Duration(seconds: 5),
        () {
          isFirstClick = true;
        },
      );
    }
  }

  onExpertBusySlots({required String selectSlots, required String selectDate, required String expertId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idUpdateSlots, Constant.idUpdateSlots0]);

      final queryParameters = {"expertId": expertId};
      log("Expert Busy Slots Params :: $queryParameters");
      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.expertBusySlots + queryString);
      log("Expert Busy Slots Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Expert Busy Slots  Headers :: $headers");
      final body = json.encode({"date": selectDate, "time": selectSlots});
      log("Expert Busy Slots  body :: $body");

      final response = await http.post(url, headers: headers, body: body);

      log("Expert Busy Slots  StatusCode :: ${response.statusCode}");
      log("Expert Busy Slots  Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        expertBusyScheduleCategory = ExpertBusyScheduleModel.fromJson(jsonResponse);
        if (expertBusyScheduleCategory?.status ?? false) {
          selectedSlotsList.clear();
          currentIndex = false;
          Utils.showToast(Get.context!, expertBusyScheduleCategory?.message.toString() ?? "");
        }
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Expert Busy Slots  Api :: $e");
      Utils.showToast(Get.context!, expertBusyScheduleCategory?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idUpdateSlots, Constant.idUpdateSlots0]);
    }
  }

  onGetBookingApiCall({required String selectedDate, required String expertId, required String salonId}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView, Constant.idUpdateSlots, Constant.idUpdateSlots0]);

      final queryParameters = {"date": selectedDate, "expertId": expertId, "salonId": salonId};

      log("Get Booking Params :: $queryParameters");

      String queryString = Uri(queryParameters: queryParameters).query;

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getBooking + queryString);

      log("Get Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY};
      log("Get Booking Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Booking StatusCode :: ${response.statusCode}");
      log("Get Booking Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getBookingModel = GetBookingModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Booking Api :: $e");
      Utils.showToast(Get.context!, getBookingModel?.message.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView, Constant.idUpdateSlots, Constant.idUpdateSlots0]);
    }
  }
}
