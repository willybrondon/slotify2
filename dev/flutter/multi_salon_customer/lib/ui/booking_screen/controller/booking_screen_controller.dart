import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get/get.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:intl/intl.dart';
import 'package:salon_2/custom/bottom_sheet/payment_bottom_sheet.dart';
import 'package:salon_2/custom/dialog/confirm_dialog.dart';
import 'package:salon_2/custom/dialog/success_dialog.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/booking_screen/model/create_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/get_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/get_check_booking_model.dart';
import 'package:salon_2/ui/booking_screen/model/get_expert_service_base_salon_model.dart';
import 'package:salon_2/ui/branch_detail_screen/controller/branch_detail_controller.dart';
import 'package:salon_2/ui/category_details/controller/category_detail_controller.dart';
import 'package:salon_2/ui/expert/expert_detail/controller/expert_detail_controller.dart';
import 'package:salon_2/ui/home_screen/controller/home_screen_controller.dart';
import 'package:salon_2/ui/payment_screen/method/flutter_wave/flutter_wave_service.dart';
import 'package:salon_2/ui/payment_screen/method/razor_pay/razor_pay_service.dart';
import 'package:salon_2/ui/payment_screen/method/stripe_payment/stripe_service.dart';
import 'package:salon_2/ui/search_screen/controller/search_screen_controller.dart';
import 'package:salon_2/ui/select_branch_screen/controller/select_branch_controller.dart';
import 'package:salon_2/ui/splash_screen/controller/splash_controller.dart';
import 'package:salon_2/ui/view_all_category/controller/view_all_category_controller.dart';
import 'package:salon_2/ui/wallet_screen/controller/wallet_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class BookingScreenController extends GetxController {
  int currentStep = 0;
  int stepCount = 0;
  int selectExpert = -1;
  bool checkValue = false;
  bool isFirstTap = false;
  String selectedPayment = "wallet";
  List<String> morningSlots = [];
  List<String> afternoonSlots = [];
  List<String> eveningSlots = [];
  List<String> selectedSlotsList = [];
  String selectedSlot = '';
  final Map<String, Set<String>> disabledSlotsMap = {};
  String? slotsString;
  String? expertId;
  double? rupee;
  String? formattedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String date = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String formattedDateNow = "";
  List checkItem = [];
  String breakStartTimes = '';
  String breakEndTimes = '';
  List serviceId = [];
  double totalPrice = 0.0;
  double finalTaxRupee = 0.0;
  double withOutTaxRupee = 0.0;
  int? totalDuration;
  int? tax;
  int? totalMinute;
  String? salonId;
  String? expertDetail;
  List<dynamic> selectedExpertDataList = [];

  num? rating;
  int? roundedRating;
  int? filledStars;

  /// Morning Slot Hide
  bool hasMorningSlots = true;

  /// AfterNoon Slot Hide
  bool hasAfternoonSlots = true;

  dynamic args = Get.arguments;
  HomeScreenController homeScreenController = Get.find<HomeScreenController>();
  SplashController splashController = Get.find<SplashController>();
  WalletScreenController walletScreenController = Get.find<WalletScreenController>();
  CategoryDetailController categoryDetailController = Get.put(CategoryDetailController());
  BranchDetailController branchDetailController = Get.put(BranchDetailController());
  SelectBranchController selectBranchController = Get.put(SelectBranchController());
  SearchScreenController searchScreenController = Get.put(SearchScreenController());

  TextEditingController searchEditingController = TextEditingController();

  //------ Split Break Time Variables ------//
  String? str;
  List? parts;
  String? breakStartTime;
  String? breakEndTime;

  //----------- API Variables -----------//
  GetBookingModel? getBookingModel;
  GetCheckBookingModel? getCheckBookingCategory;
  CreateBookingModel? createBookingCategory;
  GetExpertServiceBaseSalonModel? getExpertServiceBaseSalonCategory;
  RxBool isLoading = false.obs;
  RxBool isLoading1 = false.obs;

  Map<String, PurchaseDetails>? purchases;

  String selectedVenue = "";

  void selectVenue(String venue) {
    selectedVenue = venue;
    update([Constant.idProgressView, Constant.idConfirm]);
  }

  @override
  void onInit() async {
    log("Enter booking screen controller");
    await getDataFromArgs();
    await onGetExpertServiceBasedSalonApiCall(serviceId: serviceId.join(","), salonId: salonId.toString());

    onCheckBoxClick();
    onGetSlotsList();
    update([Constant.idServiceList, Constant.idBottomService, Constant.idConfirm]);

    Stripe.publishableKey = splashController.settingCategory?.setting?.stripePublishableKey ?? "";
    log("Stripe Publishable Key: ${splashController.settingCategory?.setting?.stripeSecretKey ?? ""}");
    log("Stripe Publishable Key:Stripe.publishableKey ${Stripe.publishableKey}");

    await Stripe.instance.applySettings();
    await splitBreakTime();
    super.onInit();
  }

  String getCurrentTime() {
    final now = DateTime.now();
    log("Time now == $now");
    final formatter = DateFormat('h:mm a');
    return formatter.format(now);
  }

  bool isTimePassed(String time) {
    final currentTime = getCurrentTime();
    log("..........timing == $time");
    return time.compareTo(currentTime) < 0;
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null ||
          args[1] != null ||
          args[2] != null ||
          args[3] != null ||
          args[4] != null ||
          args[5] != null ||
          args[6] != null) {
        checkItem = args[0];
        totalPrice = args[1];
        finalTaxRupee = args[2];
        totalMinute = args[3];
        serviceId = args[4];
        withOutTaxRupee = args[5];
        salonId = args[6];

        log("booking controller checkItem :: $checkItem");
        log("booking controller serviceId :: $serviceId");
        log("booking controller totalPrice :: $totalPrice");
        log("booking controller finalTaxRupee :: $finalTaxRupee");
        log("booking controller totalMinute :: $totalMinute");
        log("booking controller withOutTaxRupee  :: $withOutTaxRupee");
      }
    }
  }

  onCheckBoxClick() {
    withOutTaxRupee = 0.0;
    totalPrice = 0.0;
    finalTaxRupee = 0.0;

    double taxPercentage = getExpertServiceBaseSalonCategory?.tax?.toDouble() ?? 0.0;

    for (int i = 0; i < (getExpertServiceBaseSalonCategory?.matchedServices?.length ?? 0); i++) {
      num servicePrice = getExpertServiceBaseSalonCategory?.matchedServices?[i].price ?? 0.0;
      double withTaxRupee = (servicePrice * taxPercentage) / 100;

      withOutTaxRupee += servicePrice;
      totalPrice += (servicePrice + withTaxRupee);
      finalTaxRupee += withTaxRupee;
    }

    log("Booking add WithOutTaxRupee :: $withOutTaxRupee");
    log("Booking add Total Price :: $totalPrice");
    log("Booking add FinalTaxRupee :: $finalTaxRupee");

    update([Constant.idServiceList, Constant.idBottomService, Constant.idConfirm]);
  }

  onConfirmButton(BuildContext context) {
    final constant = Constant();
    final isLastStep = currentStep == constant.stepper().length - 1;
    if (isLastStep) {
      checkValue = false;

      if (selectedPayment == "wallet") {
        if (totalPrice > double.parse(walletAmount.toString())) {
          showModalBottomSheet(
            isScrollControlled: true,
            context: context,
            builder: (BuildContext context) {
              return const PaymentBottomSheet(isRecharge: false);
            },
          ).then(
            (value) async {
              await walletScreenController.onGetWalletHistoryApiCall(
                userId: Constant.storage.read<String>('userId') ?? "",
                month: DateFormat('yyyy-MM').format(DateTime.now()),
              );
            },
          );
        } else {
          Get.dialog(
            barrierColor: AppColors.blackColor.withOpacity(0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              shadowColor: AppColors.transparent,
              elevation: 0,
              child: const ConfirmDialog(),
            ),
          );
        }
      } else {
        Get.dialog(
          barrierColor: AppColors.blackColor.withOpacity(0.8),
          Dialog(
            backgroundColor: AppColors.transparent,
            shadowColor: AppColors.transparent,
            elevation: 0,
            child: const ConfirmDialog(),
          ),
        );
      }

      log("----------Completed--------------");
    } else {
      stepCount++;
      currentStep += 1;
    }
    update([Constant.idConfirm, Constant.idCurrentStep, Constant.idStep1, Constant.idStep3]);
  }

  onStep1(int index) {
    if (selectExpert == index) {
      selectExpert = -1;
    } else {
      selectExpert = index;
    }

    log("-----------------------$index");
    update([Constant.idStep1, Constant.idProgressView, Constant.idConfirm]);
  }

  onExpertSelect() {
    expertDetail = Constant.storage.read("expertDetail");

    if (expertDetail != null) {
      for (int i = 0; i < (getExpertServiceBaseSalonCategory?.data?.length ?? 0); i++) {
        if (getExpertServiceBaseSalonCategory?.data?[i].id == expertDetail) {
          selectExpert = i;
          selectExpert = 0;
          selectedExpertDataList.add(getExpertServiceBaseSalonCategory?.data?[i].id);
          selectedExpertDataList.add(getExpertServiceBaseSalonCategory?.data?[i].fname);
          selectedExpertDataList.add(getExpertServiceBaseSalonCategory?.data?[i].lname);
          selectedExpertDataList.add(getExpertServiceBaseSalonCategory?.data?[i].image);
          selectedExpertDataList.add(getExpertServiceBaseSalonCategory?.data?[i].review);
          selectedExpertDataList.add(getExpertServiceBaseSalonCategory?.data?[i].reviewCount);

          log("selectedExpertIndices :: $selectedExpertDataList");
          break;
        }
      }
    }
  }

  splitBreakTime() {
    breakStartTime = getBookingModel?.salonTime?.breakStartTime;
    breakEndTime = getBookingModel?.salonTime?.breakEndTime;
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

    update([Constant.idUpdateSlots, Constant.idProgressView]);
  }

  bool isBreakTime(String slot) {
    DateTime slotTime = DateFormat('hh:mm a').parse(slot);
    DateTime breakStartTime = DateFormat('hh:mm a').parse(breakStartTimes);
    DateTime breakEndTime = DateFormat('hh:mm a').parse(breakEndTimes);

    return slotTime.isAfter(breakStartTime) && slotTime.isBefore(breakEndTime);
  }

  void addSlotsUntilTime(DateTime targetTime) {
    selectedSlotsList.clear();
    log("object :: $targetTime");
    DateTime selectedSlotTime = DateFormat('hh:mm a').parse(selectedSlot);

    selectedSlotsList.add(selectedSlot);

    int iterations =
        ((targetTime.hour * 60 + targetTime.minute) - (selectedSlotTime.hour * 60 + selectedSlotTime.minute)) ~/ totalDuration!;
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

  void disableSlot(String date, String slot) {
    if (!disabledSlotsMap.containsKey(date)) {
      disabledSlotsMap[date] = {};
    }
    disabledSlotsMap[date]?.add(slot);
  }

  bool isSlotDisabled(String date, String slot) {
    return disabledSlotsMap[date]?.contains(slot) ?? false;
  }

  selectSlot(String slot) {
    selectedSlot = slot;
    DateTime selectedDateTime = DateFormat('hh:mm a').parse(selectedSlot);
    DateTime targetTime = selectedDateTime.add(Duration(minutes: totalMinute?.toInt() ?? 0));
    addSlotsUntilTime(targetTime);

    slotsString = selectedSlotsList.join(',');
    log("Slots String :: $slotsString");
    log("Slots String :: $selectedSlotsList");
    update([Constant.idUpdateSlots0, Constant.idConfirm, Constant.idUpdateSlots]);
  }

  onStep3(String value) {
    selectedPayment = value;

    log("currentIndex::$selectedPayment");
    update([Constant.idStep3, Constant.idConfirm]);
  }

  onBackStep() {
    currentStep == 0 ? Get.back() : currentStep--;
    update([Constant.idConfirm, Constant.idCurrentStep, Constant.idStep1, Constant.idStep2]);
  }

  onGetExpertServiceBasedSalonApiCall({required String serviceId, required String salonId}) async {
    try {
      isLoading1(true);
      update([Constant.idProgressView, Constant.idSelectBranch]);

      final url =
          Uri.parse('${ApiConstant.BASE_URL}${ApiConstant.getExpertServiceBasedSalon}?serviceId=$serviceId&salonId=$salonId');

      log("Get Expert Service Based Salon Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Expert Service Based Salon Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get Expert Service Based Salon StatusCode :: ${response.statusCode}");
      log("Get Expert Service Based Salon Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getExpertServiceBaseSalonCategory = GetExpertServiceBaseSalonModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Expert Service Based Salon Api :: $e");
    } finally {
      isLoading1(false);
      update([Constant.idProgressView, Constant.idSelectBranch]);
    }
  }

  onGetBookingApiCall({required String selectedDate, required String expertId, required String salonId}) async {
    try {
      isLoading1(true);
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
      isLoading1(false);
      update([Constant.idProgressView, Constant.idUpdateSlots, Constant.idUpdateSlots0]);
    }
  }

  onGetCheckBookingApiCall({
    required String userId,
    required String expertId,
    required String date,
    required String time,
    required String serviceId,
    required double amount,
    required int withoutTax,
    required String salonId,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get Check Booking Headers :: $headers");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.checkBooking);
      var request = http.Request('GET', url);

      log("Get Check Booking Url :: $request");

      request.body = json.encode({
        "userId": userId,
        "expertId": expertId,
        "serviceId": serviceId,
        "salonId": salonId,
        "date": date,
        "time": time,
        "amount": amount,
        "withoutTax": withoutTax
      });

      log("Get Check Booking Body :: ${request.body}");

      request.headers.addAll(headers);

      http.StreamedResponse response = await request.send();

      log("Get Check Booking Status Code :: ${response.statusCode}");

      if (response.statusCode == 200) {
        final String bookingCategory = await response.stream.bytesToString();

        log("Get Check Booking Response :: $bookingCategory");
        getCheckBookingCategory = GetCheckBookingModel.fromJson(json.decode(bookingCategory));
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get Check Booking Api :: $e");
      Utils.showToast(Get.context!, getCheckBookingCategory?.status?.toString() ?? "");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  onCreateBookingApiCall({
    required String userId,
    required String expertId,
    required String serviceId,
    required String salonId,
    required String date,
    required String time,
    required double amount,
    required int withoutTax,
    required String paymentType,
    required int atPlace,
    required String address,
  }) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode({
        "userId": userId,
        "expertId": expertId,
        "serviceId": serviceId,
        "salonId": salonId,
        "date": date,
        "time": time,
        "amount": amount,
        "withoutTax": withoutTax,
        "paymentType": paymentType,
        "atPlace": atPlace,
        "address": address,
      });

      log("Create Booking Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.createBooking);
      log("Create Booking Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};

      final response = await http.post(url, headers: headers, body: body);

      log("Create Booking Status Code :: ${response.statusCode}");
      log("Create Booking Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        createBookingCategory = CreateBookingModel.fromJson(jsonResponse);
      }

      Utils.showToast(Get.context!, createBookingCategory?.message.toString() ?? "");
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Create Booking Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  confirmDialogButton(BuildContext context) async {
    String userId = Constant.storage.read<String>('userId') ?? "";

    if (checkValue) {
      Get.back();

      if (selectedPayment == "wallet") {
        log("it's wallet ");

        await onCreateBookingApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          expertId: Constant.storage.read<String>('expertDetail') != null
              ? Constant.storage.read<String>('expertDetail').toString()
              : Constant.storage.read<String>('expertId').toString(),
          serviceId: serviceId.join(","),
          salonId: salonId.toString(),
          date: formattedDate.toString(),
          time: slotsString.toString(),
          amount: totalPrice,
          withoutTax: withOutTaxRupee.toInt(),
          paymentType: "",
          atPlace: selectedVenue == "At Salon" ? 1 : 2,
          address: searchEditingController.text,
        );

        if (createBookingCategory?.status == true) {
          finalTaxRupee = 0.0;
          withOutTaxRupee = 0.0;
          totalPrice = 0.0;

          for (var i = 0; i < (categoryDetailController.getServiceCategory?.services?.length ?? 0); i++) {
            categoryDetailController.onCheckBoxClick(false, i);
          }

          for (var i = 0; i < (homeScreenController.getAllServiceCategory?.services?.length ?? 0); i++) {
            homeScreenController.onServiceCheckBoxClick(false, i);
          }

          for (var i = 0; i < (homeScreenController.getExpertCategory?.data?.services?.length ?? 0); i++) {
            homeScreenController.onCheckBoxClick(false, i);
          }

          for (var i = 0; i < (branchDetailController.getSalonDetailCategory?.salon?.serviceIds?.length ?? 0); i++) {
            branchDetailController.onCheckBoxClick(false, i);
          }

          homeScreenController.withOutTaxRupee = 0.0;
          homeScreenController.totalPrice = 0.0;
          homeScreenController.finalTaxRupee = 0.0;
          homeScreenController.totalMinute = 0;
          homeScreenController.checkItem.clear();
          homeScreenController.serviceId.clear();
          homeScreenController.serviceName.clear();

          homeScreenController.withOutTaxRupeeExpert = 0.0;
          homeScreenController.totalPriceExpert = 0.0;
          homeScreenController.finalTaxRupeeExpert = 0.0;
          homeScreenController.totalMinuteExpert = 0;
          homeScreenController.checkItemExpert.clear();
          homeScreenController.serviceIdExpert.clear();
          homeScreenController.serviceNameExpert.clear();

          searchScreenController.totalMinute = 0;
          searchScreenController.checkItem.clear();
          searchScreenController.serviceId.clear();
          searchScreenController.serviceName.clear();

          categoryDetailController.totalMinute = 0;
          categoryDetailController.checkItem.clear();
          categoryDetailController.serviceId.clear();
          categoryDetailController.serviceName.clear();

          branchDetailController.withOutTaxRupee = 0.0;
          branchDetailController.totalPrice = 0.0;
          branchDetailController.finalTaxRupee = 0.0;
          branchDetailController.totalMinute = 0;
          branchDetailController.checkItem.clear();
          branchDetailController.serviceId.clear();

          selectBranchController.selectBranch = -1;
          Constant.storage.remove("expertDetail");
          selectedExpertDataList.clear();

          log("withOutTaxRupee :: home ${homeScreenController.withOutTaxRupee} :: branch ${branchDetailController.withOutTaxRupee} ::  homeExpert ${homeScreenController.withOutTaxRupeeExpert}");
          log("totalPrice :: home ${homeScreenController.totalPrice} :: branch ${branchDetailController.totalPrice} ::  homeExpert ${homeScreenController.totalPriceExpert}");
          log("finalTaxRupee :: home ${homeScreenController.finalTaxRupee} :: branch ${branchDetailController.finalTaxRupee} ::  homeExpert ${homeScreenController.finalTaxRupeeExpert}");
          log("totalMinute :: home ${homeScreenController.totalMinute} :: category ${categoryDetailController.totalMinute} :: branch ${branchDetailController.totalMinute} :: search ${searchScreenController.totalMinute} ");
          log("checkItem :: home ${homeScreenController.checkItem} :: category ${categoryDetailController.checkItem} :: branch ${branchDetailController.checkItem} :: search ${searchScreenController.checkItem} ");
          log("serviceId :: home ${homeScreenController.serviceId} :: category ${categoryDetailController.serviceId} :: branch ${branchDetailController.serviceId} :: search ${searchScreenController.serviceId} ");

          1.seconds.delay();
          Get.delete<CategoryDetailController>();
          Get.delete<BranchDetailController>();
          Get.delete<SelectBranchController>();
          Get.delete<ViewAllCategoryController>();
          Get.delete<ExpertDetailController>();

          homeScreenController.onGetAllExpertApiCall(start: "0", limit: homeScreenController.limitExpert.toString());

          Get.offAllNamed(AppRoutes.bottom);

          Get.dialog(
            barrierColor: AppColors.blackColor.withOpacity(0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              child: SuccessDialog(),
            ),
          );
        } else {
          Utils.showToast(Get.context!, createBookingCategory?.message ?? "");
        }
      } else if (selectedPayment == "cashAfterService") {
        await onCreateBookingApiCall(
          userId: Constant.storage.read<String>('userId') ?? "",
          expertId: Constant.storage.read<String>('expertDetail') != null
              ? Constant.storage.read<String>('expertDetail').toString()
              : Constant.storage.read<String>('expertId').toString(),
          serviceId: serviceId.join(","),
          salonId: salonId.toString(),
          date: formattedDate.toString(),
          time: slotsString.toString(),
          amount: totalPrice,
          withoutTax: withOutTaxRupee.toInt(),
          paymentType: selectedPayment,
          atPlace: selectedVenue == "At Salon" ? 1 : 2,
          address: searchEditingController.text,
        );

        if (createBookingCategory?.status == true) {
          finalTaxRupee = 0.0;
          withOutTaxRupee = 0.0;
          totalPrice = 0.0;

          for (var i = 0; i < (categoryDetailController.getServiceCategory?.services?.length ?? 0); i++) {
            categoryDetailController.onCheckBoxClick(false, i);
          }

          for (var i = 0; i < (homeScreenController.getAllServiceCategory?.services?.length ?? 0); i++) {
            homeScreenController.onServiceCheckBoxClick(false, i);
          }

          for (var i = 0; i < (homeScreenController.getExpertCategory?.data?.services?.length ?? 0); i++) {
            homeScreenController.onCheckBoxClick(false, i);
          }

          for (var i = 0; i < (branchDetailController.getSalonDetailCategory?.salon?.serviceIds?.length ?? 0); i++) {
            branchDetailController.onCheckBoxClick(false, i);
          }

          homeScreenController.withOutTaxRupee = 0.0;
          homeScreenController.totalPrice = 0.0;
          homeScreenController.finalTaxRupee = 0.0;
          homeScreenController.totalMinute = 0;
          homeScreenController.checkItem.clear();
          homeScreenController.serviceId.clear();
          homeScreenController.serviceName.clear();

          homeScreenController.withOutTaxRupeeExpert = 0.0;
          homeScreenController.totalPriceExpert = 0.0;
          homeScreenController.finalTaxRupeeExpert = 0.0;
          homeScreenController.totalMinuteExpert = 0;
          homeScreenController.checkItemExpert.clear();
          homeScreenController.serviceIdExpert.clear();
          homeScreenController.serviceNameExpert.clear();

          searchScreenController.totalMinute = 0;
          searchScreenController.checkItem.clear();
          searchScreenController.serviceId.clear();
          searchScreenController.serviceName.clear();

          categoryDetailController.totalMinute = 0;
          categoryDetailController.checkItem.clear();
          categoryDetailController.serviceId.clear();
          categoryDetailController.serviceName.clear();

          branchDetailController.withOutTaxRupee = 0.0;
          branchDetailController.totalPrice = 0.0;
          branchDetailController.finalTaxRupee = 0.0;
          branchDetailController.totalMinute = 0;
          branchDetailController.checkItem.clear();
          branchDetailController.serviceId.clear();

          selectBranchController.selectBranch = -1;
          Constant.storage.remove("expertDetail");
          selectedExpertDataList.clear();

          log("withOutTaxRupee :: home ${homeScreenController.withOutTaxRupee} :: branch ${branchDetailController.withOutTaxRupee} ::  homeExpert ${homeScreenController.withOutTaxRupeeExpert}");
          log("totalPrice :: home ${homeScreenController.totalPrice} :: branch ${branchDetailController.totalPrice} ::  homeExpert ${homeScreenController.totalPriceExpert}");
          log("finalTaxRupee :: home ${homeScreenController.finalTaxRupee} :: branch ${branchDetailController.finalTaxRupee} ::  homeExpert ${homeScreenController.finalTaxRupeeExpert}");
          log("totalMinute :: home ${homeScreenController.totalMinute} :: category ${categoryDetailController.totalMinute} :: branch ${branchDetailController.totalMinute} :: search ${searchScreenController.totalMinute} ");
          log("checkItem :: home ${homeScreenController.checkItem} :: category ${categoryDetailController.checkItem} :: branch ${branchDetailController.checkItem} :: search ${searchScreenController.checkItem} ");
          log("serviceId :: home ${homeScreenController.serviceId} :: category ${categoryDetailController.serviceId} :: branch ${branchDetailController.serviceId} :: search ${searchScreenController.serviceId} ");

          1.seconds.delay();
          Get.delete<CategoryDetailController>();
          Get.delete<BranchDetailController>();
          Get.delete<SelectBranchController>();
          Get.delete<ViewAllCategoryController>();
          Get.delete<ExpertDetailController>();

          Get.offAndToNamed(AppRoutes.bottom);

          homeScreenController.onGetAllExpertApiCall(start: "0", limit: homeScreenController.limitExpert.toString());

          Get.dialog(
            barrierColor: AppColors.blackColor.withOpacity(0.8),
            Dialog(
              backgroundColor: AppColors.transparent,
              child: SuccessDialog(),
            ),
          );
        } else {
          Utils.showToast(Get.context!, createBookingCategory?.message ?? "");
        }
      } else if (selectedPayment == "Razorpay") {
        log("it's Razorpay ");
        RazorPayService().init(
          expertId: Constant.storage.read<String>('expertId').toString(),
          paymentType: selectedPayment,
          serviceId: serviceId.join(","),
          userId: userId,
          date: formattedDateNow,
          time: slotsString.toString(),
          rupee: rupee ?? 0,
          totalAmountWithOutTax: totalPrice.toInt(),
          razorKey: splashController.settingCategory?.setting?.razorPayId ?? "",
          discountAmount: 0,
          discountPercentage: 0,
        );
        1.seconds.delay;
        isLoading(false);

        RazorPayService().razorPayCheckout();
      } else if (selectedPayment == "Stripe") {
        log("it's Stripe");
        isLoading(true);
        update([Constant.idProgressView]);

        await StripeService().init(
          expertId: Constant.storage.read<String>('expertId').toString(),
          serviceId: serviceId.join(","),
          userId: userId,
          date: formattedDateNow,
          rupee: rupee ?? 0,
          paymentType: selectedPayment,
          time: slotsString.toString(),
          stripePaymentPublishKey: splashController.settingCategory?.setting?.stripePublishableKey ?? "",
          stripeURL: Constant.stripeUrl,
          stripePaymentKey: splashController.settingCategory?.setting?.stripeSecretKey ?? "",
          discountAmount: 0,
          discountPercentage: 0,
          totalAmountWithOutTax: int.parse(totalPrice.toString()),
        );

        log("Called stripe Init");
        log("Stripe Payment Type :: $selectedPayment");
        log("Stripe Service Id :: ${serviceId.join(",")}");
        log("Stripe Expert Id :: ${Constant.storage.read<String>('expertId').toString()}");
        log("Stripe User Id :: $userId");
        log("Stripe Time :: ${slotsString.toString()}");
        log("Stripe Secret Key :: ${splashController.settingCategory?.setting?.stripeSecretKey ?? ""}");

        1.seconds.delay;
        StripeService().stripePay().then((value) {
          isLoading(false);
          update([Constant.idProgressView]);
        }).catchError((e) {
          isLoading(false);
          update([Constant.idProgressView]);

          Utils.showToast(context, e.toString());
        });
      } else if (selectedPayment == "flutterWave") {
        FlutterWaveService().init(
            flutterWavePublishKey: splashController.settingCategory?.setting?.flutterWaveKey ?? "",
            date: formattedDateNow,
            time: slotsString.toString(),
            rupee: rupee ?? 0,
            totalAmountWithOutTax: totalPrice.toString(),
            serviceId: serviceId.join(","),
            expertId: Constant.storage.read<String>('expertId').toString(),
            userId: userId,
            paymentType: selectedPayment);

        1.seconds.delay;
        isLoading(false);

        FlutterWaveService().handlePaymentInitialization();
      }
    } else {
      Utils.showToast(context, createBookingCategory?.message.toString() ?? "");
    }
  }
}
